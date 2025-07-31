import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  PlayIcon, 
  HeartIcon, 
  ClockIcon, 
  PlusIcon,
  StarIcon,
  CalendarIcon,
  FilmIcon 
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  ClockIcon as ClockSolidIcon,
  PlusIcon as PlusSolidIcon 
} from '@heroicons/react/24/solid';
import { useMovies } from '../hooks/useMovies';
import { useAuth } from '../hooks/useAuth';
import { SkeletonLoader } from '../components/common/Loader';
import { formatJavaDuration, getGenreDisplayName, formatRating } from '../utils/helpers';

const MovieDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const {
    currentMovie,
    fetchMovieById,
    isLoadingMovie,
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

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    console.log('MovieDetail: ID from URL params:', id, 'Type:', typeof id);
    if (id) {
      // Convert string ID to number if needed
      const movieId = parseInt(id, 10);
      console.log('MovieDetail: Converted movie ID:', movieId, 'Type:', typeof movieId);
      if (!isNaN(movieId)) {
        fetchMovieById(movieId);
      } else {
        console.error('Invalid movie ID:', id);
      }
    }
  }, [id, fetchMovieById]);

  const handlePlayClick = () => {
    window.location.href = `/watch/${id}`;
  };

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      if (isInFavorites(currentMovie.id)) {
        await removeFromFavorites(currentMovie.id);
      } else {
        await addToFavorites(currentMovie.id);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleWatchLaterClick = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      if (isInWatchLater(currentMovie.id)) {
        await removeFromWatchLater(currentMovie.id);
      } else {
        await addToWatchLater(currentMovie.id);
      }
    } catch (error) {
      console.error('Error updating watch later:', error);
    }
  };

  const handleWatchlistClick = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      if (isInWatchlist(currentMovie.id)) {
        await removeFromWatchlist(currentMovie.id);
      } else {
        await addToWatchlist(currentMovie.id);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  if (isLoadingMovie) {
    return (
      <div className="min-h-screen pt-24 bg-netflix-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonLoader type="hero" count={1} />
        </div>
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="min-h-screen pt-24 bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <p className="text-netflix-lightGray text-xl mb-8">
            Movie not found
          </p>
          <Link to="/browse" className="btn btn-primary">
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  const isFavorite = isAuthenticated && isInFavorites(currentMovie.id);
  const isWatchLater = isAuthenticated && isInWatchLater(currentMovie.id);
  const isWatchlist = isAuthenticated && isInWatchlist(currentMovie.id);

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <section className="relative pt-16">
        <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={currentMovie.posterUrl || currentMovie.thumbnailUrl}
              alt={currentMovie.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = '/api/placeholder/1920/1080';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>

          {/* Movie Info */}
          <div className="relative z-10 h-full flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 hero-text-shadow">
                  {currentMovie.title}
                </h1>
                
                <div className="flex items-center space-x-6 mb-6">
                  {currentMovie.imdbRating && (
                    <div className="flex items-center space-x-2">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="text-white font-medium text-lg">
                        {formatRating(currentMovie.imdbRating)}
                      </span>
                    </div>
                  )}
                  
                  {currentMovie.releaseYear && (
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5 text-netflix-lightGray" />
                      <span className="text-netflix-lightGray">{currentMovie.releaseYear}</span>
                    </div>
                  )}
                  
                  {currentMovie.duration && (
                    <div className="flex items-center space-x-2">
                      <FilmIcon className="h-5 w-5 text-netflix-lightGray" />
                      <span className="text-netflix-lightGray">
                        {formatJavaDuration(currentMovie.duration)}
                      </span>
                    </div>
                  )}
                  
                  {currentMovie.genre && (
                    <span className="px-3 py-1 bg-netflix-red text-white text-sm rounded-full">
                      {getGenreDisplayName(currentMovie.genre)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handlePlayClick}
                    className="btn btn-primary btn-lg flex items-center justify-center space-x-2"
                  >
                    <PlayIcon className="h-6 w-6" />
                    <span>Play Movie</span>
                  </button>
                  
                  {isAuthenticated && (
                    <>
                      <button
                        onClick={handleFavoriteClick}
                        className={`btn btn-lg flex items-center justify-center space-x-2 ${
                          isFavorite ? 'btn-primary' : 'btn-outline'
                        }`}
                      >
                        {isFavorite ? (
                          <HeartSolidIcon className="h-6 w-6" />
                        ) : (
                          <HeartIcon className="h-6 w-6" />
                        )}
                        <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                      </button>
                      
                      <button
                        onClick={handleWatchLaterClick}
                        className={`btn btn-lg flex items-center justify-center space-x-2 ${
                          isWatchLater ? 'btn-primary' : 'btn-outline'
                        }`}
                      >
                        {isWatchLater ? (
                          <ClockSolidIcon className="h-6 w-6" />
                        ) : (
                          <ClockIcon className="h-6 w-6" />
                        )}
                        <span>{isWatchLater ? 'In Watch Later' : 'Watch Later'}</span>
                      </button>
                    </>
                  )}
                  
                  {!isAuthenticated && (
                    <Link
                      to="/login"
                      className="btn btn-outline btn-lg flex items-center justify-center space-x-2"
                    >
                      <HeartIcon className="h-6 w-6" />
                      <span>Sign in to Save</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Movie Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Description */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
              {currentMovie.description ? (
                <p className="text-netflix-lightGray text-lg leading-relaxed">
                  {currentMovie.description}
                </p>
              ) : (
                <p className="text-netflix-lightGray italic">
                  No description available for this movie.
                </p>
              )}
            </div>

            {/* Movie Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-netflix-darkGray rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Movie Details</h3>
                
                <div className="space-y-4">
                  {currentMovie.releaseYear && (
                    <div>
                      <h4 className="text-netflix-lightGray text-sm font-medium mb-1">Release Year</h4>
                      <p className="text-white">{currentMovie.releaseYear}</p>
                    </div>
                  )}
                  
                  {currentMovie.genre && (
                    <div>
                      <h4 className="text-netflix-lightGray text-sm font-medium mb-1">Genre</h4>
                      <p className="text-white">{getGenreDisplayName(currentMovie.genre)}</p>
                    </div>
                  )}
                  
                  {currentMovie.duration && (
                    <div>
                      <h4 className="text-netflix-lightGray text-sm font-medium mb-1">Duration</h4>
                      <p className="text-white">{formatJavaDuration(currentMovie.duration)}</p>
                    </div>
                  )}
                  
                  {currentMovie.imdbRating && (
                    <div>
                      <h4 className="text-netflix-lightGray text-sm font-medium mb-1">Rating</h4>
                      <div className="flex items-center space-x-2">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-white">{formatRating(currentMovie.imdbRating)} / 10</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MovieDetail;