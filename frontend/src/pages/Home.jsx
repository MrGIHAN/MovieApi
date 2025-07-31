import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useMovies } from '../hooks/useMovies';
import { useAuth } from '../hooks/useAuth';
import MovieGrid from '../components/movie/MovieGrid';
import { SkeletonLoader } from '../components/common/Loader';
import { API_BASE_URL } from '../utils/constants';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { 
    movies, 
    recommendations, 
    fetchMovies, 
    fetchRecommendations,
    isLoading,
    error 
  } = useMovies();
  
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    // Test API connection
    const testApiConnection = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/movies`);
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch (err) {
        console.error('API connection test failed:', err);
        setApiStatus('error');
      }
    };
    
    testApiConnection();
    fetchMovies();
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [fetchMovies, fetchRecommendations, isAuthenticated]);

  const handleMovieClick = (movie) => {
    window.location.href = `/movie/${movie.id}`;
  };

  const handlePlayClick = (movieId) => {
    window.location.href = `/watch/${movieId}`;
  };

  // Get featured movie (first movie for now) - handle empty array
  const featuredMovie = movies && movies.length > 0 ? movies[0] : null;

  return (
    <div className="min-h-screen">
      {/* Debug Section - Remove in production
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-900/20 border border-yellow-500/50 p-4 mb-4">
          <h3 className="text-yellow-400 font-bold mb-2">Debug Info (Development Only)</h3>
          <div className="text-sm text-yellow-200 space-y-1">
            <p>API Base URL: {API_BASE_URL}</p>
            <p>API Status: {apiStatus}</p>
            <p>Movies Count: {movies?.length || 0}</p>
            <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
            <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )} */}

      {/* Hero Section */}
      {featuredMovie ? (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={featuredMovie.posterUrl || featuredMovie.thumbnailUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/api/placeholder/1920/1080';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 hero-text-shadow">
                {featuredMovie.title}
              </h1>
              
              {featuredMovie.description && (
                <p className="text-lg md:text-xl text-white mb-8 max-w-2xl hero-text-shadow line-clamp-3">
                  {featuredMovie.description}
                </p>
              )}

              <div className="flex items-center space-x-4 mb-8">
                {featuredMovie.imdbRating && (
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white font-medium">{featuredMovie.imdbRating}</span>
                  </div>
                )}
                {featuredMovie.releaseYear && (
                  <span className="text-netflix-lightGray">{featuredMovie.releaseYear}</span>
                )}
                {featuredMovie.genre && (
                  <span className="px-3 py-1 bg-netflix-gray text-white text-sm rounded-full">
                    {featuredMovie.genre.replace('_', ' ')}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => handlePlayClick(featuredMovie.id)}
                  className="btn btn-primary btn-lg flex items-center justify-center space-x-2"
                >
                  <PlayIcon className="h-6 w-6" />
                  <span>Play Now</span>
                </button>
                
                <Link
                  to={`/movie/${featuredMovie.id}`}
                  className="btn btn-outline btn-lg flex items-center justify-center space-x-2"
                >
                  <InformationCircleIcon className="h-6 w-6" />
                  <span>More Info</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        // Fallback hero section when no movies are available
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-netflix-red to-red-900">
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
              Welcome to Netflix Clone
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 max-w-2xl mx-auto">
              {isLoading ? 'Loading amazing content...' : 'Discover thousands of movies and TV shows'}
            </p>
            {error && (
              <p className="text-red-300 mb-8">
                Unable to load content. Please try again later.
              </p>
            )}
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/browse"
                className="btn btn-primary btn-lg"
              >
                Browse Movies
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="btn btn-outline btn-lg"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Content Sections */}
      <div className="bg-netflix-black">
        {/* Popular Movies */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <SkeletonLoader type="row" count={1} />
            ) : movies && movies.length > 0 ? (
              <MovieGrid
                movies={movies?.slice(0, 12) || []}
                title="Popular Movies"
                subtitle="Trending now"
                onMovieClick={handleMovieClick}
                showFilters={false}
                emptyMessage="No movies available"
              />
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎬</div>
                <h2 className="text-2xl font-bold text-white mb-4">No Movies Available</h2>
                <p className="text-netflix-lightGray mb-8">
                  {error ? 'Unable to load movies. Please try again later.' : 'Check back soon for new content!'}
                </p>
                <Link
                  to="/browse"
                  className="btn btn-primary"
                >
                  Browse All
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Personalized Recommendations */}
        {isAuthenticated && recommendations && recommendations.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <MovieGrid
                movies={recommendations}
                title="Recommended for You"
                subtitle="Based on your viewing history"
                onMovieClick={handleMovieClick}
                showFilters={false}
                emptyMessage="No recommendations available"
              />
            </div>
          </section>
        )}

        {/* Browse All */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Discover More Movies
            </h2>
            <p className="text-netflix-lightGray mb-8 max-w-2xl mx-auto">
              Explore our vast collection of movies across all genres. From action-packed blockbusters to heartwarming dramas.
            </p>
            <Link
              to="/browse"
              className="btn btn-primary btn-lg"
            >
              Browse All Movies
            </Link>
          </div>
        </section>

        {/* Call to Action for Guest Users */}
        {!isAuthenticated && (
          <section className="py-16 bg-netflix-darkGray">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Join Netflix Clone Today
              </h2>
              <p className="text-netflix-lightGray mb-8 text-lg">
                Create your account to save favorites, track your watch history, and get personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/register"
                  className="btn btn-primary btn-lg"
                >
                  Sign Up Free
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline btn-lg"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;