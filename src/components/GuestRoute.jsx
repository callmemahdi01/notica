// src/components/GuestRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>در حال بارگذاری...</div>;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default GuestRoute;