import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { movieService, commentsService } from '../services/movieService';
import { 
  favoritesService, 
  watchlistService, 
  watchLaterService, 
  watchHistoryService 
} from '../services/userService';
import { API_BASE_URL } from '../utils/constants';

// Initial state with safe defaults
const initialState = {
  // Movies - Always initialize as arrays
  movies: [],
  currentMovie: null,
  recommendations: [],
  searchResults: [],
  genres: [],
  
  // User lists - Always initialize as arrays
  favorites: [],
  watchlist: [],
  watchLater: [],
  watchHistory: [],
  continueWatching: [],
  
  // Comments
  comments: [],
  
  // Loading states
  isLoading: false,
  isLoadingMovie: false,
  isLoadingComments: false,
  isLoadingUserLists: false,
  
  // Errors
  error: null,
  
  // Search
  searchQuery: '',
  searchFilters: {
    genre: '',
    year: null,
    sortBy: 'title',
    sortDir: 'asc'
  },
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  }
};

// Action types
const ActionTypes = {
  // Loading actions
  SET_LOADING: 'SET_LOADING',
  SET_LOADING_MOVIE: 'SET_LOADING_MOVIE',
  SET_LOADING_COMMENTS: 'SET_LOADING_COMMENTS',
  SET_LOADING_USER_LISTS: 'SET_LOADING_USER_LISTS',
  
  // Movie actions
  SET_MOVIES: 'SET_MOVIES',
  SET_CURRENT_MOVIE: 'SET_CURRENT_MOVIE',
  SET_RECOMMENDATIONS: 'SET_RECOMMENDATIONS',
  ADD_MOVIE: 'ADD_MOVIE',
  UPDATE_MOVIE: 'UPDATE_MOVIE',
  REMOVE_MOVIE: 'REMOVE_MOVIE',
  
  // Search actions
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SEARCH_FILTERS: 'SET_SEARCH_FILTERS',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  
  // User list actions
  SET_FAVORITES: 'SET_FAVORITES',
  SET_WATCHLIST: 'SET_WATCHLIST',
  SET_WATCH_LATER: 'SET_WATCH_LATER',
  SET_WATCH_HISTORY: 'SET_WATCH_HISTORY',
  SET_CONTINUE_WATCHING: 'SET_CONTINUE_WATCHING',
  
  // Comment actions
  SET_COMMENTS: 'SET_COMMENTS',
  ADD_COMMENT: 'ADD_COMMENT',
  UPDATE_COMMENT: 'UPDATE_COMMENT',
  REMOVE_COMMENT: 'REMOVE_COMMENT',
  
  // Error actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Pagination actions
  SET_PAGINATION: 'SET_PAGINATION',
};

// Helper function to ensure data is an array
const ensureArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data === null || data === undefined) return [];
  if (typeof data === 'object' && data.length !== undefined) {
    // Array-like object
    return Array.from(data);
  }
  // Single item, wrap in array
  return [data];
};

