import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthStorage } from '../utils/storage';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const ActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case ActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case ActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case ActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true });

      try {
        // Try to auto-login with stored token
        const success = await authService.autoLogin();
        
        if (success) {
          const user = authService.getCurrentUser();
          dispatch({
            type: ActionTypes.SET_USER,
            payload: user,
          });
        } else {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auto-login failed:', error);
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Setup token refresh
  useEffect(() => {
    if (state.isAuthenticated) {
      const refreshInterval = authService.setupTokenRefresh(() => {
        // Token expired, logout user
        logout();
      });

      return () => {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      };
    }
  }, [state.isAuthenticated]);

  /**
   * Login user
   * @param {object} credentials - Login credentials
   */
  const login = async (credentials) => {
    dispatch({ type: ActionTypes.LOGIN_START });

    try {
      const response = await authService.login(credentials);
      
      dispatch({
        type: ActionTypes.LOGIN_SUCCESS,
        payload: { user: response.user },
      });

      return response;
    } catch (error) {
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  /**
   * Register user
   * @param {object} userData - Registration data
   */
  const register = async (userData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const response = await authService.register(userData);
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  /**
   * Register admin
   * @param {object} adminData - Admin registration data
   */
  const registerAdmin = async (adminData) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const response = await authService.registerAdmin(adminData);
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      return response;
    } catch (error) {
      dispatch({
        type: ActionTypes.LOGIN_FAILURE,
        payload: { error: error.message },
      });
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: ActionTypes.LOGOUT });
    }
  };

  /**
   * Update user profile
   * @param {object} updates - Profile updates
   */
  const updateUser = (updates) => {
    // Update user in context
    dispatch({
      type: ActionTypes.UPDATE_USER,
      payload: updates,
    });

    // Update user in storage
    const updatedUser = { ...state.user, ...updates };
    AuthStorage.saveUser(updatedUser);
  };

  /**
   * Clear authentication error
   */
  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Has role
   */
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  /**
   * Check if user is admin
   * @returns {boolean} Is admin
   */
  const isAdmin = () => {
    return hasRole('ADMIN');
  };

  /**
   * Check if user is regular user
   * @returns {boolean} Is user
   */
  const isUser = () => {
    return hasRole('USER');
  };

  /**
   * Get user's full name
   * @returns {string} Full name
   */
  const getUserFullName = () => {
    if (!state.user) return '';
    return `${state.user.firstName} ${state.user.lastName}`.trim();
  };

  /**
   * Get user's initials
   * @returns {string} User initials
   */
  const getUserInitials = () => {
    if (!state.user) return 'U';
    
    const firstInitial = state.user.firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = state.user.lastName?.charAt(0).toUpperCase() || '';
    
    return firstInitial + lastInitial || 'U';
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    login,
    register,
    registerAdmin,
    logout,
    updateUser,
    clearError,

    // Utility functions
    hasRole,
    isAdmin,
    isUser,
    getUserFullName,
    getUserInitials,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;