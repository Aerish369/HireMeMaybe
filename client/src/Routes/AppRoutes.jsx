import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute.jsx';
import EmployerRoute from './EmployerRoute.jsx';
import EmployeeRoute from './EmployeeRoute.jsx';
import AuthRedirectRoute from './AuthRedirectRoute.jsx';

// Pages
import Login from '../pages/Auth/Login.jsx';
import Register from '../pages/Auth/Register.jsx';
import Profile from '../pages/Profile/Profile.jsx';
import JobList from '../pages/Jobs/JobList.jsx';
import JobDetail from '../pages/Jobs/JobDetail.jsx';
import CreateJob from '../pages/Jobs/CreateJob.jsx';
import EditJob from '../pages/Jobs/EditJob.jsx';
import MyApplications from '../pages/Applications/MyApplications.jsx';
import EmployeeDashboard from '../pages/Dashboard/EmployeeDashboard.jsx';
import EmployerDashboard from '../pages/Dashboard/EmployerDashboard.jsx';
import JobApplications from "../pages/JobApplications.jsx";
import RecommendedJobs from "../pages/Jobs/RecommendedJobs.jsx";
import CategoryJobs from "../pages/Jobs/CategoryJobs.jsx";


const AppRoutes = () => {
  return (
    <Routes>

     
      <Route path="/" element={<Navigate to="/jobs" replace />} />
      
      <Route
        path="/login"
        element={
          <AuthRedirectRoute>
            <Login />
          </AuthRedirectRoute>
        }
      />

      <Route
        path="/register"
        element={
          <AuthRedirectRoute>
            <Register />
          </AuthRedirectRoute>
        }
      />

      {/* 🌍 Public Jobs */}
      <Route path="/jobs" element={<JobList />} />
      <Route path="/jobs/:id" element={<JobDetail />} />

      {/* 🔐 Protected */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* 👨‍💼 Employee */}
      <Route
        path="/employee/dashboard"
        element={
          <EmployeeRoute>
            <EmployeeDashboard />
          </EmployeeRoute>
        }
      />

      <Route
        path="/my-applications"
        element={
          <EmployeeRoute>
            <MyApplications />
          </EmployeeRoute>
        }
      />

      {/* 🏢 Employer */}
      <Route
        path="/employer/dashboard"
        element={
          <EmployerRoute>
            <EmployerDashboard />
          </EmployerRoute>
        }
      />

      <Route
        path="/jobs/create"
        element={
          <EmployerRoute>
            <CreateJob />
          </EmployerRoute>
        }
      />

      <Route
        path="/jobs/:id/edit"
        element={
          <EmployerRoute>
            <EditJob />
          </EmployerRoute>
        }
      />

      <Route
        path="/jobs/:id/applications"
        element={
          <EmployerRoute>
            <JobApplications />
          </EmployerRoute>
        }
      />
      <Route 
        path="/jobs/recommended" 
        element={
          <RecommendedJobs />
        } 
      />

      <Route 
        path="/jobs/category/:categoryId" 
        element={
          <CategoryJobs />
          } 
          />


      {/* ❌ Unknown URL */}
      <Route path="*" element={<Navigate to="/jobs" replace />} />

    </Routes>
  );
};

export default AppRoutes;
