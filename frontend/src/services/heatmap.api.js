import api from "./api";

export const getHeatmap = (params) => api.get("/heatmap", { params });
