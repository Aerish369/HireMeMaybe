import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';
import { profileAPI } from '../api/profile';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from stored token
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      
      // Also load profile
      try {
        const profileData = await profileAPI.getProfile();
        setProfile(profileData);
      } catch (profileError) {
        console.log('Profile not found or error loading profile');
      }
    } catch (err) {
      console.error('Error loading user:', err);
      // Token might be invalid, clear it
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Register function
  // const register = async (userData) => {
  //   setError(null);
  //   try {
  //     await authAPI.register(userData);
  //     // After registration, login the user
  //     const loginData = await authAPI.login({
  //       email: userData.email,
  //       password: userData.password,
  //     });
      
  //     localStorage.setItem('access_token', loginData.access);
  //     localStorage.setItem('refresh_token', loginData.refresh);
      
  //     await loadUser();
  //     return { success: true };
  //   } catch (err) {
  //     const errorMessage = err.response?.data || 'Registration failed';
  //     setError(errorMessage);
  //     return { success: false, error: errorMessage };
  //   }
  // };

  // Register function
  const register = async (userData) => {
    console.log('=== AUTH CONTEXT REGISTER CALLED ===');
    console.log('User data received:', userData);
    
    setError(null);
    try {
      console.log('Calling authAPI.register...');
      const registerResponse = await authAPI.register(userData);
      console.log('Registration API response:', registerResponse);
      
      // After registration, login the user
      console.log('Registration successful, now logging in...');
      const loginData = await authAPI.login({
        email: userData.email,
        password: userData.password,
      });
      console.log('Login response:', loginData);
      
      localStorage.setItem('access_token', loginData.access);
      localStorage.setItem('refresh_token', loginData.refresh);
      console.log('Tokens saved to localStorage');
      
      console.log('Loading user data...');
      await loadUser();
      console.log('User loaded successfully');
      
      return { success: true };
    } catch (err) {
      console.error('=== REGISTRATION ERROR ===');
      console.error('Error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);
      
      const errorMessage = err.response?.data || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login function
  const login = async (credentials) => {
    setError(null);
    try {
      const data = await authAPI.login(credentials);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      await loadUser();
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setProfile(null);
    setError(null);
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await profileAPI.updateProfile(profileData);
      setProfile(updatedProfile);
      return { success: true, profile: updatedProfile };
    } catch (err) {
      const errorMessage = err.response?.data || 'Failed to update profile';
      return { success: false, error: errorMessage };
    }
  };

  // Get user role from profile
  const getRole = () => {
    return profile?.role || null;
  };

  const isEmployer = () => {
    return profile?.role === 'employer';
  };

  const isEmployee = () => {
    return profile?.role === 'employee';
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    register,
    logout,
    loadUser,
    updateProfile,
    getRole,
    isEmployer,
    isEmployee,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
