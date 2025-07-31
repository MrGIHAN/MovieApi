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
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { adminMovieService } from '../../services/movieService';
import { SkeletonLoader } from '../common/Loader';
import { formatFileSize, formatDate } from '../../utils/helpers';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentMovies, setRecentMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, trending] = await Promise.all([
        adminMovieService.getAdminStats(),
        adminMovieService.getTrendingMovies()
      ]);
      
      setStats(statsData);
      setTrendingMovies(trending.slice(0, 5));
      setRecentMovies(statsData.recentMovies || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Show error message to user
      if (error.response?.status === 403) {
        console.error('Access denied. Admin privileges required.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, trend, color = 'blue' }) => {
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
          <div>
            <p className="text-netflix-lightGray text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-netflix-lightGray'
              }`}>
                {trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />}
                {trend === 'down' && <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                <span>{change}% from last {timeRange === '24hours' ? 'day' : timeRange === '7days' ? 'week' : 'month'}</span>
              </div>
            )}
          </div>
          <div className={`p-3 ${colors[color]} rounded-lg`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const RecentMovieItem = ({ movie, index }) => (
    <div className="flex items-center space-x-4 p-3 bg-netflix-gray rounded-lg hover:bg-netflix-lightGray transition-colors duration-200">
      <div className="w-12 h-8 bg-netflix-darkGray rounded overflow-hidden flex-shrink-0">
        <img
          src={movie.posterUrl || movie.thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/api/placeholder/48/32';
          }}
        />
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
        <img
          src={movie.posterUrl || movie.thumbnailUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/api/placeholder/48/32';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate">{movie.title}</p>
        <div className="flex items-center space-x-2 text-sm text-netflix-lightGray">
          <EyeIcon className="h-4 w-4" />
          <span>{movie.viewCount || 0} views</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
        <span className="text-green-400 text-sm font-medium">#{index + 1}</span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <div className="h-8 bg-netflix-gray rounded w-64 animate-pulse mb-2"></div>
          <div className="h-4 bg-netflix-gray rounded w-96 animate-pulse"></div>
        </div>
        <SkeletonLoader type="row" count={3} />
      </div>
    );
  }

  return (
    <div className="flex-1 md:ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-netflix-lightGray mt-2">Overview of your Netflix Clone platform</p>
        </div>

        {/* Test Button for Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4">
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Refresh Dashboard Data
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Movies"
            value={stats?.totalMovies?.toLocaleString() || '0'}
            change={stats?.moviesChange}
            trend={stats?.moviesChange > 0 ? 'up' : stats?.moviesChange < 0 ? 'down' : 'neutral'}
            icon={FilmIcon}
            color="blue"
          />
          
          <StatCard
            title="Active Users"
            value={stats?.activeUsers?.toLocaleString() || '0'}
            change={stats?.usersChange}
            trend={stats?.usersChange > 0 ? 'up' : stats?.usersChange < 0 ? 'down' : 'neutral'}
            icon={UsersIcon}
            color="green"
          />
          
          <StatCard
            title="Total Views"
            value={stats?.totalViews?.toLocaleString() || '0'}
            change={stats?.viewsChange}
            trend={stats?.viewsChange > 0 ? 'up' : stats?.viewsChange < 0 ? 'down' : 'neutral'}
            icon={EyeIcon}
            color="red"
          />
          
          <StatCard
            title="Storage Used"
            value={formatFileSize(stats?.storageUsed || 0)}
            change={stats?.storageChange}
            trend={stats?.storageChange > 0 ? 'up' : stats?.storageChange < 0 ? 'down' : 'neutral'}
            icon={ArrowUpTrayIcon}
            color="yellow"
          />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Engagement</h3>
              <PlayIcon className="h-6 w-6 text-netflix-red" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-netflix-lightGray">Avg. Watch Time</span>
                <span className="text-white font-medium">{stats?.avgWatchTime || '0m'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-netflix-lightGray">Completion Rate</span>
                <span className="text-white font-medium">{stats?.completionRate || '0'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-netflix-lightGray">Bounce Rate</span>
                <span className="text-white font-medium">{stats?.bounceRate || '0'}%</span>
              </div>
            </div>
          </div>

          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">User Activity</h3>
              <HeartIcon className="h-6 w-6 text-netflix-red" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-netflix-lightGray">New Signups</span>
                <span className="text-white font-medium">{stats?.newSignups || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-netflix-lightGray">Total Favorites</span>
                <span className="text-white font-medium">{stats?.totalFavorites || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-netflix-lightGray">Watch Later</span>
                <span className="text-white font-medium">{stats?.totalWatchLater || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">System Health</h3>
              <ChartBarIcon className="h-6 w-6 text-green-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-netflix-lightGray">Server Uptime</span>
                <span className="text-green-400 font-medium">{stats?.uptime || '99.9'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-netflix-lightGray">Response Time</span>
                <span className="text-white font-medium">{stats?.responseTime || '120'}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-netflix-lightGray">Error Rate</span>
                <span className="text-white font-medium">{stats?.errorRate || '0.1'}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Movies */}
          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recently Added Movies</h3>
              <a href="/admin/movies" className="text-netflix-red hover:text-red-300 text-sm font-medium">
                View All
              </a>
            </div>
            <div className="space-y-3">
              {recentMovies.slice(0, 5).map((movie, index) => (
                <RecentMovieItem key={movie.id} movie={movie} index={index} />
              ))}
              {recentMovies.length === 0 && (
                <div className="text-center py-8 text-netflix-lightGray">
                  No recent movies found
                </div>
              )}
            </div>
          </div>

          {/* Trending Movies */}
          <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Trending Movies</h3>
              <a href="/admin/statistics" className="text-netflix-red hover:text-red-300 text-sm font-medium">
                View Analytics
              </a>
            </div>
            <div className="space-y-3">
              {trendingMovies.map((movie, index) => (
                <TrendingMovieItem key={movie.id} movie={movie} index={index} />
              ))}
              {trendingMovies.length === 0 && (
                <div className="text-center py-8 text-netflix-lightGray">
                  No trending data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* System Status */}
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">System Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
              <p className="text-netflix-lightGray text-sm">Database</p>
              <p className="text-green-400 text-xs">Online</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
              <p className="text-netflix-lightGray text-sm">API Server</p>
              <p className="text-green-400 text-xs">Healthy</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
              <p className="text-netflix-lightGray text-sm">File Storage</p>
              <p className="text-green-400 text-xs">Available</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mx-auto mb-2"></div>
              <p className="text-netflix-lightGray text-sm">CDN</p>
              <p className="text-yellow-400 text-xs">Optimizing</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-netflix-lightGray text-sm">
          <p>Last updated: {formatDate(new Date(), 'MMM dd, yyyy HH:mm')}</p>
          <p className="mt-1">Netflix Clone Admin Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;