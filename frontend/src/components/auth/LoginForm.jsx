import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { LoadingOverlay } from '../common/Loader';
import { isValidEmail } from '../../utils/helpers';

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const { error: showError } = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      // Redirect to intended destination or home
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the auth service
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <LoadingOverlay isLoading={isLoading} text="Signing in...">
        <div className="bg-netflix-darkGray rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="text-netflix-red text-2xl font-bold">
              NETFLIX
            </Link>
            <h2 className="text-2xl font-bold text-white mt-4 mb-2">
              Welcome Back
            </h2>
            <p className="text-netflix-lightGray">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="form-error">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input pr-12 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-netflix-lightGray hover:text-white transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-netflix-red bg-netflix-darkGray border-netflix-gray rounded focus:ring-netflix-red focus:ring-2"
                />
                <span className="ml-2 text-sm text-netflix-lightGray">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-netflix-red hover:text-red-300 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-netflix-red text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Test Admin Login Button - Development Only */}
            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    email: 'admin@test.com',
                    password: 'admin123'
                  });
                }}
                className="w-full mt-2 bg-gray-600 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Load Test Admin Credentials
              </button>
            )}
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-netflix-gray">
            <p className="text-center text-netflix-lightGray text-sm mb-4">
              Demo Accounts (for testing)
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="bg-netflix-gray p-3 rounded">
                <p className="text-white font-medium">User Account</p>
                <p className="text-netflix-lightGray">user@demo.com / password123</p>
              </div>
              <div className="bg-netflix-gray p-3 rounded">
                <p className="text-yellow-400 font-medium">Admin Account</p>
                <p className="text-netflix-lightGray">admin@demo.com / admin123</p>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-netflix-lightGray">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-netflix-red hover:text-red-300 transition-colors duration-200 font-medium"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default LoginForm;