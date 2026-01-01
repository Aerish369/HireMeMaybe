import axiosClient from './axiosClient';

export const applicationsAPI = {
  // Apply to a job (Employee only)
  applyToJob: async (jobId, applicationData = {}) => {
    const response = await axiosClient.post(`/api/jobs/${jobId}/apply/`, applicationData);
    return response.data;
  },

  // Check application status for a job
  getApplicationStatus: async (jobId) => {
    const response = await axiosClient.get(`/api/jobs/${jobId}/apply/`);
    return response.data;
  },

  
  // Get all my applications (Employee only)
  getMyApplications: async () => {
    const response = await axiosClient.get('/api/my-applications/');
    return response.data;
  },
};

export default applicationsAPI;
