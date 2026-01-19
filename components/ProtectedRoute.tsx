import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const auth = useAuth();
  const location = useLocation();

  if (!auth) {
    return <div className="min-h-screen flex items-center justify-center">Authentication service unavailable</div>;
  }

  const { isAuthenticated, user, isLoading } = auth;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-[#800000] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (requireAdmin) {
    // Redirect to admin login if not authenticated OR not an admin
    if (!isAuthenticated || user?.role !== 'admin') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
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