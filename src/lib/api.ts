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

// Books API
export const booksAPI = {
  getAll: (params?: {
    class?: string;
    subject?: string;
    category?: string;
    academic_year?: string;
  }) => api.get("/books", { params }),
  getById: (id: string) => api.get(`/books/${id}`),
  create: (book: {
    title: string;
    class: string;
    subject: string;
    category: string;
    rate: number;
    academic_year: string;
  }) => api.post("/books", book),
  update: (
    id: string,
    book: {
      title: string;
      class: string;
      subject: string;
      category: string;
      rate: number;
      academic_year: string;
    },
  ) => api.put(`/books/${id}`, book),
  delete: (id: string) => api.delete(`/books/${id}`),
  search: (query: string) =>
    api.get(`/books/search?q=${encodeURIComponent(query)}`),
};

// Requisitions API
export const requisitionsAPI = {
  getAll: () => api.get("/requisitions"),
  getById: (id: string) => api.get(`/requisitions/${id}`),
  create: (requisition: {
    schoolId: string;
    bookId: string;
    quantity: number;
    reqId: string;
  }) => api.post("/requisitions", requisition),
  update: (
    id: string,
    requisition: {
      quantity?: number;
      received?: number;
      status?: string;
      remarksByBlock?: string;
      remarksByDistrict?: string;
    },
  ) => api.put(`/requisitions/${id}`, requisition),
  delete: (id: string) => api.delete(`/requisitions/${id}`),
  getBySchool: (schoolUdise: string) =>
    api.get(`/requisitions/school/${schoolUdise}`),
  getByBlock: (blockId: string) => api.get(`/requisitions/block/${blockId}`),
};

// Stock API
export const stockAPI = {
  getAll: () => api.get("/stock"),
  getById: (id: string) => api.get(`/stock/${id}`),
  create: (stock: {
    book_id: string;
    quantity: number;
    school_udise?: string;
    academic_year: string;
  }) => api.post("/stock", stock),
  update: (
    id: string,
    stock: {
      quantity: number;
      school_udise?: string;
    },
  ) => api.put(`/stock/${id}`, stock),
  delete: (id: string) => api.delete(`/stock/${id}`),
  getStateStock: () => api.get("/stock/state"),
  getBySchool: (schoolUdise: string) => api.get(`/stock/school/${schoolUdise}`),
};

// Backlog API
export const backlogAPI = {
  getAll: (params?: { type?: string; userId?: string }) =>
    api.get("/backlog", { params }),
  getById: (id: string) => api.get(`/backlog/${id}`),
  create: (backlog: {
    bookId: string;
    type: string;
    userId: string;
    quantity: number;
  }) => api.post("/backlog", backlog),
  update: (
    id: string,
    backlog: {
      bookId?: string;
      type?: string;
      userId?: string;
      quantity?: number;
    },
  ) => api.put(`/backlog/${id}`, backlog),
  delete: (id: string) => api.delete(`/backlog/${id}`),
  getByType: (type: string, userId?: string) =>
    api.get(`/backlog/type/${type}`, { params: userId ? { userId } : {} }),
};

export default api;
