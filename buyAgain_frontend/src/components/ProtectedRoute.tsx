import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

interface ProtectedRouteProps {
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRoles }) => {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        Loading...
      </div>
    );
  }

  // Once loading is complete, check if the user is authenticated.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check if the user has one of the required roles.
  const userRole = user?.data?.users?.role ?? '';
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the child components.
  return <Outlet />;
};

export default ProtectedRoute;
