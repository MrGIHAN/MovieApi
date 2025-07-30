import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useMovies } from '../hooks/useMovies';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import VideoPlayer from '../components/movie/VideoPlayer';
import MovieCarousel from '../components/movie/MovieCarousel';
import { SkeletonLoader } from '../components/common/Loader';
import { formatJavaDuration, getGenreDisplayName } from '../utils/helpers';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const {
    currentMovie,
    recommendations,
    fetchMovieById,
    fetchRecommendations,
    updateWatchProgress,
    isLoadingMovie,
    isLoading
  } = useMovies();
  const { success, error } = useNotification();

  const [playerKey, setPlayerKey] = useState(0);
  const [watchStartTime, setWatchStartTime] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Get start time from URL params (for resume functionality)
  useEffect(() => {
    const timeParam = searchParams.get('t');
    if (timeParam) {
      const startTime = parseInt(timeParam);
      if (!isNaN(startTime) && startTime > 0) {
        setWatchStartTime(startTime);
      }
    }
  }, [searchParams]);

  // Fetch movie data
  useEffect(() => {
    if (id) {
      fetchMovieById(id);
    }
  }, [id, fetchMovieById]);

  // Fetch recommendations after movie loads
  useEffect(() => {
    if (currentMovie) {
      fetchRecommendations();
    }
  }, [currentMovie, fetchRecommendations]);

  // Show recommendations after some time
  useEffect(() => {
    if (currentMovie) {
      const timer = setTimeout(() => {
        setShowRecommendations(true);
      }, 10000); // Show after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [currentMovie]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToMovieDetail = () => {
    if (currentMovie) {
      navigate(`/movie/${currentMovie.id}`);
    }
  };

  const handleTimeUpdate = (currentTime, duration) => {
    // Update watch progress in real-time
    if (isAuthenticated && currentMovie) {
      // Save progress every 30 seconds
      const now = Date.now();
      const lastUpdate = localStorage.getItem(`last_progress_${currentMovie.id}`);
      
      if (!lastUpdate || now - parseInt(lastUpdate) > 30000) {
        updateWatchProgress({
          movieId: currentMovie.id,
          currentPosition: Math.floor(currentTime),
          totalDuration: Math.floor(duration),
          completed: currentTime / duration >= 0.9
        });
        localStorage.setItem(`last_progress_${currentMovie.id}`, now.toString());
      }
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/movie/${currentMovie.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentMovie.title,
          text: `Watch ${currentMovie.title} on Netflix Clone`,
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

  const handleMovieClick = (movie) => {
    // Navigate to new movie
    navigate(`/watch/${movie.id}`);
    // Force re-render of video player
    setPlayerKey(prev => prev + 1);
    setWatchStartTime(0);
    setShowRecommendations(false);
  };

  if (isLoadingMovie) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <div className="flex items-center justify-center h-screen">
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-white text-xl">Loading movie...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentMovie) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <p className="text-netflix-lightGray text-xl mb-8">
            Movie not found
          </p>
          <button
            onClick={() => navigate('/browse')}
            className="btn btn-primary"
          >
            Browse Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="w-10 h-10 bg-netflix-darkGray/80 hover:bg-netflix-gray rounded-full flex items-center justify-center transition-colors duration-200"
              title="Go back"
            >
              <ArrowLeftIcon className="h-5 w-5 text-white" />
            </button>
            
            <div className="cursor-pointer" onClick={handleGoToMovieDetail}>
              <h1 className="text-white text-lg font-semibold hover:text-netflix-red transition-colors duration-200">
                {currentMovie.title}
              </h1>
              <div className="flex items-center space-x-3 text-sm text-netflix-lightGray">
                {currentMovie.releaseYear && (
                  <span>{currentMovie.releaseYear}</span>
                )}
                {currentMovie.genre && (
                  <>
                    <span>•</span>
                    <span>{getGenreDisplayName(currentMovie.genre)}</span>
                  </>
                )}
                {currentMovie.duration && (
                  <>
                    <span>•</span>
                    <span>{formatJavaDuration(currentMovie.duration)}</span>
                  </>
                )}
                {currentMovie.imdbRating && (
                  <>
                    <span>•</span>
                    <span>⭐ {currentMovie.imdbRating}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 bg-netflix-darkGray/80 hover:bg-netflix-gray rounded-full flex items-center justify-center transition-colors duration-200"
              title="Share movie"
            >
              <ShareIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative">
        <VideoPlayer
          key={playerKey}
          movie={currentMovie}
          autoPlay={true}
          startTime={watchStartTime}
          onTimeUpdate={handleTimeUpdate}
          onClose={handleGoBack}
          className="h-screen"
        />
      </div>

      {/* Recommendations Section */}
      {showRecommendations && recommendations && recommendations.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
          <div className="max-w-7xl mx-auto">
            <MovieCarousel
              title="More Like This"
              movies={recommendations.slice(0, 10)}
              onMovieClick={handleMovieClick}
              showTitle={true}
              slidesToShow={5}
              className="mb-4"
            />
          </div>
        </div>
      )}

      {/* Up Next Section (for series - placeholder) */}
      {currentMovie.type === 'SERIES' && (
        <div className="absolute bottom-20 right-6 w-80 bg-netflix-darkGray/95 backdrop-blur-sm rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Up Next</h3>
          <div className="flex space-x-3">
            <div className="w-20 h-12 bg-netflix-gray rounded overflow-hidden flex-shrink-0">
              <img
                src={currentMovie.posterUrl}
                alt="Next episode"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/80/48';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                Episode 2: {currentMovie.title} Continues
              </p>
              <p className="text-netflix-lightGray text-xs">
                45m
              </p>
            </div>
          </div>
          <button className="w-full mt-3 py-2 bg-white text-black rounded font-medium hover:bg-netflix-lightGray transition-colors duration-200">
            Play Next Episode
          </button>
        </div>
      )}

      {/* Loading overlay for recommendations */}
      {isLoading && showRecommendations && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
          <div className="max-w-7xl mx-auto">
            <SkeletonLoader type="row" count={1} />
          </div>
        </div>
      )}

      {/* Mobile-specific controls */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="bg-netflix-darkGray/95 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleGoBack}
              className="flex items-center space-x-2 text-white"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back</span>
            </button>
            
            <button
              onClick={handleGoToMovieDetail}
              className="text-netflix-red hover:text-red-300 text-sm font-medium"
            >
              Movie Details
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts info (hidden by default, shown on key press) */}
      <div className="fixed bottom-4 left-4 bg-netflix-darkGray/95 backdrop-blur-sm rounded-lg p-3 opacity-0 pointer-events-none transition-opacity duration-300" id="shortcuts-info">
        <div className="text-white text-xs space-y-1">
          <div className="font-medium mb-2">Keyboard Shortcuts:</div>
          <div>Space - Play/Pause</div>
          <div>← → - Skip 10s</div>
          <div>↑ ↓ - Volume</div>
          <div>F - Fullscreen</div>
          <div>M - Mute</div>
          <div>Esc - Exit</div>
        </div>
      </div>

      {/* Error Boundary for Video Player */}
      {!currentMovie.videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 z-30">
          <div className="text-center text-white max-w-md mx-auto p-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Video Not Available</h2>
            <p className="text-netflix-lightGray mb-6">
              This movie is currently not available for streaming. Please try again later or contact support.
            </p>
            <div className="space-x-4">
              <button
                onClick={handleGoBack}
                className="btn btn-outline"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watch;