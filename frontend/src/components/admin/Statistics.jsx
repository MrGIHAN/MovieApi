import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  FilmIcon,
  UsersIcon,
  EyeIcon,
  HeartIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { adminMovieService } from '../../services/movieService';
import { SkeletonLoader } from '../common/Loader';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('7days');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const data = await adminMovieService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
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
            <p className="text-3xl font-bold text-white mt-2">{value?.toLocaleString() || 0}</p>
            {change !== undefined && (
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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Statistics</h1>
          <p className="text-netflix-lightGray mt-2">
            Detailed analytics and insights for your Netflix Clone platform
          </p>
        </div>
        
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

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={stats?.totalViews}
          change={stats?.viewsChange}
          trend={stats?.viewsChange > 0 ? 'up' : 'down'}
          icon={EyeIcon}
          color="blue"
        />
        
        <StatCard
          title="Total Favorites"
          value={stats?.totalFavorites}
          change={stats?.favoritesChange}
          trend={stats?.favoritesChange > 0 ? 'up' : 'down'}
          icon={HeartIcon}
          color="red"
        />
        
        <StatCard
          title="Watch Later"
          value={stats?.totalWatchLater}
          change={stats?.watchLaterChange}
          trend={stats?.watchLaterChange > 0 ? 'up' : 'down'}
          icon={ClockIcon}
          color="yellow"
        />
        
        <StatCard
          title="Active Users"
          value={stats?.activeUsers}
          change={stats?.activeUsersChange}
          trend={stats?.activeUsersChange > 0 ? 'up' : 'down'}
          icon={UsersIcon}
          color="green"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Watched Movies */}
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
          <h3 className="text-xl font-semibold text-white mb-6">Most Watched Movies</h3>
          <div className="space-y-4">
            {stats?.mostWatched?.slice(0, 5).map((movie, index) => (
              <div key={movie.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-netflix-red">#{index + 1}</span>
                  <div>
                    <p className="text-white font-medium">{movie.title}</p>
                    <p className="text-netflix-lightGray text-sm">{movie.genre}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{movie.viewCount.toLocaleString()}</p>
                  <p className="text-netflix-lightGray text-sm">views</p>
                </div>
              </div>
            )) || (
              <p className="text-netflix-lightGray text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Genre Distribution */}
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
          <h3 className="text-xl font-semibold text-white mb-6">Genre Distribution</h3>
          <div className="space-y-4">
            {stats?.genreDistribution?.slice(0, 5).map((genre) => (
              <div key={genre.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">{genre.name}</span>
                  <span className="text-netflix-lightGray">{genre.percentage}%</span>
                </div>
                <div className="w-full bg-netflix-gray rounded-full h-2">
                  <div 
                    className="bg-netflix-red h-2 rounded-full transition-all duration-300"
                    style={{ width: `${genre.percentage}%` }}
                  />
                </div>
              </div>
            )) || (
              <p className="text-netflix-lightGray text-center py-8">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* User Engagement */}
      <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
        <h3 className="text-xl font-semibold text-white mb-6">User Engagement Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-netflix-lightGray mb-2">Average Watch Time</p>
            <p className="text-3xl font-bold text-white">{stats?.avgWatchTime || '0m'}</p>
          </div>
          <div className="text-center">
            <p className="text-netflix-lightGray mb-2">Completion Rate</p>
            <p className="text-3xl font-bold text-white">{stats?.completionRate || 0}%</p>
          </div>
          <div className="text-center">
            <p className="text-netflix-lightGray mb-2">User Retention</p>
            <p className="text-3xl font-bold text-white">{stats?.retentionRate || 0}%</p>
          </div>
        </div>
      </div>

      {/* Platform Health */}
      <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
        <h3 className="text-xl font-semibold text-white mb-6">Platform Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mx-auto mb-2"></div>
            <p className="text-netflix-lightGray text-sm">Server Status</p>
            <p className="text-green-400 text-xs">Online</p>
          </div>
          <div className="text-center">
            <p className="text-netflix-lightGray text-sm">Uptime</p>
            <p className="text-white font-bold">{stats?.uptime || '99.9'}%</p>
          </div>
          <div className="text-center">
            <p className="text-netflix-lightGray text-sm">Response Time</p>
            <p className="text-white font-bold">{stats?.responseTime || '120'}ms</p>
          </div>
          <div className="text-center">
            <p className="text-netflix-lightGray text-sm">Error Rate</p>
            <p className="text-white font-bold">{stats?.errorRate || '0.1'}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;