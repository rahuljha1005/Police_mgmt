import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Loader from "../../components/ui/Loader";
import HeatLayer from "../heatmap/HeatLayer";
import {
  getPublicCrimeTrends,
  getPublicCrimeTypes,
  getPublicHeatmap,
  getPublicZoneSafety,
} from "../../services/publicAnalytics.api";

const colors = ["#f59e0b", "#22c55e", "#38bdf8", "#f97316", "#a78bfa", "#ef4444"];

const CivilianAnalytics = () => {
  const [payload, setPayload] = useState({
    trends: null,
    types: [],
    zones: [],
    heatmap: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([getPublicCrimeTrends(), getPublicCrimeTypes(), getPublicZoneSafety(), getPublicHeatmap()])
      .then(([trends, types, zones, heatmap]) =>
        setPayload({
          trends: trends.data.data,
          types: types.data.data || [],
          zones: zones.data.data || [],
          heatmap: heatmap.data.data || [],
        })
      )
      .catch((err) => setError(err.response?.data?.message || "Unable to load public safety analytics."))
      .finally(() => setLoading(false));
  }, []);

  const heatPoints = useMemo(
    () => payload.heatmap.map((point) => ({ ...point, intensity: point.intensity || 1 })),
    [payload.heatmap]
  );

  if (loading) return <Loader rows={5} />;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">Public Awareness</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Crime Awareness Analytics</h1>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Public-safe statistics for awareness and prevention. Confidential FIR details, patrol intelligence, and active investigation data are not shown.
        </p>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Complaint Resolution" value={`${payload.trends?.complaintResolution?.resolutionRate || 0}%`} />
        <Stat label="Resolved Complaints" value={payload.trends?.complaintResolution?.resolved || 0} />
        <Stat label="Avg Resolution Hours" value={payload.trends?.complaintResolution?.averageResolutionHours || 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel title="Yearly FIR Trends">
          <ResponsiveContainer height={280} width="100%">
            <LineChart data={payload.trends?.yearly || []}>
              <CartesianGrid stroke="#2f2a27" />
              <XAxis dataKey="year" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip />
              <Line dataKey="count" stroke="#f59e0b" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Monthly Crime Activity">
          <ResponsiveContainer height={280} width="100%">
            <AreaChart data={payload.trends?.monthly || []}>
              <CartesianGrid stroke="#2f2a27" />
              <XAxis dataKey="label" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip />
              <Area dataKey="count" fill="#92400e" stroke="#f59e0b" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Crime Category Distribution">
          <ResponsiveContainer height={280} width="100%">
            <PieChart>
              <Pie data={payload.types} dataKey="count" innerRadius={60} nameKey="crimeType" outerRadius={100}>
                {payload.types.map((entry, index) => <Cell fill={colors[index % colors.length]} key={entry.crimeType} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Zone Safety Overview">
          <ResponsiveContainer height={280} width="100%">
            <BarChart data={payload.zones}>
              <CartesianGrid stroke="#2f2a27" />
              <XAxis dataKey="zone" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" />
              <Tooltip />
              <Bar dataKey="safetyScore" fill="#22c55e" />
              <Bar dataKey="firCount" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <ChartPanel title="Public Crime Density Heatmap">
        <div className="h-[460px] overflow-hidden rounded-md">
          <MapContainer center={[20.5937, 78.9629]} className="h-full w-full" scrollWheelZoom zoom={5}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <HeatLayer points={heatPoints} />
          </MapContainer>
        </div>
      </ChartPanel>
    </section>
  );
};

const Stat = ({ label, value }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-4">
    <p className="text-sm text-zinc-400">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
  </article>
);

const ChartPanel = ({ children, title }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-4">
    <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
    {children}
  </article>
);

export default CivilianAnalytics;
