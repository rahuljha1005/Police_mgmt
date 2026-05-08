import api from "./api";

export const getCrimeTrends = (params) => api.get("/analytics/crime-trends", { params });
export const getStationAnalysis = (params) => api.get("/analytics/station-analysis", { params });
export const getHeatmapSummary = (params) => api.get("/analytics/heatmap-summary", { params });
