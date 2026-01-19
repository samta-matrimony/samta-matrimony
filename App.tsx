import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Browse from './pages/Browse';
import ProfileView from './pages/ProfileView';
import Register from './pages/Register';
import Plans from './pages/Plans';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import MyProfile from './pages/MyProfile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { AboutUs, ContactUs, PrivacyPolicy, TermsConditions } from './pages/Legal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InteractionProvider } from './contexts/InteractionContext';
import { ChatProvider } from './contexts/ChatContext';
import { MatchmakingProvider } from './contexts/MatchmakingContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import ProtectedRoute from './components/ProtectedRoute';

/**
 * Handles automatic redirection after authentication
 * - Redirects authenticated users away from public pages
 * - Routes admins to admin dashboard, regular users to dashboard
 */
const PostAuthRedirect: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth state to load before redirecting
    if (auth?.isLoading) {
      return;
    }

    if (auth?.isAuthenticated && auth?.user) {
      const isPublicPath = ['/', '/register'].includes(location.pathname);
      const isAdminPath = location.pathname.startsWith('/admin');
      
      // If on public page and authenticated, redirect to appropriate dashboard
      if (isPublicPath) {
        if (auth.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }

      // If admin tries to access non-admin paths, redirect to admin dashboard
      if (auth.user.role === 'admin' && !isAdminPath && location.pathname.startsWith('/')) {
        if (!['/about', '/contact', '/privacy', '/terms'].includes(location.pathname)) {
          navigate('/admin', { replace: true });
        }
      }
    }
  }, [auth?.isAuthenticated, auth?.user, auth?.isLoading, navigate, location.pathname]);

  return null;
};

const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <PostAuthRedirect />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/profile/:id" element={<ProfileView />} />
        <Route path="/register" element={<Register />} />
        <Route path="/plans" element={<Plans />} />
        
        {/* Authentication Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Trust & Legal Routes */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        
        {/* Protected User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-profile" 
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages/:userId" 
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AnalyticsProvider>
          <InteractionProvider>
            <ChatProvider>
              <MatchmakingProvider>
                <AppRoutes />
              </MatchmakingProvider>
            </ChatProvider>
          </InteractionProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;