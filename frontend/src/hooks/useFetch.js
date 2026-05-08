import { useCallback, useEffect, useState } from "react";

export const useFetch = (request, dependencies = [], options = {}) => {
  const [data, setData] = useState(options.initialData ?? null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await request();
      setData(response.data?.data ?? response.data);
      setPagination(response.data?.pagination ?? null);
    } catch (err) {
      setError(err.response?.data?.message || options.errorMessage || "Unable to load data.");
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, pagination, refetch: load, setData };
};
