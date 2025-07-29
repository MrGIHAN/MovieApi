import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  FilmIcon, 
  UsersIcon, 
  ArrowUpTrayIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';
import Dashboard from '../components/admin/Dashboard';
import MovieUpload from '../components/admin/MovieUpload';
import UserManagement from '../components/admin/UserManagement';
import Statistics from '../components/admin/Statistics';

const Admin = () => {
  const location = useLocation();

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
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
          <div className="flex-1 flex flex-col min-h-0 bg-netflix-darkGray border-r border-netflix-gray">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-8">
                <h1 className="text-xl font-bold text-yellow-400">Admin Panel</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
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
            </div>
            
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
          <button className="bg-netflix-darkGray p-2 rounded-md text-netflix-lightGray hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="movies" element={<AdminMovies />} />
              <Route path="upload" element={<AdminUpload />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="statistics" element={<AdminStatistics />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for admin sections
const AdminDashboard = () => (
  <div className="p-8">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      <p className="text-netflix-lightGray mt-2">Overview of your Netflix Clone platform</p>
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-netflix-darkGray rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-2 bg-blue-500 rounded-lg">
            <FilmIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-netflix-lightGray">Total Movies</p>
            <p className="text-2xl font-semibold text-white">1,234</p>
          </div>
        </div>
      </div>

      <div className="bg-netflix-darkGray rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-2 bg-green-500 rounded-lg">
            <UsersIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-netflix-lightGray">Active Users</p>
            <p className="text-2xl font-semibold text-white">5,678</p>
          </div>
        </div>
      </div>

      <div className="bg-netflix-darkGray rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-500 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-netflix-lightGray">Views Today</p>
            <p className="text-2xl font-semibold text-white">12,345</p>
          </div>
        </div>
      </div>

      <div className="bg-netflix-darkGray rounded-lg p-6">
        <div className="flex items-center">
          <div className="p-2 bg-red-500 rounded-lg">
            <ArrowUpTrayIcon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-netflix-lightGray">Uploads</p>
            <p className="text-2xl font-semibold text-white">89</p>
          </div>
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-netflix-darkGray rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/upload"
          className="flex items-center p-4 bg-netflix-gray rounded-lg hover:bg-netflix-lightGray transition-colors duration-200"
        >
          <ArrowUpTrayIcon className="h-8 w-8 text-netflix-red mr-3" />
          <div>
            <h3 className="text-white font-medium">Upload Movie</h3>
            <p className="text-netflix-lightGray text-sm">Add new content</p>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="flex items-center p-4 bg-netflix-gray rounded-lg hover:bg-netflix-lightGray transition-colors duration-200"
        >
          <UsersIcon className="h-8 w-8 text-blue-400 mr-3" />
          <div>
            <h3 className="text-white font-medium">Manage Users</h3>
            <p className="text-netflix-lightGray text-sm">User administration</p>
          </div>
        </Link>

        <Link
          to="/admin/statistics"
          className="flex items-center p-4 bg-netflix-gray rounded-lg hover:bg-netflix-lightGray transition-colors duration-200"
        >
          <ChartBarIcon className="h-8 w-8 text-green-400 mr-3" />
          <div>
            <h3 className="text-white font-medium">View Analytics</h3>
            <p className="text-netflix-lightGray text-sm">Platform insights</p>
          </div>
        </Link>
      </div>
    </div>
  </div>
);

const AdminMovies = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-white mb-8">Movie Management</h1>
    <div className="bg-netflix-darkGray rounded-lg p-6 text-center">
      <FilmIcon className="h-16 w-16 text-netflix-lightGray mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Movie Management</h2>
      <p className="text-netflix-lightGray">Manage your movie collection here.</p>
    </div>
  </div>
);

const AdminUpload = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-white mb-8">Upload Movies</h1>
    <div className="bg-netflix-darkGray rounded-lg p-6 text-center">
      <ArrowUpTrayIcon className="h-16 w-16 text-netflix-lightGray mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Upload New Content</h2>
      <p className="text-netflix-lightGray">Add new movies to your platform.</p>
    </div>
  </div>
);

const AdminUsers = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-white mb-8">User Management</h1>
    <div className="bg-netflix-darkGray rounded-lg p-6 text-center">
      <UsersIcon className="h-16 w-16 text-netflix-lightGray mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">User Management</h2>
      <p className="text-netflix-lightGray">Manage registered users and permissions.</p>
    </div>
  </div>
);

const AdminStatistics = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-white mb-8">Platform Statistics</h1>
    <div className="bg-netflix-darkGray rounded-lg p-6 text-center">
      <ChartBarIcon className="h-16 w-16 text-netflix-lightGray mx-auto mb-4" />
      <h2 className="text-xl font-bold text-white mb-2">Analytics & Statistics</h2>
      <p className="text-netflix-lightGray">View detailed platform analytics and insights.</p>
    </div>
  </div>
);

export default Admin;