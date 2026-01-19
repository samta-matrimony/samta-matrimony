import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Browse from './pages/Browse';
import ProfileView from './pages/ProfileView';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import MyProfile from './pages/MyProfile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import { AboutUs, ContactUs, PrivacyPolicy, TermsConditions } from './pages/Legal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InteractionProvider } from './contexts/InteractionContext';
import { ChatProvider } from './contexts/ChatContext';
import { MatchmakingProvider } from './contexts/MatchmakingContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import ProtectedRoute from './components/ProtectedRoute';

// Component to handle auto-redirection post-auth
const PostAuthRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const isPublicPath = ['/', '/register'].includes(location.pathname);
      
      if (isPublicPath) {
        if (user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  return null;
};

const AppRoutes: React.FC = () => {
  return (
    <Layout>
      <PostAuthRedirect />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/profile/:id" element={<ProfileView />} />
        <Route path="/register" element={<Register />} />
        
        {/* Trust Pages */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        
        {/* Protected User Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/my-profile" element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />
        <Route path="/messages/:userId" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AnalyticsProvider>
        <InteractionProvider>
          <ChatProvider>
            <MatchmakingProvider>
              <HashRouter>
                <AppRoutes />
              </HashRouter>
            </MatchmakingProvider>
          </ChatProvider>
        </InteractionProvider>
      </AnalyticsProvider>
    </AuthProvider>
  );
};

export default App;