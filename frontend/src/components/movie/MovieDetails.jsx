import React, { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  HeartIcon, 
  ClockIcon, 
  PlusIcon,
  StarIcon,
  CalendarIcon,
  FilmIcon,
  XMarkIcon,
  ShareIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  ClockIcon as ClockSolidIcon,
  PlusIcon as PlusSolidIcon 
} from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import { useMovies } from '../../hooks/useMovies';
import { useNotification } from '../../context/NotificationContext';
import { formatJavaDuration, getGenreDisplayName, formatRating } from '../../utils/helpers';
import Modal from '../common/Modal';
import MovieCarousel from './MovieCarousel';
import { SkeletonLoader } from '../common/Loader';

const MovieDetails = ({ 
  movie, 
  isOpen, 
  onClose, 
  onPlay,
  showRecommendations = true,
  size = 'lg' 
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
    isInWatchlist,
    recommendations,
    fetchRecommendations,
    isLoading
  } = useMovies();
  const { success, error } = useNotification();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Check if movie is in user lists
  const isFavorite = isAuthenticated && movie && isInFavorites(movie.id);
  const isWatchLater = isAuthenticated && movie && isInWatchLater(movie.id);
  const isWatchlist = isAuthenticated && movie && isInWatchlist(movie.id);

  // Fetch recommendations when movie changes
  useEffect(() => {
    if (movie && showRecommendations) {
      fetchRecommendations();
    }
  }, [movie, showRecommendations, fetchRecommendations]);

  if (!movie) return null;

  // Handle actions
  const handlePlayClick = () => {
    if (onPlay) {
      onPlay(movie);
    } else {
      window.location.href = `/watch/${movie.id}`;
    }
    onClose();
  };

  const handleFavoriteClick = async () => {
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

  const handleWatchLaterClick = async () => {
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

  const handleWatchlistClick = async () => {
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

  const handleShare = async () => {
    const url = `${window.location.origin}/movie/${movie.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Check out ${movie.title} on Netflix Clone`,
          url: url
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        success('Link copied to clipboard');
      } catch (err) {
        error('Failed to copy link');
      }
    }
  };

  const tabs = [
    { id: 'details', name: 'Details', icon: FilmIcon },
    { id: 'cast', name: 'Cast & Crew', icon: StarIcon },
    { id: 'similar', name: 'More Like This', icon: PlusIcon }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      showCloseButton={false}
      className="bg-netflix-black"
    >
      <div className="relative">
        {/* Hero Section */}
        <div className="relative h-64 md:h-96 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={movie.posterUrl || movie.thumbnailUrl}
              alt={movie.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = '/api/placeholder/800/600';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/50 to-transparent"></div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-netflix-darkGray/80 hover:bg-netflix-gray rounded-full flex items-center justify-center transition-colors duration-200 z-10"
          >
            <XMarkIcon className="h-6 w-6 text-white" />
          </button>

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-4xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 hero-text-shadow">
                {movie.title}
              </h1>
              
              <div className="flex items-center space-x-6 mb-6">
                {movie.imdbRating && (
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-medium">
                      {formatRating(movie.imdbRating)}
                    </span>
                  </div>
                )}
                
                {movie.releaseYear && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-netflix-lightGray" />
                    <span className="text-netflix-lightGray">{movie.releaseYear}</span>
                  </div>
                )}
                
                {movie.duration && (
                  <div className="flex items-center space-x-2">
                    <FilmIcon className="h-5 w-5 text-netflix-lightGray" />
                    <span className="text-netflix-lightGray">
                      {formatJavaDuration(movie.duration)}
                    </span>
                  </div>
                )}
                
                {movie.genre && (
                  <span className="px-3 py-1 bg-netflix-red text-white text-sm rounded-full">
                    {getGenreDisplayName(movie.genre)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handlePlayClick}
                  className="btn btn-primary btn-lg flex items-center space-x-2"
                >
                  <PlayIcon className="h-6 w-6" />
                  <span>Play</span>
                </button>
                
                {isAuthenticated && (
                  <>
                    <button
                      onClick={handleFavoriteClick}
                      className={`btn btn-lg flex items-center space-x-2 ${
                        isFavorite ? 'btn-primary' : 'btn-outline'
                      }`}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite ? (
                        <HeartSolidIcon className="h-6 w-6" />
                      ) : (
                        <HeartIcon className="h-6 w-6" />
                      )}
                    </button>
                    
                    <button
                      onClick={handleWatchLaterClick}
                      className={`btn btn-lg flex items-center space-x-2 ${
                        isWatchLater ? 'btn-primary' : 'btn-outline'
                      }`}
                      title={isWatchLater ? 'Remove from watch later' : 'Add to watch later'}
                    >
                      {isWatchLater ? (
                        <ClockSolidIcon className="h-6 w-6" />
                      ) : (
                        <ClockIcon className="h-6 w-6" />
                      )}
                    </button>

                    <button
                      onClick={handleWatchlistClick}
                      className={`btn btn-lg flex items-center space-x-2 ${
                        isWatchlist ? 'btn-primary' : 'btn-outline'
                      }`}
                      title={isWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      {isWatchlist ? (
                        <PlusSolidIcon className="h-6 w-6" />
                      ) : (
                        <PlusIcon className="h-6 w-6" />
                      )}
                    </button>
                  </>
                )}
                
                <button
                  onClick={handleShare}
                  className="btn btn-outline btn-lg flex items-center space-x-2"
                  title="Share movie"
                >
                  <ShareIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-netflix-gray animate-pulse" />
          )}
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8">
          {/* Tabs */}
          <div className="border-b border-netflix-gray mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-netflix-red text-white'
                      : 'border-transparent text-netflix-lightGray hover:text-white hover:border-netflix-gray'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-96">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Overview</h3>
                  {movie.description ? (
                    <div>
                      <p className={`text-netflix-lightGray leading-relaxed ${
                        !showFullDescription && movie.description.length > 300 ? 'line-clamp-3' : ''
                      }`}>
                        {movie.description}
                      </p>
                      {movie.description.length > 300 && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-netflix-red hover:text-red-300 text-sm mt-2 flex items-center space-x-1"
                        >
                          <span>{showFullDescription ? 'Show less' : 'Show more'}</span>
                          <ChevronDownIcon 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              showFullDescription ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-netflix-lightGray italic">
                      No description available for this movie.
                    </p>
                  )}
                </div>

                {/* Movie Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {movie.releaseYear && (
                      <div>
                        <h4 className="text-netflix-lightGray text-sm font-medium mb-1">Release Year</h4>
                        <p className="text-white">{movie.releaseYear}</p>
                      </div>
                    )}
                    
                    {movie.genre && (
                      <div>
                        <h4 className="text-netflix-lightGray text-sm font-medium mb-1">Genre</h4>
                        <p className="text-white">{getGenreDisplayName(movie.genre)}</p>
                      </div>
                    )}
                    
                    {movie.duration && (
                      <div>
                        <h4 className="text-netflix-lightGray text-sm font-medium mb-1">Duration</h4>
                        <p className="text-white">{formatJavaDuration(movie.duration)}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {movie.imdbRating && (
                      <div>
                        <h4 className="text-netflix-lightGray text-sm font-medium mb-1">Rating</h4>
                        <div className="flex items-center space-x-2">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span className="text-white">{formatRating(movie.imdbRating)} / 10</span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-netflix-lightGray text-sm font-medium mb-1">Quality</h4>
                      <p className="text-white">HD</p>
                    </div>
                    
                    <div>
                      <h4 className="text-netflix-lightGray text-sm font-medium mb-1">Audio</h4>
                      <p className="text-white">English</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cast' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Cast & Crew</h3>
                  <p className="text-netflix-lightGray">
                    Cast and crew information is not available for this movie.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'similar' && (
              <div className="space-y-6">
                {isLoading ? (
                  <SkeletonLoader type="row" count={1} />
                ) : recommendations && recommendations.length > 0 ? (
                  <MovieCarousel
                    title="More Like This"
                    movies={recommendations}
                    onMovieClick={(movie) => {
                      onClose();
                      setTimeout(() => {
                        window.location.href = `/movie/${movie.id}`;
                      }, 100);
                    }}
                    slidesToShow={4}
                    showTitle={false}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-netflix-lightGray">
                      No similar movies found.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MovieDetails;