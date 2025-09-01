import axios from "axios";

const api = axios.create({
  baseURL:
    (import.meta.env.VITE_BACKEND_URL
      ? import.meta.env.VITE_BACKEND_URL + "/api/v1"
      : null) || "http://localhost:3000/api/v1",
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
  getClassEnrollments: (schoolId: string) =>
    api.get(`/schools/${schoolId}/enrollments`),
  updateClassEnrollment: (
    schoolId: string,
    data: { class: string; students: number },
  ) => api.post(`/schools/${schoolId}/enrollments`, data),
  deleteClassEnrollment: (schoolId: string, enrollmentId: string) =>
    api.delete(`/schools/${schoolId}/enrollments/${enrollmentId}`),
};

// Books API
export const booksAPI = {
  getAll: (params?: {
    class?: string;
    subject?: string;
    category?: string;
    academic_year?: string;
    enabled_only?: boolean;
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
  toggleStatus: (id: string) => api.patch(`/books/${id}/toggle-status`),
  addComment: (id: string, comment: string) =>
    api.patch(`/books/${id}/add-comment`, { comment }),
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
  getAll: (params?: { type?: string; userId?: string }) =>
    api.get("/stock", { params }),
  getById: (id: string) => api.get(`/stock/${id}`),
  create: (stock: {
    bookId: string;
    quantity: number;
    userId: string;
    type: string;
  }) => api.post("/stock", stock),
  update: (
    id: string,
    stock: {
      quantity: number;
    },
  ) => api.put(`/stock/${id}`, stock),
  delete: (id: string) => api.delete(`/stock/${id}`),
  getStateStock: () => api.get("/stock/state"),
  getBySchool: (schoolUdise: string) => api.get(`/stock/school/${schoolUdise}`),
};

// Backlog API functionality now uses stockAPI

// EChallan API
export const echallanAPI = {
  getAll: (params?: { type?: string; status?: string }) =>
    api.get("/echallans", { params }),
  getById: (id: string) => api.get(`/echallans/${id}`),
  create: (echallan: {
    challanNo: string;
    destinationType: string;
    destinationName: string;
    destinationId?: string;
    requisitionId: string;
    academicYear: string;
    vehicleNo?: string;
    agency?: string;
    books: Array<{
      bookId: string;
      className: string;
      subject: string;
      bookName: string;
      noOfBoxes: string;
      noOfPackets: string;
      noOfLooseBoxes: string;
    }>;
  }) => api.post("/echallans", echallan),
  updateStatus: (
    id: string,
    data: {
      status: string;
      deliveredAt?: string;
    },
  ) => api.put(`/echallans/${id}/status`, data),
  delete: (id: string) => api.delete(`/echallans/${id}`),
};

// Issues API
export const issuesAPI = {
  getAll: (params?: {
    schoolId?: string;
    status?: string;
    level?: string;
    priority?: string;
  }) => api.get("/issues", { params }),
  getById: (id: string) => api.get(`/issues/${id}`),
  getSummary: (params?: { level?: string }) =>
    api.get("/issues/summary", { params }),
  create: (issue: {
    title: string;
    description: string;
    priority?: string;
    schoolId: string;
    raisedBy: string;
  }) => api.post("/issues", issue),
  reviewAtBlock: (
    id: string,
    data: {
      action: "escalate" | "resolve" | "reject";
      remarks?: string;
    },
  ) => api.patch(`/issues/${id}/review/block`, data),
  reviewAtDistrict: (
    id: string,
    data: {
      action: "escalate" | "resolve" | "reject";
      remarks?: string;
    },
  ) => api.patch(`/issues/${id}/review/district`, data),
  reviewAtState: (
    id: string,
    data: {
      action: "resolve" | "reject";
      remarks?: string;
    },
  ) => api.patch(`/issues/${id}/review/state`, data),
};

export const notificationsAPI = {
  getAll: (params?: {
    userLevel?: string;
    userId?: string;
    schoolId?: string;
    blockCode?: string;
    districtCode?: string;
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => api.get("/notifications", { params }),
  getStats: (params?: {
    userLevel?: string;
    userId?: string;
    schoolId?: string;
    blockCode?: string;
    districtCode?: string;
  }) => api.get("/notifications/stats", { params }),
  create: (notification: {
    title: string;
    message: string;
    type?: string;
    priority?: string;
    sentBy: string;
    sentFrom: string;
    targetSchools?: boolean;
    targetBlocks?: boolean;
    targetDistricts?: boolean;
    targetStates?: boolean;
    specificSchoolIds?: string[];
    specificBlockCodes?: number[];
    specificDistrictCodes?: number[];
    expiresAt?: string;
  }) => api.post("/notifications", notification),
  markAsRead: (id: string, data: { userId: string; userLevel: string }) =>
    api.post(`/notifications/${id}/read`, data),
  update: (
    id: string,
    notification: {
      title?: string;
      message?: string;
      type?: string;
      priority?: string;
      isActive?: boolean;
      expiresAt?: string;
      sentBy: string;
    },
  ) => api.put(`/notifications/${id}`, notification),
  delete: (id: string, data: { sentBy: string }) =>
    api.delete(`/notifications/${id}`, { data }),
};

// Reports API
export const reportsAPI = {
  getDistrictWise: (params?: { district?: string }) =>
    api.get("/reports/district-wise", { params }),
  getISWise: (params?: { district?: string }) =>
    api.get("/reports/is-wise", { params }),
  getSummary: () => api.get("/reports/summary"),
  getDetailedDistrictWise: (params?: { district?: string }) =>
    api.get("/reports/detailed-district-wise", { params }),
  getDetailedISWise: (params?: { district?: string }) =>
    api.get("/reports/detailed-is-wise", { params }),
};

export default api;
