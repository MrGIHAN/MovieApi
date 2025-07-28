import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlayIcon, 
  PlusIcon, 
  HeartIcon,
  ClockIcon,
  StarIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  PlusIcon as PlusSolidIcon,
  ClockIcon as ClockSolidIcon 
} from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import { useMovies } from '../../hooks/useMovies';
import { formatJavaDuration, getGenreDisplayName, formatRating } from '../../utils/helpers';
import { useNotification } from '../../context/NotificationContext';

const MovieCard = ({ 
  movie, 
  size = 'md', 
  showHover = true,
  showDetails = true,
  onClick 
}) => {
  const { isAuthenticated } = useAuth();
  const { 
    addToFavorites, 
    removeFromFavorites, 
    addToWatchLater, 
    removeFromWatchLater,
    addToWatchlist,
    removeFromWatchlist,
    isInFavorites, 
    isInWatchLater,
    isInWatchlist 
  } = useMovies();
  const { success, error } = useNotification();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-40',
      image: 'h-60',
    },
    md: {
      container: 'w-48',
      image: 'h-72',
    },
    lg: {
      container: 'w-56',
      image: 'h-84',
    },
  };

  const config = sizeConfig[size];

  // Check if movie is in user lists
  const isFavorite = isAuthenticated && isInFavorites(movie.id);
  const isWatchLater = isAuthenticated && isInWatchLater(movie.id);
  const isWatchlist = isAuthenticated && isInWatchlist(movie.id);

  // Handle actions
  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(movie);
    } else {
      window.location.href = `/watch/${movie.id}`;
    }
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      error('Please log in to add movies to favorites');
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(movie.id);
      } else {
        await addToFavorites(movie.id);
      }
    } catch (err) {
      console.error('Error updating favorites:', err);
    }
  };

  const handleWatchLaterClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      error('Please log in to add movies to watch later');
      return;
    }

    try {
      if (isWatchLater) {
        await removeFromWatchLater(movie.id);
      } else {
        await addToWatchLater(movie.id);
      }
    } catch (err) {
      console.error('Error updating watch later:', err);
    }
  };

  const handleWatchlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      error('Please log in to add movies to watchlist');
      return;
    }

    try {
      if (isWatchlist) {
        await removeFromWatchlist(movie.id);
      } else {
        await addToWatchlist(movie.id);
      }
    } catch (err) {
      console.error('Error updating watchlist:', err);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(movie);
    }
  };

  return (
    <div
      className={`
        ${config.container} flex-shrink-0 group cursor-pointer relative
        ${showHover ? 'transform transition-all duration-300 hover:scale-105 hover:z-20' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Movie Poster */}
      <div className={`relative ${config.image} overflow-hidden rounded-lg bg-netflix-gray`}>
        {/* Image */}
        {!imageError ? (
          <img
            src={movie.posterUrl || movie.thumbnailUrl}
            alt={movie.title}
            className={`
              w-full h-full object-cover transition-all duration-300
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              ${showHover ? 'group-hover:scale-110' : ''}
            `}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-netflix-darkGray">
            <div className="text-center">
              <div className="text-4xl mb-2">🎬</div>
              <p className="text-xs text-netflix-lightGray px-2">
                {movie.title}
              </p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-netflix-gray animate-pulse" />
        )}

        {/* Rating badge */}
        {movie.imdbRating && (
          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-sm rounded px-2 py-1 flex items-center space-x-1">
            <StarIcon className="h-3 w-3 text-yellow-400" />
            <span className="text-xs text-white font-medium">
              {formatRating(movie.imdbRating)}
            </span>
          </div>
        )}

        {/* Overlay with controls (appears on hover) */}
        {showHover && isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlayClick}
                className="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transform transition-all duration-200 hover:scale-110"
                aria-label={`Play ${movie.title}`}
              >
                <PlayIcon className="h-6 w-6 text-black ml-1" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
              <div className="flex space-x-2">
                {/* Favorite button */}
                <button
                  onClick={handleFavoriteClick}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                    ${isFavorite 
                      ? 'bg-netflix-red text-white' 
                      : 'bg-black/50 text-white hover:bg-black/75'
                    }
                  `}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="h-4 w-4" />
                  ) : (
                    <HeartIcon className="h-4 w-4" />
                  )}
                </button>

                {/* Watch Later button */}
                <button
                  onClick={handleWatchLaterClick}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                    ${isWatchLater 
                      ? 'bg-netflix-red text-white' 
                      : 'bg-black/50 text-white hover:bg-black/75'
                    }
                  `}
                  aria-label={isWatchLater ? 'Remove from watch later' : 'Add to watch later'}
                  title={isWatchLater ? 'Remove from watch later' : 'Add to watch later'}
                >
                  {isWatchLater ? (
                    <ClockSolidIcon className="h-4 w-4" />
                  ) : (
                    <ClockIcon className="h-4 w-4" />
                  )}
                </button>

                {/* Watchlist button */}
                <button
                  onClick={handleWatchlistClick}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                    ${isWatchlist 
                      ? 'bg-netflix-red text-white' 
                      : 'bg-black/50 text-white hover:bg-black/75'
                    }
                  `}
                  aria-label={isWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                  title={isWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  {isWatchlist ? (
                    <PlusSolidIcon className="h-4 w-4" />
                  ) : (
                    <PlusIcon className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* More info button */}
              <Link
                to={`/movie/${movie.id}`}
                className="w-8 h-8 bg-black/50 hover:bg-black/75 rounded-full flex items-center justify-center transition-all duration-200"
                aria-label={`More info about ${movie.title}`}
                title="More info"
                onClick={(e) => e.stopPropagation()}
              >
                <ChevronDownIcon className="h-4 w-4 text-white" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Movie Details */}
      {showDetails && (
        <div className="mt-3 space-y-1">
          <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-netflix-red transition-colors duration-200">
            {movie.title}
          </h3>
          
          <div className="flex items-center space-x-2 text-xs text-netflix-lightGray">
            {movie.releaseYear && (
              <span>{movie.releaseYear}</span>
            )}
            {movie.genre && (
              <>
                <span>•</span>
                <span>{getGenreDisplayName(movie.genre)}</span>
              </>
            )}
            {movie.duration && (
              <>
                <span>•</span>
                <span>{formatJavaDuration(movie.duration)}</span>
              </>
            )}
          </div>

          {movie.description && (
            <p className="text-xs text-netflix-lightGray line-clamp-2">
              {movie.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Compact version for lists
export const CompactMovieCard = ({ movie, onClick }) => {
  return (
    <div
      className="flex items-center space-x-4 p-3 bg-netflix-darkGray rounded-lg hover:bg-netflix-gray cursor-pointer transition-colors duration-200 group"
      onClick={() => onClick?.(movie)}
    >
      <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-netflix-gray">
        <img
          src={movie.posterUrl || movie.thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.target.src = '/api/placeholder/64/96';
          }}
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate group-hover:text-netflix-red transition-colors duration-200">
          {movie.title}
        </h3>
        
        <div className="flex items-center space-x-2 text-sm text-netflix-lightGray mt-1">
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
          <p className="text-sm text-netflix-lightGray mt-2 line-clamp-2">
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
          className="w-10 h-10 bg-netflix-red hover:bg-red-700 rounded-full flex items-center justify-center transition-colors duration-200"
          aria-label={`Play ${movie.title}`}
        >
          <PlayIcon className="h-5 w-5 text-white ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default MovieCard;