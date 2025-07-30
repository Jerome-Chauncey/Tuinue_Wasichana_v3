import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) return <Navigate to="/auth" />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" />;
  return children;
}

export default ProtectedRoute;