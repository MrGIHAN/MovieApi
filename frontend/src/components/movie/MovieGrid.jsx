import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { SkeletonLoader } from '../common/Loader';
import { AdjustmentsHorizontalIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

const MovieGrid = ({
  movies,
  isLoading = false,
  title,
  subtitle,
  showFilters = false,
  showLayoutToggle = false,
  onMovieClick,
  emptyMessage = 'No movies found',
  className = '',
}) => {
  // Ensure movies is always an array
  const safeMovies = Array.isArray(movies) ? movies : [];
  const [layout, setLayout] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [genreFilter, setGenreFilter] = useState('');
  const [filteredMovies, setFilteredMovies] = useState(movies);

  // Update filtered movies when movies or filters change
  useEffect(() => {
    let filtered = [...safeMovies];

    // Genre filter
    if (genreFilter) {
      filtered = filtered.filter(movie => 
        movie.genre?.toLowerCase() === genreFilter.toLowerCase()
      );
    }

    // Sort movies
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (sortBy === 'releaseYear' || sortBy === 'imdbRating') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredMovies(filtered);
  }, [safeMovies, genreFilter, sortBy, sortOrder]);

  // Get unique genres from movies
  const genres = [...new Set(safeMovies.map(movie => movie.genre).filter(Boolean))];

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {title && (
          <div className="space-y-2">
            <div className="h-8 bg-netflix-gray rounded w-64 animate-pulse"></div>
            {subtitle && <div className="h-4 bg-netflix-gray rounded w-96 animate-pulse"></div>}
          </div>
        )}
        <SkeletonLoader type="row" count={3} />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {(title || showFilters || showLayoutToggle) && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            )}
            {subtitle && (
              <p className="text-netflix-lightGray">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Filters */}
            {showFilters && (
              <div className="flex items-center space-x-3">
                {/* Genre Filter */}
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="bg-netflix-darkGray border border-netflix-gray text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                >
                  <option value="">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre.replace('_', ' ')}
                    </option>
                  ))}
                </select>

                {/* Sort Options */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="bg-netflix-darkGray border border-netflix-gray text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                >
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="releaseYear-desc">Newest First</option>
                  <option value="releaseYear-asc">Oldest First</option>
                  <option value="imdbRating-desc">Highest Rated</option>
                  <option value="imdbRating-asc">Lowest Rated</option>
                </select>
              </div>
            )}

            {/* Layout Toggle */}
            {showLayoutToggle && (
              <div className="flex bg-netflix-darkGray rounded-lg p-1">
                <button
                  onClick={() => setLayout('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    layout === 'grid'
                      ? 'bg-netflix-red text-white'
                      : 'text-netflix-lightGray hover:text-white'
                  }`}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setLayout('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    layout === 'list'
                      ? 'bg-netflix-red text-white'
                      : 'text-netflix-lightGray hover:text-white'
                  }`}
                  aria-label="List view"
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Movies Grid/List */}
      {filteredMovies.length > 0 ? (
        layout === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={onMovieClick}
                showHover={true}
                showDetails={true}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center space-x-4 p-4 bg-netflix-darkGray rounded-lg hover:bg-netflix-gray cursor-pointer transition-colors duration-200 group"
                onClick={() => onMovieClick?.(movie)}
              >
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
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg truncate group-hover:text-netflix-red transition-colors duration-200">
                    {movie.title}
                  </h3>
                  
                  <div className="flex items-center space-x-3 text-sm text-netflix-lightGray mt-2">
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
                  
                  {movie.description && (
                    <p className="text-netflix-lightGray mt-2 line-clamp-2">
                      {movie.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/watch/${movie.id}`;
                    }}
                    className="w-12 h-12 bg-netflix-red hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200"
                    aria-label={`Play ${movie.title}`}
                  >
                    <svg className="h-6 w-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Movies Found</h3>
          <p className="text-netflix-lightGray">{emptyMessage}</p>
        </div>
      )}

      {/* Results count */}
      {filteredMovies.length > 0 && (
        <div className="text-center text-netflix-lightGray text-sm">
          Showing {filteredMovies.length} of {safeMovies.length} movies
        </div>
      )}
    </div>
  );
};

export default MovieGrid;