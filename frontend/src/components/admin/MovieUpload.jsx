import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const MovieUpload = () => {
  const [movieData, setMovieData] = useState({
    title: '',
    description: '',
    releaseYear: '',
    duration: '', // This will be converted to Duration on backend
    videoUrl: '',
    thumbnailUrl: '',
    posterUrl: '',
    trailerUrl: '',
    genre: '',
    imdbRating: '',
    featured: false,
    trending: false
  });

  const [loading, setLoading] = useState(false);

  const genres = [
    'ACTION', 'ADVENTURE', 'ANIMATION', 'COMEDY', 'CRIME', 'DOCUMENTARY',
    'DRAMA', 'FAMILY', 'FANTASY', 'HISTORY', 'HORROR', 'MUSIC', 'MYSTERY',
    'ROMANCE', 'SCIENCE_FICTION', 'THRILLER', 'WAR', 'WESTERN', 'BIOGRAPHY', 'SPORT'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMovieData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!movieData.title.trim()) {
      toast.error('Movie title is required');
      return false;
    }
    if (!movieData.genre) {
      toast.error('Genre is required');
      return false;
    }
    if (movieData.releaseYear && movieData.releaseYear < 1900) {
      toast.error('Release year must be 1900 or later');
      return false;
    }
    if (movieData.imdbRating && (movieData.imdbRating < 0 || movieData.imdbRating > 10)) {
      toast.error('IMDB rating must be between 0 and 10');
      return false;
    }
    return true;
  };

  const convertDurationToMinutes = (durationString) => {
    if (!durationString) return null;
    
    // If it's already in minutes (number)
    if (!isNaN(durationString)) {
      return parseInt(durationString);
    }
    
    // If it's in HH:MM:SS or MM:SS format
    const parts = durationString.split(':');
    let totalMinutes = 0;
    
    if (parts.length === 3) {
      // HH:MM:SS
      totalMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]) + Math.round(parseInt(parts[2]) / 60);
    } else if (parts.length === 2) {
      // MM:SS
      totalMinutes = parseInt(parts[0]) + Math.round(parseInt(parts[1]) / 60);
    }
    
    return totalMinutes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare the data for backend
      const submitData = {
        title: movieData.title.trim(),
        description: movieData.description || null,
        releaseYear: movieData.releaseYear ? parseInt(movieData.releaseYear) : null,
        duration: convertDurationToMinutes(movieData.duration), // Convert to minutes
        videoUrl: movieData.videoUrl || null,
        thumbnailUrl: movieData.thumbnailUrl || null,
        posterUrl: movieData.posterUrl || null,
        trailerUrl: movieData.trailerUrl || null,
        genre: movieData.genre.toUpperCase(),
        imdbRating: movieData.imdbRating ? parseFloat(movieData.imdbRating) : null,
        featured: movieData.featured,
        trending: movieData.trending
      };

      const token = localStorage.getItem('token');
      const response = await fetch('/api/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create movie');
      }

      const result = await response.json();
      toast.success('Movie created successfully!');
      
      // Reset form
      setMovieData({
        title: '',
        description: '',
        releaseYear: '',
        duration: '',
        videoUrl: '',
        thumbnailUrl: '',
        posterUrl: '',
        trailerUrl: '',
        genre: '',
        imdbRating: '',
        featured: false,
        trending: false
      });
      
    } catch (error) {
      console.error('Error creating movie:', error);
      toast.error(error.message || 'Failed to create movie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload New Movie</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={movieData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre *
            </label>
            <select
              name="genre"
              value={movieData.genre}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Genre</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Release Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Release Year
            </label>
            <input
              type="number"
              name="releaseYear"
              value={movieData.releaseYear}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear() + 5}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes or HH:MM:SS)
            </label>
            <input
              type="text"
              name="duration"
              value={movieData.duration}
              onChange={handleInputChange}
              placeholder="120 or 02:00:00"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* IMDB Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IMDB Rating
            </label>
            <input
              type="number"
              name="imdbRating"
              value={movieData.imdbRating}
              onChange={handleInputChange}
              step="0.1"
              min="0"
              max="10"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={movieData.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video URL
            </label>
            <input
              type="url"
              name="videoUrl"
              value={movieData.videoUrl}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              name="thumbnailUrl"
              value={movieData.thumbnailUrl}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poster URL
            </label>
            <input
              type="url"
              name="posterUrl"
              value={movieData.posterUrl}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trailer URL
            </label>
            <input
              type="url"
              name="trailerUrl"
              value={movieData.trailerUrl}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              id="featured"
              checked={movieData.featured}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
              Featured
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="trending"
              id="trending"
              checked={movieData.trending}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="trending" className="ml-2 block text-sm text-gray-700">
              Trending
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-md text-white font-medium ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } transition-colors`}
          >
            {loading ? 'Creating...' : 'Create Movie'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieUpload;