import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import EmployerRoute from './EmployerRoute.jsx';
import EmployeeRoute from './EmployeeRoute.jsx';

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

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<JobList />} />
      <Route path="/jobs/:id" element={<JobDetail />} />

      {/* Protected Routes */}
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Employee Routes */}
      <Route path="/employee/dashboard" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
      <Route path="/my-applications" element={<EmployeeRoute><MyApplications /></EmployeeRoute>} />

      {/* Employer Routes */}
      <Route path="/employer/dashboard" element={<EmployerRoute><EmployerDashboard /></EmployerRoute>} />
      <Route path="/jobs/create" element={<EmployerRoute><CreateJob /></EmployerRoute>} />
      <Route path="/jobs/:id/edit" element={<EmployerRoute><EditJob /></EmployerRoute>} />
    </Routes>
  );
};

export default AppRoutes;
