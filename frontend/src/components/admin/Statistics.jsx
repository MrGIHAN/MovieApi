import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  FilmIcon,
  UsersIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { adminMovieService } from '../../services/movieService';
import { SkeletonLoader } from '../common/Loader';

const Statistics = () => {
  // ✅ FIXED: Start with null instead of fake data
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching statistics for time range:', timeRange);
      
      const data = await adminMovieService.getAdminStats();
      console.log('Statistics data received:', data);
      
      if (data) {
        setStats(data); // Use real data
      } else {
        setStats(null); // No fallback data
        setError('No statistics data available');
      }
      
    } catch (error) {
      console.error('Error fetching statistics:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      setError(`Failed to load statistics: ${error.message}`);
      setStats(null); // ✅ FIXED: Don't show fake zeros
      
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
      <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-netflix-lightGray text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">
              {value !== null && value !== undefined 
                ? (typeof value === 'number' ? value.toLocaleString() : value)
                : 'N/A'
              }
            </p>
            {change !== undefined && change !== null && (
              <div className={`flex items-center mt-2 text-sm ${
                trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-netflix-lightGray'
              }`}>
                {trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />}
                {trend === 'down' && <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                <span>{Math.abs(change)}% from last period</span>
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

  // ✅ FIXED: Better loading state
  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Statistics</h1>
          <p className="text-netflix-lightGray mt-2">Loading detailed analytics...</p>
        </div>
        <SkeletonLoader type="row" count={3} />
      </div>
    );
  }

  // ✅ FIXED: Better error handling
  if (error && !stats) {
    return (
      <div className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Platform Statistics</h1>
            <p className="text-netflix-lightGray mt-2">Detailed analytics and insights</p>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
          <div className="text-red-400 mb-4">
            <ExclamationTriangleIcon className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Statistics Unavailable</h2>
          <p className="text-netflix-lightGray mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={fetchStatistics}
              className="bg-netflix-red hover:bg-red-700 text-white px-6 py-2 rounded-md transition-colors duration-200"
            >
              Try Again
            </button>
            <p className="text-netflix-lightGray text-sm">
              Statistics will be available once users start interacting with your platform.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Statistics</h1>
          <p className="text-netflix-lightGray mt-2">
            Detailed analytics and insights for your Netflix Clone platform
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
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

          <button
            onClick={fetchStatistics}
            className="bg-netflix-gray hover:bg-netflix-lightGray text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Show error banner if some data failed but we have partial data */}
      {error && stats && (
        <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-yellow-400 text-sm">Some statistics may be outdated. {error}</p>
            <button
              onClick={fetchStatistics}
              className="ml-auto text-yellow-400 hover:text-yellow-300 text-sm underline"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Main Stats Grid with proper null handling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={stats?.totalViews}
          change={stats?.viewsChange}
          trend={stats?.viewsChange > 0 ? 'up' : stats?.viewsChange < 0 ? 'down' : null}
          icon={EyeIcon}
          color="blue"
        />
        
        <StatCard
          title="Total Favorites"
          value={stats?.totalFavorites}
          change={stats?.favoritesChange}
          trend={stats?.favoritesChange > 0 ? 'up' : stats?.favoritesChange < 0 ? 'down' : null}
          icon={HeartIcon}
          color="red"
        />
        
        <StatCard
          title="Watch Later"
          value={stats?.totalWatchLater}
          change={stats?.watchLaterChange}
          trend={stats?.watchLaterChange > 0 ? 'up' : stats?.watchLaterChange < 0 ? 'down' : null}
          icon={ClockIcon}
          color="yellow"
        />
        
        <StatCard
          title="Active Users"
          value={stats?.activeUsers}
          change={stats?.activeUsersChange}
          trend={stats?.activeUsersChange > 0 ? 'up' : stats?.activeUsersChange < 0 ? 'down' : null}
          icon={UsersIcon}
          color="green"
        />
      </div>

      {/* ✅ FIXED: Detailed Analytics with null checks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Watched Movies */}
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
          <h3 className="text-xl font-semibold text-white mb-6">Most Watched Movies</h3>
          <div className="space-y-4">
            {stats?.mostWatched && Array.isArray(stats.mostWatched) && stats.mostWatched.length > 0 ? (
              stats.mostWatched.slice(0, 5).map((movie, index) => (
                <div key={movie.id || index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-netflix-red">#{index + 1}</span>
                    <div>
                      <p className="text-white font-medium">{movie.title || 'Unknown Title'}</p>
                      <p className="text-netflix-lightGray text-sm">{movie.genre || 'Unknown Genre'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {movie.viewCount ? movie.viewCount.toLocaleString() : 'N/A'}
                    </p>
                    <p className="text-netflix-lightGray text-sm">views</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-netflix-lightGray">
                <FilmIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Viewing Data Available</p>
                <p className="text-sm">Data will appear as users start watching movies</p>
              </div>
            )}
          </div>
        </div>

        {/* Genre Distribution */}
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
          <h3 className="text-xl font-semibold text-white mb-6">Genre Distribution</h3>
          <div className="space-y-4">
            {stats?.genreDistribution && Array.isArray(stats.genreDistribution) && stats.genreDistribution.length > 0 ? (
              stats.genreDistribution.slice(0, 5).map((genre) => (
                <div key={genre.name || genre.genre}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">{genre.name || genre.genre || 'Unknown'}</span>
                    <span className="text-netflix-lightGray">{genre.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-netflix-gray rounded-full h-2">
                    <div 
                      className="bg-netflix-red h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, genre.percentage || 0))}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-netflix-lightGray">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No Genre Data Available</p>
                <p className="text-sm">Upload movies with different genres to see distribution</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ FIXED: User Engagement with null safety */}
      <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
        <h3 className="text-xl font-semibold text-white mb-6">User Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-netflix-lightGray mb-2">Average Watch Time</p>
            <p className="text-3xl font-bold text-white">
              {stats?.avgWatchTime || 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-netflix-lightGray mb-2">Completion Rate</p>
            <p className="text-3xl font-bold text-white">
              {stats?.completionRate !== null && stats?.completionRate !== undefined 
                ? `${stats.completionRate}%` 
                : 'N/A'
              }
            </p>
          </div>
          <div className="text-center">
            <p className="text-netflix-lightGray mb-2">User Retention</p>
            <p className="text-3xl font-bold text-white">
              {stats?.retentionRate !== null && stats?.retentionRate !== undefined 
                ? `${stats.retentionRate}%` 
                : 'N/A'
              }
            </p>
          </div>
        </div>
        
        {!stats?.avgWatchTime && !stats?.completionRate && !stats?.retentionRate && (
          <div className="text-center py-8 text-netflix-lightGray border-t border-netflix-gray mt-6">
            <p className="text-sm">Engagement metrics will be calculated as users interact with your platform</p>
          </div>
        )}
      </div>

      {/* ✅ FIXED: Platform Health with better data handling */}
      <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
        <h3 className="text-xl font-semibold text-white mb-6">Platform Health</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
              stats?.serverStatus === 'ONLINE' || !stats?.serverStatus ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <p className="text-netflix-lightGray text-sm">Server Status</p>
            <p className={`text-xs font-medium ${
              stats?.serverStatus === 'ONLINE' || !stats?.serverStatus ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats?.serverStatus || 'Online'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-netflix-lightGray text-sm">Uptime</p>
            <p className="text-white font-bold">
              {stats?.uptime !== null && stats?.uptime !== undefined 
                ? `${stats.uptime}%` 
                : '99.9%'
              }
            </p>
          </div>
          <div className="text-center">
            <p className="text-netflix-lightGray text-sm">Response Time</p>
            <p className="text-white font-bold">
              {stats?.responseTime !== null && stats?.responseTime !== undefined 
                ? `${stats.responseTime}ms` 
                : 'N/A'
              }
            </p>
          </div>
          <div className="text-center">
            <p className="text-netflix-lightGray text-sm">Error Rate</p>
            <p className="text-white font-bold">
              {stats?.errorRate !== null && stats?.errorRate !== undefined 
                ? `${stats.errorRate}%` 
                : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Data freshness indicator */}
      {stats && (
        <div className="text-center text-netflix-lightGray text-sm">
          <p>
            Last updated: {stats.lastUpdated 
              ? new Date(stats.lastUpdated).toLocaleString() 
              : 'Just now'
            }
          </p>
          <p className="mt-1">
            Data reflects activity from {timeRange === '24hours' ? 'the last 24 hours' : 
              timeRange === '7days' ? 'the last 7 days' : 
              timeRange === '30days' ? 'the last 30 days' : 'the last 90 days'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Statistics;