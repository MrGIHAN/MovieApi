import { STORAGE_KEYS } from './constants';

/**
 * Generic local storage utility class
 */
class Storage {
  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  static setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Stored value or default value
   */
  static getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  static removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  /**
   * Clear all items from localStorage
   */
  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Check if key exists in localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Whether key exists
   */
  static hasItem(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error('Error checking localStorage:', error);
      return false;
    }
  }

  /**
   * Get all keys from localStorage
   * @returns {string[]} Array of keys
   */
  static getAllKeys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes (approximate)
   * @returns {number} Storage size in bytes
   */
  static getStorageSize() {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }
}

/**
 * Auth-specific storage utilities
 */
export const AuthStorage = {
  /**
   * Save authentication tokens
   * @param {string} token - Access token
   * @param {string} refreshToken - Refresh token
   */
  saveTokens(token, refreshToken) {
    Storage.setItem(STORAGE_KEYS.TOKEN, token);
    Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  /**
   * Get access token
   * @returns {string|null} Access token
   */
  getToken() {
    return Storage.getItem(STORAGE_KEYS.TOKEN);
  },

  /**
   * Get refresh token
   * @returns {string|null} Refresh token
   */
  getRefreshToken() {
    return Storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Save user data
   * @param {object} user - User object
   */
  saveUser(user) {
    Storage.setItem(STORAGE_KEYS.USER, user);
  },

  /**
   * Get user data
   * @returns {object|null} User object
   */
  getUser() {
    return Storage.getItem(STORAGE_KEYS.USER);
  },

  /**
   * Clear all auth data
   */
  clearAuth() {
    Storage.removeItem(STORAGE_KEYS.TOKEN);
    Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    Storage.removeItem(STORAGE_KEYS.USER);
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Whether user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Check if user is admin
   * @returns {boolean} Whether user is admin
   */
  isAdmin() {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }
};

/**
 * Preferences storage utilities
 */
export const PreferencesStorage = {
  /**
   * Save theme preference
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  saveTheme(theme) {
    Storage.setItem(STORAGE_KEYS.THEME, theme);
  },

  /**
   * Get theme preference
   * @returns {string} Theme name
   */
  getTheme() {
    return Storage.getItem(STORAGE_KEYS.THEME, 'dark');
  },

  /**
   * Save volume preference
   * @param {number} volume - Volume level (0-1)
   */
  saveVolume(volume) {
    Storage.setItem(STORAGE_KEYS.VOLUME, volume);
  },

  /**
   * Get volume preference
   * @returns {number} Volume level
   */
  getVolume() {
    return Storage.getItem(STORAGE_KEYS.VOLUME, 1);
  },

  /**
   * Save playback quality preference
   * @param {string} quality - Quality setting
   */
  savePlaybackQuality(quality) {
    Storage.setItem(STORAGE_KEYS.PLAYBACK_QUALITY, quality);
  },

  /**
   * Get playback quality preference
   * @returns {string} Quality setting
   */
  getPlaybackQuality() {
    return Storage.getItem(STORAGE_KEYS.PLAYBACK_QUALITY, 'auto');
  }
};

/**
 * Watch progress storage utilities
 */
export const WatchProgressStorage = {
  /**
   * Save watch progress for a movie
   * @param {number} movieId - Movie ID
   * @param {number} currentTime - Current time in seconds
   * @param {number} duration - Total duration in seconds
   */
  saveProgress(movieId, currentTime, duration) {
    const progressKey = `watch_progress_${movieId}`;
    const progress = {
      movieId,
      currentTime,
      duration,
      timestamp: Date.now(),
      percentage: duration ? (currentTime / duration) * 100 : 0
    };
    Storage.setItem(progressKey, progress);
  },

  /**
   * Get watch progress for a movie
   * @param {number} movieId - Movie ID
   * @returns {object|null} Progress object
   */
  getProgress(movieId) {
    const progressKey = `watch_progress_${movieId}`;
    return Storage.getItem(progressKey);
  },

  /**
   * Remove watch progress for a movie
   * @param {number} movieId - Movie ID
   */
  removeProgress(movieId) {
    const progressKey = `watch_progress_${movieId}`;
    Storage.removeItem(progressKey);
  },

  /**
   * Get all watch progress data
   * @returns {object[]} Array of progress objects
   */
  getAllProgress() {
    const keys = Storage.getAllKeys();
    const progressKeys = keys.filter(key => key.startsWith('watch_progress_'));
    return progressKeys.map(key => Storage.getItem(key)).filter(Boolean);
  },

  /**
   * Clear old progress data (older than 30 days)
   */
  clearOldProgress() {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const keys = Storage.getAllKeys();
    const progressKeys = keys.filter(key => key.startsWith('watch_progress_'));
    
    progressKeys.forEach(key => {
      const progress = Storage.getItem(key);
      if (progress && progress.timestamp < thirtyDaysAgo) {
        Storage.removeItem(key);
      }
    });
  }
};

/**
 * Search history storage utilities
 */
export const SearchHistoryStorage = {
  /**
   * Add search term to history
   * @param {string} term - Search term
   */
  addSearchTerm(term) {
    if (!term || term.trim().length < 2) return;
    
    const history = this.getSearchHistory();
    const trimmedTerm = term.trim();
    
    // Remove if already exists
    const filtered = history.filter(item => item.term !== trimmedTerm);
    
    // Add to beginning
    filtered.unshift({
      term: trimmedTerm,
      timestamp: Date.now()
    });
    
    // Keep only last 20 searches
    const limited = filtered.slice(0, 20);
    
    Storage.setItem('search_history', limited);
  },

  /**
   * Get search history
   * @returns {object[]} Array of search objects
   */
  getSearchHistory() {
    return Storage.getItem('search_history', []);
  },

  /**
   * Clear search history
   */
  clearSearchHistory() {
    Storage.removeItem('search_history');
  },

  /**
   * Remove specific search term
   * @param {string} term - Term to remove
   */
  removeSearchTerm(term) {
    const history = this.getSearchHistory();
    const filtered = history.filter(item => item.term !== term);
    Storage.setItem('search_history', filtered);
  }
};

/**
 * Recently viewed storage utilities
 */
export const RecentlyViewedStorage = {
  /**
   * Add movie to recently viewed
   * @param {object} movie - Movie object
   */
  addMovie(movie) {
    if (!movie || !movie.id) return;
    
    const recent = this.getRecentlyViewed();
    
    // Remove if already exists
    const filtered = recent.filter(item => item.id !== movie.id);
    
    // Add to beginning
    filtered.unshift({
      ...movie,
      viewedAt: Date.now()
    });
    
    // Keep only last 50 movies
    const limited = filtered.slice(0, 50);
    
    Storage.setItem('recently_viewed', limited);
  },

  /**
   * Get recently viewed movies
   * @returns {object[]} Array of movie objects
   */
  getRecentlyViewed() {
    return Storage.getItem('recently_viewed', []);
  },

  /**
   * Clear recently viewed
   */
  clearRecentlyViewed() {
    Storage.removeItem('recently_viewed');
  },

  /**
   * Remove specific movie from recently viewed
   * @param {number} movieId - Movie ID
   */
  removeMovie(movieId) {
    const recent = this.getRecentlyViewed();
    const filtered = recent.filter(item => item.id !== movieId);
    Storage.setItem('recently_viewed', filtered);
  }
};

export default Storage;