// Reducer with array safety
const movieReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case ActionTypes.SET_LOADING_MOVIE:
      return { ...state, isLoadingMovie: action.payload };
      
    case ActionTypes.SET_LOADING_COMMENTS:
      return { ...state, isLoadingComments: action.payload };
      
    case ActionTypes.SET_LOADING_USER_LISTS:
      return { ...state, isLoadingUserLists: action.payload };
      
    case ActionTypes.SET_MOVIES:
      return { 
        ...state, 
        movies: ensureArray(action.payload), 
        isLoading: false 
      };
      
    case ActionTypes.SET_CURRENT_MOVIE:
      return { ...state, currentMovie: action.payload, isLoadingMovie: false };
      
    case ActionTypes.SET_RECOMMENDATIONS:
      return { 
        ...state, 
        recommendations: ensureArray(action.payload) 
      };
      
    case ActionTypes.ADD_MOVIE:
      return { 
        ...state, 
        movies: [action.payload, ...ensureArray(state.movies)] 
      };
      
    case ActionTypes.UPDATE_MOVIE:
      return {
        ...state,
        movies: ensureArray(state.movies).map(movie =>
          movie.id === action.payload.id ? action.payload : movie
        ),
        currentMovie: state.currentMovie?.id === action.payload.id 
          ? action.payload 
          : state.currentMovie
      };
      
    case ActionTypes.REMOVE_MOVIE:
      return {
        ...state,
        movies: ensureArray(state.movies).filter(movie => movie.id !== action.payload),
        currentMovie: state.currentMovie?.id === action.payload 
          ? null 
          : state.currentMovie
      };
      
    case ActionTypes.SET_SEARCH_RESULTS:
      return { 
        ...state, 
        searchResults: ensureArray(action.payload), 
        isLoading: false 
      };
      
    case ActionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
      
    case ActionTypes.SET_SEARCH_FILTERS:
      return { 
        ...state, 
        searchFilters: { ...state.searchFilters, ...action.payload } 
      };
      
    case ActionTypes.CLEAR_SEARCH:
      return { 
        ...state, 
        searchResults: [], 
        searchQuery: '',
        searchFilters: initialState.searchFilters
      };
      
    case ActionTypes.SET_FAVORITES:
      return { 
        ...state, 
        favorites: ensureArray(action.payload) 
      };
      
    case ActionTypes.SET_WATCHLIST:
      return { 
        ...state, 
        watchlist: ensureArray(action.payload) 
      };
      
    case ActionTypes.SET_WATCH_LATER:
      return { 
        ...state, 
        watchLater: ensureArray(action.payload) 
      };
      
    case ActionTypes.SET_WATCH_HISTORY:
      return { 
        ...state, 
        watchHistory: ensureArray(action.payload) 
      };
      
    case ActionTypes.SET_CONTINUE_WATCHING:
      return { 
        ...state, 
        continueWatching: ensureArray(action.payload) 
      };
      
    case ActionTypes.SET_COMMENTS:
      return { 
        ...state, 
        comments: ensureArray(action.payload), 
        isLoadingComments: false 
      };
      
    case ActionTypes.ADD_COMMENT:
      return { 
        ...state, 
        comments: [action.payload, ...ensureArray(state.comments)] 
      };
      
    case ActionTypes.UPDATE_COMMENT:
      return {
        ...state,
        comments: ensureArray(state.comments).map(comment =>
          comment.id === action.payload.id ? action.payload : comment
        )
      };
      
    case ActionTypes.REMOVE_COMMENT:
      return {
        ...state,
        comments: ensureArray(state.comments).filter(comment => comment.id !== action.payload)
      };
      
    case ActionTypes.SET_ERROR:
      return { 
        ...state, 
        error: action.payload, 
        isLoading: false,
        isLoadingMovie: false,
        isLoadingComments: false 
      };
      
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
      
    case ActionTypes.SET_PAGINATION:
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
      
    default:
      return state;
  }
};

// Create context
const MovieContext = createContext();

