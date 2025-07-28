import React, { createContext, useContext, useReducer, useCallback } from 'react';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  notifications: [],
  toastSettings: {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#333',
      color: '#fff',
    },
    success: {
      style: {
        background: '#10B981',
      },
    },
    error: {
      style: {
        background: '#EF4444',
      },
    },
    loading: {
      style: {
        background: '#6B7280',
      },
    },
  },
};

// Action types
const ActionTypes = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  UPDATE_TOAST_SETTINGS: 'UPDATE_TOAST_SETTINGS',
};

// Reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        ),
      };

    case ActionTypes.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };

    case ActionTypes.UPDATE_TOAST_SETTINGS:
      return {
        ...state,
        toastSettings: { ...state.toastSettings, ...action.payload },
      };

    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Generate unique ID for notifications
  const generateId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // Add notification to list
  const addNotification = useCallback((notification) => {
    const id = generateId();
    const notificationWithId = {
      id,
      timestamp: new Date(),
      ...notification,
    };

    dispatch({
      type: ActionTypes.ADD_NOTIFICATION,
      payload: notificationWithId,
    });

    // Auto-remove notification after specified duration
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  // Remove notification from list
  const removeNotification = useCallback((id) => {
    dispatch({
      type: ActionTypes.REMOVE_NOTIFICATION,
      payload: id,
    });
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_NOTIFICATIONS });
  }, []);

  // Toast notifications with react-hot-toast
  const showToast = useCallback((message, type = 'default', options = {}) => {
    const toastOptions = {
      ...state.toastSettings,
      ...options,
    };

    switch (type) {
      case 'success':
        return toast.success(message, {
          ...toastOptions,
          ...toastOptions.success,
        });

      case 'error':
        return toast.error(message, {
          ...toastOptions,
          ...toastOptions.error,
        });

      case 'loading':
        return toast.loading(message, {
          ...toastOptions,
          ...toastOptions.loading,
        });

      case 'promise':
        return toast.promise(
          options.promise,
          {
            loading: options.loading || 'Loading...',
            success: options.success || 'Success!',
            error: options.error || 'Error occurred',
          },
          toastOptions
        );

      case 'custom':
        return toast.custom(
          (t) => options.customComponent(t, message),
          toastOptions
        );

      default:
        return toast(message, toastOptions);
    }
  }, [state.toastSettings]);

  // Success toast
  const success = useCallback((message, options = {}) => {
    return showToast(message, 'success', options);
  }, [showToast]);

  // Error toast
  const error = useCallback((message, options = {}) => {
    return showToast(message, 'error', options);
  }, [showToast]);

  // Loading toast
  const loading = useCallback((message, options = {}) => {
    return showToast(message, 'loading', options);
  }, [showToast]);

  // Promise toast
  const promise = useCallback((promiseOrFn, messages, options = {}) => {
    return showToast(null, 'promise', {
      promise: promiseOrFn,
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...options,
    });
  }, [showToast]);

  // Dismiss toast
  const dismiss = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);

  // Update toast settings
  const updateToastSettings = useCallback((settings) => {
    dispatch({
      type: ActionTypes.UPDATE_TOAST_SETTINGS,
      payload: settings,
    });
  }, []);

  // Notification presets
  const notificationPresets = {
    welcome: (userName) => ({
      type: 'success',
      title: 'Welcome!',
      message: `Hello ${userName}, welcome to Netflix Clone!`,
      icon: '👋',
    }),

    movieAdded: (movieTitle) => ({
      type: 'success',
      title: 'Added to List',
      message: `"${movieTitle}" has been added to your list`,
      icon: '➕',
    }),

    movieRemoved: (movieTitle) => ({
      type: 'info',
      title: 'Removed from List',
      message: `"${movieTitle}" has been removed from your list`,
      icon: '➖',
    }),

    downloadComplete: (movieTitle) => ({
      type: 'success',
      title: 'Download Complete',
      message: `"${movieTitle}" is ready to watch offline`,
      icon: '📥',
    }),

    networkError: () => ({
      type: 'error',
      title: 'Network Error',
      message: 'Please check your internet connection and try again',
      icon: '🌐',
      duration: 0, // Don't auto-dismiss
    }),

    sessionExpired: () => ({
      type: 'warning',
      title: 'Session Expired',
      message: 'Please log in again to continue',
      icon: '⏰',
      duration: 0,
    }),

    newEpisode: (showTitle) => ({
      type: 'info',
      title: 'New Episode Available',
      message: `New episode of "${showTitle}" is now available`,
      icon: '🆕',
    }),
  };

  // Show preset notification
  const showPreset = useCallback((presetName, ...args) => {
    const preset = notificationPresets[presetName];
    if (preset) {
      const notification = preset(...args);
      return addNotification(notification);
    }
  }, [addNotification]);

  // Batch notifications
  const showBatch = useCallback((notifications) => {
    const ids = [];
    notifications.forEach((notification) => {
      const id = addNotification(notification);
      ids.push(id);
    });
    return ids;
  }, [addNotification]);

  // Context value
  const value = {
    // State
    notifications: state.notifications,
    toastSettings: state.toastSettings,

    // Toast functions
    showToast,
    success,
    error,
    loading,
    promise,
    dismiss,

    // Notification functions
    addNotification,
    removeNotification,
    clearNotifications,
    showPreset,
    showBatch,

    // Settings
    updateToastSettings,

    // Presets
    notificationPresets,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;