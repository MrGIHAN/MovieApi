import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '../../hooks/useMovies';
import { PlayIcon, StarIcon } from '@heroicons/react/24/outline';
import { formatRating, getGenreDisplayName } from '../../utils/helpers';
import Loader from '../common/Loader';

const MovieSearch = ({ query, onClose }) => {
  const { searchMovies, searchResults, isLoading } = useMovies();
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query && query.trim().length >= 2) {
      searchMovies({ title: query.trim() })
        .then(data => {
          setResults(data || []);
        })
        .catch(error => {
          console.error('Search error:', error);
          setResults([]);
        });
    } else {
      setResults([]);
    }
  }, [query, searchMovies]);

  const handleMovieClick = () => {
    onClose();
  };

  const handlePlayClick = (movieId, e) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `/watch/${movieId}`;
    onClose();
  };

  const displayResults = results.length > 0 ? results : searchResults;

  if (!query || query.trim().length < 2) {
    return null;
  }

  return (
    <div className="search-results">
      {isLoading ? (
        <div className="p-4">
          <Loader size="sm" text="Searching..." />
        </div>
      ) : displayResults.length > 0 ? (
        <>
          <div className="p-3 border-b border-netflix-gray">
            <p className="text-netflix-lightGray text-sm">
              {displayResults.length} result{displayResults.length !== 1 ? 's' : ''} for "{query}"
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {displayResults.slice(0, 8).map((movie) => (
              <Link
                key={movie.id}
                to={`/movie/${movie.id}`}
                className="search-item"
                onClick={handleMovieClick}
              >
                <div className="w-12 h-16 flex-shrink-0 rounded overflow-hidden bg-netflix-gray">
                  <img
                    src={movie.posterUrl || movie.thumbnailUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/48/64';
                    }}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">
                    {movie.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-netflix-lightGray mt-1">
                    {movie.releaseYear && <span>{movie.releaseYear}</span>}
                    {movie.genre && (
                      <>
                        <span>•</span>
                        <span>{getGenreDisplayName(movie.genre)}</span>
                      </>
                    )}
                    {movie.imdbRating && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-3 w-3 text-yellow-400" />
                          <span>{formatRating(movie.imdbRating)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {movie.description && (
                    <p className="text-xs text-netflix-lightGray mt-1 line-clamp-2">
                      {movie.description}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={(e) => handlePlayClick(movie.id, e)}
                  className="w-8 h-8 bg-netflix-red hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
                  title={`Play ${movie.title}`}
                >
                  <PlayIcon className="h-4 w-4 text-white ml-0.5" />
                </button>
              </Link>
            ))}
          </div>
          {displayResults.length > 8 && (
            <div className="p-3 border-t border-netflix-gray">
              <Link
                to={`/search?q=${encodeURIComponent(query)}`}
                className="text-netflix-red hover:text-red-300 text-sm font-medium"
                onClick={handleMovieClick}
              >
                View all {displayResults.length} results
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="p-4 text-center">
          <p className="text-netflix-lightGray">
            No movies found for "{query}"
          </p>
          <p className="text-netflix-lightGray text-sm mt-1">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
};

export default MovieSearch;