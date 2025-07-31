// API Base URL
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
    WATCH_LATER: '/api/users/watchlater',
    HISTORY: '/api/users/history',
    PREFERENCES: '/api/users/preferences',
    ADD_TO_WATCHLIST: (movieId) => `/api/users/watchlist/${movieId}`,
    ADD_TO_FAVORITES: (movieId) => `/api/users/favorites/${movieId}`,
    ADD_TO_WATCH_LATER: (movieId) => `/api/users/watchlater/${movieId}`,
    UPDATE_HISTORY: (movieId) => `/api/users/history/${movieId}`,
  },
  
  // Streaming endpoints
  STREAMING: {
    STREAM: (movieId) => `/api/stream/${movieId}`,
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
  
  // Admin endpoints - Updated to match backend controller
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
  'HORROR',
  'THRILLER',
  'ROMANCE',
  'SCIENCE_FICTION',
  'FANTASY',
  'DOCUMENTARY',
  'ANIMATION',
  'MYSTERY',
  'CRIME',
  'ADVENTURE',
  'FAMILY',
  'MUSICAL',
  'WAR',
  'WESTERN',
  'BIOGRAPHY',
  'HISTORY',
  'SPORT'
];

// Genre Display Names
export const GENRE_DISPLAY_NAMES = {
  ACTION: 'Action',
  COMEDY: 'Comedy',
  DRAMA: 'Drama',
  HORROR: 'Horror',
  THRILLER: 'Thriller',
  ROMANCE: 'Romance',
  SCIENCE_FICTION: 'Sci-Fi',
  FANTASY: 'Fantasy',
  DOCUMENTARY: 'Documentary',
  ANIMATION: 'Animation',
  MYSTERY: 'Mystery',
  CRIME: 'Crime',
  ADVENTURE: 'Adventure',
  FAMILY: 'Family',
  MUSICAL: 'Musical',
  WAR: 'War',
  WESTERN: 'Western',
  BIOGRAPHY: 'Biography',
  HISTORY: 'History',
  SPORT: 'Sport'
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'netflix_token',
  REFRESH_TOKEN: 'netflix_refresh_token',
  USER: 'netflix_user',
  THEME: 'netflix_theme',
  VOLUME: 'netflix_volume',
  PLAYBACK_QUALITY: 'netflix_quality',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Welcome back!',
    REGISTER: 'Account created successfully!',
    LOGOUT: 'Goodbye!',
    FAVORITE_ADDED: 'Added to favorites',
    FAVORITE_REMOVED: 'Removed from favorites',
    WATCHLIST_ADDED: 'Added to watchlist',
    WATCHLIST_REMOVED: 'Removed from watchlist',
    WATCH_LATER_ADDED: 'Added to watch later',
    WATCH_LATER_REMOVED: 'Removed from watch later',
    PROFILE_UPDATED: 'Profile updated successfully',
    MOVIE_UPLOADED: 'Movie uploaded successfully',
    MOVIE_UPDATED: 'Movie updated successfully',
    MOVIE_DELETED: 'Movie deleted successfully',
  },
  ERROR: {
    GENERAL: 'Something went wrong',
    LOGIN_FAILED: 'Invalid email or password',
    REGISTER_FAILED: 'Registration failed',
    NETWORK_ERROR: 'Network error. Please try again.',
    UNAUTHORIZED: 'Please log in to continue',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Please check your input',
    FILE_TOO_LARGE: 'File too large',
    INVALID_FILE_TYPE: 'Invalid file type',
  }
};

// File Upload Constraints
export const FILE_CONSTRAINTS = {
  VIDEO: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_TYPES: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'],
  },
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  }
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Video Player
export const VIDEO_PLAYER = {
  PROGRESS_UPDATE_INTERVAL: 5000, // 5 seconds
  COMPLETION_THRESHOLD: 0.9, // 90% watched = completed
  SEEK_STEP: 10, // seconds
  VOLUME_STEP: 0.1,
};

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

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  GENRES,
  GENRE_DISPLAY_NAMES,
  STORAGE_KEYS,
  USER_ROLES,
  TOAST_MESSAGES,
  FILE_CONSTRAINTS,
  PAGINATION,
  VIDEO_PLAYER,
  ROUTES,
  BREAKPOINTS,
};