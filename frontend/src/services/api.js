import axios from "axios";
import { emitAuthLogout, getStoredSession, isTokenExpired } from "../auth/auth.utils";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const session = getStoredSession();
  const token = session?.token;

  if (token && isTokenExpired(token)) {
    emitAuthLogout("expired");
    return Promise.reject(new axios.Cancel("Session expired"));
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      emitAuthLogout("invalid-session");
    }

    return Promise.reject(error);
  }
);

export default api;
