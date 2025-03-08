import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Not logged in, redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Role not authorized, redirect to home page
    return <Navigate to="/" replace />;
  }

  if (!user.isApproved && user.role !== 'admin') {
    // User not approved, redirect to pending approval page
    return <Navigate to="/pending-approval" replace />;
  }

  // Authorized, render component
  return children;
};

export default PrivateRoute;
