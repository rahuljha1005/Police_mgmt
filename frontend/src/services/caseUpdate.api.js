import api from "./api";

export const getFirTimeline = (firId, params) => api.get(`/case-updates/fir/${firId}`, { params });
export const createCaseUpdate = (payload) => api.post("/case-updates", payload);
export const uploadEvidence = (caseUpdateId, formData, onUploadProgress) =>
  api.post(`/case-updates/${caseUpdateId}/upload-evidence`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
