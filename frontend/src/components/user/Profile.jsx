import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  CameraIcon,
  TrashIcon,
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';
import { useMovies } from '../../hooks/useMovies';
import { useNotification } from '../../context/NotificationContext';
import { LoadingOverlay } from '../common/Loader';
import { isValidEmail, validatePassword } from '../../utils/helpers';

const UserProfile = () => {
  const { user, updateUser, isLoading } = useAuth();
  const { 
    favorites, 
    watchLater, 
    watchHistory,
    fetchFavorites,
    fetchWatchLater,
    fetchWatchHistory 
  } = useMovies();
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

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Fetch user statistics
  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchWatchLater();
      fetchWatchHistory();
    }
  }, [user, fetchFavorites, fetchWatchLater, fetchWatchHistory]);

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'password', name: 'Change Password', icon: EyeIcon },
    { id: 'preferences', name: 'Preferences', icon: CameraIcon },
    { id: 'data', name: 'Data & Privacy', icon: DocumentArrowDownIcon },
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

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError('Profile picture must be less than 5MB');
        return;
      }
      
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
        showError('Profile picture must be a valid image file');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setProfilePicturePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!profileData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (profileData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!profileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (profileData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
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

  const handleDownloadData = () => {
    const userData = {
      profile: user,
      favorites: favorites || [],
      watchLater: watchLater || [],
      watchHistory: watchHistory || []
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `netflix-clone-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showSuccess('Data downloaded successfully');
  };

  const handleClearWatchHistory = () => {
    if (window.confirm('Are you sure you want to clear your watch history? This action cannot be undone.')) {
      // API call to clear watch history would go here
      console.log('Clear watch history');
      showSuccess('Watch history cleared');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and you will lose all your data.')) {
      if (window.confirm('This will permanently delete your account and all associated data. Type DELETE to confirm.')) {
        // API call to delete account would go here
        console.log('Delete account');
        showError('Account deletion is not available in demo mode');
      }
    }
  };

  const PasswordRequirement = ({ met, text }) => (
    <div className={`flex items-center space-x-2 text-sm ${met ? 'text-green-400' : 'text-netflix-lightGray'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-green-400' : 'bg-netflix-lightGray'}`}>
        {met && <span className="text-white text-xs">✓</span>}
      </div>
      <span>{text}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-netflix-red rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
              {profilePicturePreview ? (
                <img 
                  src={profilePicturePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.firstName?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <label htmlFor="profilePicture" className="absolute bottom-0 right-0 w-8 h-8 bg-netflix-darkGray rounded-full flex items-center justify-center cursor-pointer hover:bg-netflix-gray transition-colors duration-200">
              <CameraIcon className="h-4 w-4 text-white" />
            </label>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-netflix-lightGray">{user?.email}</p>
            <p className="text-netflix-lightGray text-sm">
              Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-netflix-darkGray rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-netflix-red mb-2">
            {watchHistory?.length || 0}
          </h3>
          <p className="text-netflix-lightGray">Movies Watched</p>
        </div>
        
        <div className="bg-netflix-darkGray rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-netflix-red mb-2">
            {favorites?.length || 0}
          </h3>
          <p className="text-netflix-lightGray">Favorites</p>
        </div>
        
        <div className="bg-netflix-darkGray rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-netflix-red mb-2">
            {watchLater?.length || 0}
          </h3>
          <p className="text-netflix-lightGray">Watch Later</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-netflix-gray">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-netflix-red text-white'
                    : 'border-transparent text-netflix-lightGray hover:text-white hover:border-netflix-gray'
                }`}
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
                        <PasswordRequirement key={index} met={req.met} text={req.text} />
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

        {activeTab === 'preferences' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Playback Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white">Auto-play next episode</h4>
                      <p className="text-netflix-lightGray text-sm">Automatically play the next episode</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-netflix-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white">Auto-play previews</h4>
                      <p className="text-netflix-lightGray text-sm">Automatically play previews while browsing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-netflix-gray peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-netflix-red"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Content Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Preferred Video Quality</label>
                    <select className="input w-full md:w-auto">
                      <option value="auto">Auto</option>
                      <option value="high">High (1080p)</option>
                      <option value="medium">Medium (720p)</option>
                      <option value="low">Low (480p)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-white mb-2">Default Audio Language</label>
                    <select className="input w-full md:w-auto">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Data & Privacy</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-netflix-gray">
                <div>
                  <h3 className="text-white font-medium">Download Your Data</h3>
                  <p className="text-netflix-lightGray text-sm">Get a copy of your account data including favorites, watch history, and preferences</p>
                </div>
                <button 
                  onClick={handleDownloadData}
                  className="btn btn-outline btn-sm flex items-center space-x-2"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-netflix-gray">
                <div>
                  <h3 className="text-white font-medium">Clear Watch History</h3>
                  <p className="text-netflix-lightGray text-sm">Remove all your viewing history and reset recommendations</p>
                </div>
                <button 
                  onClick={handleClearWatchHistory}
                  className="btn btn-outline btn-sm text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-black flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Clear History</span>
                </button>
              </div>
              
              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="text-red-400 font-medium">Delete Account</h3>
                  <p className="text-netflix-lightGray text-sm">Permanently delete your account and all associated data</p>
                </div>
                <button 
                  onClick={handleDeleteAccount}
                  className="btn btn-sm bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;