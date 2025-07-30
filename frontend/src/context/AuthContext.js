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
        const token = AuthStorage.getToken();
        const user = AuthStorage.getUser();

        if (token && user) {
          // Validate token
          const isValid = await authService.validateToken(token);
          
          if (isValid) {
            dispatch({
              type: ActionTypes.SET_USER,
              payload: user,
            });
          } else {
            // Try to refresh token
            const refreshToken = AuthStorage.getRefreshToken();
            if (refreshToken) {
              try {
                const response = await authService.refreshToken(refreshToken);
                dispatch({
                  type: ActionTypes.LOGIN_SUCCESS,
                  payload: { user: response.user },
                });
              } catch (refreshError) {
                AuthStorage.clearAuth();
                dispatch({ type: ActionTypes.SET_LOADING, payload: false });
              }
            } else {
              AuthStorage.clearAuth();
              dispatch({ type: ActionTypes.SET_LOADING, payload: false });
            }
          }
        } else {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auto-login failed:', error);
        AuthStorage.clearAuth();
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user
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
   */
  const updateUser = (updates) => {
    dispatch({
      type: ActionTypes.UPDATE_USER,
      payload: updates,
    });

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
   * Check if user is admin
   */
  const isAdmin = () => {
    return state.user?.role === 'ADMIN';
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
    logout,
    updateUser,
    clearError,

    // Utility functions
    isAdmin,
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