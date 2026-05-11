import api from "./api";

export const getSafetyZones = () => api.get("/public-safety/zones");
export const getSafetyZone = (id) => api.get(`/public-safety/zone/${id}`);
export const getSafetyMap = () => api.get("/public-safety/map");
export const getIndiaSafetyMap = () => api.get("/public-safety/india-map");
export const getIndiaSafetyState = (id) => api.get(`/public-safety/state/${id}`);
export const getIndiaSafetyAnalytics = () => api.get("/public-safety/india-analytics");
export const getPublicSafetyRiskRankings = () => api.get("/public-safety/risk-rankings");
export const getPublicSafetyTrendAnalytics = () => api.get("/public-safety/trend-analytics");
export const getPublicSafetyDominantCrimes = () => api.get("/public-safety/dominant-crimes");
export const getPublicSafetyRiskMatrix = () => api.get("/public-safety/risk-matrix");
