import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAuthenticated = !!localStorage.getItem('accessToken');

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && user?.status === 'LOCKED') {
    localStorage.clear();
    return <Navigate to="/login" replace state={{ error: "Tài khoản của bạn đã bị khóa, vui lòng liên hệ admin nếu có thắc mắc" }} />;
  }

  if (isAuthenticated && user?.status === 'PENDING') {
    return <Navigate to="/waiting-approval" replace />;
  }

  if (allowedRoles && user?.role?.code && !allowedRoles.includes(user.role.code)) {
    // Redirect to home if user doesn't have the required role
    return <Navigate to="/" replace />;
  }

  // If authenticated and (no roles specified or user has one of the allowed roles)
  return <Outlet />;
};

export default ProtectedRoute;
