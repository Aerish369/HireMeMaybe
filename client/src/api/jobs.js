import axiosClient from './axiosClient';

export const jobsAPI = {
  // List all jobs
  getJobs: async (params = {}) => {
    const response = await axiosClient.get('/api/jobs/', { params });
    return response.data;
  },

  // Get single job details
  getJob: async (jobId) => {
    const response = await axiosClient.get(`/api/jobs/${jobId}/`);
    return response.data;
  },

  // Create a new job (Employer only)
  createJob: async (jobData) => {
    const response = await axiosClient.post('/api/jobs/', jobData);
    return response.data;
  },

  // Update a job (Employer/Owner only)
  updateJob: async (jobId, jobData) => {
    const response = await axiosClient.put(`/api/jobs/${jobId}/`, jobData);
    return response.data;
  },

  // Partial update a job
  patchJob: async (jobId, jobData) => {
    const response = await axiosClient.patch(`/api/jobs/${jobId}/`, jobData);
    return response.data;
  },

  // Delete a job (Owner only)
  deleteJob: async (jobId) => {
    const response = await axiosClient.delete(`/api/jobs/${jobId}/`);
    return response.data;
  },
};

export default jobsAPI;
