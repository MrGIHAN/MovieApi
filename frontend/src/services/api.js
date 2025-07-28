import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, TOAST_MESSAGES } from '../utils/constants';
import { AuthStorage } from '../utils/storage';
import toast from 'react-hot-toast';

/**
 * Base API configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
  (config) => {
    const token = AuthStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle common errors and token refresh
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = AuthStorage.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const { token, refreshToken: newRefreshToken } = response.data;
          AuthStorage.saveTokens(token, newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        AuthStorage.clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle different error status codes
    if (error.response?.status === 403) {
      toast.error(TOAST_MESSAGES.ERROR.FORBIDDEN);
    } else if (error.response?.status === 404) {
      toast.error(TOAST_MESSAGES.ERROR.NOT_FOUND);
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      toast.error(TOAST_MESSAGES.ERROR.NETWORK_ERROR);
    }

    return Promise.reject(error);
  }
);

/**
 * API service methods
 */
export const apiService = {
  /**
   * Generic GET request
   * @param {string} url - Endpoint URL
   * @param {object} config - Axios config
   * @returns {Promise} Response promise
   */
  get: (url, config = {}) => api.get(url, config),

  /**
   * Generic POST request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request data
   * @param {object} config - Axios config
   * @returns {Promise} Response promise
   */
  post: (url, data = {}, config = {}) => api.post(url, data, config),

  /**
   * Generic PUT request
   * @param {string} url - Endpoint URL
   * @param {object} data - Request data
   * @param {object} config - Axios config
   * @returns {Promise} Response promise
   */
  put: (url, data = {}, config = {}) => api.put(url, data, config),

  /**
   * Generic DELETE request
   * @param {string} url - Endpoint URL
   * @param {object} config - Axios config
   * @returns {Promise} Response promise
   */
  delete: (url, config = {}) => api.delete(url, config),

  /**
   * File upload request
   * @param {string} url - Endpoint URL
   * @param {FormData} formData - Form data with files
   * @param {Function} onUploadProgress - Progress callback
   * @returns {Promise} Response promise
   */
  upload: (url, formData, onUploadProgress) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
  },

  /**
   * Download file request
   * @param {string} url - File URL
   * @param {object} config - Axios config
   * @returns {Promise} Response promise
   */
  download: (url, config = {}) => {
    return api.get(url, {
      ...config,
      responseType: 'blob',
    });
  },

  /**
   * Stream video request with range support
   * @param {string} url - Video URL
   * @param {object} headers - Custom headers (for Range requests)
   * @returns {Promise} Response promise
   */
  stream: (url, headers = {}) => {
    return api.get(url, {
      headers: {
        ...headers,
      },
      responseType: 'blob',
    });
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    return AuthStorage.isAuthenticated();
  },

  /**
   * Get current user from storage
   * @returns {object|null} User object
   */
  getCurrentUser: () => {
    return AuthStorage.getUser();
  },

  /**
   * Set auth token for requests
   * @param {string} token - JWT token
   */
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  /**
   * Clear auth token
   */
  clearAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Request/Response logging for development
 */
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(
    (config) => {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers,
      });
      return config;
    },
    (error) => {
      console.error('❌ API Request Error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.error(`❌ API Response Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return Promise.reject(error);
    }
  );
}

export default api;