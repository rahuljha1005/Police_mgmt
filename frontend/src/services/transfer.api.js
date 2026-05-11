import api from "./api";

export const getTransferWorkloads = () => api.get("/transfers/workloads");
export const getTransferAssignments = (officerId) => api.get("/transfers/assignments", { params: { officerId } });
export const getTransferSuggestions = (fromOfficerId) => api.get("/transfers/suggestions", { params: { fromOfficerId } });
export const bulkTransferCases = (payload) => api.post("/transfers/bulk", payload);
