import api from "./api";

export const civilianLogin = (credentials) => api.post("/civilian-auth/login", credentials);
export const civilianRegister = (payload) => api.post("/civilian-auth/register", payload);
