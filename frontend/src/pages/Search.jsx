import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';
import { useMovies } from '../hooks/useMovies';
import { useDebounce } from '../hooks/useDebounce';
import MovieGrid from '../components/movie/MovieGrid';
import { SkeletonLoader } from '../components/common/Loader';
import { GENRES } from '../utils/constants';
import { SearchHistoryStorage } from '../utils/storage';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchMovies, searchResults, isLoading, clearSearch } = useMovies();

  // Search state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'relevance',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState(SearchHistoryStorage.getSearchHistory());
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Search when debounced query or filters change
  useEffect(() => {
    if (debouncedQuery.trim() || Object.values(filters).some(filter => filter)) {
      performSearch();
    } else {
      clearSearch();
    }
  }, [debouncedQuery, filters]);

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (query) params.set('q', query);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.year) params.set('year', filters.year);
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.sortBy !== 'relevance') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);

    setSearchParams(params, { replace: true });
  }, [query, filters, setSearchParams]);

  const performSearch = async () => {
    const searchParams = {
      title: debouncedQuery.trim(),
      genre: filters.genre,
      year: filters.year ? parseInt(filters.year) : null,
      minRating: filters.rating ? parseFloat(filters.rating) : null,
      sortBy: filters.sortBy,
      sortDir: filters.sortOrder
    };

    // Remove empty values
    Object.keys(searchParams).forEach(key => {
      if (!searchParams[key] && searchParams[key] !== 0) {
        delete searchParams[key];
      }
    });

    try {
      await searchMovies(searchParams);
      
      // Add to search history if it's a text search
      if (debouncedQuery.trim()) {
        SearchHistoryStorage.addSearchTerm(debouncedQuery.trim());
        setSearchHistory(SearchHistoryStorage.getSearchHistory());
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleClearSearch = () => {
    setQuery('');
    setFilters({
      genre: '',
      year: '',
      rating: '',
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
    clearSearch();
    navigate('/search', { replace: true });
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleRemoveSuggestion = (suggestion, e) => {
    e.stopPropagation();
    SearchHistoryStorage.removeSearchTerm(suggestion);
    setSearchHistory(SearchHistoryStorage.getSearchHistory());
  };

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`);
  };

  // Generate year options
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  }, []);

  const ratingOptions = [
    { value: '', label: 'Any Rating' },
    { value: '9', label: '9+ Stars' },
    { value: '8', label: '8+ Stars' },
    { value: '7', label: '7+ Stars' },
    { value: '6', label: '6+ Stars' },
    { value: '5', label: '5+ Stars' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'title', label: 'Title' },
    { value: 'releaseYear', label: 'Release Year' },
    { value: 'imdbRating', label: 'Rating' }
  ];

  const hasActiveFilters = filters.genre || filters.year || filters.rating || filters.sortBy !== 'relevance';
  const hasResults = searchResults && searchResults.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-screen pt-24 bg-netflix-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-netflix-lightGray" />
                <input
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search for movies..."
                  className="w-full pl-12 pr-12 py-4 bg-netflix-darkGray border border-netflix-gray rounded-lg text-white placeholder-netflix-lightGray focus:outline-none focus:ring-2 focus:ring-netflix-red focus:border-transparent"
                />
                {query && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-netflix-lightGray hover:text-white"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Search Suggestions */}
              {showSuggestions && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-netflix-darkGray border border-netflix-gray rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <h4 className="text-netflix-lightGray text-sm font-medium px-3 py-2">Recent Searches</h4>
                    {searchHistory.slice(0, 8).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 hover:bg-netflix-gray rounded cursor-pointer group"
                        onClick={() => handleSuggestionClick(item.term)}
                      >
                        <div className="flex items-center space-x-3">
                          <MagnifyingGlassIcon className="h-4 w-4 text-netflix-lightGray" />
                          <span className="text-white">{item.term}</span>
                        </div>
                        <button
                          onClick={(e) => handleRemoveSuggestion(item.term, e)}
                          className="opacity-0 group-hover:opacity-100 text-netflix-lightGray hover:text-white transition-opacity duration-200"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  showFilters || hasActiveFilters
                    ? 'bg-netflix-red text-white'
                    : 'bg-netflix-darkGray text-netflix-lightGray hover:text-white hover:bg-netflix-gray'
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-white text-netflix-red text-xs px-2 py-1 rounded-full font-medium">
                    {Object.values(filters).filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-netflix-darkGray rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Genre Filter */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Genre</label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="w-full bg-netflix-gray border border-netflix-lightGray text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  >
                    <option value="">All Genres</option>
                    {GENRES.map(genre => (
                      <option key={genre} value={genre}>
                        {genre.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Release Year</label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full bg-netflix-gray border border-netflix-lightGray text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  >
                    <option value="">Any Year</option>
                    {yearOptions.slice(0, 50).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Minimum Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full bg-netflix-gray border border-netflix-lightGray text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Sort By</label>
                  <div className="flex space-x-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="flex-1 bg-netflix-gray border border-netflix-lightGray text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      className="bg-netflix-gray border border-netflix-lightGray text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
                    >
                      <option value="desc">{filters.sortBy === 'title' ? 'Z-A' : 'High-Low'}</option>
                      <option value="asc">{filters.sortBy === 'title' ? 'A-Z' : 'Low-High'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-netflix-gray">
                  <button
                    onClick={() => setFilters({
                      genre: '',
                      year: '',
                      rating: '',
                      sortBy: 'relevance',
                      sortOrder: 'desc'
                    })}
                    className="text-netflix-red hover:text-red-300 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="space-y-6">
          {/* Results Header */}
          {(hasQuery || hasActiveFilters) && (
            <div className="flex items-center justify-between">
              <div>
                {isLoading ? (
                  <div className="h-6 bg-netflix-gray rounded w-48 animate-pulse"></div>
                ) : (
                  <h2 className="text-xl font-semibold text-white">
                    {hasQuery ? (
                      <>
                        Search results for "{query}"
                        {searchResults && (
                          <span className="text-netflix-lightGray font-normal ml-2">
                            ({searchResults.length} {searchResults.length === 1 ? 'result' : 'results'})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        Filtered results
                        {searchResults && (
                          <span className="text-netflix-lightGray font-normal ml-2">
                            ({searchResults.length} {searchResults.length === 1 ? 'movie' : 'movies'})
                          </span>
                        )}
                      </>
                    )}
                  </h2>
                )}
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex items-center space-x-2">
                  {filters.genre && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-netflix-red text-white">
                      {filters.genre.replace('_', ' ')}
                      <button
                        onClick={() => handleFilterChange('genre', '')}
                        className="ml-2 hover:text-netflix-lightGray"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.year && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-netflix-red text-white">
                      {filters.year}
                      <button
                        onClick={() => handleFilterChange('year', '')}
                        className="ml-2 hover:text-netflix-lightGray"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {filters.rating && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-netflix-red text-white">
                      {filters.rating}+ ⭐
                      <button
                        onClick={() => handleFilterChange('rating', '')}
                        className="ml-2 hover:text-netflix-lightGray"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <SkeletonLoader type="row" count={3} />
          )}

          {/* Search Results Grid */}
          {!isLoading && hasResults && (
            <MovieGrid
              movies={searchResults}
              onMovieClick={handleMovieClick}
              showFilters={false}
              showLayoutToggle={true}
              emptyMessage="No movies found matching your search criteria"
            />
          )}

          {/* No Results */}
          {!isLoading && !hasResults && (hasQuery || hasActiveFilters) && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-4">No movies found</h3>
              <p className="text-netflix-lightGray mb-8 max-w-md mx-auto">
                {hasQuery ? (
                  <>We couldn't find any movies matching "<strong>{query}</strong>". Try adjusting your search or filters.</>
                ) : (
                  'No movies match your current filters. Try adjusting your search criteria.'
                )}
              </p>
              <div className="space-y-4">
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={handleClearSearch}
                    className="btn btn-primary"
                  >
                    Clear Search & Filters
                  </button>
                  <button
                    onClick={() => navigate('/browse')}
                    className="btn btn-outline"
                  >
                    Browse All Movies
                  </button>
                </div>
                
                {/* Search Suggestions */}
                <div className="text-sm text-netflix-lightGray">
                  <p className="mb-2">Try searching for:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'].map(suggestion => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setQuery(suggestion);
                          setShowSuggestions(false);
                        }}
                        className="px-3 py-1 bg-netflix-gray hover:bg-netflix-lightGray rounded-full text-xs transition-colors duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Default State - No Search Query */}
          {!isLoading && !hasQuery && !hasActiveFilters && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🎬</div>
              <h3 className="text-2xl font-bold text-white mb-4">Search for Movies</h3>
              <p className="text-netflix-lightGray mb-8 max-w-md mx-auto">
                Enter a movie title, genre, or use filters to find the perfect movie to watch.
              </p>
              
              {/* Popular Searches */}
              <div className="space-y-4">
                <p className="text-netflix-lightGray">Popular searches:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Marvel', 'Comedy Movies', '2023 Movies', 'Action', 'Best Movies'].map(term => (
                    <button
                      key={term}
                      onClick={() => {
                        setQuery(term);
                        setShowSuggestions(false);
                      }}
                      className="px-4 py-2 bg-netflix-darkGray hover:bg-netflix-gray rounded-lg text-white transition-colors duration-200 text-sm"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Filter Buttons */}
              <div className="mt-8 space-y-4">
                <p className="text-netflix-lightGray">Browse by genre:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {GENRES.slice(0, 8).map(genre => (
                    <button
                      key={genre}
                      onClick={() => {
                        handleFilterChange('genre', genre);
                        setShowFilters(false);
                      }}
                      className="px-4 py-2 bg-netflix-red hover:bg-red-700 rounded-lg text-white transition-colors duration-200 text-sm"
                    >
                      {genre.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;