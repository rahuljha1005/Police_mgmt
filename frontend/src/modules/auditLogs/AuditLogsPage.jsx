import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import api from "../../services/api";

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 20, action: "", from: "", to: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const query = useMemo(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    return params;
  }, [filters]);

  useEffect(() => {
    const loadLogs = async () => {
      setError("");
      setIsLoading(true);
      try {
        const response = await api.get("/admin/audit-logs", { params: query });
        setLogs(response.data.data);
        setPagination(response.data.pagination);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load audit logs.");
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, [query]);

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, page: 1, [event.target.name]: event.target.value }));
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">Traceability</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Audit Logs</h1>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      <article className="rounded-lg border border-white/10 bg-police-panel">
        <div className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-3">
          <input className="rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="action" onChange={updateFilter} placeholder="Action filter" value={filters.action} />
          <input className="rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="from" onChange={updateFilter} type="date" value={filters.from} />
          <input className="rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="to" onChange={updateFilter} type="date" value={filters.to} />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {logs.map((log) => (
                <tr key={log._id}>
                  <td className="px-4 py-3 font-semibold text-police-accent">{log.action}</td>
                  <td className="px-4 py-3">
                    <p className="text-zinc-200">{log.user_id?.name || "System"}</p>
                    <p className="text-xs text-zinc-500">{log.user_id?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{log.entity_type}</td>
                  <td className="px-4 py-3 text-zinc-400">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && logs.length === 0 && <div className="p-4"><EmptyState message="No audit logs found." /></div>}
        <Pagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
      </article>
    </section>
  );
};

export default AuditLogsPage;
