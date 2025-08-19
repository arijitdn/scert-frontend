import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3000" + "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// District API
export const districtsAPI = {
  getAll: () => api.get("/districts"),
  getById: (id: string) => api.get(`/districts/${id}`),
};

// Block API
export const blocksAPI = {
  getAll: (district?: string) =>
    api.get("/blocks", { params: district ? { district } : {} }),
  getById: (id: string) => api.get(`/blocks/${id}`),
  updatePassword: (id: string, password: string) =>
    api.put(`/blocks/${id}/password`, { password }),
};

// School API
export const schoolsAPI = {
  getAll: (params?: { district?: string; block?: string }) =>
    api.get("/schools", { params }),
  getById: (id: string) => api.get(`/schools/${id}`),
  getByUdise: (udise: string) => api.get(`/schools/udise/${udise}`),
};

export default api;
