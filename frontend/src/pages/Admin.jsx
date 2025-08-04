import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  FilmIcon, 
  UsersIcon, 
  ArrowUpTrayIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Import the actual components (make sure these match your file names)
import Dashboard from '../components/admin/Dashboard';
import MovieUpload from '../components/admin/MovieUpload';
import UserManagement from '../components/admin/UserManagement';
import Statistics from '../components/admin/Statistics';

// Import services and utilities
import { movieService, adminMovieService } from '../services/movieService';
import { useNotification } from '../context/NotificationContext';
import { SkeletonLoader } from '../components/common/Loader';
import { formatDate } from '../utils/helpers';

const Admin = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: HomeIcon,
      current: location.pathname === '/admin'
    },
    {
      name: 'Movies',
      href: '/admin/movies',
      icon: FilmIcon,
      current: location.pathname === '/admin/movies'
    },
    {
      name: 'Upload',
      href: '/admin/upload',
      icon: ArrowUpTrayIcon,
      current: location.pathname === '/admin/upload'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UsersIcon,
      current: location.pathname === '/admin/users'
    },
    {
      name: 'Statistics',
      href: '/admin/statistics',
      icon: ChartBarIcon,
      current: location.pathname === '/admin/statistics'
    }
  ];

  return (
    <div className="min-h-screen pt-16 bg-netflix-black">
      <div className="flex">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-netflix-darkGray border-r border-netflix-gray transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full pt-16">
            {/* Mobile close button */}
            <div className="md:hidden flex justify-end p-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-netflix-lightGray hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Logo/Title */}
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <h1 className="text-xl font-bold text-yellow-400">Admin Panel</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${item.current
                      ? 'bg-netflix-red text-white'
                      : 'text-netflix-lightGray hover:bg-netflix-gray hover:text-white'
                    }
                  `}
                >
                  <item.icon
                    className={`
                      mr-3 flex-shrink-0 h-6 w-6
                      ${item.current ? 'text-white' : 'text-netflix-lightGray group-hover:text-white'}
                    `}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Admin Info */}
            <div className="flex-shrink-0 p-4 border-t border-netflix-gray">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">A</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Admin User</p>
                  <p className="text-netflix-lightGray text-xs">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden fixed top-20 left-4 z-40">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="bg-netflix-darkGray p-2 rounded-md text-netflix-lightGray hover:text-white border border-netflix-gray"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 md:pl-64">
          <main className="min-h-screen">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="movies" element={<AdminMovies />} />
              <Route path="upload" element={<MovieUpload />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="statistics" element={<Statistics />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

// ✅ FIXED: AdminMovies component with real API integration
const AdminMovies = () => {
  const { error: notifyError } = useNotification();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchMovies = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching movies from API...');
      
      // Use the real movie service - try admin endpoint first, fallback to regular
      let moviesData;
      try {
        // Try admin-specific endpoint if available
        moviesData = await movieService.getAllMovies();
      } catch (regularError) {
        console.log('Regular movies endpoint failed:', regularError);
        // You could try admin endpoint here if it has a different method
        throw regularError;
      }

      console.log('Movies data received:', moviesData);
      console.log('Data type:', typeof moviesData);
      console.log('Is array:', Array.isArray(moviesData));

      // Ensure we have an array
      const safeMovies = Array.isArray(moviesData) ? moviesData : [];
      setMovies(safeMovies);
      
      if (safeMovies.length === 0) {
        console.log('No movies found in response');
      }

    } catch (err) {
      console.error('Error fetching movies:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      setError(`Failed to fetch movies: ${err.message}`);
      notifyError('Failed to load movies. Please check your connection and try again.');
      setMovies([]); // Set empty array, not fake data
    } finally {
      setIsLoading(false);
    }
  }, [notifyError]);

  React.useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleRefresh = () => {
    fetchMovies();
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    try {
      await adminMovieService.deleteMovie(movieId);
      setMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieId));
    } catch (err) {
      console.error('Error deleting movie:', err);
      notifyError('Failed to delete movie');
    }
  };

  // Filter and sort movies
  const filteredMovies = React.useMemo(() => {
    let filtered = movies.filter(movie => 
      movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort movies
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [movies, searchQuery, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Movie Management</h1>
          <p className="text-netflix-lightGray">Loading movies...</p>
        </div>
        <SkeletonLoader type="list" count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Movie Management</h1>
          <p className="text-netflix-lightGray">Manage your movie collection</p>
        </div>

        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center mb-8">
          <div className="text-red-400 mb-4">
            <FilmIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Movies</h2>
          <p className="text-netflix-lightGray mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Movie Management</h1>
            <p className="text-netflix-lightGray">
              {movies.length > 0 
                ? `Managing ${movies.length} movie${movies.length !== 1 ? 's' : ''}`
                : 'Manage your movie collection'
              }
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-netflix-gray hover:bg-netflix-lightGray text-white px-4 py-2 rounded-md transition-colors duration-200"
          >
            Refresh
          </button>
        </div>

        {/* Search and Sort Controls */}
        {movies.length > 0 && (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-6">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-netflix-gray border border-netflix-lightGray rounded-lg text-white placeholder-netflix-lightGray focus:outline-none focus:ring-2 focus:ring-netflix-red"
              />
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="bg-netflix-gray border border-netflix-lightGray text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="viewCount-desc">Most Viewed</option>
                <option value="imdbRating-desc">Highest Rated</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-netflix-darkGray rounded-lg border border-netflix-gray overflow-hidden">
        <div className="p-6 border-b border-netflix-gray">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {filteredMovies.length > 0 
                ? `${filteredMovies.length} Movie${filteredMovies.length !== 1 ? 's' : ''} Found`
                : movies.length > 0 
                  ? 'No Movies Match Your Search'
                  : 'All Movies'
              }
            </h2>
            <Link 
              to="/admin/upload"
              className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Add New Movie
            </Link>
          </div>
        </div>

        {filteredMovies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-netflix-gray">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Movie</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Genre</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Year</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Views</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Added</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="border-b border-netflix-gray hover:bg-netflix-gray/50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-netflix-lightGray rounded overflow-hidden flex-shrink-0">
                          {movie.posterUrl || movie.thumbnailUrl ? (
                            <img
                              src={movie.posterUrl || movie.thumbnailUrl}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="w-full h-full bg-netflix-lightGray flex items-center justify-center">
                            <FilmIcon className="h-4 w-4 text-netflix-darkGray" />
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">{movie.title}</p>
                          <p className="text-netflix-lightGray text-sm truncate max-w-xs">
                            {movie.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-netflix-lightGray">
                      {movie.genre || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-netflix-lightGray">
                      {movie.releaseYear || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-netflix-lightGray">
                      {movie.imdbRating ? `${movie.imdbRating}/10` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-netflix-lightGray">
                      {movie.viewCount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 text-netflix-lightGray text-sm">
                      {movie.createdAt ? formatDate(movie.createdAt) : 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                          onClick={() => {
                            // Navigate to edit page or open edit modal
                            console.log('Edit movie:', movie.id);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200"
                          onClick={() => handleDeleteMovie(movie.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : movies.length === 0 ? (
          <div className="p-12 text-center">
            <FilmIcon className="h-16 w-16 text-netflix-lightGray mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">No Movies Available</h3>
            <p className="text-netflix-lightGray mb-6">
              It looks like no movies have been uploaded yet.
            </p>
            <Link 
              to="/admin/upload"
              className="btn btn-primary"
            >
              Upload Your First Movie
            </Link>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FilmIcon className="h-16 w-16 text-netflix-lightGray mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-white mb-2">No Movies Match Your Search</h3>
            <p className="text-netflix-lightGray mb-6">
              Try adjusting your search terms or filters.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="btn btn-outline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;