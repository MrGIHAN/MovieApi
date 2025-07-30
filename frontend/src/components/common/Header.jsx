import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useMovies } from '../../hooks/useMovies';
import { useDebounce } from '../../hooks/useDebounce';
import UserMenu from '../user/UserMenu';
import MovieSearch from '../movie/MovieSearch';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, isLoading } = useAuth();
  const { searchMovies, setSearchQuery } = useMovies();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      setSearchQuery(debouncedSearchQuery);
      if (location.pathname !== '/search') {
        navigate(`/search?q=${encodeURIComponent(debouncedSearchQuery)}`);
      }
    }
  }, [debouncedSearchQuery, setSearchQuery, navigate, location.pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-menu') && !event.target.closest('.user-menu-trigger')) {
        setShowUserMenu(false);
      }
      if (!event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-trigger')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowSearch(false);
  }, [location.pathname]);

  // Define navigation items based on auth state
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Home', href: '/', current: location.pathname === '/' },
      { name: 'Browse', href: '/browse', current: location.pathname === '/browse' },
    ];

    if (isAuthenticated && !isLoading) {
      const userItems = [
        { name: 'My List', href: '/favorites', current: location.pathname === '/favorites' },
        { name: 'Watch Later', href: '/watch-later', current: location.pathname === '/watch-later' },
        { name: 'History', href: '/history', current: location.pathname === '/history' },
      ];

      const adminItems = isAdmin() ? [
        { name: 'Admin Panel', href: '/admin', current: location.pathname.startsWith('/admin'), isAdmin: true },
      ] : [];

      return [...baseItems, ...userItems, ...adminItems];
    }

    return baseItems;
  };

  const navigation = getNavigationItems();

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setLocalSearchQuery('');
      setSearchQuery('');
    }
  };

  const handleUserMenuToggle = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
  };

  const handleMobileMenuToggle = (e) => {
    e.stopPropagation();
    setShowMobileMenu(!showMobileMenu);
  };

  const handleNavItemClick = (href) => {
    navigate(href);
    setShowMobileMenu(false);
  };

  // Don't render anything while loading auth state
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-netflix-black/95 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex-shrink-0">
              <span className="text-netflix-red text-2xl font-bold">NETFLIX</span>
            </Link>
            <div className="w-8 h-8 bg-netflix-gray rounded animate-pulse"></div>
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-netflix-black/95 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-netflix-red text-2xl font-bold">
                NETFLIX
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link ${item.current ? 'active' : ''} ${
                      item.isAdmin ? 'text-yellow-400 hover:text-yellow-300' : ''
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {showSearch ? (
                <div className="flex items-center bg-netflix-darkGray/90 backdrop-blur-sm rounded-lg px-3 py-2">
                  <input
                    type="text"
                    placeholder="Search movies..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    className="bg-transparent text-white placeholder-netflix-lightGray outline-none w-64"
                    autoFocus
                  />
                  <button
                    onClick={handleSearchToggle}
                    className="ml-2 text-netflix-lightGray hover:text-white"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSearchToggle}
                  className="text-netflix-lightGray hover:text-white transition-colors duration-200"
                >
                  <MagnifyingGlassIcon className="h-6 w-6" />
                </button>
              )}
              
              {/* Search Results Dropdown */}
              {showSearch && debouncedSearchQuery && (
                <div className="absolute top-full right-0 mt-2 z-50">
                  <MovieSearch 
                    query={debouncedSearchQuery}
                    onClose={() => setShowSearch(false)}
                  />
                </div>
              )}
            </div>

            {/* Notifications (for authenticated users) */}
            {isAuthenticated && (
              <button className="text-netflix-lightGray hover:text-white transition-colors duration-200">
                <BellIcon className="h-6 w-6" />
              </button>
            )}

            {/* User Menu or Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative user-menu">
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center space-x-2 text-netflix-lightGray hover:text-white transition-colors duration-200 user-menu-trigger"
                >
                  <div className="w-8 h-8 bg-netflix-red rounded flex items-center justify-center text-white text-sm font-medium">
                    {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {showUserMenu && (
                  <UserMenu onClose={() => setShowUserMenu(false)} />
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-netflix-lightGray hover:text-white transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={handleMobileMenuToggle}
                className="text-netflix-lightGray hover:text-white transition-colors duration-200 mobile-menu-trigger"
              >
                {showMobileMenu ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-netflix-darkGray rounded-lg mt-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavItemClick(item.href)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    item.current
                      ? 'text-white bg-netflix-gray'
                      : `text-netflix-lightGray hover:text-white hover:bg-netflix-gray ${
                          item.isAdmin ? 'text-yellow-400 hover:text-yellow-300' : ''
                        }`
                  }`}
                >
                  {item.name}
                </button>
              ))}

              {!isAuthenticated && (
                <div className="pt-4 pb-3 border-t border-netflix-gray">
                  <div className="flex items-center px-3 space-x-3">
                    <button
                      onClick={() => handleNavItemClick('/login')}
                      className="flex-1 text-center py-2 px-4 bg-netflix-gray text-white rounded-lg hover:bg-netflix-lightGray transition-colors duration-200"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleNavItemClick('/register')}
                      className="flex-1 text-center py-2 px-4 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;