import api from "./api";

export const getHierarchyOverview = () => api.get("/hierarchy/overview");
