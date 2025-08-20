import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMovies } from '../hooks/useMovies';
import { useAuth } from '../hooks/useAuth';
import MovieGrid from '../components/movie/MovieGrid';
import { SkeletonLoader } from '../components/common/Loader';
import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';
import HeroSlider from '../components/hero/HeroSlider';
import RowSlider from '../components/sections/RowSlider';

const Home = () => {
  const navigate = useNavigate();
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
    const testApiConnection = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MOVIES.BASE}`);
        setApiStatus(res.ok ? 'connected' : 'error');
      } catch {
        setApiStatus('error');
      }
    };
    testApiConnection();
    fetchMovies();
    if (isAuthenticated) fetchRecommendations();
  }, [fetchMovies, fetchRecommendations, isAuthenticated]);

  const handleMovieClick = (movie) => navigate(`/movie/${movie.id}`);
  const handlePlayClick = (movie) => navigate(`/watch/${movie.id}`);
  const handleMoreInfo = (movie) => navigate(`/movie/${movie.id}`);

  // Featured slides (prefer those with a wide image)
  const featuredSlides = useMemo(() => {
    const withHero = (movies || []).filter(m => m?.thumbnailUrl || m?.posterUrl);
    return withHero.slice(0, 6);
  }, [movies]);

  // Secondary rows
  const trending = useMemo(() => (movies || []).slice(0, 12), [movies]);
  const newReleases = useMemo(() => (movies || []).slice(12, 24), [movies]);

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* HERO — slider */}
      {featuredSlides.length > 0 ? (
        <HeroSlider
          slides={featuredSlides}
          autoPlayMs={6000}
          onPlay={handlePlayClick}
          onMoreInfo={handleMoreInfo}
        />
      ) : (
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-900 to-black">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold text-white mb-4">Welcome to Netflix Clone</h1>
            <p className="text-neutral-300 mb-8 text-lg">
              {isLoading ? 'Loading amazing content...' : 'Discover thousands of movies and TV shows.'}
            </p>
            {error && <p className="text-red-400 mb-6">Unable to load content. Please try again later.</p>}
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/browse" className="btn btn-primary btn-lg">Browse Movies</Link>
              {!isAuthenticated && <Link to="/register" className="btn btn-outline btn-lg">Sign Up</Link>}
            </div>
          </div>
        </section>
      )}

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row sliders */}
        {isLoading ? (
          <div className="py-10"><SkeletonLoader type="row" count={1} /></div>
        ) : (
          <>
            <RowSlider title="Trending Now" movies={trending} onMovieClick={handleMovieClick} />
            <RowSlider title="New Releases" movies={newReleases} onMovieClick={handleMovieClick} />
          </>
        )}

        {/* Popular grid */}
        <section className="py-12">
          {isLoading ? (
            <SkeletonLoader type="row" count={1} />
          ) : movies && movies.length > 0 ? (
            <MovieGrid
              movies={movies?.slice(0, 12) || []}
              title="Popular Movies"
              subtitle="Handpicked for you"
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
              <Link to="/browse" className="btn btn-primary">Browse All</Link>
            </div>
          )}
        </section>

        {/* Personalized Recommendations */}
        {isAuthenticated && recommendations && recommendations.length > 0 && (
          <section className="py-8">
            <MovieGrid
              movies={recommendations}
              title="Recommended for You"
              subtitle="Based on your viewing history"
              onMovieClick={handleMovieClick}
              showFilters={false}
              emptyMessage="No recommendations available"
            />
          </section>
        )}

        {/* CTA for guests */}
        {!isAuthenticated && (
          <section className="py-16 bg-netflix-darkGray/40 rounded-2xl my-8">
            <div className="max-w-4xl mx-auto text-center px-6">
              <h2 className="text-3xl font-bold text-white mb-4">Join Netflix Clone Today</h2>
              <p className="text-netflix-lightGray mb-8 text-lg">
                Create your account to save favorites, track your watch history, and get personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/register" className="btn btn-primary btn-lg">Sign Up Free</Link>
                <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
