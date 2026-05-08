import api from "./api";

export const getFirs = (params) => api.get("/firs", { params });
export const getFir = (id) => api.get(`/firs/${id}`);
export const createFir = (payload) => api.post("/firs", payload);
export const assignFirOfficer = (id, assigned_officer_id) =>
  api.patch(`/firs/${id}/assign`, { assigned_officer_id });
