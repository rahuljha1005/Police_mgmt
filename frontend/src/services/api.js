import axios from "axios";
import { emitAuthLogout, getStoredSession, isTokenExpired } from "../auth/auth.utils";

const isProduction = import.meta.env.PROD;
const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (isProduction ? "/api" : "http://localhost:5000/api");

const normalizeBase = (url) => {
  if (!url) return url;
  let v = String(url).trim();
  v = v.replace(/^(https?:)\/(?=[^\/])/i, "$1//");
  v = v.replace(/^(https?:)\/\/+/, "$1//");
  return v;
};

const normalizedConfigured = normalizeBase(configuredApiBaseUrl);
const apiBaseUrl = normalizedConfigured.replace(/\/$/, "").endsWith("/api")
  ? normalizedConfigured.replace(/\/$/, "")
  : `${normalizedConfigured.replace(/\/$/, "")}/api`;

console.log("[api] VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL || "(not set)");
console.log("[api] normalized configured API base:", normalizedConfigured);
console.log("[api] resolved API base URL:", apiBaseUrl);

if (isProduction && apiBaseUrl.includes("localhost")) {
  console.error("[api] Production API URL is pointing to localhost. Set VITE_API_BASE_URL to the deployed backend /api URL.");
}

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
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

  console.log("[api] request", {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL || ""}${config.url || ""}`,
    hasToken: Boolean(token),
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log("[api] response", {
      status: response.status,
      url: response.config?.url,
    });

    return response;
  },
  (error) => {
    console.error("[api] error", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
    });

    if (error.response?.status === 401) {
      emitAuthLogout("invalid-session");
    }

    return Promise.reject(error);
  }
);

export default api;
