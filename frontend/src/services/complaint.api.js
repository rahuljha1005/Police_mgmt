import api from "./api";

export const getComplaints = (params) => api.get("/complaints", { params });
export const getComplaint = (id) => api.get(`/complaints/${id}`);
export const createComplaint = (payload) => api.post("/complaints", payload);
export const assignComplaintOfficer = (id, assigned_officer_id) =>
  api.patch(`/complaints/${id}/assign`, { assigned_officer_id });
export const updateComplaintStatus = (id, status) => api.patch(`/complaints/${id}/status`, { status });
export const convertComplaintToFir = (id, payload) => api.post(`/complaints/${id}/convert-to-fir`, payload);
export const createMyComplaint = (payload) => api.post("/complaints/my", payload);
export const getMyComplaints = (params) => api.get("/complaints/my", { params });
export const getMyComplaint = (id) => api.get(`/complaints/my/${id}`);
