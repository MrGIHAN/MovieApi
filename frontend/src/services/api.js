import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS, TOAST_MESSAGES } from '../utils/constants';
import { AuthStorage } from '../utils/storage';
import toast from 'react-hot-toast';

/**
 * Base API configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('API Base URL:', API_BASE_URL);

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
    console.log('API Response interceptor - Success:', response.status, response.config.url);
    
    // Handle circular reference issues in the response
    if (response.data && typeof response.data === 'object') {
      try {
        // Test if the response can be serialized
        JSON.stringify(response.data);
      } catch (circularError) {
        console.warn('Circular reference detected in response, attempting to clean');
        // If we can't serialize, the response has circular references
        // We'll let the individual service handle this
      }
    }
    
    return response;
  },
  async (error) => {
    console.log('API Response interceptor - Error:', error.response?.status, error.config?.url);
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

          const { token, refreshToken: newRefreshToken, user } = response.data;
          AuthStorage.saveTokens(token, newRefreshToken);
          AuthStorage.saveUser(user);

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
      toast.error('Access denied. You don\'t have permission for this action.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (!error.response) {
      toast.error(TOAST_MESSAGES.ERROR.NETWORK);
    }

    return Promise.reject(error);
  }
);

/**
 * API service methods
 */
export const apiService = {
  get: (url, config = {}) => {
    console.log('API GET request:', url);
    return api.get(url, config).catch(error => {
      console.error('API GET error for URL:', url, error);
      throw error;
    });
  },
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

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

  stream: (url, headers = {}) => {
    return api.get(url, {
      headers: { ...headers },
      responseType: 'blob',
    });
  },

  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  clearAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;