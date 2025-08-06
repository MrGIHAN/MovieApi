// Fixed uploadService.js
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
   * Upload video file with proper error handling
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
      formData.append('type', 'video');

      console.log('Uploading video file:', file.name, 'Size:', formatFileSize(file.size));

      const response = await apiService.upload(
        API_ENDPOINTS.ADMIN.UPLOAD_VIDEO,
        formData,
        onProgress
      );

      console.log('Video upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Video upload error:', error);
      const message = getErrorMessage(error);
      toast.error(`Video upload failed: ${message}`);
      throw error;
    }
  },

  /**
   * Upload image file with proper error handling
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
      formData.append('type', 'image');

      console.log('Uploading image file:', file.name, 'Size:', formatFileSize(file.size));

      const response = await apiService.upload(
        API_ENDPOINTS.ADMIN.UPLOAD_IMAGE,
        formData,
        onProgress
      );

      console.log('Image upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Image upload error:', error);
      const message = getErrorMessage(error);
      toast.error(`Image upload failed: ${message}`);
      throw error;
    }
  },

  /**
   * Create movie with uploaded files
   * @param {object} movieData - Movie data with file URLs
   * @returns {Promise<object>} Created movie
   */
  async createMovieWithFiles(movieData) {
    try {
      console.log('Creating movie with data:', movieData);
      
      const response = await apiService.post(API_ENDPOINTS.ADMIN.MOVIES, movieData);
      
      console.log('Movie creation response:', response.data);
      toast.success('Movie created successfully!');
      
      return response.data;
    } catch (error) {
      console.error('Movie creation error:', error);
      const message = getErrorMessage(error);
      toast.error(`Movie creation failed: ${message}`);
      throw error;
    }
  },

  /**
   * Complete movie upload process
   * @param {object} movieData - Movie metadata
   * @param {File} videoFile - Video file
   * @param {File} posterFile - Poster file
   * @param {File} thumbnailFile - Thumbnail file (optional)
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<object>} Created movie
   */
  async uploadMovieComplete(movieData, videoFile, posterFile, thumbnailFile, onProgress) {
    try {
      let overallProgress = 0;
      const updateProgress = (step, stepProgress) => {
        const stepWeights = { video: 60, poster: 20, thumbnail: 10, create: 10 };
        const stepStartProgress = {
          video: 0,
          poster: 60,
          thumbnail: 80,
          create: 90
        };
        
        overallProgress = stepStartProgress[step] + (stepProgress * stepWeights[step] / 100);
        onProgress({ step, stepProgress, overallProgress });
      };

      // Step 1: Upload video
      updateProgress('video', 0);
      const videoResponse = await this.uploadVideo(videoFile, (progress) => {
        updateProgress('video', progress);
      });

      // Step 2: Upload poster
      updateProgress('poster', 0);
      const posterResponse = await this.uploadImage(posterFile, (progress) => {
        updateProgress('poster', progress);
      });

      // Step 3: Upload thumbnail (optional)
      let thumbnailResponse = null;
      if (thumbnailFile) {
        updateProgress('thumbnail', 0);
        thumbnailResponse = await this.uploadImage(thumbnailFile, (progress) => {
          updateProgress('thumbnail', progress);
        });
      }

      // Step 4: Create movie record
      updateProgress('create', 0);
      const completeMovieData = {
        ...movieData,
        videoUrl: videoResponse.fileUrl || videoResponse.url || videoResponse.filePath,
        posterUrl: posterResponse.fileUrl || posterResponse.url || posterResponse.filePath,
        thumbnailUrl:
          thumbnailResponse?.fileUrl ||
          thumbnailResponse?.url ||
          thumbnailResponse?.filePath ||
          posterResponse.fileUrl ||
          posterResponse.url ||
          posterResponse.filePath,
        fileSize: videoFile.size,
        uploadedAt: new Date().toISOString()
      };

      const movieResponse = await this.createMovieWithFiles(completeMovieData);
      updateProgress('create', 100);

      return movieResponse;
    } catch (error) {
      console.error('Complete upload process failed:', error);
      throw error;
    }
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
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
      });

      video.addEventListener('seeked', () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailFile = new File(
                [blob],
                `${videoFile.name.split('.')[0]}_thumbnail.jpg`,
                { type: 'image/jpeg' }
              );
              resolve(thumbnailFile);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        } catch (error) {
          reject(error);
        }
      });

      video.addEventListener('error', reject);
      
      try {
        video.src = URL.createObjectURL(videoFile);
        video.currentTime = Math.min(timeInSeconds, 5); // Ensure we don't seek beyond video length
      } catch (error) {
        reject(error);
      }
    });
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
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
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
  }
};

export default uploadService;