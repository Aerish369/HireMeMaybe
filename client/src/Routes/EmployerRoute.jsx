import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader.jsx';

const EmployerRoute = ({ children }) => {
  const { isAuthenticated, isEmployer, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isEmployer()) {
    return <Navigate to="/jobs" replace />;
  }

  return children;
};

export default EmployerRoute;
