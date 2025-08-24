import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { Data } from '../context/AuthContext';

interface ProtectedRouteProps {
  user: Data | null;
  requiredRoles?: string[]; // Changed to array of strings
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  user,
  requiredRoles,
}) => {
  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.data?.users?.role ?? '';

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    // User doesn't have one of the required roles
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has one of the required roles
  return <Outlet />;
};

export default ProtectedRoute;
