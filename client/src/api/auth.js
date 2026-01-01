import axiosClient from './axiosClient';

export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await axiosClient.post('/auth/users/', userData);
    return response.data;
  },

  // Login and get JWT tokens
  login: async (credentials) => {
    const response = await axiosClient.post('/auth/jwt/create/', credentials);
    return response.data;
  },

  // Get current logged-in user
  getCurrentUser: async () => {
    const response = await axiosClient.get('/auth/users/me/');
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    const response = await axiosClient.post('/auth/jwt/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },
};

export default authAPI;
