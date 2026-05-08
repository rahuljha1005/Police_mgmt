import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Activity, Database, RadioTower } from "lucide-react";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import { getCrimeTrends, getHeatmapSummary, getStationAnalysis } from "../../services/analytics.api";
import { getComplaints } from "../../services/complaint.api";
import { getFirs } from "../../services/fir.api";
import ActivityFeed from "./components/ActivityFeed";
import AnalyticsTable from "./components/AnalyticsTable";
import CrimeHeatInsights from "./components/CrimeHeatInsights";
import IntelligencePanel from "./components/IntelligencePanel";
import KPIGrid from "./components/KPIGrid";
import OfficerAnalytics from "./components/OfficerAnalytics";
import TrendCharts from "./components/TrendCharts";
import ZoneAnalytics from "./components/ZoneAnalytics";

const sumBy = (items = [], key) => items.reduce((total, item) => total + Number(item?.[key] || 0), 0);

const statusCount = (items = [], status) =>
  items.find((item) => String(item.status).toLowerCase() === status)?.count || 0;

const toPercent = (value, total) => (total ? Math.round((value / total) * 100) : 0);

const calculateGrowth = (monthlyTrends = []) => {
  if (monthlyTrends.length < 2) return 0;
  const current = Number(monthlyTrends.at(-1)?.count || 0);
  const previous = Number(monthlyTrends.at(-2)?.count || 0);
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const priorityRank = { critical: 4, high: 3, medium: 2, low: 1, HIGH: 3, MEDIUM: 2, LOW: 1 };

const AnalyticsDashboard = () => {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [trends, station, heatmap, firs, complaints] = await Promise.all([
          getCrimeTrends(),
          getStationAnalysis(),
          getHeatmapSummary(),
          getFirs({ page: 1, limit: 100 }),
          getComplaints({ page: 1, limit: 100 }),
        ]);

        if (!active) return;
        setPayload({
          trends: trends.data.data,
          station: station.data.data,
          heatmap: heatmap.data.data,
          firs: firs.data.data || [],
          firPagination: firs.data.pagination,
          complaints: complaints.data.data || [],
          complaintPagination: complaints.data.pagination,
        });
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Unable to load analytics command center.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const intelligence = useMemo(() => {
    if (!payload) return null;
    const openClosedRatio = payload.trends.openClosedRatio || [];
    const monthlyTrends = payload.trends.monthlyTrends || [];
    const totalFirs = sumBy(openClosedRatio, "count");
    const open = statusCount(openClosedRatio, "open");
    const investigating = statusCount(openClosedRatio, "investigating");
    const closed = statusCount(openClosedRatio, "closed");
    const activeInvestigations = open + investigating;
    const highPriorityFirs = payload.firs
      .filter((fir) => ["high", "critical"].includes(fir.priority))
      .sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0));
    const highPriorityComplaints = payload.complaints
      .filter((complaint) => complaint.priority === "HIGH")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const convertedComplaints = statusCount(payload.station.complaintConversionRate, "converted_to_fir");
    const totalComplaints = sumBy(payload.station.complaintConversionRate, "count");
    const activeOfficerCount = payload.trends.officerWorkload?.filter((officer) => officer.open > 0).length || 0;
    const maxZoneCount = Math.max(...(payload.heatmap.activeZones || []).map((zone) => zone.count), 1);

    return {
      kpis: [
        { label: "Total FIRs", value: totalFirs, detail: `${closed} closed`, tone: "gold" },
        { label: "Active Investigations", value: activeInvestigations, detail: `${open} open / ${investigating} investigating`, tone: "warning" },
        { label: "Crime Growth", value: `${calculateGrowth(monthlyTrends)}%`, detail: "latest month delta", tone: calculateGrowth(monthlyTrends) > 0 ? "danger" : "stable" },
        { label: "Emergency Incidents", value: highPriorityFirs.length, detail: "high and critical FIRs", tone: "danger" },
        { label: "Patrol Activity", value: activeOfficerCount, detail: "officers carrying open FIRs", tone: "live" },
      ],
      system: [
        { label: "Analytics API", value: "Online", icon: Database },
        { label: "Live Dispatch", value: `${activeInvestigations} active`, icon: RadioTower },
        { label: "Alert Load", value: highPriorityFirs.length + highPriorityComplaints.length, icon: AlertTriangle },
        { label: "Signal", value: "Nominal", icon: Activity },
      ],
      activeInvestigations,
      closureRate: toPercent(closed, totalFirs),
      conversionRate: toPercent(convertedComplaints, totalComplaints),
      highPriorityFirs,
      highPriorityComplaints,
      maxZoneCount,
    };
  }, [payload]);

  if (loading) return <Loader rows={8} />;
  if (error) return <div className="border border-red-900/60 bg-red-950/30 p-4 text-sm text-red-200">{error}</div>;
  if (!payload || !intelligence) return <EmptyState message="No analytics data found." />;

  const recentFirs = payload.firs.slice(0, 14);
  const recentComplaints = payload.complaints.slice(0, 14);
  const activeInvestigations = payload.firs.filter((fir) => ["open", "investigating"].includes(fir.status));

  return (
    <section className="-mx-5 -my-6 min-h-screen bg-[#0b0b0b] px-4 py-4 text-zinc-200 md:-mx-8 md:px-5">
      <div className="mx-auto max-w-[1920px] space-y-4">
        <header className="flex flex-col gap-3 border border-[#262626] bg-[#111] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C89B7B]">Operations intelligence</p>
            <h1 className="mt-1 text-2xl font-semibold text-zinc-50">Police Analytics Command Center</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs lg:grid-cols-4">
            {intelligence.system.map(({ icon: Icon, label, value }) => (
              <div className="flex items-center gap-2 border border-[#262626] bg-[#151515] px-3 py-2" key={label}>
                <Icon className="h-4 w-4 text-[#C89B7B]" />
                <span className="text-zinc-500">{label}</span>
                <span className="font-semibold text-zinc-100">{value}</span>
              </div>
            ))}
          </div>
        </header>

        <KPIGrid metrics={intelligence.kpis} />

        <div className="grid gap-4 2xl:grid-cols-[1.2fr_0.85fr_360px]">
          <TrendCharts trends={payload.trends} station={payload.station} intelligence={intelligence} />
          <ZoneAnalytics station={payload.station} trends={payload.trends} heatmap={payload.heatmap} />
          <div className="space-y-4">
            <ActivityFeed firs={recentFirs} complaints={recentComplaints} />
            <IntelligencePanel
              heatmap={payload.heatmap}
              highPriorityComplaints={intelligence.highPriorityComplaints}
              highPriorityFirs={intelligence.highPriorityFirs}
              activeInvestigations={intelligence.activeInvestigations}
            />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1fr] 2xl:grid-cols-[1fr_0.9fr_0.9fr]">
          <CrimeHeatInsights heatmap={payload.heatmap} maxZoneCount={intelligence.maxZoneCount} />
          <OfficerAnalytics officers={payload.trends.officerWorkload || []} closureRate={intelligence.closureRate} />
          <IntelligencePanel
            variant="predictive"
            heatmap={payload.heatmap}
            highPriorityComplaints={intelligence.highPriorityComplaints}
            highPriorityFirs={intelligence.highPriorityFirs}
            activeInvestigations={intelligence.activeInvestigations}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <AnalyticsTable
            title="Recent FIRs"
            rows={recentFirs}
            columns={[
              { key: "fir_number", label: "FIR No.", render: (row) => row.fir_number },
              { key: "title", label: "Title", render: (row) => row.title },
              { key: "station", label: "Station", render: (row) => row.police_station_id?.name || "Unassigned" },
              { key: "priority", label: "Priority", render: (row) => row.priority, status: true },
              { key: "status", label: "Status", render: (row) => row.status, status: true },
            ]}
          />
          <AnalyticsTable
            title="High-Priority Complaints"
            rows={intelligence.highPriorityComplaints}
            columns={[
              { key: "title", label: "Complaint", render: (row) => row.title },
              { key: "station", label: "Station", render: (row) => row.police_station_id?.name || "Pending" },
              { key: "officer", label: "Officer", render: (row) => row.assigned_officer_id?.name || "Unassigned" },
              { key: "priority", label: "Priority", render: (row) => row.priority, status: true },
              { key: "status", label: "Status", render: (row) => row.status, status: true },
            ]}
          />
          <AnalyticsTable
            title="Active Investigations"
            rows={activeInvestigations}
            columns={[
              { key: "fir_number", label: "FIR No.", render: (row) => row.fir_number },
              { key: "officer", label: "Officer", render: (row) => row.assigned_officer_id?.name || "Unassigned" },
              { key: "crime", label: "Crime Type", render: (row) => row.crime_type_id?.name || "Unknown" },
              { key: "priority", label: "Priority", render: (row) => row.priority, status: true },
              { key: "status", label: "Status", render: (row) => row.status, status: true },
            ]}
          />
          <AnalyticsTable
            title="Officer Activity Logs"
            rows={payload.trends.officerWorkload || []}
            columns={[
              { key: "officer", label: "Officer", render: (row) => row.officer },
              { key: "total", label: "Total FIRs", render: (row) => row.total },
              { key: "open", label: "Open FIRs", render: (row) => row.open },
              { key: "clearance", label: "Closure Load", render: (row) => `${Math.max(row.total - row.open, 0)} closed/archived` },
            ]}
          />
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboard;