// Movie provider component
export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  // Error handler
  const handleError = useCallback((error) => {
    console.error('Movie context error:', error);
    dispatch({ 
      type: ActionTypes.SET_ERROR, 
      payload: error.message || 'An error occurred' 
    });
  }, []);

  // Movie actions with array safety
  const fetchMovies = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      console.log('Fetching movies from:', `${API_BASE_URL}/api/movies`);
      const movies = await movieService.getAllMovies();
      console.log('Movies fetched:', movies);
      console.log('Movies type:', typeof movies);
      console.log('Movies is array:', Array.isArray(movies));
      // Ensure we always dispatch an array
      const safeMovies = ensureArray(movies);
      console.log('Safe movies:', safeMovies);
      dispatch({ 
        type: ActionTypes.SET_MOVIES, 
        payload: safeMovies
      });
    } catch (error) {
      console.error('Error fetching movies:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      handleError(error);
      // Dispatch empty array on error to prevent map errors
      dispatch({ type: ActionTypes.SET_MOVIES, payload: [] });
    }
  }, [handleError]);

  const fetchMovieById = useCallback(async (movieId) => {
    dispatch({ type: ActionTypes.SET_LOADING_MOVIE, payload: true });
    try {
      const movie = await movieService.getMovieById(movieId);
      dispatch({ type: ActionTypes.SET_CURRENT_MOVIE, payload: movie });
      return movie;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const fetchMoviesByGenre = useCallback(async (genre) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const movies = await movieService.getMoviesByGenre(genre);
      dispatch({ 
        type: ActionTypes.SET_MOVIES, 
        payload: ensureArray(movies) 
      });
    } catch (error) {
      handleError(error);
      dispatch({ type: ActionTypes.SET_MOVIES, payload: [] });
    }
  }, [handleError]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const recommendations = await movieService.getRecommendations();
      dispatch({ 
        type: ActionTypes.SET_RECOMMENDATIONS, 
        payload: ensureArray(recommendations) 
      });
    } catch (error) {
      // Don't show error for recommendations, just set empty array
      console.error('Error fetching recommendations:', error);
      dispatch({ type: ActionTypes.SET_RECOMMENDATIONS, payload: [] });
    }
  }, []);

  // Search actions with array safety
  const searchMovies = useCallback(async (searchParams) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const results = await movieService.searchMovies(searchParams);
      dispatch({ 
        type: ActionTypes.SET_SEARCH_RESULTS, 
        payload: ensureArray(results) 
      });
      return ensureArray(results);
    } catch (error) {
      handleError(error);
      dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: [] });
      return [];
    }
  }, [handleError]);

  const setSearchQuery = useCallback((query) => {
    dispatch({ type: ActionTypes.SET_SEARCH_QUERY, payload: query });
  }, []);

  const setSearchFilters = useCallback((filters) => {
    dispatch({ type: ActionTypes.SET_SEARCH_FILTERS, payload: filters });
  }, []);

  const clearSearch = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_SEARCH });
  }, []);

  // User list actions with array safety
  const fetchFavorites = useCallback(async () => {
    try {
      const favorites = await favoritesService.getFavorites();
      dispatch({ 
        type: ActionTypes.SET_FAVORITES, 
        payload: ensureArray(favorites) 
      });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      dispatch({ type: ActionTypes.SET_FAVORITES, payload: [] });
    }
  }, []);

  const addToFavorites = useCallback(async (movieId) => {
    try {
      await favoritesService.addToFavorites(movieId);
      // Refresh favorites list
      await fetchFavorites();
    } catch (error) {
      handleError(error);
    }
  }, [fetchFavorites, handleError]);

  const removeFromFavorites = useCallback(async (movieId) => {
    try {
      await favoritesService.removeFromFavorites(movieId);
      // Refresh favorites list
      await fetchFavorites();
    } catch (error) {
      handleError(error);
    }
  }, [fetchFavorites, handleError]);

  const fetchWatchlist = useCallback(async () => {
    try {
      const watchlist = await watchlistService.getWatchlist();
      dispatch({ 
        type: ActionTypes.SET_WATCHLIST, 
        payload: ensureArray(watchlist) 
      });
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      dispatch({ type: ActionTypes.SET_WATCHLIST, payload: [] });
    }
  }, []);

  const addToWatchlist = useCallback(async (movieId) => {
    try {
      await watchlistService.addToWatchlist(movieId);
      await fetchWatchlist();
    } catch (error) {
      handleError(error);
    }
  }, [fetchWatchlist, handleError]);

  const removeFromWatchlist = useCallback(async (movieId) => {
    try {
      await watchlistService.removeFromWatchlist(movieId);
      await fetchWatchlist();
    } catch (error) {
      handleError(error);
    }
  }, [fetchWatchlist, handleError]);

  const fetchWatchLater = useCallback(async () => {
    try {
      const watchLater = await watchLaterService.getWatchLater();
      dispatch({ 
        type: ActionTypes.SET_WATCH_LATER, 
        payload: ensureArray(watchLater) 
      });
    } catch (error) {
      console.error('Error fetching watch later:', error);
      dispatch({ type: ActionTypes.SET_WATCH_LATER, payload: [] });
    }
  }, []);

  const addToWatchLater = useCallback(async (movieId) => {
    try {
      await watchLaterService.addToWatchLater(movieId);
      await fetchWatchLater();
    } catch (error) {
      handleError(error);
    }
  }, [fetchWatchLater, handleError]);

  const removeFromWatchLater = useCallback(async (movieId) => {
    try {
      await watchLaterService.removeFromWatchLater(movieId);
      await fetchWatchLater();
    } catch (error) {
      handleError(error);
    }
  }, [fetchWatchLater, handleError]);

  const fetchWatchHistory = useCallback(async () => {
    try {
      const history = await watchHistoryService.getWatchHistory();
      dispatch({ 
        type: ActionTypes.SET_WATCH_HISTORY, 
        payload: ensureArray(history) 
      });
    } catch (error) {
      console.error('Error fetching watch history:', error);
      dispatch({ type: ActionTypes.SET_WATCH_HISTORY, payload: [] });
    }
  }, []);

  const fetchContinueWatching = useCallback(async () => {
    try {
      const continueWatching = await watchHistoryService.getContinueWatching();
      dispatch({ 
        type: ActionTypes.SET_CONTINUE_WATCHING, 
        payload: ensureArray(continueWatching) 
      });
    } catch (error) {
      console.error('Error fetching continue watching:', error);
      dispatch({ type: ActionTypes.SET_CONTINUE_WATCHING, payload: [] });
    }
  }, []);

  // Comment actions with array safety
  const fetchComments = useCallback(async (movieId) => {
    dispatch({ type: ActionTypes.SET_LOADING_COMMENTS, payload: true });
    try {
      const comments = await commentsService.getCommentsByMovie(movieId);
      dispatch({ 
        type: ActionTypes.SET_COMMENTS, 
        payload: ensureArray(comments) 
      });
    } catch (error) {
      handleError(error);
      dispatch({ type: ActionTypes.SET_COMMENTS, payload: [] });
    }
  }, [handleError]);

  const addComment = useCallback(async (movieId, commentData) => {
    try {
      const comment = await commentsService.addComment(movieId, commentData);
      dispatch({ type: ActionTypes.ADD_COMMENT, payload: comment });
      return comment;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const updateComment = useCallback(async (commentId, commentData) => {
    try {
      const comment = await commentsService.updateComment(commentId, commentData);
      dispatch({ type: ActionTypes.UPDATE_COMMENT, payload: comment });
      return comment;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const deleteComment = useCallback(async (commentId) => {
    try {
      await commentsService.deleteComment(commentId);
      dispatch({ type: ActionTypes.REMOVE_COMMENT, payload: commentId });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  // Utility actions
  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  const updateWatchProgress = useCallback(async (progressData) => {
    try {
      await movieService.updateWatchProgress(progressData);
      // Refresh continue watching list
      await fetchContinueWatching();
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  }, [fetchContinueWatching]);

  // Helper functions with array safety
  const isInFavorites = useCallback((movieId) => {
    return ensureArray(state.favorites).some(movie => movie.id === movieId);
  }, [state.favorites]);

  const isInWatchlist = useCallback((movieId) => {
    return ensureArray(state.watchlist).some(movie => movie.id === movieId);
  }, [state.watchlist]);

  const isInWatchLater = useCallback((movieId) => {
    return ensureArray(state.watchLater).some(movie => movie.id === movieId);
  }, [state.watchLater]);

  // Context value
  const value = {
    // State with safe array defaults
    ...state,
    movies: ensureArray(state.movies),
    recommendations: ensureArray(state.recommendations),
    searchResults: ensureArray(state.searchResults),
    favorites: ensureArray(state.favorites),
    watchlist: ensureArray(state.watchlist),
    watchLater: ensureArray(state.watchLater),
    watchHistory: ensureArray(state.watchHistory),
    continueWatching: ensureArray(state.continueWatching),
    comments: ensureArray(state.comments),

    // Movie actions
    fetchMovies,
    fetchMovieById,
    fetchMoviesByGenre,
    fetchRecommendations,

    // Search actions
    searchMovies,
    setSearchQuery,
    setSearchFilters,
    clearSearch,

    // User list actions
    fetchFavorites,
    addToFavorites,
    removeFromFavorites,
    fetchWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    fetchWatchLater,
    addToWatchLater,
    removeFromWatchLater,
    fetchWatchHistory,
    fetchContinueWatching,

    // Comment actions
    fetchComments,
    addComment,
    updateComment,
    deleteComment,

    // Utility actions
    clearError,
    updateWatchProgress,

    // Helper functions
    isInFavorites,
    isInWatchlist,
    isInWatchLater,
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};

// Custom hook to use movie context
export const useMovies = () => {
  const context = useContext(MovieContext);
  
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  
  return context;
};

export default MovieContext;