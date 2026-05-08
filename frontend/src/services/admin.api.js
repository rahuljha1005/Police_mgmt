import api from "./api";

export const getDashboard = () => api.get("/admin/dashboard");
export const getReferenceData = () => api.get("/admin/reference-data");
export const getOfficers = (params) => api.get("/admin/officers", { params });
export const createOfficer = (payload) => api.post("/admin/officers", payload);
export const verifyOfficer = (id, status) => api.patch(`/admin/officers/${id}/verify`, { status });
export const changeOfficerRole = (id, role) => api.patch(`/admin/officers/${id}/role`, { role });
export const getAuditLogs = (params) => api.get("/admin/audit-logs", { params });
