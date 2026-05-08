import { useEffect, useState } from "react";
import api from "../../services/api";
import StatusBadge from "../../components/ui/StatusBadge";

const StatCard = ({ label, value, helper }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-5">
    <p className="text-sm font-medium text-zinc-400">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    {helper && <p className="mt-2 text-sm text-police-accent">{helper}</p>}
  </article>
);

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setDashboard(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            className="h-32 animate-pulse rounded-lg border border-white/10 bg-police-panel"
            key={item}
          />
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-red-200">
        {error}
      </div>
    );
  }

  const openCases = dashboard?.openFirCount ?? 0;
  const closedCases = dashboard?.closedFirCount ?? 0;
  const totalFirs = dashboard?.totalFirs ?? 0;
  const crimeStats = dashboard?.crimeTypeDistribution || [];
  const stationStats = dashboard?.stationWiseFirCount || [];
  const latestAuditLogs = dashboard?.latestAuditLogs || [];

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">
          Live Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total FIRs" value={totalFirs} helper="All registered FIR records" />
        <StatCard label="Open Cases" value={openCases} helper="FIR status: open" />
        <StatCard label="Closed Cases" value={closedCases} helper="FIR status: closed" />
      </div>

      <article className="rounded-lg border border-white/10 bg-police-panel p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Open vs Closed Cases</h2>
            <p className="text-sm text-zinc-400">Fetched from backend dashboard API</p>
          </div>
          <p className="text-sm text-police-accent">{openCases + closedCases} cases tracked</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex justify-between text-sm text-zinc-300">
              <span>Open</span>
              <span>{openCases}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-police-bg">
              <div
                className="h-full rounded-full bg-police-primary"
                style={{
                  width: `${Math.min(100, totalFirs ? (openCases / totalFirs) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm text-zinc-300">
              <span>Closed</span>
              <span>{closedCases}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-police-bg">
              <div
                className="h-full rounded-full bg-police-accent"
                style={{
                  width: `${Math.min(100, totalFirs ? (closedCases / totalFirs) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-lg border border-white/10 bg-police-panel p-5">
          <h2 className="text-xl font-semibold text-white">Crime Type Distribution</h2>
          <div className="mt-5 space-y-4">
            {crimeStats.length === 0 && <p className="text-sm text-zinc-400">No FIR data yet.</p>}
            {crimeStats.map((item) => {
              const width = totalFirs ? Math.max(6, (item.count / totalFirs) * 100) : 0;
              return (
                <div key={item.crime_type_id || item.name}>
                  <div className="mb-2 flex justify-between text-sm text-zinc-300">
                    <span>{item.name || "Unassigned"}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-police-bg">
                    <div className="h-full rounded-full bg-police-primary" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-police-panel p-5">
          <h2 className="text-xl font-semibold text-white">Station-wise FIR Count</h2>
          <div className="mt-5 space-y-3">
            {stationStats.length === 0 && <p className="text-sm text-zinc-400">No station data yet.</p>}
            {stationStats.slice(0, 8).map((item) => (
              <div className="flex items-center justify-between rounded-md bg-police-bg px-3 py-3" key={item.police_station_id || item.name}>
                <span className="text-sm text-zinc-200">{item.name || "Unknown station"}</span>
                <span className="text-sm font-semibold text-police-accent">{item.count}</span>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-lg border border-white/10 bg-police-panel p-5">
        <h2 className="text-xl font-semibold text-white">Latest Audit Logs</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {latestAuditLogs.map((log) => (
                <tr key={log._id}>
                  <td className="px-3 py-3"><StatusBadge value={log.action} /></td>
                  <td className="px-3 py-3 text-zinc-300">{log.user_id?.name || "System"}</td>
                  <td className="px-3 py-3 text-zinc-300">{log.entity_type}</td>
                  <td className="px-3 py-3 text-zinc-400">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default DashboardPage;
