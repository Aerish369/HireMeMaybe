import axiosClient from './axiosClient';

export const authAPI = {
  // Register a new user
  // register: async (userData) => {
  //   const response = await axiosClient.post('/auth/users/', userData);
  //   return response.data;
  // },
  register: async (userData) => {
    console.log('=== AUTH API REGISTER ===');
    console.log('Sending request to /auth/users/ with data:', userData);
    try {
      const response = await axiosClient.post('/auth/users/', userData);
      console.log('Register API success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Register API error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
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
