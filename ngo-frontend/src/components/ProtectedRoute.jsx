import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to auth
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have it, redirect to access denied
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/access-denied" replace />;
  }

  // User is authenticated and has the required role
  return children;
};

export default ProtectedRoute; 