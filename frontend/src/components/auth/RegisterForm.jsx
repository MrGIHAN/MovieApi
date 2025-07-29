import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../context/NotificationContext';
import { LoadingOverlay } from '../common/Loader';
import { isValidEmail, validatePassword } from '../../utils/helpers';

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const { success: showSuccess } = useNotification();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordValidation = validatePassword(formData.password);

  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.isValid) {
      newErrors.password = 'Password does not meet requirements';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      showSuccess('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (error) {
      // Error is handled by the auth service
      console.error('Registration failed:', error);
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center space-x-2 text-xs ${met ? 'text-green-400' : 'text-netflix-lightGray'}`}>
      {met ? (
        <CheckIcon className="h-3 w-3" />
      ) : (
        <XMarkIcon className="h-3 w-3" />
      )}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <LoadingOverlay isLoading={isLoading} text="Creating account...">
        <div className="bg-netflix-darkGray rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="text-netflix-red text-2xl font-bold">
              NETFLIX
            </Link>
            <h2 className="text-2xl font-bold text-white mt-4 mb-2">
              Create Account
            </h2>
            <p className="text-netflix-lightGray">
              Join millions of users streaming movies
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`input ${errors.firstName ? 'input-error' : ''}`}
                  placeholder="First name"
                  autoComplete="given-name"
                />
                {errors.firstName && (
                  <p className="form-error">{errors.firstName}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`input ${errors.lastName ? 'input-error' : ''}`}
                  placeholder="Last name"
                  autoComplete="family-name"
                />
                {errors.lastName && (
                  <p className="form-error">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                  placeholder="Create a password"
                  autoComplete="new-password"
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
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <PasswordRequirement
                    met={passwordValidation.requirements.minLength}
                    text="At least 8 characters"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasUpperCase}
                    text="One uppercase letter"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasLowerCase}
                    text="One lowercase letter"
                  />
                  <PasswordRequirement
                    met={passwordValidation.requirements.hasNumbers}
                    text="One number"
                  />
                </div>
              )}
              
              {errors.password && (
                <p className="form-error">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-netflix-lightGray hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="text-sm text-netflix-lightGray">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-netflix-red hover:text-red-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-netflix-red hover:text-red-300">
                Privacy Policy
              </Link>
              .
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !passwordValidation.isValid}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-netflix-lightGray">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-netflix-red hover:text-red-300 transition-colors duration-200 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </LoadingOverlay>
    </div>
  );
};

export default RegisterForm;