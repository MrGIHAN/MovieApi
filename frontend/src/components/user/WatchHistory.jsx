import React, { useEffect, useState } from 'react';
import { useMovies } from '../../hooks/useMovies';
import { useAuth } from '../../hooks/useAuth';
import { SkeletonLoader } from '../common/Loader';
import { ClockIcon, PlayIcon } from '@heroicons/react/24/outline';
import { formatVideoTime, formatDate } from '../../utils/helpers';

const WatchHistory = () => {
  const { isAuthenticated } = useAuth();
  const { 
    watchHistory, 
    fetchWatchHistory, 
    isLoadingUserLists 
  } = useMovies();
  
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'in-progress'
  const [sortBy, setSortBy] = useState('lastWatched');

  useEffect(() => {
    if (isAuthenticated) {
      fetchWatchHistory();
    }
  }, [isAuthenticated, fetchWatchHistory]);

  const handleMovieClick = (movie) => {
    window.location.href = `/movie/${movie.id}`;
  };

  const handleWatchClick = (movie, progress) => {
    // Resume from last position or start from beginning
    const startTime = progress?.watchPositionSeconds || 0;
    window.location.href = `/watch/${movie.id}?t=${startTime}`;
  };

  const getProgressPercentage = (progress) => {
    if (!progress || !progress.totalDurationSeconds) return 0;
    return Math.min(100, (progress.watchPositionSeconds / progress.totalDurationSeconds) * 100);
  };

  const getFilteredHistory = () => {
    if (!watchHistory) return [];
    
    let filtered = [...watchHistory];
    
    // Apply filter
    switch (filter) {
      case 'completed':
        filtered = filtered.filter(item => item.completed);
        break;
      case 'in-progress':
        filtered = filtered.filter(item => !item.completed && item.watchPositionSeconds > 0);
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'lastWatched':
          return new Date(b.lastWatchedAt) - new Date(a.lastWatchedAt);
        case 'title':
          return a.movie.title.localeCompare(b.movie.title);
        case 'progress':
          return getProgressPercentage(b) - getProgressPercentage(a);
        default:
          return 0;
      }
    });

    return filtered;
  };

  if (isLoadingUserLists) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <ClockIcon className="h-8 w-8 text-netflix-red" />
          <h1 className="text-3xl font-bold text-white">Watch History</h1>
        </div>
        <SkeletonLoader type="list" count={5} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <ClockIcon className="h-16 w-16 text-netflix-lightGray mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
        <p className="text-netflix-lightGray mb-8">
          Please sign in to view your watch history.
        </p>
        <a
          href="/login"
          className="btn btn-primary"
        >
          Sign In
        </a>
      </div>
    );
  }

  const filteredHistory = getFilteredHistory();

  if (!watchHistory || watchHistory.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <ClockIcon className="h-8 w-8 text-netflix-red" />
          <h1 className="text-3xl font-bold text-white">Watch History</h1>
        </div>
        
        <div className="text-center py-16">
          <ClockIcon className="h-24 w-24 text-netflix-lightGray mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">No Watch History</h2>
          <p className="text-netflix-lightGray mb-8 max-w-md mx-auto">
            Start watching movies to see your history here.
          </p>
          <a
            href="/browse"
            className="btn btn-primary"
          >
            Browse Movies
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <ClockIcon className="h-8 w-8 text-netflix-red" />
          <h1 className="text-3xl font-bold text-white">Watch History</h1>
          <span className="bg-netflix-gray text-netflix-lightGray px-3 py-1 rounded-full text-sm">
            {watchHistory.length} {watchHistory.length === 1 ? 'movie' : 'movies'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-netflix-darkGray border border-netflix-gray text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
          >
            <option value="all">All Movies</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-netflix-darkGray border border-netflix-gray text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
          >
            <option value="lastWatched">Recently Watched</option>
            <option value="title">Title</option>
            <option value="progress">Progress</option>
          </select>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-16">
          <ClockIcon className="h-16 w-16 text-netflix-lightGray mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Movies Found</h3>
          <p className="text-netflix-lightGray">
            Try changing your filter settings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((historyItem) => {
            const { movie } = historyItem;
            const progressPercentage = getProgressPercentage(historyItem);
            
            return (
              <div
                key={`${movie.id}-${historyItem.lastWatchedAt}`}
                className="flex items-center space-x-4 p-4 bg-netflix-darkGray rounded-lg hover:bg-netflix-gray transition-colors duration-200 group"
              >
                {/* Movie Poster */}
                <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-netflix-gray">
                  <img
                    src={movie.posterUrl || movie.thumbnailUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/80/112';
                    }}
                  />
                </div>
                
                {/* Movie Info */}
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-semibold text-white text-lg truncate cursor-pointer hover:text-netflix-red transition-colors duration-200"
                    onClick={() => handleMovieClick(movie)}
                  >
                    {movie.title}
                  </h3>
                  
                  <div className="flex items-center space-x-3 text-sm text-netflix-lightGray mt-1">
                    {movie.releaseYear && <span>{movie.releaseYear}</span>}
                    {movie.genre && (
                      <>
                        <span>•</span>
                        <span>{movie.genre.replace('_', ' ')}</span>
                      </>
                    )}
                    {movie.imdbRating && (
                      <>
                        <span>•</span>
                        <span>⭐ {movie.imdbRating}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-netflix-lightGray mb-1">
                      <span>
                        {historyItem.completed ? 'Completed' : 
                         progressPercentage > 0 ? `${Math.round(progressPercentage)}% watched` : 'Not started'}
                      </span>
                      <span>
                        Last watched: {formatDate(historyItem.lastWatchedAt, 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="w-full bg-netflix-gray rounded-full h-1">
                      <div 
                        className="bg-netflix-red h-1 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    {historyItem.watchPositionSeconds > 0 && (
                      <div className="text-xs text-netflix-lightGray mt-1">
                        {formatVideoTime(historyItem.watchPositionSeconds)} 
                        {historyItem.totalDurationSeconds && 
                          ` / ${formatVideoTime(historyItem.totalDurationSeconds)}`
                        }
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleWatchClick(movie, historyItem)}
                    className="w-12 h-12 bg-netflix-red hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200 group"
                    title={historyItem.completed ? 'Watch again' : 'Continue watching'}
                  >
                    <PlayIcon className="h-6 w-6 text-white ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredHistory.length > 0 && (
        <div className="text-center text-netflix-lightGray text-sm">
          Showing {filteredHistory.length} of {watchHistory.length} movies
        </div>
      )}
    </div>
  );
};

export default WatchHistory;