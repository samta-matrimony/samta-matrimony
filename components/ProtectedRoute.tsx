import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (requireAdmin) {
    // Redirect to the common login form if not authenticated OR not an admin
    if (!isAuthenticated || user?.role !== 'admin') {
      return <Navigate to="/register" state={{ from: location, mode: 'login' }} replace />;
    }
  } else {
    // For regular user routes: redirect to unified login if not authenticated
    if (!isAuthenticated) {
      return <Navigate to="/register" state={{ from: location, mode: 'login' }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;