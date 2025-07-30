import { apiService } from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { AuthStorage } from '../utils/storage';
import toast from 'react-hot-toast';

export const authService = {
  /**
   * Login user
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

      toast.success('Welcome back!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    }
  },

  /**
   * Register new user
   */
  async register(userData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      toast.success('Account created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    }
  },

  /**
   * Register admin user
   */
  async registerAdmin(adminData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER_ADMIN, adminData);
      toast.success('Admin registered successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Admin registration failed';
      toast.error(message);
      throw new Error(message);
    }
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      AuthStorage.clearAuth();
      apiService.clearAuthToken();
      toast.success('Logged out successfully');
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken) {
    try {
      const response = await apiService.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken
      });

      const { token, refreshToken: newRefreshToken, user } = response.data;

      AuthStorage.saveTokens(token, newRefreshToken);
      AuthStorage.saveUser(user);
      apiService.setAuthToken(token);

      return response.data;
    } catch (error) {
      AuthStorage.clearAuth();
      apiService.clearAuthToken();
      throw error;
    }
  },

  /**
   * Validate current token
   */
  async validateToken(token) {
    try {
      if (!token) return false;
      
      const response = await apiService.get(API_ENDPOINTS.AUTH.VALIDATE, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data === true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return AuthStorage.getUser();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return AuthStorage.isAuthenticated();
  },

  /**
   * Check if current user is admin
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  },

  /**
   * Auto-login with stored token
   */
  async autoLogin() {
    const token = AuthStorage.getToken();
    const user = AuthStorage.getUser();

    if (!token || !user) {
      return false;
    }

    try {
      const isValid = await this.validateToken(token);
      
      if (isValid) {
        apiService.setAuthToken(token);
        return true;
      } else {
        // Try to refresh token
        const refreshToken = AuthStorage.getRefreshToken();
        if (refreshToken) {
          try {
            await this.refreshToken(refreshToken);
            return true;
          } catch (refreshError) {
            AuthStorage.clearAuth();
            return false;
          }
        }
        return false;
      }
    } catch (error) {
      AuthStorage.clearAuth();
      return false;
    }
  }
};

export default authService;