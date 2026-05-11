import api from "./api";

export const login = (credentials) => api.post("/auth/login", credentials);
export const resetTemporaryPassword = (payload) => api.post("/auth/reset-temporary-password", payload);
