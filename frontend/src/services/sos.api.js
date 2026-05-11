import api from "./api";

export const createSos = (payload) => api.post("/sos", payload);
export const getMySos = (params) => api.get("/sos/my", { params });
export const getPoliceSos = (params) => api.get("/sos", { params });
export const getSosAnalytics = () => api.get("/sos/analytics");
export const respondSos = (id) => api.post(`/sos/${id}/respond`);
export const markSosOnScene = (id) => api.post(`/sos/${id}/on-scene`);
export const resolveSos = (id, payload) => api.post(`/sos/${id}/resolve`, payload);
export const escalateSos = (id, payload) => api.post(`/sos/${id}/escalate`, payload);
export const markSosFalseAlert = (id, payload) => api.post(`/sos/${id}/false-alert`, payload);
export const updateSos = (id, payload) => api.patch(`/sos/${id}`, payload);
