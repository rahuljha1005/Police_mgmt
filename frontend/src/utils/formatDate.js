export const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

export const formatShortDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
};
