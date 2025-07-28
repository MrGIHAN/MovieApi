import { apiService } from './api';
import { API_ENDPOINTS, TOAST_MESSAGES } from '../utils/constants';
import { getErrorMessage } from '../utils/helpers';
import toast from 'react-hot-toast';

/**
 * User service for handling user-related operations
 */
export const userService = {
  /**
   * Get current user profile
   * @returns {Promise<object>} User profile data
   */
  async getProfile() {
    try {
      const response = await apiService.get(API_ENDPOINTS.USERS.ME);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {object} profileData - Profile update data
   * @returns {Promise<object>} Updated profile
   */
  async updateProfile(profileData) {
    try {
      const response = await apiService.put(API_ENDPOINTS.USERS.ME, profileData);
      toast.success(TOAST_MESSAGES.SUCCESS.PROFILE_UPDATED);
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Get user preferences
   * @returns {Promise<object>} User preferences
   */
  async getPreferences() {
    try {
      const response = await apiService.get(API_ENDPOINTS.USERS.PREFERENCES);
      return response.data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return {}; // Return empty object if no preferences
    }
  },

  /**
   * Update user preferences
   * @param {object} preferences - Preferences data
   * @returns {Promise<object>} Updated preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await apiService.put(API_ENDPOINTS.USERS.PREFERENCES, preferences);
      toast.success('Preferences updated successfully');
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  }
};

/**
 * Watchlist service for managing user's watchlist
 */
export const watchlistService = {
  /**
   * Get user's watchlist
   * @returns {Promise<Array>} Array of movies in watchlist
   */
  async getWatchlist() {
    try {
      const response = await apiService.get(API_ENDPOINTS.USERS.WATCHLIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      return [];
    }
  },

  /**
   * Add movie to watchlist
   * @param {number} movieId - Movie ID
   * @returns {Promise<void>}
   */
  async addToWatchlist(movieId) {
    try {
      await apiService.post(API_ENDPOINTS.USERS.ADD_TO_WATCHLIST(movieId));
      toast.success(TOAST_MESSAGES.SUCCESS.WATCHLIST_ADDED);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Remove movie from watchlist
   * @param {number} movieId - Movie ID
   * @returns {Promise<void>}
   */
  async removeFromWatchlist(movieId) {
    try {
      await apiService.delete(API_ENDPOINTS.USERS.ADD_TO_WATCHLIST(movieId));
      toast.success(TOAST_MESSAGES.SUCCESS.WATCHLIST_REMOVED);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  }
};

/**
 * Favorites service for managing user's favorite movies
 */
export const favoritesService = {
  /**
   * Get user's favorite movies
   * @returns {Promise<Array>} Array of favorite movies
   */
  async getFavorites() {
    try {
      const response = await apiService.get(API_ENDPOINTS.USERS.FAVORITES);
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },

  /**
   * Add movie to favorites
   * @param {number} movieId - Movie ID
   * @returns {Promise<void>}
   */
  async addToFavorites(movieId) {
    try {
      await apiService.post(API_ENDPOINTS.USERS.ADD_TO_FAVORITES(movieId));
      toast.success(TOAST_MESSAGES.SUCCESS.FAVORITE_ADDED);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Remove movie from favorites
   * @param {number} movieId - Movie ID
   * @returns {Promise<void>}
   */
  async removeFromFavorites(movieId) {
    try {
      await apiService.delete(API_ENDPOINTS.USERS.ADD_TO_FAVORITES(movieId));
      toast.success(TOAST_MESSAGES.SUCCESS.FAVORITE_REMOVED);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  }
};

/**
 * Watch Later service for managing user's watch later list
 */
export const watchLaterService = {
  /**
   * Get user's watch later list
   * @returns {Promise<Array>} Array of movies in watch later
   */
  async getWatchLater() {
    try {
      const response = await apiService.get(API_ENDPOINTS.USERS.WATCH_LATER);
      return response.data;
    } catch (error) {
      console.error('Error fetching watch later:', error);
      return [];
    }
  },

  /**
   * Add movie to watch later
   * @param {number} movieId - Movie ID
   * @returns {Promise<void>}
   */
  async addToWatchLater(movieId) {
    try {
      await apiService.post(API_ENDPOINTS.USERS.ADD_TO_WATCH_LATER(movieId));
      toast.success(TOAST_MESSAGES.SUCCESS.WATCH_LATER_ADDED);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  },

  /**
   * Remove movie from watch later
   * @param {number} movieId - Movie ID
   * @returns {Promise<void>}
   */
  async removeFromWatchLater(movieId) {
    try {
      await apiService.delete(API_ENDPOINTS.USERS.ADD_TO_WATCH_LATER(movieId));
      toast.success(TOAST_MESSAGES.SUCCESS.WATCH_LATER_REMOVED);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      throw error;
    }
  }
};

/**
 * Watch History service for managing user's watch history
 */
export const watchHistoryService = {
  /**
   * Get user's watch history
   * @returns {Promise<Array>} Array of watched movies with progress
   */
  async getWatchHistory() {
    try {
      const response = await apiService.get(API_ENDPOINTS.USERS.HISTORY);
      return response.data;
    } catch (error) {
      console.error('Error fetching watch history:', error);
      return [];
    }
  },

  /**
   * Update watch history for a movie
   * @param {number} movieId - Movie ID
   * @param {object} historyData - History data
   * @param {number} historyData.position - Current position in seconds
   * @param {boolean} historyData.completed - Whether movie is completed
   * @returns {Promise<void>}
   */
  async updateWatchHistory(movieId, historyData) {
    try {
      await apiService.post(API_ENDPOINTS.USERS.UPDATE_HISTORY(movieId), historyData);
    } catch (error) {
      console.error('Error updating watch history:', error);
      // Don't show error toast for history updates
    }
  },

  /**
   * Get continue watching list (movies with progress but not completed)
   * @returns {Promise<Array>} Array of movies to continue watching
   */
  async getContinueWatching() {
    try {
      const history = await this.getWatchHistory();
      return history.filter(item => 
        item.watchPositionSeconds > 0 && 
        !item.completed &&
        item.watchPositionSeconds < (item.movie?.duration?.seconds || Infinity) * 0.9
      );
    } catch (error) {
      console.error('Error fetching continue watching:', error);
      return [];
    }
  }
};

export default userService;