import axiosClient from './axiosClient';

const applicationsAPI = {
  /**
   * Apply to a job
   * @param {string|number} jobId - ID of the job
   * @param {object} data - { cover_letter: string, resume: File|null }
   */
  applyToJob: async (jobId, data = {}) => {
    const formData = new FormData();

    // Append cover_letter if exists
    if (data.cover_letter) {
      formData.append('cover_letter', data.cover_letter);
    }

    // Append resume if exists
    if (data.resume) {
      formData.append('resume', data.resume);
    }

    const response = await axiosClient.post(
      `/api/jobs/${jobId}/apply/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  /**
   * Check application status for a job
   * @param {string|number} jobId
   */
  getApplicationStatus: async (jobId) => {
    const response = await axiosClient.get(`/api/jobs/${jobId}/apply/`);
    return response.data;
  },

  /**
   * Get all applications of the logged-in user
   */
  getMyApplications: async () => {
    const response = await axiosClient.get('/api/my-applications/');
    return response.data;
  },

  /**
   * NEW: Get all applications for employer's jobs
   */
  getJobApplications: async (jobId) => {
    const response = await axiosClient.get(`/api/jobs/${jobId}/applications/`);
    return response.data;
  },

  /**
   * NEW: Update the status of an application
   * @param {string|number} applicationId
   * @param {string} status - "pending", "reviewed", "accepted", "rejected"
   */
  updateStatus: async (applicationId, status) => {
    const response = await axiosClient.patch(`/api/applications/${applicationId}/`, { status });
    return response.data;
  },
};

export default applicationsAPI;
