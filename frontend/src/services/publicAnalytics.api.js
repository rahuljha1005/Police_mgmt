import api from "./api";

export const getPublicCrimeTrends = () => api.get("/public-analytics/crime-trends");
export const getPublicCrimeTypes = () => api.get("/public-analytics/crime-types");
export const getPublicZoneSafety = () => api.get("/public-analytics/zone-safety");
