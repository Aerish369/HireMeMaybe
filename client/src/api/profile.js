import axiosClient from './axiosClient';

export const profileAPI = {
  // Get current user's profile
  getProfile: async () => {
    const response = await axiosClient.get('/api/profile/me/');
    return response.data;
  },

  // Update current user's profile
  updateProfile: async (profileData) => {
    const response = await axiosClient.put('/api/profile/me/', profileData);
    return response.data;
  },
};

export default profileAPI;
