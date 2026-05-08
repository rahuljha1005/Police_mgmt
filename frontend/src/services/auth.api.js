import api from "./api";

export const login = (credentials) => api.post("/auth/login", credentials);
