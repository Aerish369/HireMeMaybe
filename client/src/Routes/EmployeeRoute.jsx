import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader.jsx';

const EmployeeRoute = ({ children }) => {
  const { isAuthenticated, isEmployee, loading } = useAuth();

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

  if (!isEmployee()) {
    return <Navigate to="/jobs" replace />;
  }

  return children;
};

export default EmployeeRoute;
