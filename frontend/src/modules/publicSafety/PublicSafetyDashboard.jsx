import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/ui/Loader";
import { getIndiaSafetyAnalytics, getIndiaSafetyMap } from "../../services/publicSafety.api";
import IndiaSafetyMap from "./components/IndiaSafetyMap";
import PoliceAreaIntelligence from "./components/PoliceAreaIntelligence";
import RiskInsights from "./components/RiskInsights";
import SafetyRankingTable from "./components/SafetyRankingTable";
import StateAnalyticsPanel from "./components/StateAnalyticsPanel";
import TrendCharts from "./components/TrendCharts";

const PublicSafetyDashboard = ({ context = "civilian", mode = "analytics" }) => {
  const [payload, setPayload] = useState({ analytics: null, map: null });
  const [selectedState, setSelectedState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getIndiaSafetyAnalytics(), getIndiaSafetyMap()])
      .then(([analytics, map]) => {
        const analyticsData = analytics.data.data;
        const mapData = map.data.data;
        setPayload({ analytics: analyticsData, map: mapData });
        setSelectedState(analyticsData?.riskyStates?.[0] || analyticsData?.states?.[0] || null);
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load India public safety intelligence."))
      .finally(() => setLoading(false));
  }, []);

  const rankedStates = useMemo(
    () => [...(payload.analytics?.states || [])].sort((a, b) => a.publicSafetyRank - b.publicSafetyRank),
    [payload.analytics?.states]
  );
  const highRiskStates = useMemo(
    () => [...(payload.analytics?.states || [])].sort((a, b) => a.safetyScore - b.safetyScore).slice(0, 5),
    [payload.analytics?.states]
  );
  const safestStates = useMemo(
    () => [...(payload.analytics?.states || [])].sort((a, b) => b.safetyScore - a.safetyScore).slice(0, 5),
    [payload.analytics?.states]
  );

  if (loading) return <Loader rows={5} />;

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-police-accent">
            {context === "police" ? "Operational Safety Intelligence" : "Public Safety Intelligence"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            {mode === "map" ? "India Safety Score Map" : "National Public Safety Intelligence Dashboard"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-400">
            Choropleth safety map using real India GeoJSON boundaries with realistic synthetic state analytics. Comparisons are ranked by risk, growth, resolution efficiency, and dominant crime pressure.
          </p>
        </div>
        <div className="rounded-lg border border-white/10 bg-police-panel px-4 py-3 text-sm text-zinc-300">
          Boundary source: <span className="text-white">{payload.map?.boundarySource?.name || "India GeoJSON"}</span>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}

      <RiskInsights analytics={payload.analytics} mapSummary={payload.map?.summary} />

      <div className="grid items-start gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <article className="rounded-lg border border-white/10 bg-police-panel p-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">India Choropleth Safety Map</h2>
            <Legend />
          </div>
          <IndiaSafetyMap mapData={payload.map} onStateSelect={setSelectedState} selectedState={selectedState} />
        </article>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <StateAnalyticsPanel state={selectedState} />
          <OperationalList onStateSelect={setSelectedState} title="Top High-Risk States" states={highRiskStates} variant="risk" />
          <OperationalList onStateSelect={setSelectedState} title="Safest States Rankings" states={safestStates} variant="safe" />
        </div>
      </div>

      {context === "police" && <PoliceAreaIntelligence />}

      <TrendCharts analytics={payload.analytics} />
      <SafetyRankingTable states={rankedStates} />
    </section>
  );
};

const OperationalList = ({ onStateSelect, states, title, variant }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-3">
    <h2 className="text-lg font-semibold text-white">{title}</h2>
    <div className="mt-3 space-y-1.5">
      {states.map((state, index) => (
        <button
          className="grid w-full grid-cols-[24px_1fr_auto] items-center gap-2 rounded-md bg-police-bg px-3 py-2 text-left transition hover:bg-white/[0.06]"
          key={state.id}
          onClick={() => onStateSelect(state)}
          type="button"
        >
          <span className={`text-sm font-semibold ${variant === "risk" ? "text-red-300" : "text-emerald-300"}`}>{index + 1}</span>
          <span>
            <span className="block text-sm font-medium text-white">{state.state}</span>
            <span className="block text-xs text-zinc-500">
              {variant === "risk"
                ? `${state.growthPercent}% growth / ${state.commonCrimeType}`
                : `${state.complaintResolutionPercent}% resolution / ${state.trend}`}
            </span>
          </span>
          <span className="text-sm font-semibold text-white">{state.safetyScore}</span>
        </button>
      ))}
    </div>
  </article>
);

const Legend = () => {
  const items = [
    ["Safe", "bg-emerald-500"],
    ["Moderate", "bg-yellow-500"],
    ["Risky", "bg-orange-500"],
    ["High Risk", "bg-red-500"],
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([label, color]) => (
        <span className="inline-flex items-center gap-1 text-xs text-zinc-400" key={label}>
          <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
          {label}
        </span>
      ))}
    </div>
  );
};

export default PublicSafetyDashboard;
