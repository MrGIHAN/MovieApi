import React, { useEffect, useState } from 'react';
import { useMovies } from '../../hooks/useMovies';
import { useAuth } from '../../hooks/useAuth';
import MovieGrid from '../movie/MovieGrid';
import { SkeletonLoader } from '../common/Loader';
import { HeartIcon } from '@heroicons/react/24/outline';

const Favorites = () => {
  const { isAuthenticated } = useAuth();
  const { 
    favorites, 
    fetchFavorites, 
    isLoadingUserLists, 
    removeFromFavorites 
  } = useMovies();
  
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  const handleMovieClick = (movie) => {
    window.location.href = `/movie/${movie.id}`;
  };

  const handleRemoveFavorite = async (movieId) => {
    try {
      await removeFromFavorites(movieId);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  };

  if (isLoadingUserLists) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <HeartIcon className="h-8 w-8 text-netflix-red" />
          <h1 className="text-3xl font-bold text-white">My Favorites</h1>
        </div>
        <SkeletonLoader type="row" count={3} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <HeartIcon className="h-16 w-16 text-netflix-lightGray mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
        <p className="text-netflix-lightGray mb-8">
          Please sign in to view your favorite movies.
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

  if (!favorites || favorites.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <HeartIcon className="h-8 w-8 text-netflix-red" />
          <h1 className="text-3xl font-bold text-white">My Favorites</h1>
        </div>
        
        <div className="text-center py-16">
          <HeartIcon className="h-24 w-24 text-netflix-lightGray mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">No Favorites Yet</h2>
          <p className="text-netflix-lightGray mb-8 max-w-md mx-auto">
            Start adding movies to your favorites by clicking the heart icon while browsing.
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
          <HeartIcon className="h-8 w-8 text-netflix-red" />
          <h1 className="text-3xl font-bold text-white">My Favorites</h1>
          <span className="bg-netflix-gray text-netflix-lightGray px-3 py-1 rounded-full text-sm">
            {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="bg-netflix-darkGray border border-netflix-gray text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
          >
            <option value="dateAdded-desc">Recently Added</option>
            <option value="dateAdded-asc">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="releaseYear-desc">Newest Movies</option>
            <option value="releaseYear-asc">Oldest Movies</option>
            <option value="imdbRating-desc">Highest Rated</option>
            <option value="imdbRating-asc">Lowest Rated</option>
          </select>
        </div>
      </div>

      <MovieGrid
        movies={favorites}
        onMovieClick={handleMovieClick}
        showFilters={false}
        showLayoutToggle={true}
        emptyMessage="No favorite movies found"
      />
    </div>
  );
};

export default Favorites;