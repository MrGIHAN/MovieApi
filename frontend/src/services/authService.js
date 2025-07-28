import { apiService } from './api';
import { API_ENDPOINTS, TOAST_MESSAGES } from '../utils/constants';
import { AuthStorage } from '../utils/storage';
import toast from 'react-hot-toast';

/**
 * Authentication service for handling user auth operations
 */
export const authService = {
  /**
   * Login user
   * @param {object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<object>} Auth response with user and tokens
   */
  async login(credentials) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      const { token, refreshToken, user } = response.data;

      // Store auth data
      AuthStorage.saveTokens(token, refreshToken);
      AuthStorage.saveUser(user);

      // Set token for future requests
      apiService.setAuthToken(token);

      toast.success(TOAST_MESSAGES.SUCCESS.LOGIN);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || TOAST_MESSAGES.ERROR.LOGIN_FAILED;
      toast.error(message);
      throw error;
    }
  },

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @returns {Promise<object>} Registration response
   */
  async register(userData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      toast.success(TOAST_MESSAGES.SUCCESS.REGISTER);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || TOAST_MESSAGES.ERROR.REGISTER_FAILED;
      toast.error(message);
      throw error;
    }
  },

  /**
   * Register admin user
   * @param {object} adminData - Admin registration data
   * @returns {Promise<object>} Registration response
   */
  async registerAdmin(adminData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER_ADMIN, adminData);
      toast.success('Admin registered successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Admin registration failed';
      toast.error(message);
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Call backend logout endpoint
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if backend call fails
      console.error('Logout error:', error);
    } finally {
      // Clear local auth data
      AuthStorage.clearAuth();
      apiService.clearAuthToken();
      toast.success(TOAST_MESSAGES.SUCCESS.LOGOUT);
    }
  },

  /**
   * Refresh authentication token
   * @returns {Promise<object>} New auth tokens
   */
  async refreshToken() {
    try {
      const refreshToken = AuthStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiService.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });

      const { token, refreshToken: newRefreshToken, user } = response.data;

      // Update stored tokens
      AuthStorage.saveTokens(token, newRefreshToken);
      AuthStorage.saveUser(user);
      apiService.setAuthToken(token);

      return response.data;
    } catch (error) {
      // Refresh failed, clear auth data
      AuthStorage.clearAuth();
      apiService.clearAuthToken();
      throw error;
    }
  },

  /**
   * Validate current token
   * @returns {Promise<boolean>} Token validity
   */
  async validateToken() {
    try {
      const token = AuthStorage.getToken();
      if (!token) return false;

      const response = await apiService.get(API_ENDPOINTS.AUTH.VALIDATE, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data === true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get current authenticated user
   * @returns {object|null} Current user object
   */
  getCurrentUser() {
    return AuthStorage.getUser();
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return AuthStorage.isAuthenticated();
  },

  /**
   * Check if current user is admin
   * @returns {boolean} Admin status
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  },

  /**
   * Check if current user is regular user
   * @returns {boolean} User status
   */
  isUser() {
    const user = this.getCurrentUser();
    return user?.role === 'USER';
  },

  /**
   * Get user's full name
   * @returns {string} Full name
   */
  getUserFullName() {
    const user = this.getCurrentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  },

  /**
   * Get user's initials
   * @returns {string} User initials
   */
  getUserInitials() {
    const user = this.getCurrentUser();
    if (!user) return 'U';
    
    const firstInitial = user.firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0).toUpperCase() || '';
    
    return firstInitial + lastInitial || 'U';
  },

  /**
   * Auto-login with stored token
   * @returns {Promise<boolean>} Login success status
   */
  async autoLogin() {
    const token = AuthStorage.getToken();
    const user = AuthStorage.getUser();

    if (!token || !user) {
      return false;
    }

    try {
      // Validate stored token
      const isValid = await this.validateToken();
      
      if (isValid) {
        apiService.setAuthToken(token);
        return true;
      } else {
        // Try to refresh token
        try {
          await this.refreshToken();
          return true;
        } catch (refreshError) {
          // Refresh failed, clear auth data
          AuthStorage.clearAuth();
          return false;
        }
      }
    } catch (error) {
      AuthStorage.clearAuth();
      return false;
    }
  },

  /**
   * Setup automatic token refresh
   * @param {Function} onTokenExpired - Callback for token expiration
   */
  setupTokenRefresh(onTokenExpired) {
    // Check token validity every 5 minutes
    const checkInterval = 5 * 60 * 1000; // 5 minutes

    const tokenCheckInterval = setInterval(async () => {
      if (this.isAuthenticated()) {
        try {
          const isValid = await this.validateToken();
          if (!isValid) {
            // Try to refresh
            await this.refreshToken();
          }
        } catch (error) {
          // Token refresh failed
          clearInterval(tokenCheckInterval);
          AuthStorage.clearAuth();
          apiService.clearAuthToken();
          
          if (onTokenExpired) {
            onTokenExpired();
          }
        }
      } else {
        // Not authenticated, stop checking
        clearInterval(tokenCheckInterval);
      }
    }, checkInterval);

    return tokenCheckInterval;
  },

  /**
   * Handle authentication errors
   * @param {Error} error - Authentication error
   */
  handleAuthError(error) {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      AuthStorage.clearAuth();
      apiService.clearAuthToken();
      toast.error(TOAST_MESSAGES.ERROR.UNAUTHORIZED);
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden - user doesn't have permission
      toast.error(TOAST_MESSAGES.ERROR.FORBIDDEN);
    } else {
      // Other auth errors
      const message = error.response?.data?.message || TOAST_MESSAGES.ERROR.GENERAL;
      toast.error(message);
    }
  }
};

export default authService;