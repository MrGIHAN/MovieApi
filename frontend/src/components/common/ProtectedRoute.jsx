import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflix-black">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-netflix-black">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">403</h1>
          <p className="text-netflix-lightGray text-xl mb-8">
            Access Denied. You don't have permission to access this page.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  // If user should not be authenticated (like login/register pages)
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

// Admin route wrapper
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
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

export default ProtectedRoute;