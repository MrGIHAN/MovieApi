import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute, { AdminRoute, GuestRoute } from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Browse from './pages/Browse';
import MovieDetail from './pages/MovieDetail';
import Watch from './pages/Watch';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// User Components
import Favorites from './components/user/ Favorites';
import WatchLater from './components/user/WatchLater';
import WatchHistory from './components/user/WatchHistory';

// Global Styles
import './styles/globals.css';

function App() {
  return (
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

              {/* Header */}
              <Header />

              {/* Main Content */}
              <main className="pt-16">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/movie/:id" element={<MovieDetail />} />
                  <Route path="/watch/:id" element={<Watch />} />
                  <Route path="/search" element={<Search />} />

                  {/* Auth Routes (Guest only) */}
                  <Route
                    path="/login"
                    element={
                      <GuestRoute>
                        <div className="min-h-screen flex items-center justify-center">
                          <LoginForm />
                        </div>
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <GuestRoute>
                        <div className="min-h-screen flex items-center justify-center">
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

                  {/* Admin Routes */}
                  <Route
                    path="/admin/*"
                    element={
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    }
                  />

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
                          <a
                            href="/"
                            className="btn btn-primary"
                          >
                            Go Home
                          </a>
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
  );
}

export default App;