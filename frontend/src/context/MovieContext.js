import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { movieService, commentsService } from '../services/movieService';
import { 
  favoritesService, 
  watchlistService, 
  watchLaterService, 
  watchHistoryService 
} from '../services/userService';

// Initial state
const initialState = {
  // Movies
  movies: [],
  currentMovie: null,
  recommendations: [],
  searchResults: [],
  genres: [],
  
  // User lists
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

// Reducer
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
      return { ...state, movies: action.payload, isLoading: false };
      
    case ActionTypes.SET_CURRENT_MOVIE:
      return { ...state, currentMovie: action.payload, isLoadingMovie: false };
      
    case ActionTypes.SET_RECOMMENDATIONS:
      return { ...state, recommendations: action.payload };
      
    case ActionTypes.ADD_MOVIE:
      return { ...state, movies: [action.payload, ...state.movies] };
      
    case ActionTypes.UPDATE_MOVIE:
      return {
        ...state,
        movies: state.movies.map(movie =>
          movie.id === action.payload.id ? action.payload : movie
        ),
        currentMovie: state.currentMovie?.id === action.payload.id 
          ? action.payload 
          : state.currentMovie
      };
      
    case ActionTypes.REMOVE_MOVIE:
      return {
        ...state,
        movies: state.movies.filter(movie => movie.id !== action.payload),
        currentMovie: state.currentMovie?.id === action.payload 
          ? null 
          : state.currentMovie
      };
      
    case ActionTypes.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload, isLoading: false };
      
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
      return { ...state, favorites: action.payload };
      
    case ActionTypes.SET_WATCHLIST:
      return { ...state, watchlist: action.payload };
      
    case ActionTypes.SET_WATCH_LATER:
      return { ...state, watchLater: action.payload };
      
    case ActionTypes.SET_WATCH_HISTORY:
      return { ...state, watchHistory: action.payload };
      
    case ActionTypes.SET_CONTINUE_WATCHING:
      return { ...state, continueWatching: action.payload };
      
    case ActionTypes.SET_COMMENTS:
      return { ...state, comments: action.payload, isLoadingComments: false };
      
    case ActionTypes.ADD_COMMENT:
      return { ...state, comments: [action.payload, ...state.comments] };
      
    case ActionTypes.UPDATE_COMMENT:
      return {
        ...state,
        comments: state.comments.map(comment =>
          comment.id === action.payload.id ? action.payload : comment
        )
      };
      
    case ActionTypes.REMOVE_COMMENT:
      return {
        ...state,
        comments: state.comments.filter(comment => comment.id !== action.payload)
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

  // Movie actions
  const fetchMovies = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const movies = await movieService.getAllMovies();
      dispatch({ type: ActionTypes.SET_MOVIES, payload: movies });
    } catch (error) {
      handleError(error);
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
      dispatch({ type: ActionTypes.SET_MOVIES, payload: movies });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const recommendations = await movieService.getRecommendations();
      dispatch({ type: ActionTypes.SET_RECOMMENDATIONS, payload: recommendations });
    } catch (error) {
      // Don't show error for recommendations
      console.error('Error fetching recommendations:', error);
    }
  }, []);

  // Search actions
  const searchMovies = useCallback(async (searchParams) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    try {
      const results = await movieService.searchMovies(searchParams);
      dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: results });
      return results;
    } catch (error) {
      handleError(error);
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

  // User list actions
  const fetchFavorites = useCallback(async () => {
    try {
      const favorites = await favoritesService.getFavorites();
      dispatch({ type: ActionTypes.SET_FAVORITES, payload: favorites });
    } catch (error) {
      console.error('Error fetching favorites:', error);
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
      dispatch({ type: ActionTypes.SET_WATCHLIST, payload: watchlist });
    } catch (error) {
      console.error('Error fetching watchlist:', error);
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
      dispatch({ type: ActionTypes.SET_WATCH_LATER, payload: watchLater });
    } catch (error) {
      console.error('Error fetching watch later:', error);
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
      dispatch({ type: ActionTypes.SET_WATCH_HISTORY, payload: history });
    } catch (error) {
      console.error('Error fetching watch history:', error);
    }
  }, []);

  const fetchContinueWatching = useCallback(async () => {
    try {
      const continueWatching = await watchHistoryService.getContinueWatching();
      dispatch({ type: ActionTypes.SET_CONTINUE_WATCHING, payload: continueWatching });
    } catch (error) {
      console.error('Error fetching continue watching:', error);
    }
  }, []);

  // Comment actions
  const fetchComments = useCallback(async (movieId) => {
    dispatch({ type: ActionTypes.SET_LOADING_COMMENTS, payload: true });
    try {
      const comments = await commentsService.getCommentsByMovie(movieId);
      dispatch({ type: ActionTypes.SET_COMMENTS, payload: comments });
    } catch (error) {
      handleError(error);
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

  const updateWatchProgress = useCallback(async (movieId, progressData) => {
    try {
      await movieService.updateWatchProgress(progressData);
      // Refresh continue watching list
      await fetchContinueWatching();
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  }, [fetchContinueWatching]);

  // Helper functions
  const isInFavorites = useCallback((movieId) => {
    return state.favorites.some(movie => movie.id === movieId);
  }, [state.favorites]);

  const isInWatchlist = useCallback((movieId) => {
    return state.watchlist.some(movie => movie.id === movieId);
  }, [state.watchlist]);

  const isInWatchLater = useCallback((movieId) => {
    return state.watchLater.some(movie => movie.id === movieId);
  }, [state.watchLater]);

  // Context value
  const value = {
    // State
    ...state,

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