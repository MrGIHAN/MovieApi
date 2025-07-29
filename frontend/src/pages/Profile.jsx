import React, { useState } from 'react';
import { UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { LoadingOverlay } from '../components/common/Loader';
import { isValidEmail, validatePassword } from '../utils/helpers';

const Profile = () => {
  const { user, updateUser, isLoading } = useAuth();
  const { success: showSuccess, error: showError } = useNotification();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'password', name: 'Change Password', icon: EyeIcon },
  ];

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!profileData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const validation = validatePassword(passwordData.newPassword);
      if (!validation.isValid) {
        newErrors.newPassword = 'Password does not meet requirements';
      }
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    try {
      await updateUser(profileData);
      showSuccess('Profile updated successfully');
    } catch (error) {
      showError('Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      // API call to change password would go here
      console.log('Change password:', passwordData);
      showSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showError('Failed to change password');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen pt-24 bg-netflix-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-netflix-red rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-netflix-lightGray">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-netflix-gray">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                    ${activeTab === tab.id
                      ? 'border-netflix-red text-white'
                      : 'border-transparent text-netflix-lightGray hover:text-white hover:border-netflix-gray'
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-netflix-darkGray rounded-lg p-8">
          {activeTab === 'profile' && (
            <LoadingOverlay isLoading={isLoading} text="Updating profile...">
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className={`input ${errors.firstName ? 'input-error' : ''}`}
                        placeholder="Enter your first name"
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
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className={`input ${errors.lastName ? 'input-error' : ''}`}
                        placeholder="Enter your last name"
                      />
                      {errors.lastName && (
                        <p className="form-error">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className={`input ${errors.email ? 'input-error' : ''}`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="form-error">{errors.email}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </LoadingOverlay>
          )}

          {activeTab === 'password' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="form-group">
                  <label htmlFor="currentPassword" className="form-label">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`input pr-12 ${errors.currentPassword ? 'input-error' : ''}`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-netflix-lightGray hover:text-white"
                    >
                      {showPasswords.current ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="form-error">{errors.currentPassword}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`input pr-12 ${errors.newPassword ? 'input-error' : ''}`}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-netflix-lightGray hover:text-white"
                    >
                      {showPasswords.new ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="form-error">{errors.newPassword}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`input pr-12 ${errors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-netflix-lightGray hover:text-white"
                    >
                      {showPasswords.confirm ? (
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

                {/* Password Requirements */}
                {passwordData.newPassword && (
                  <div className="bg-netflix-gray rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Password Requirements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(() => {
                        const validation = validatePassword(passwordData.newPassword);
                        return [
                          { met: validation.requirements.minLength, text: 'At least 8 characters' },
                          { met: validation.requirements.hasUpperCase, text: 'One uppercase letter' },
                          { met: validation.requirements.hasLowerCase, text: 'One lowercase letter' },
                          { met: validation.requirements.hasNumbers, text: 'One number' }
                        ].map((req, index) => (
                          <div key={index} className={`flex items-center space-x-2 text-sm ${req.met ? 'text-green-400' : 'text-netflix-lightGray'}`}>
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-400' : 'bg-netflix-lightGray'}`}>
                              {req.met && <span className="text-white text-xs">✓</span>}
                            </div>
                            <span>{req.text}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary"
                  >
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Account Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-netflix-darkGray rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-netflix-red mb-2">0</h3>
            <p className="text-netflix-lightGray">Movies Watched</p>
          </div>
          
          <div className="bg-netflix-darkGray rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-netflix-red mb-2">0</h3>
            <p className="text-netflix-lightGray">Favorites</p>
          </div>
          
          <div className="bg-netflix-darkGray rounded-lg p-6 text-center">
            <h3 className="text-2xl font-bold text-netflix-red mb-2">0</h3>
            <p className="text-netflix-lightGray">Watch Later</p>
          </div>
        </div>

        {/* Account Actions */}
        <div className="mt-12 bg-netflix-darkGray rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Account Actions</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-netflix-gray">
              <div>
                <h3 className="text-white font-medium">Download Your Data</h3>
                <p className="text-netflix-lightGray text-sm">Get a copy of your account data</p>
              </div>
              <button className="btn btn-outline btn-sm">
                Download
              </button>
            </div>
            
            <div className="flex items-center justify-between py-4 border-b border-netflix-gray">
              <div>
                <h3 className="text-white font-medium">Clear Watch History</h3>
                <p className="text-netflix-lightGray text-sm">Remove all your viewing history</p>
              </div>
              <button className="btn btn-outline btn-sm text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                Clear History
              </button>
            </div>
            
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-red-400 font-medium">Delete Account</h3>
                <p className="text-netflix-lightGray text-sm">Permanently delete your account and all data</p>
              </div>
              <button className="btn btn-sm bg-red-600 hover:bg-red-700 text-white">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;