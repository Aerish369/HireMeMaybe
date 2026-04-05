import axiosClient from "./axiosClient";

export const jobsAPI = {
  getJobs: async (params = {}) => {
    const response = await axiosClient.get("/api/jobs/", { params });
    return response.data;
  },

  getJob: async (jobId) => {
    const response = await axiosClient.get(`/api/jobs/${jobId}/`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await axiosClient.post("/api/jobs/", jobData);
    return response.data;
  },

  updateJob: async (jobId, jobData) => {
    const response = await axiosClient.put(`/api/jobs/${jobId}/`, jobData);
    return response.data;
  },

  patchJob: async (jobId, jobData) => {
    const response = await axiosClient.patch(`/api/jobs/${jobId}/`, jobData);
    return response.data;
  },

  deleteJob: async (jobId) => {
    const response = await axiosClient.delete(`/api/jobs/${jobId}/`);
    return response.data;
  },

  applyToJob: async (jobId, { file, coverLetter }) => {
    const formData = new FormData();

    if (file) {
      formData.append("resume", file);
    }

    formData.append("cover_letter", coverLetter);

    const response = await axiosClient.post(
      `/api/jobs/${jobId}/apply/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  },

  getSkills: async () => {
    const response = await axiosClient.get("/api/skills/");
    return response.data;
  },

  getCategories: async () => {
    const response = await axiosClient.get("/api/categories/");
    return response.data;
  },
};

export default jobsAPI;
