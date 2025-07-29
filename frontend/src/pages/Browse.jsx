import React, { useEffect, useState } from 'react';
import { useMovies } from '../hooks/useMovies';
import MovieGrid from '../components/movie/MovieGrid';
import { SkeletonLoader } from '../components/common/Loader';
import { GENRES } from '../utils/constants';

const Browse = () => {
  const { 
    movies, 
    fetchMovies, 
    fetchMoviesByGenre,
    isLoading 
  } = useMovies();
  
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    if (selectedGenre) {
      fetchMoviesByGenre(selectedGenre);
    } else {
      fetchMovies();
    }
  }, [selectedGenre, fetchMovies, fetchMoviesByGenre]);

  const handleMovieClick = (movie) => {
    window.location.href = `/movie/${movie.id}`;
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 bg-netflix-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonLoader type="row" count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-netflix-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Browse Movies
          </h1>
          <p className="text-netflix-lightGray text-lg">
            Discover your next favorite movie from our extensive collection
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          {/* Genre Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGenreChange('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                !selectedGenre
                  ? 'bg-netflix-red text-white'
                  : 'bg-netflix-gray text-netflix-lightGray hover:text-white hover:bg-netflix-lightGray'
              }`}
            >
              All Genres
            </button>
            {GENRES.slice(0, 10).map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreChange(genre)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  selectedGenre === genre
                    ? 'bg-netflix-red text-white'
                    : 'bg-netflix-gray text-netflix-lightGray hover:text-white hover:bg-netflix-lightGray'
                }`}
              >
                {genre.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        <MovieGrid
          movies={movies || []}
          onMovieClick={handleMovieClick}
          showFilters={true}
          showLayoutToggle={true}
          title={selectedGenre ? `${selectedGenre.replace('_', ' ')} Movies` : 'All Movies'}
          subtitle={`${movies?.length || 0} movies available`}
          emptyMessage={
            selectedGenre 
              ? `No ${selectedGenre.replace('_', ' ').toLowerCase()} movies found`
              : 'No movies available'
          }
        />
      </div>
    </div>
  );
};

export default Browse;