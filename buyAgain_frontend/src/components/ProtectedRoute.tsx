import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { Data } from '../context/AuthContext';

interface ProtectedRouteProps {
  user: Data | null;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  user,
  requiredRole,
}) => {
  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.data?.users?.role !== requiredRole) {
    // User doesn't have the necessary role
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;
