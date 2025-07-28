import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  redirectTo = '/login',
  fallback = null 
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return URL
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If admin access is required but user is not admin
  if (requireAdmin && !isAdmin()) {
    // Show fallback component or redirect to unauthorized page
    if (fallback) {
      return fallback;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">403</h1>
          <p className="text-netflix-lightGray mb-8">
            You don't have permission to access this page.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  // If user should not be authenticated (like login/register pages)
  if (!requireAuth && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  // All checks passed, render the protected component
  return children;
};

// HOC for protecting components
export const withAuth = (Component, options = {}) => {
  return function AuthenticatedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Admin route wrapper
export const AdminRoute = ({ children, fallback }) => {
  return (
    <ProtectedRoute
      requireAuth={true}
      requireAdmin={true}
      fallback={fallback}
    >
      {children}
    </ProtectedRoute>
  );
};

// User route wrapper (authenticated but not admin)
export const UserRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true}>
      {children}
    </ProtectedRoute>
  );
};

// Guest route wrapper (not authenticated)
export const GuestRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  );
};

// Role-based access component
export const RoleGuard = ({ 
  allowedRoles = [], 
  userRole, 
  children, 
  fallback = null 
}) => {
  if (!allowedRoles.includes(userRole)) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-netflix-lightGray">
          You don't have permission to view this content.
        </p>
      </div>
    );
  }

  return children;
};

// Feature guard component
export const FeatureGuard = ({ 
  feature, 
  isEnabled, 
  children, 
  fallback = null 
}) => {
  if (!isEnabled) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-netflix-lightGray">
          This feature is currently unavailable.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;