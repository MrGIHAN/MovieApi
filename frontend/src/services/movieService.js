import { apiService } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

/**
 * Movie service for handling movie-related operations
 */
export const movieService = {
  /**
   * Get all movies
   * @returns {Promise<Array>} Array of movies
   */
  async getAllMovies() {
    try {
      console.log('Making API call to:', API_ENDPOINTS.MOVIES.BASE);
      const response = await apiService.get(API_ENDPOINTS.MOVIES.BASE);
      console.log('API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      console.error('Error config:', error.config);
      throw error;
    }
  },

  /**
   * Get movie by ID
   * @param {number} movieId - Movie ID
   * @returns {Promise<object>} Movie object
   */
  async getMovieById(movieId) {
    try {
      console.log('Fetching movie with ID:', movieId, 'Type:', typeof movieId);
      console.log('API endpoint:', API_ENDPOINTS.MOVIES.BY_ID(movieId));
      const response = await apiService.get(API_ENDPOINTS.MOVIES.BY_ID(movieId));
      console.log('Movie response status:', response.status);
      console.log('Movie response data type:', typeof response.data);
      
      // Handle circular reference issue by creating a clean copy
      if (response.data && typeof response.data === 'object') {
        try {
          // Try to create a clean copy by stringifying and parsing
          const cleanData = JSON.parse(JSON.stringify(response.data));
          return cleanData;
        } catch (circularError) {
          console.warn('Circular reference detected, attempting to clean data manually');
          // Try to extract basic movie data manually
          const movie = response.data;
          const cleanMovie = {
            id: movie.id,
            title: movie.title,
            description: movie.description,
            releaseYear: movie.releaseYear,
            duration: movie.duration,
            genre: movie.genre,
            imdbRating: movie.imdbRating,
            posterUrl: movie.posterUrl,
            thumbnailUrl: movie.thumbnailUrl,
            videoUrl: movie.videoUrl,
            trailerUrl: movie.trailerUrl,
            viewCount: movie.viewCount,
            featured: movie.featured,
            trending: movie.trending,
            createdAt: movie.createdAt,
            updatedAt: movie.updatedAt
          };
          return cleanMovie;
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching movie:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      toast.error('Movie not found');
      throw error;
    }
  },

  /**
   * Get movies by genre
   * @param {string} genre - Genre name
   * @returns {Promise<Array>} Array of movies
   */
  async getMoviesByGenre(genre) {
    try {
      const response = await apiService.get(API_ENDPOINTS.MOVIES.BY_GENRE(genre));
      return response.data;
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      throw error;
    }
  },

  /**
   * Search movies
   * @param {object} searchParams - Search parameters
   * @param {string} searchParams.title - Movie title
   * @param {string} searchParams.genre - Genre filter
   * @param {number} searchParams.year - Release year
   * @param {string} searchParams.sortBy - Sort field
   * @param {string} searchParams.sortDir - Sort direction
   * @returns {Promise<Array>} Array of movies
   */
  async searchMovies(searchParams) {
    try {
      const response = await apiService.get(API_ENDPOINTS.MOVIES.SEARCH, {
        params: searchParams
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  /**
   * Get personalized recommendations
   * @returns {Promise<Array>} Array of recommended movies
   */
  async getRecommendations() {
    try {
      const response = await apiService.get(API_ENDPOINTS.MOVIES.RECOMMENDATIONS);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Don't throw error for recommendations, return empty array
      return [];
    }
  },

  /**
   * Stream movie video
   * @param {number} movieId - Movie ID
   * @param {object} headers - Request headers (for range requests)
   * @returns {Promise<Blob>} Video blob
   */
  async streamMovie(movieId, headers = {}) {
    try {
      const response = await apiService.stream(
        API_ENDPOINTS.STREAMING.STREAM(movieId),
        headers
      );
      return response;
    } catch (error) {
      console.error('Error streaming movie:', error);
      toast.error('Failed to load video');
      throw error;
    }
  },

  /**
   * Update watch progress
   * @param {object} progressData - Progress data
   * @param {number} progressData.movieId - Movie ID
   * @param {number} progressData.currentPosition - Current position in seconds
   * @param {number} progressData.totalDuration - Total duration in seconds
   * @param {boolean} progressData.completed - Whether movie is completed
   * @returns {Promise<void>}
   */
  async updateWatchProgress(progressData) {
    try {
      await apiService.post(API_ENDPOINTS.STREAMING.PROGRESS, progressData);
    } catch (error) {
      console.error('Error updating watch progress:', error);
      // Don't throw error for progress updates
    }
  },

  /**
   * Mark movie as completed
   * @param {number} movieId - Movie ID
   * @returns {Promise<void>}
   */
  async markAsCompleted(movieId) {
    try {
      await apiService.post(API_ENDPOINTS.STREAMING.COMPLETE(movieId));
    } catch (error) {
      console.error('Error marking movie as completed:', error);
    }
  }
};

/**
 * Comments service for movie comments
 */
export const commentsService = {
  /**
   * Get comments for a movie
   * @param {number} movieId - Movie ID
   * @returns {Promise<Array>} Array of comments
   */
  async getCommentsByMovie(movieId) {
    try {
      const response = await apiService.get(API_ENDPOINTS.COMMENTS.BY_MOVIE(movieId));
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  /**
   * Add comment to movie
   * @param {number} movieId - Movie ID
   * @param {object} commentData - Comment data
   * @param {string} commentData.content - Comment content
   * @param {number} commentData.rating - Rating (1-5)
   * @returns {Promise<object>} Created comment
   */
  async addComment(movieId, commentData) {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.COMMENTS.ADD(movieId),
        commentData
      );
      toast.success('Comment added successfully');
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Update comment
   * @param {number} commentId - Comment ID
   * @param {object} commentData - Updated comment data
   * @returns {Promise<object>} Updated comment
   */
  async updateComment(commentId, commentData) {
    try {
      const response = await apiService.put(
        API_ENDPOINTS.COMMENTS.UPDATE(commentId),
        commentData
      );
      toast.success('Comment updated successfully');
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Delete comment
   * @param {number} commentId - Comment ID
   * @returns {Promise<void>}
   */
  async deleteComment(commentId) {
    try {
      await apiService.delete(API_ENDPOINTS.COMMENTS.DELETE(commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  }
};

/**
 * Admin movie service for admin operations
 */
export const adminMovieService = {
  /**
   * Create new movie (Admin only)
   * @param {object} movieData - Movie data
   * @returns {Promise<object>} Created movie
   */
  async createMovie(movieData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.ADMIN.MOVIES, movieData);
      toast.success('Movie created successfully');
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Update movie (Admin only)
   * @param {number} movieId - Movie ID
   * @param {object} movieData - Updated movie data
   * @returns {Promise<object>} Updated movie
   */
  async updateMovie(movieId, movieData) {
    try {
      const response = await apiService.put(
        API_ENDPOINTS.ADMIN.UPDATE_MOVIE(movieId),
        movieData
      );
      toast.success('Movie updated successfully');
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Delete movie (Admin only)
   * @param {number} movieId - Movie ID
   * @returns {Promise<void>}
   */
  async deleteMovie(movieId) {
    try {
      await apiService.delete(API_ENDPOINTS.ADMIN.DELETE_MOVIE(movieId));
      toast.success('Movie deleted successfully');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Get trending movies (Admin only)
   * @returns {Promise<Array>} Array of trending movies
   */
  async getTrendingMovies() {
    try {
      const response = await apiService.get(API_ENDPOINTS.ADMIN.TRENDING);
      return response.data;
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      throw error;
    }
  },

  /**
   * Toggle featured status (Admin only)
   * @param {number} movieId - Movie ID
   * @returns {Promise<void>}
   */
  async toggleFeatured(movieId) {
    try {
      await apiService.post(API_ENDPOINTS.ADMIN.TOGGLE_FEATURED(movieId));
      toast.success('Featured status updated');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Get admin statistics
   * @returns {Promise<object>} Admin stats
   */
  async getAdminStats() {
    try {
      const response = await apiService.get(API_ENDPOINTS.ADMIN.STATS);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  /**
   * Get all users (Admin only)
   * @returns {Promise<Array>} Array of users
   */
  async getAllUsers() {
    try {
      const response = await apiService.get(API_ENDPOINTS.ADMIN.USERS);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Delete user (Admin only)
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    try {
      await apiService.delete(API_ENDPOINTS.ADMIN.DELETE_USER(userId));
      toast.success('User deleted successfully');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  }
};

export default movieService;