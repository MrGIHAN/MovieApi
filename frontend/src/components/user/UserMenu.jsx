import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  CogIcon, 
  HeartIcon, 
  ClockIcon, 
  PlayIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const UserMenu = ({ onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      onClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuClick = (path) => {
    navigate(path);
    onClose();
  };

  const menuItems = [
    {
      icon: UserIcon,
      label: 'Profile',
      path: '/profile',
      description: 'Manage your account'
    },
    {
      icon: HeartIcon,
      label: 'My Favorites',
      path: '/favorites',
      description: 'Your favorite movies'
    },
    {
      icon: ClockIcon,
      label: 'Watch Later',
      path: '/watch-later',
      description: 'Movies to watch later'
    },
    {
      icon: PlayIcon,
      label: 'Watch History',
      path: '/history',
      description: 'Recently watched'
    },
    {
      icon: CogIcon,
      label: 'Settings',
      path: '/settings',
      description: 'App preferences'
    }
  ];

  // Add admin menu item if user is admin
  if (isAdmin()) {
    menuItems.push({
      icon: WrenchScrewdriverIcon,
      label: 'Admin Dashboard',
      path: '/admin',
      description: 'Admin controls',
      isAdmin: true
    });
  }

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-netflix-darkGray border border-netflix-gray rounded-lg shadow-2xl py-2 z-50">
      {/* User Info Header */}
      <div className="px-4 py-3 border-b border-netflix-gray">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-netflix-red rounded-full flex items-center justify-center text-white font-medium">
            {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-netflix-lightGray text-sm truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleMenuClick(item.path)}
            className={`w-full px-4 py-3 text-left hover:bg-netflix-gray transition-colors duration-200 flex items-center space-x-3 ${
              item.isAdmin ? 'border-t border-netflix-gray' : ''
            }`}
          >
            <item.icon className={`h-5 w-5 ${item.isAdmin ? 'text-yellow-400' : 'text-netflix-lightGray'}`} />
            <div className="flex-1">
              <p className={`font-medium ${item.isAdmin ? 'text-yellow-400' : 'text-white'}`}>
                {item.label}
              </p>
              <p className="text-netflix-lightGray text-sm">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-netflix-gray pt-2">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 text-left hover:bg-netflix-gray transition-colors duration-200 flex items-center space-x-3"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 text-netflix-lightGray" />
          <div>
            <p className="text-white font-medium">Sign Out</p>
            <p className="text-netflix-lightGray text-sm">
              Sign out of your account
            </p>
          </div>
        </button>
      </div>

      {/* Account Plan Info (Optional) */}
      <div className="border-t border-netflix-gray px-4 py-3">
        <div className="text-center">
          <p className="text-netflix-lightGray text-xs">
            Netflix Clone • Free Plan
          </p>
          <p className="text-netflix-lightGray text-xs mt-1">
            Unlimited streaming
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;