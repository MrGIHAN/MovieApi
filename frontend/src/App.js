import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute, { AdminRoute, GuestRoute } from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import MovieDetail from './pages/MovieDetail';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Test from './pages/Test';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// User Components
import Favorites from './components/user/Favorites';
import WatchLater from './components/user/WatchLater';
import WatchHistory from './components/user/WatchHistory';

// Global Styles
import './styles/globals.css';

function App() {
  return (
    <ErrorBoundary fallbackMessage="The Movie App encountered an unexpected error. Please try again.">
      <NotificationProvider>
        <AuthProvider>
          <MovieProvider>
            <Router>
              <div className="min-h-screen bg-netflix-black text-white">
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#10B981',
                    },
                  },
                  error: {
                    style: {
                      background: '#EF4444',
                    },
                  },
                }}
              />

              {/* Header - Always visible */}
              <Header />

              {/* Main Content */}
              <main className="pt-16 min-h-screen">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  <Route path="/watch/:id" element={<Watch />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/test" element={<Test />} />

                  {/* Guest Only Routes (redirect if authenticated) */}
                  <Route
                    path="/login"
                    element={
                      <GuestRoute>
                        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                          <LoginForm />
                        </div>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <GuestRoute>
                        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                          <RegisterForm />
                        </div>
                      </GuestRoute>
                    }
                  />

                  {/* Protected User Routes */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/favorites"
                    element={
                      <ProtectedRoute>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                          <Favorites />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/watch-later"
                    element={
                      <ProtectedRoute>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                          <WatchLater />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                          <WatchHistory />
                        </div>
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes - All admin routes under /admin */}
                  <Route
                    path="/admin/*"
                    element={
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    }
                  />

                  {/* Redirect old admin route */}
                  <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />

                  {/* 404 Page */}
                  <Route
                    path="*"
                    element={
                      <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                          <p className="text-netflix-lightGray text-xl mb-8">
                            Oops! The page you're looking for doesn't exist.
                          </p>
                          <Navigate to="/" replace />
                        </div>
                      </div>
                    }
                  />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />
              </div>
            </Router>
          </MovieProvider>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;