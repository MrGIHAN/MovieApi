import React, { useState, useEffect } from 'react';
import { 
  FilmIcon, 
  UsersIcon, 
  ArrowUpTrayIcon,
  ChartBarIcon,
  EyeIcon,
  PlayIcon,
  HeartIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { adminMovieService } from '../../services/movieService';
import { SkeletonLoader } from '../common/Loader';
import { formatFileSize, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  // ✅ FIXED: No fallback data initialization - start with null
  const [stats, setStats] = useState(null);
  const [recentMovies, setRecentMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching dashboard data...');
      
      // ✅ FIXED: Use Promise.allSettled for graceful error handling
      const results = await Promise.allSettled([
        adminMovieService.getAdminStats(),
        adminMovieService.getTrendingMovies()
      ]);

      // Handle stats data - no fallback to zeros
      if (results[0].status === 'fulfilled' && results[0].value) {
        console.log('Stats data received:', results[0].value);
        setStats(results[0].value);
        
        // Extract recent movies from stats if available
        if (results[0].value.recentMovies && Array.isArray(results[0].value.recentMovies)) {
          setRecentMovies(results[0].value.recentMovies);
        }
      } else {
        console.warn('Failed to fetch stats:', results[0].reason);
        setStats(null); // ✅ FIXED: Don't set fake zeros
      }

      // Handle trending movies data - ensure it's an array
      if (results[1].status === 'fulfilled' && results[1].value) {
        console.log('Trending data received:', results[1].value);
        const trending = Array.isArray(results[1].value) ? results[1].value : [];
        setTrendingMovies(trending.slice(0, 5));
      } else {
        console.warn('Failed to fetch trending movies:', results[1].reason);
        setTrendingMovies([]); // Empty array, not fake data
      }

      // If both critical requests failed, show error
      if (results[0].status === 'rejected' && results[1].status === 'rejected') {
        setError('Unable to load dashboard data. Please check your connection.');
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
      
      // ✅ FIXED: Don't set fake data on error
      setStats(null);
      setRecentMovies([]);
      setTrendingMovies([]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, color = 'blue', isLoading: cardLoading = false }) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-netflix-red',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };

    return (
      <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray hover:border-netflix-lightGray transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-netflix-lightGray text-sm font-medium">{title}</p>
            {cardLoading ? (
              <div className="h-8 bg-netflix-gray animate-pulse rounded mt-2 w-24"></div>
            ) : (
              <p className="text-3xl font-bold text-white mt-2">
                {value !== null && value !== undefined ? value : 'N/A'}
              </p>
            )}
            {!cardLoading && change !== undefined && change !== null && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-netflix-lightGray'
              }`}>
                {trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />}
                {trend === 'down' && <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                <span>{Math.abs(change)}% from last {timeRange === '24hours' ? 'day' : timeRange === '7days' ? 'week' : 'month'}</span>
              </div>
            )}
          </div>
          <div className={`p-3 ${colors[color]} rounded-lg ml-4`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const RecentMovieItem = ({ movie, index }) => (
    <div className="flex items-center space-x-4 p-3 bg-netflix-gray rounded-lg hover:bg-netflix-lightGray transition-colors duration-200">
      <div className="w-12 h-8 bg-netflix-darkGray rounded overflow-hidden flex-shrink-0">
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
          <FilmIcon className="h-3 w-3 text-netflix-darkGray" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{movie.title}</p>
        <p className="text-netflix-lightGray text-sm">
          Added {formatDate(movie.createdAt || new Date())}
        </p>
      </div>
      <div className="text-netflix-lightGray text-sm">
        #{index + 1}
      </div>
    </div>
  );

  const TrendingMovieItem = ({ movie, index }) => (
    <div className="flex items-center space-x-4 p-3 bg-netflix-gray rounded-lg hover:bg-netflix-lightGray transition-colors duration-200">
      <div className="w-12 h-8 bg-netflix-darkGray rounded overflow-hidden flex-shrink-0">
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
          <FilmIcon className="h-3 w-3 text-netflix-darkGray" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{movie.title}</p>
        <div className="flex items-center space-x-2 text-sm text-netflix-lightGray">
          <EyeIcon className="h-4 w-4" />
          <span>{movie.viewCount?.toLocaleString() || 0} views</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
        <span className="text-green-400 text-sm font-medium">#{index + 1}</span>
      </div>
    </div>
  );

  // ✅ FIXED: Better loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-netflix-lightGray mt-2">Loading your platform overview...</p>
          </div>
          <SkeletonLoader type="row" count={3} />
        </div>
      </div>
    );
  }

  // ✅ FIXED: Better error handling
  if (error && !stats) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
            <div className="text-red-400 mb-4">
              <ExclamationTriangleIcon className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Dashboard Error</h2>
            <p className="text-netflix-lightGray mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-netflix-lightGray mt-2">Overview of your Netflix Clone platform</p>
        </div>

        {/* Show partial error if some data failed to load */}
        {error && stats && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-yellow-400 text-sm">Some dashboard data couldn't be loaded. {error}</p>
              <button
                onClick={fetchDashboardData}
                className="ml-auto text-yellow-400 hover:text-yellow-300 text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="flex justify-center mb-8">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-netflix-darkGray border border-netflix-gray text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>

        {/* ✅ FIXED: Stats Grid with proper null handling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Movies"
            value={stats?.totalMovies?.toLocaleString()}
            change={stats?.moviesChange}
            trend={stats?.moviesChange > 0 ? 'up' : stats?.moviesChange < 0 ? 'down' : 'neutral'}
            icon={FilmIcon}
            color="blue"
            isLoading={!stats}
          />
          
          <StatCard
            title="Active Users"
            value={stats?.activeUsers?.toLocaleString()}
            change={stats?.usersChange}
            trend={stats?.usersChange > 0 ? 'up' : stats?.usersChange < 0 ? 'down' : 'neutral'}
            icon={UsersIcon}
            color="green"
            isLoading={!stats}
          />
          
          <StatCard
            title="Total Views"
            value={stats?.totalViews?.toLocaleString()}
            change={stats?.viewsChange}
            trend={stats?.viewsChange > 0 ? 'up' : stats?.viewsChange < 0 ? 'down' : 'neutral'}
            icon={EyeIcon}
            color="red"
            isLoading={!stats}
          />
          
          <StatCard
            title="Storage Used"
            value={stats?.storageUsed ? formatFileSize(stats.storageUsed) : undefined}
            change={stats?.storageChange}
            trend={stats?.storageChange > 0 ? 'up' : stats?.storageChange < 0 ? 'down' : 'neutral'}
            icon={ArrowUpTrayIcon}
            color="yellow"
            isLoading={!stats}
          />
        </div>

        {/* ✅ FIXED: Additional Stats with null checks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Engagement</h3>
              <PlayIcon className="h-6 w-6 text-netflix-red" />
            </div>
            {stats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-netflix-lightGray">Avg. Watch Time</span>
                  <span className="text-white font-medium">{stats.avgWatchTime || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-netflix-lightGray">Completion Rate</span>
                  <span className="text-white font-medium">{stats.completionRate ? `${stats.completionRate}%` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-netflix-lightGray">Bounce Rate</span>
                  <span className="text-white font-medium">{stats.bounceRate ? `${stats.bounceRate}%` : 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-netflix-gray animate-pulse rounded w-1/2"></div>
                    <div className="h-4 bg-netflix-gray animate-pulse rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">User Activity</h3>
              <HeartIcon className="h-6 w-6 text-netflix-red" />
            </div>
            {stats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-netflix-lightGray">New Signups</span>
                  <span className="text-white font-medium">{stats.newSignups?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-netflix-lightGray">Total Favorites</span>
                  <span className="text-white font-medium">{stats.totalFavorites?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-netflix-lightGray">Watch Later</span>
                  <span className="text-white font-medium">{stats.totalWatchLater?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-netflix-gray animate-pulse rounded w-1/2"></div>
                    <div className="h-4 bg-netflix-gray animate-pulse rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">System Health</h3>
              <ChartBarIcon className="h-6 w-6 text-green-400" />
            </div>
            {stats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-netflix-lightGray">Server Uptime</span>
                  <span className="text-green-400 font-medium">{stats.uptime ? `${stats.uptime}%` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-netflix-lightGray">Response Time</span>
                  <span className="text-white font-medium">{stats.responseTime ? `${stats.responseTime}ms` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-netflix-lightGray">Error Rate</span>
                  <span className="text-white font-medium">{stats.errorRate ? `${stats.errorRate}%` : 'N/A'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-netflix-gray animate-pulse rounded w-1/2"></div>
                    <div className="h-4 bg-netflix-gray animate-pulse rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ✅ FIXED: Charts and Lists with proper empty states */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Movies */}
          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recently Added Movies</h3>
              <a href="/admin/movies" className="text-netflix-red hover:text-red-300 text-sm font-medium transition-colors duration-200">
                View All
              </a>
            </div>
            <div className="space-y-3">
              {recentMovies.length > 0 ? (
                recentMovies.slice(0, 5).map((movie, index) => (
                  <RecentMovieItem key={movie.id || index} movie={movie} index={index} />
                ))
              ) : !isLoading ? (
                <div className="text-center py-12 text-netflix-lightGray">
                  <FilmIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent movies found</p>
                  <a href="/admin/upload" className="text-netflix-red hover:text-red-300 text-sm mt-2 inline-block">
                    Upload your first movie
                  </a>
                </div>
              ) : (
                <SkeletonLoader type="list" count={3} />
              )}
            </div>
          </div>

          {/* Trending Movies */}
          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Trending Movies</h3>
              <a href="/admin/statistics" className="text-netflix-red hover:text-red-300 text-sm font-medium transition-colors duration-200">
                View Analytics
              </a>
            </div>
            <div className="space-y-3">
              {trendingMovies.length > 0 ? (
                trendingMovies.map((movie, index) => (
                  <TrendingMovieItem key={movie.id || index} movie={movie} index={index} />
                ))
              ) : !isLoading ? (
                <div className="text-center py-12 text-netflix-lightGray">
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No trending data available</p>
                  <p className="text-sm mt-1">Data will appear as users start watching movies</p>
                </div>
              ) : (
                <SkeletonLoader type="list" count={3} />
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray mb-8">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a
              href="/admin/upload"
              className="flex items-center p-4 bg-netflix-gray rounded-lg hover:bg-netflix-lightGray transition-colors duration-200 group"
            >
              <ArrowUpTrayIcon className="h-8 w-8 text-netflix-red mr-3 group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h4 className="text-white font-medium">Upload Movie</h4>
                <p className="text-netflix-lightGray text-sm">Add new content to the platform</p>
              </div>
            </a>

            <a
              href="/admin/users"
              className="flex items-center p-4 bg-netflix-gray rounded-lg hover:bg-netflix-lightGray transition-colors duration-200 group"
            >
              <UsersIcon className="h-8 w-8 text-blue-400 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h4 className="text-white font-medium">Manage Users</h4>
                <p className="text-netflix-lightGray text-sm">User administration and moderation</p>
              </div>
            </a>

            <a
              href="/admin/statistics"
              className="flex items-center p-4 bg-netflix-gray rounded-lg hover:bg-netflix-lightGray transition-colors duration-200 group"
            >
              <ChartBarIcon className="h-8 w-8 text-green-400 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <div>
                <h4 className="text-white font-medium">View Analytics</h4>
                <p className="text-netflix-lightGray text-sm">Detailed platform insights</p>
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-netflix-lightGray text-sm">
          <p>Last updated: {formatDate(new Date())}</p>
          <p className="mt-1">Netflix Clone Admin Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;