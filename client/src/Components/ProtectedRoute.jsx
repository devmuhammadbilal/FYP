import React from 'react';
import { Navigate } from 'react-router-dom';

// This component will be used to protect routes that need authentication
const ProtectedRoute = ({ children }) => {
  // Get the JWT token from localStorage
  const token = localStorage.getItem('authToken');
  
  // If no token exists, redirect the user to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If token exists, render the children (protected content)
  return children;
};

export default ProtectedRoute;
