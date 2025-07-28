// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REGISTER_ADMIN: '/auth/register-admin',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VALIDATE: '/auth/validate',
  },
  
  // Movie endpoints
  MOVIES: {
    BASE: '/movies',
    BY_ID: (id) => `/movies/${id}`,
    BY_GENRE: (genre) => `/movies/genre/${genre}`,
    SEARCH: '/movies/search',
    RECOMMENDATIONS: '/movies/recommendations',
  },
  
  // User endpoints
  USERS: {
    ME: '/users/me',
    WATCHLIST: '/users/watchlist',
    FAVORITES: '/users/favorites',
    WATCH_LATER: '/users/watchlater',
    HISTORY: '/users/history',
    PREFERENCES: '/users/preferences',
    ADD_TO_WATCHLIST: (movieId) => `/users/watchlist/${movieId}`,
    ADD_TO_FAVORITES: (movieId) => `/users/favorites/${movieId}`,
    ADD_TO_WATCH_LATER: (movieId) => `/users/watchlater/${movieId}`,
    UPDATE_HISTORY: (movieId) => `/users/history/${movieId}`,
  },
  
  // Streaming endpoints
  STREAMING: {
    STREAM: (movieId) => `/stream/${movieId}`,
    PROGRESS: '/stream/progress',
    COMPLETE: (movieId) => `/stream/complete/${movieId}`,
  },
  
  // Comments endpoints
  COMMENTS: {
    BY_MOVIE: (movieId) => `/comments/movie/${movieId}`,
    ADD: (movieId) => `/comments/movie/${movieId}`,
    UPDATE: (commentId) => `/comments/${commentId}`,
    DELETE: (commentId) => `/comments/${commentId}`,
  },
  
  // Admin endpoints
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    MOVIES: '/admin/movies',
    UPLOAD_VIDEO: '/admin/upload/video',
    UPLOAD_IMAGE: '/admin/upload/image',
    DELETE_USER: (userId) => `/admin/users/${userId}`,
    UPDATE_MOVIE: (movieId) => `/admin/movies/${movieId}`,
    DELETE_MOVIE: (movieId) => `/admin/movies/${movieId}`,
    TRENDING: '/admin/movies/trending',
    TOGGLE_FEATURED: (movieId) => `/admin/movies/${movieId}/feature`,
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