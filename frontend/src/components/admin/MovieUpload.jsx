import React, { useState, useRef } from 'react';
import {
  CloudArrowUpIcon,
  FilmIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { useNotification } from '../../context/NotificationContext';
import { uploadService } from '../../services/uploadService';
import { adminMovieService } from '../../services/movieService';
import { GENRES, FILE_CONSTRAINTS } from '../../utils/constants';
import { formatFileSize } from '../../utils/helpers';
import { ProgressLoader } from '../common/Loader';

const MovieUpload = () => {
  const { success, error } = useNotification();
  const videoInputRef = useRef(null);
  const posterInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  // Form state
  const [movieData, setMovieData] = useState({
    title: '',
    description: '',
    genre: '',
    releaseYear: new Date().getFullYear(),
    duration: '', // Will be filled automatically from video
    imdbRating: '',
    director: '',
    cast: '',
    language: 'English',
    country: 'United States'
  });

  // File states
  const [videoFile, setVideoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Preview states
  const [videoPreviews, setVideoPreviews] = useState({
    url: null,
    duration: null,
    size: null
  });
  const [posterPreview, setPosterPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    video: 0,
    poster: 0,
    thumbnail: 0,
    overall: 0
  });
  const [uploadStep, setUploadStep] = useState('form'); // form, uploading, success, error
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMovieData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVideoFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = uploadService.validateFile(file, 'video');
    if (!validation.isValid) {
      error(validation.errors.join(', '));
      return;
    }

    setVideoFile(file);
    
    // Create preview
    const url = uploadService.createPreviewURL(file);
    setVideoPreviews({
      url,
      duration: null,
      size: formatFileSize(file.size)
    });

    // Get video duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration);
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const durationString = hours > 0 ? `PT${hours}H${minutes}M` : `PT${minutes}M`;
      
      setMovieData(prev => ({
        ...prev,
        duration: durationString
      }));
      
      setVideoPreviews(prev => ({
        ...prev,
        duration: `${hours > 0 ? hours + 'h ' : ''}${minutes}m`
      }));
      
      URL.revokeObjectURL(video.src);
    };
    video.src = url;
  };

  const handlePosterFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = uploadService.validateFile(file, 'image');
    if (!validation.isValid) {
      error(validation.errors.join(', '));
      return;
    }

    setPosterFile(file);
    
    // Create preview
    const url = uploadService.createPreviewURL(file);
    setPosterPreview(url);
  };

  const handleThumbnailFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = uploadService.validateFile(file, 'image');
    if (!validation.isValid) {
      error(validation.errors.join(', '));
      return;
    }

    setThumbnailFile(file);
    
    // Create preview
    const url = uploadService.createPreviewURL(file);
    setThumbnailPreview(url);
  };

  const removeVideoFile = () => {
    setVideoFile(null);
    if (videoPreviews.url) {
      uploadService.revokePreviewURL(videoPreviews.url);
    }
    setVideoPreviews({ url: null, duration: null, size: null });
    setMovieData(prev => ({ ...prev, duration: '' }));
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const removePosterFile = () => {
    setPosterFile(null);
    if (posterPreview) {
      uploadService.revokePreviewURL(posterPreview);
    }
    setPosterPreview(null);
    if (posterInputRef.current) {
      posterInputRef.current.value = '';
    }
  };

  const removeThumbnailFile = () => {
    setThumbnailFile(null);
    if (thumbnailPreview) {
      uploadService.revokePreviewURL(thumbnailPreview);
    }
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const generateThumbnailFromVideo = async () => {
    if (!videoFile) {
      error('Please select a video file first');
      return;
    }

    try {
      const thumbnailFile = await uploadService.generateVideoThumbnail(videoFile, 5);
      setThumbnailFile(thumbnailFile);
      
      const url = uploadService.createPreviewURL(thumbnailFile);
      setThumbnailPreview(url);
      
      success('Thumbnail generated from video');
    } catch (err) {
      error('Failed to generate thumbnail from video');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!movieData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!movieData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!movieData.genre) {
      newErrors.genre = 'Genre is required';
    }

    if (!movieData.releaseYear || movieData.releaseYear < 1900 || movieData.releaseYear > new Date().getFullYear() + 5) {
      newErrors.releaseYear = 'Please enter a valid release year';
    }

    if (movieData.imdbRating && (movieData.imdbRating < 0 || movieData.imdbRating > 10)) {
      newErrors.imdbRating = 'IMDB rating must be between 0 and 10';
    }

    if (!videoFile) {
      newErrors.video = 'Video file is required';
    }

    if (!posterFile) {
      newErrors.poster = 'Poster image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setUploadStep('uploading');
    setUploadProgress({ video: 0, poster: 0, thumbnail: 0, overall: 0 });

    try {
      // Upload video file
      setUploadProgress(prev => ({ ...prev, overall: 10 }));
      const videoResponse = await uploadService.uploadVideo(videoFile, (progress) => {
        setUploadProgress(prev => ({ ...prev, video: progress, overall: 10 + (progress * 0.6) }));
      });

      // Upload poster
      setUploadProgress(prev => ({ ...prev, overall: 70 }));
      const posterResponse = await uploadService.uploadImage(posterFile, (progress) => {
        setUploadProgress(prev => ({ ...prev, poster: progress, overall: 70 + (progress * 0.15) }));
      });

      // Upload thumbnail if provided
      let thumbnailResponse = null;
      if (thumbnailFile) {
        setUploadProgress(prev => ({ ...prev, overall: 85 }));
        thumbnailResponse = await uploadService.uploadImage(thumbnailFile, (progress) => {
          setUploadProgress(prev => ({ ...prev, thumbnail: progress, overall: 85 + (progress * 0.10) }));
        });
      }

      // Create movie record
      setUploadProgress(prev => ({ ...prev, overall: 95 }));
      const moviePayload = {
        ...movieData,
        videoUrl: videoResponse.url,
        posterUrl: posterResponse.url,
        thumbnailUrl: thumbnailResponse?.url || posterResponse.url,
        fileSize: videoFile.size
      };

      await adminMovieService.createMovie(moviePayload);

      setUploadProgress(prev => ({ ...prev, overall: 100 }));
      setUploadStep('success');
      
      success('Movie uploaded successfully!');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);

    } catch (err) {
      console.error('Upload failed:', err);
      setUploadStep('error');
      error('Failed to upload movie. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setMovieData({
      title: '',
      description: '',
      genre: '',
      releaseYear: new Date().getFullYear(),
      duration: '',
      imdbRating: '',
      director: '',
      cast: '',
      language: 'English',
      country: 'United States'
    });
    
    removeVideoFile();
    removePosterFile();
    removeThumbnailFile();
    
    setUploadStep('form');
    setUploadProgress({ video: 0, poster: 0, thumbnail: 0, overall: 0 });
    setErrors({});
  };

  if (uploadStep === 'uploading') {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CloudArrowUpIcon className="h-16 w-16 text-netflix-red mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Uploading Movie</h2>
            <p className="text-netflix-lightGray">
              Please don't close this page while the upload is in progress.
            </p>
          </div>
          
          <div className="space-y-4">
            <ProgressLoader 
              progress={uploadProgress.overall} 
              text={`Overall Progress (${Math.round(uploadProgress.overall)}%)`}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-netflix-darkGray rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FilmIcon className="h-4 w-4 text-netflix-red" />
                  <span className="text-white">Video</span>
                </div>
                <ProgressLoader progress={uploadProgress.video} />
              </div>
              
              <div className="bg-netflix-darkGray rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <PhotoIcon className="h-4 w-4 text-blue-400" />
                  <span className="text-white">Poster</span>
                </div>
                <ProgressLoader progress={uploadProgress.poster} />
              </div>
              
              <div className="bg-netflix-darkGray rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <PhotoIcon className="h-4 w-4 text-green-400" />
                  <span className="text-white">Thumbnail</span>
                </div>
                <ProgressLoader progress={uploadProgress.thumbnail} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (uploadStep === 'success') {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Upload Successful!</h2>
          <p className="text-netflix-lightGray mb-8">
            "{movieData.title}" has been uploaded and is now available on the platform.
          </p>
          <div className="space-x-4">
            <button
              onClick={resetForm}
              className="btn btn-primary"
            >
              Upload Another Movie
            </button>
            <a
              href="/admin/movies"
              className="btn btn-outline"
            >
              View All Movies
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (uploadStep === 'error') {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Upload Failed</h2>
          <p className="text-netflix-lightGray mb-8">
            There was an error uploading your movie. Please check your files and try again.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => setUploadStep('form')}
              className="btn btn-primary"
            >
              Try Again
            </button>
            <button
              onClick={resetForm}
              className="btn btn-outline"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Movie</h1>
          <p className="text-netflix-lightGray">
            Add new movies to your Netflix Clone platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Movie Information */}
          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
            <h2 className="text-xl font-semibold text-white mb-6">Movie Information</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Movie Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={movieData.title}
                  onChange={handleInputChange}
                  className={`input ${errors.title ? 'input-error' : ''}`}
                  placeholder="Enter movie title"
                />
                {errors.title && <p className="form-error">{errors.title}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="genre" className="form-label">
                  Genre *
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={movieData.genre}
                  onChange={handleInputChange}
                  className={`input ${errors.genre ? 'input-error' : ''}`}
                >
                  <option value="">Select Genre</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>
                      {genre.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {errors.genre && <p className="form-error">{errors.genre}</p>}
              </div>

              <div className="form-group lg:col-span-2">
                <label htmlFor="description" className="form-label">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={movieData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`input resize-none ${errors.description ? 'input-error' : ''}`}
                  placeholder="Enter movie description"
                />
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="releaseYear" className="form-label">
                  Release Year *
                </label>
                <input
                  type="number"
                  id="releaseYear"
                  name="releaseYear"
                  value={movieData.releaseYear}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear() + 5}
                  className={`input ${errors.releaseYear ? 'input-error' : ''}`}
                />
                {errors.releaseYear && <p className="form-error">{errors.releaseYear}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="imdbRating" className="form-label">
                  IMDB Rating
                </label>
                <input
                  type="number"
                  id="imdbRating"
                  name="imdbRating"
                  value={movieData.imdbRating}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  step="0.1"
                  className={`input ${errors.imdbRating ? 'input-error' : ''}`}
                  placeholder="e.g., 8.5"
                />
                {errors.imdbRating && <p className="form-error">{errors.imdbRating}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="director" className="form-label">
                  Director
                </label>
                <input
                  type="text"
                  id="director"
                  name="director"
                  value={movieData.director}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter director name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cast" className="form-label">
                  Cast
                </label>
                <input
                  type="text"
                  id="cast"
                  name="cast"
                  value={movieData.cast}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter main cast (comma separated)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="language" className="form-label">
                  Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={movieData.language}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="country" className="form-label">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={movieData.country}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
            <h2 className="text-xl font-semibold text-white mb-6">File Uploads</h2>
            
            {/* Video Upload */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Video File *</h3>
              {!videoFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
                    errors.video 
                      ? 'border-red-500 bg-red-500/10' 
                      : 'border-netflix-gray hover:border-netflix-lightGray bg-netflix-gray/20'
                  }`}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <CloudArrowUpIcon className="h-12 w-12 text-netflix-lightGray mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">Upload Video File</p>
                  <p className="text-netflix-lightGray text-sm mb-4">
                    Click to select or drag and drop your video file here
                  </p>
                  <p className="text-netflix-lightGray text-xs">
                    Supported formats: MP4, AVI, MOV, WMV (Max: {formatFileSize(FILE_CONSTRAINTS.VIDEO.MAX_SIZE)})
                  </p>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept={FILE_CONSTRAINTS.VIDEO.ALLOWED_TYPES.join(',')}
                    onChange={handleVideoFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="bg-netflix-gray rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-12 bg-netflix-darkGray rounded flex items-center justify-center">
                        <PlayIcon className="h-6 w-6 text-netflix-red" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{videoFile.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-netflix-lightGray">
                          <span>{videoPreviews.size}</span>
                          {videoPreviews.duration && <span>{videoPreviews.duration}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeVideoFile}
                      className="text-netflix-lightGray hover:text-red-400 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
              {errors.video && <p className="form-error mt-2">{errors.video}</p>}
            </div>

            {/* Poster Upload */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">Poster Image *</h3>
              {!posterFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
                    errors.poster 
                      ? 'border-red-500 bg-red-500/10' 
                      : 'border-netflix-gray hover:border-netflix-lightGray bg-netflix-gray/20'
                  }`}
                  onClick={() => posterInputRef.current?.click()}
                >
                  <PhotoIcon className="h-12 w-12 text-netflix-lightGray mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">Upload Poster Image</p>
                  <p className="text-netflix-lightGray text-sm mb-4">
                    Click to select or drag and drop your poster image here
                  </p>
                  <p className="text-netflix-lightGray text-xs">
                    Supported formats: JPG, PNG, GIF (Max: {formatFileSize(FILE_CONSTRAINTS.IMAGE.MAX_SIZE)})
                  </p>
                  <input
                    ref={posterInputRef}
                    type="file"
                    accept={FILE_CONSTRAINTS.IMAGE.ALLOWED_TYPES.join(',')}
                    onChange={handlePosterFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="bg-netflix-gray rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-24 bg-netflix-darkGray rounded overflow-hidden flex-shrink-0">
                      {posterPreview && (
                        <img
                          src={posterPreview}
                          alt="Poster preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{posterFile.name}</p>
                      <p className="text-netflix-lightGray text-sm">{formatFileSize(posterFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removePosterFile}
                      className="text-netflix-lightGray hover:text-red-400 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
              {errors.poster && <p className="form-error mt-2">{errors.poster}</p>}
            </div>

            {/* Thumbnail Upload */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Thumbnail Image</h3>
                {videoFile && !thumbnailFile && (
                  <button
                    type="button"
                    onClick={generateThumbnailFromVideo}
                    className="btn btn-outline btn-sm"
                  >
                    Generate from Video
                  </button>
                )}
              </div>
              {!thumbnailFile ? (
                <div
                  className="border-2 border-dashed border-netflix-gray hover:border-netflix-lightGray bg-netflix-gray/20 rounded-lg p-8 text-center cursor-pointer transition-colors duration-200"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <PhotoIcon className="h-12 w-12 text-netflix-lightGray mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">Upload Thumbnail (Optional)</p>
                  <p className="text-netflix-lightGray text-sm mb-4">
                    If not provided, poster image will be used as thumbnail
                  </p>
                  <p className="text-netflix-lightGray text-xs">
                    Supported formats: JPG, PNG, GIF (Max: {formatFileSize(FILE_CONSTRAINTS.IMAGE.MAX_SIZE)})
                  </p>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept={FILE_CONSTRAINTS.IMAGE.ALLOWED_TYPES.join(',')}
                    onChange={handleThumbnailFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="bg-netflix-gray rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-16 bg-netflix-darkGray rounded overflow-hidden flex-shrink-0">
                      {thumbnailPreview && (
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{thumbnailFile.name}</p>
                      <p className="text-netflix-lightGray text-sm">{formatFileSize(thumbnailFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeThumbnailFile}
                      className="text-netflix-lightGray hover:text-red-400 transition-colors duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-outline"
              disabled={isUploading}
            >
              Reset Form
            </button>
            
            <div className="space-x-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="btn btn-secondary"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploading || !videoFile || !posterFile || !movieData.title.trim()}
              >
                {isUploading ? 'Uploading...' : 'Upload Movie'}
              </button>
            </div>
          </div>
        </form>

        {/* Upload Guidelines */}
        <div className="mt-8 bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
          <h3 className="text-lg font-semibold text-white mb-4">Upload Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-netflix-lightGray">
            <div>
              <h4 className="text-white font-medium mb-2">Video Requirements</h4>
              <ul className="space-y-1">
                <li>• Supported formats: MP4, AVI, MOV, WMV, FLV, WebM</li>
                <li>• Maximum file size: {formatFileSize(FILE_CONSTRAINTS.VIDEO.MAX_SIZE)}</li>
                <li>• Recommended resolution: 1080p or higher</li>
                <li>• Recommended bitrate: 5-10 Mbps</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Image Requirements</h4>
              <ul className="space-y-1">
                <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                <li>• Maximum file size: {formatFileSize(FILE_CONSTRAINTS.IMAGE.MAX_SIZE)}</li>
                <li>• Poster dimensions: 2:3 aspect ratio (e.g., 400x600px)</li>
                <li>• Thumbnail dimensions: 16:9 aspect ratio (e.g., 320x180px)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieUpload;