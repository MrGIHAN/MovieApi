import React from 'react';

const Loader = ({ 
  size = 'md', 
  color = 'red', 
  fullScreen = false, 
  text = null,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    red: 'border-netflix-red',
    white: 'border-white',
    gray: 'border-netflix-lightGray',
  };

  const SpinnerComponent = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`
        animate-spin rounded-full border-2 border-transparent ${sizeClasses[size]} ${colorClasses[color]}
        border-t-current
      `}></div>
      {text && (
        <p className="text-netflix-lightGray text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-netflix-black bg-opacity-75 backdrop-blur-sm z-50 flex items-center justify-center">
        <SpinnerComponent />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <SpinnerComponent />
    </div>
  );
};

// Skeleton loader for content
export const SkeletonLoader = ({ 
  type = 'card', 
  count = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="animate-pulse">
            <div className="bg-netflix-gray rounded-lg aspect-video mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-netflix-gray rounded w-3/4"></div>
              <div className="h-4 bg-netflix-gray rounded w-1/2"></div>
            </div>
          </div>
        );

      case 'row':
        return (
          <div className="animate-pulse">
            <div className="h-6 bg-netflix-gray rounded w-1/4 mb-4"></div>
            <div className="flex space-x-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <div className="bg-netflix-gray rounded-lg aspect-video mb-2"></div>
                  <div className="h-4 bg-netflix-gray rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="animate-pulse">
            <div className="bg-netflix-gray rounded-lg h-96 mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-netflix-gray rounded w-1/3"></div>
              <div className="h-4 bg-netflix-gray rounded w-2/3"></div>
              <div className="h-4 bg-netflix-gray rounded w-1/2"></div>
              <div className="flex space-x-4 mt-6">
                <div className="h-12 bg-netflix-gray rounded w-32"></div>
                <div className="h-12 bg-netflix-gray rounded w-32"></div>
              </div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="bg-netflix-gray rounded w-16 h-16"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-netflix-gray rounded w-3/4"></div>
                  <div className="h-4 bg-netflix-gray rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-netflix-gray rounded"></div>
            <div className="h-4 bg-netflix-gray rounded w-5/6"></div>
            <div className="h-4 bg-netflix-gray rounded w-4/6"></div>
          </div>
        );

      default:
        return (
          <div className="animate-pulse">
            <div className="bg-netflix-gray rounded h-32"></div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={count > 1 ? 'mb-8' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// Loading overlay for forms and buttons
export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  text = 'Loading...',
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-netflix-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <Loader text={text} color="white" />
        </div>
      )}
    </div>
  );
};

// Progress bar loader
export const ProgressLoader = ({ 
  progress = 0, 
  text = null,
  className = '' 
}) => {
  return (
    <div className={`w-full ${className}`}>
      {text && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-netflix-lightGray">{text}</span>
          <span className="text-sm text-netflix-lightGray">{progress}%</span>
        </div>
      )}
      <div className="w-full bg-netflix-gray rounded-full h-2">
        <div 
          className="bg-netflix-red h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
};

// Dots loader
export const DotsLoader = ({ 
  size = 'md',
  color = 'red',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    red: 'bg-netflix-red',
    white: 'bg-white',
    gray: 'bg-netflix-lightGray',
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`
            ${sizeClasses[size]} ${colorClasses[color]} rounded-full
            animate-pulse
          `}
          style={{
            animationDelay: `${index * 0.2}s`,
          }}
        ></div>
      ))}
    </div>
  );
};

// Pulse loader
export const PulseLoader = ({ 
  className = '',
  children 
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
};

export default Loader;