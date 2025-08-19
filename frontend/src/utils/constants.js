
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081';


// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REGISTER_ADMIN: '/api/auth/register-admin',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    VALIDATE: '/api/auth/validate',
  },
  
  // Movie endpoints
  MOVIES: {
    BASE: '/api/movies',
    BY_ID: (id) => `/api/movies/${id}`,
    BY_GENRE: (genre) => `/api/movies/genre/${genre}`,
    SEARCH: '/api/movies/search',
    RECOMMENDATIONS: '/api/movies/recommendations',
  },
  
  // User endpoints
  USERS: {
    ME: '/api/users/me',
    WATCHLIST: '/api/users/watchlist',
    FAVORITES: '/api/users/favorites',
    WATCH_LATER: '/api/watch-later',
    HISTORY: '/api/users/history',
    PREFERENCES: '/api/users/preferences',
    ADD_TO_WATCHLIST: (movieId) => `/api/users/watchlist/${movieId}`,
    ADD_TO_FAVORITES: (movieId) => `/api/users/favorites/${movieId}`,
    ADD_TO_WATCH_LATER: (movieId) => `/api/watch-later/${movieId}`,
    UPDATE_HISTORY: (movieId) => `/api/users/history/${movieId}`,
  },
  
  // Streaming endpoints - FIXED: Uses full URL for video streaming
  STREAMING: {
    STREAM: (movieId) => `${API_BASE_URL}/api/stream/${movieId}`,
    PROGRESS: '/api/stream/progress',
    COMPLETE: (movieId) => `/api/stream/complete/${movieId}`,
  },
  
  // Comments endpoints
  COMMENTS: {
    BY_MOVIE: (movieId) => `/api/comments/movie/${movieId}`,
    ADD: (movieId) => `/api/comments/movie/${movieId}`,
    UPDATE: (commentId) => `/api/comments/${commentId}`,
    DELETE: (commentId) => `/api/comments/${commentId}`,
  },
  
  // Admin endpoints
  ADMIN: {
    STATS: '/api/admin/stats',
    USERS: '/api/admin/users',
    MOVIES: '/api/admin/movies',
    UPLOAD_VIDEO: '/api/admin/upload/video',
    UPLOAD_IMAGE: '/api/admin/upload/image',
    DELETE_USER: (userId) => `/api/admin/users/${userId}`,
    UPDATE_MOVIE: (movieId) => `/api/admin/movies/${movieId}`,
    DELETE_MOVIE: (movieId) => `/api/admin/movies/${movieId}`,
    TRENDING: '/api/admin/movies/trending',
    TOGGLE_FEATURED: (movieId) => `/api/admin/movies/${movieId}/feature`,
  },
};

// Movie Genres
export const GENRES = [
  'ACTION',
  'COMEDY', 
  'DRAMA',
  'THRILLER',
  'HORROR',
  'ROMANCE',
  'SCI_FI',
  'FANTASY',
  'ADVENTURE',
  'CRIME',
  'MYSTERY',
  'ANIMATION',
  'FAMILY',
  'DOCUMENTARY',
  'MUSICAL',
  'WAR',
  'WESTERN',
  'HISTORICAL',
  'BIOGRAPHY',
  'SPORT',
];

// Genre Display Names
export const GENRE_DISPLAY_NAMES = {
  ACTION: 'Action',
  COMEDY: 'Comedy',
  DRAMA: 'Drama',
  THRILLER: 'Thriller',
  HORROR: 'Horror',
  ROMANCE: 'Romance',
  SCI_FI: 'Sci-Fi',
  FANTASY: 'Fantasy',
  ADVENTURE: 'Adventure',
  CRIME: 'Crime',
  MYSTERY: 'Mystery',
  ANIMATION: 'Animation',
  FAMILY: 'Family',
  DOCUMENTARY: 'Documentary',
  MUSICAL: 'Musical',
  WAR: 'War',
  WESTERN: 'Western',
  HISTORICAL: 'Historical',
  BIOGRAPHY: 'Biography',
  SPORT: 'Sport',
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'movieapi_token',
  REFRESH_TOKEN: 'movieapi_refresh_token',
  USER: 'movieapi_user',
  PREFERENCES: 'movieapi_preferences',
};

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Successfully logged in!',
    LOGOUT: 'Successfully logged out!',
    REGISTER: 'Account created successfully!',
    UPDATE_PROFILE: 'Profile updated successfully!',
    ADD_TO_WATCHLIST: 'Added to watchlist!',
    REMOVE_FROM_WATCHLIST: 'Removed from watchlist!',
    ADD_TO_FAVORITES: 'Added to favorites!',
    REMOVE_FROM_FAVORITES: 'Removed from favorites!',
    FILE_UPLOAD: 'File uploaded successfully!',
    MOVIE_CREATED: 'Movie created successfully!',
    MOVIE_UPDATED: 'Movie updated successfully!',
    MOVIE_DELETED: 'Movie deleted successfully!',
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Please log in to continue',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Please check your input',
    FILE_TOO_LARGE: 'File too large',
    INVALID_FILE_TYPE: 'Invalid file type',
    VIDEO_LOAD_ERROR: 'Failed to load video',
    LOGIN_FAILED: 'Login failed. Please check your credentials.',
    REGISTER_FAILED: 'Registration failed. Please try again.',
  }
};

// File Upload Constraints
export const FILE_CONSTRAINTS = {
  VIDEO: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_TYPES: ['video/mp4', 'video/avi', 'video/quicktime', 'video/wmv', 'video/flv', 'video/webm'],
  },
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  }
};

// Video Player Configuration
export const VIDEO_PLAYER = {
  PROGRESS_UPDATE_INTERVAL: 5000, // 5 seconds
  COMPLETION_THRESHOLD: 0.9, // 90% watched = completed
  SEEK_STEP: 10, // seconds
  VOLUME_STEP: 0.1,
  PLAYBACK_RATES: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
  AUTO_HIDE_CONTROLS_DELAY: 3000, // 3 seconds
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// App constants
export const APP_NAME = 'MovieAPI';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const SUPPORTED_VIDEO_FORMATS = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
export const SUPPORTED_IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

// Routes
export const ROUTES = {
  HOME: '/',
  BROWSE: '/browse',
  SEARCH: '/search',
  MOVIE_DETAIL: '/movie/:id',
  WATCH: '/watch/:id',
  PROFILE: '/profile',
  FAVORITES: '/favorites',
  WATCHLIST: '/watchlist',
  WATCH_LATER: '/watch-later',
  HISTORY: '/history',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_MOVIES: '/admin/movies',
  ADMIN_USERS: '/admin/users',
  ADMIN_UPLOAD: '/admin/upload',
  LOGIN: '/login',
  REGISTER: '/register',
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// API Response Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};


const constants = {
  API_BASE_URL,
  API_ENDPOINTS,
  GENRES,
  GENRE_DISPLAY_NAMES,
  STORAGE_KEYS,
  USER_ROLES,
  TOAST_MESSAGES,
  FILE_CONSTRAINTS,
  VIDEO_PLAYER,
  PAGINATION,
  APP_NAME,
  DEFAULT_PAGE_SIZE,
  MAX_FILE_SIZE,
  SUPPORTED_VIDEO_FORMATS,
  SUPPORTED_IMAGE_FORMATS,
  ROUTES,
  BREAKPOINTS,
  HTTP_STATUS,
  LOADING_STATES,
};

export default constants;
