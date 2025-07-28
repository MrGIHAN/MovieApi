import { apiService } from './api';
import { API_ENDPOINTS, FILE_CONSTRAINTS, TOAST_MESSAGES } from '../utils/constants';
import { formatFileSize, getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

/**
 * File upload service for handling file uploads
 */
export const uploadService = {
  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @param {string} type - File type ('video' or 'image')
   * @returns {object} Validation result
   */
  validateFile(file, type) {
    const constraints = FILE_CONSTRAINTS[type.toUpperCase()];
    const errors = [];

    if (!file) {
      errors.push('No file selected');
      return { isValid: false, errors };
    }

    // Check file size
    if (file.size > constraints.MAX_SIZE) {
      errors.push(`File size must be less than ${formatFileSize(constraints.MAX_SIZE)}`);
    }

    // Check file type
    if (!constraints.ALLOWED_TYPES.includes(file.type)) {
      errors.push(`File type must be one of: ${constraints.ALLOWED_TYPES.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Upload video file
   * @param {File} file - Video file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<object>} Upload response
   */
  async uploadVideo(file, onProgress) {
    // Validate file
    const validation = this.validateFile(file, 'video');
    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ');
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.upload(
        API_ENDPOINTS.ADMIN.UPLOAD_VIDEO,
        formData,
        onProgress
      );

      toast.success('Video uploaded successfully');
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Upload image file
   * @param {File} file - Image file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<object>} Upload response
   */
  async uploadImage(file, onProgress) {
    // Validate file
    const validation = this.validateFile(file, 'image');
    if (!validation.isValid) {
      const errorMessage = validation.errors.join(', ');
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.upload(
        API_ENDPOINTS.ADMIN.UPLOAD_IMAGE,
        formData,
        onProgress
      );

      toast.success('Image uploaded successfully');
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Upload multiple files
   * @param {FileList} files - Files to upload
   * @param {string} type - File type ('video' or 'image')
   * @param {Function} onProgress - Progress callback (receives file index and progress)
   * @returns {Promise<Array>} Array of upload responses
   */
  async uploadMultipleFiles(files, type, onProgress) {
    const uploadPromises = Array.from(files).map((file, index) => {
      const progressCallback = (progress) => {
        if (onProgress) {
          onProgress(index, progress);
        }
      };

      if (type === 'video') {
        return this.uploadVideo(file, progressCallback);
      } else if (type === 'image') {
        return this.uploadImage(file, progressCallback);
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      toast.success(`${results.length} files uploaded successfully`);
      return results;
    } catch (error) {
      toast.error('Some files failed to upload');
      throw error;
    }
  },

  /**
   * Create file preview URL
   * @param {File} file - File to preview
   * @returns {string} Preview URL
   */
  createPreviewURL(file) {
    return URL.createObjectURL(file);
  },

  /**
   * Revoke file preview URL
   * @param {string} url - Preview URL to revoke
   */
  revokePreviewURL(url) {
    URL.revokeObjectURL(url);
  },

  /**
   * Get file info
   * @param {File} file - File object
   * @returns {object} File information
   */
  getFileInfo(file) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      formattedSize: formatFileSize(file.size),
      extension: file.name.split('.').pop().toLowerCase()
    };
  },

  /**
   * Compress image before upload
   * @param {File} file - Image file
   * @param {object} options - Compression options
   * @param {number} options.maxWidth - Maximum width
   * @param {number} options.maxHeight - Maximum height
   * @param {number} options.quality - Compression quality (0-1)
   * @returns {Promise<File>} Compressed file
   */
  async compressImage(file, options = {}) {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Generate thumbnail from video
   * @param {File} videoFile - Video file
   * @param {number} timeInSeconds - Time to capture thumbnail
   * @returns {Promise<File>} Thumbnail image file
   */
  async generateVideoThumbnail(videoFile, timeInSeconds = 5) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      });

      video.addEventListener('seeked', () => {
        ctx.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          const thumbnailFile = new File(
            [blob],
            `${videoFile.name.split('.')[0]}_thumbnail.jpg`,
            { type: 'image/jpeg' }
          );
          resolve(thumbnailFile);
        }, 'image/jpeg', 0.8);
      });

      video.addEventListener('error', reject);
      
      video.src = URL.createObjectURL(videoFile);
      video.currentTime = timeInSeconds;
    });
  },

  /**
   * Check upload progress
   * @param {string} uploadId - Upload ID
   * @returns {Promise<object>} Upload status
   */
  async checkUploadProgress(uploadId) {
    try {
      const response = await apiService.get(`/upload/progress/${uploadId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking upload progress:', error);
      throw error;
    }
  },

  /**
   * Cancel upload
   * @param {string} uploadId - Upload ID
   * @returns {Promise<void>}
   */
  async cancelUpload(uploadId) {
    try {
      await apiService.post(`/upload/cancel/${uploadId}`);
      toast.success('Upload cancelled');
    } catch (error) {
      console.error('Error cancelling upload:', error);
      throw error;
    }
  }
};

export default uploadService;