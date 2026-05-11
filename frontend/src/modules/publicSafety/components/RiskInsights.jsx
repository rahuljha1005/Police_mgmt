const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const RiskInsights = ({ analytics, mapSummary }) => {
  const states = analytics?.states || [];
  const fastestGrowth = [...states].sort((a, b) => b.growthPercent - a.growthPercent)[0];
  const bestResolution = [...states].sort((a, b) => b.complaintResolutionPercent - a.complaintResolutionPercent)[0];
  const emergencyTotal = states.reduce((sum, state) => sum + state.emergencyIncidentCount, 0);
  const avgResolution = states.length
    ? Math.round(states.reduce((sum, state) => sum + state.complaintResolutionPercent, 0) / states.length)
    : 0;
  const nationalSafety = mapSummary?.averageSafetyScore || Math.round(states.reduce((sum, state) => sum + state.safetyScore, 0) / Math.max(states.length, 1));

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Insight label="National Safety Score" value={`${nationalSafety}/100`} tone="neutral" />
        <Insight label="Highest Risk State" value={mapSummary?.highestRiskState || "-"} tone="risk" />
        <Insight label="Safest State" value={mapSummary?.safestState || "-"} tone="safe" />
        <Insight label="Fastest Crime Growth" value={fastestGrowth ? `${fastestGrowth.state} ${fastestGrowth.growthPercent}%` : "-"} tone="risk" />
        <Insight label="Emergency Incidents" value={formatNumber(emergencyTotal)} tone="warning" />
        <Insight label="Avg Resolution" value={`${avgResolution}%`} tone="safe" />
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {(analytics?.insights || []).slice(0, 4).map((insight) => (
          <article className="rounded-lg border border-white/10 bg-police-panel p-4" key={insight}>
            <p className="text-xs font-semibold uppercase tracking-wide text-police-accent">Intelligence note</p>
            <p className="mt-2 text-sm leading-5 text-zinc-300">{insight}</p>
          </article>
        ))}
      </div>
      <p className="sr-only">Best resolution state: {bestResolution?.state}</p>
    </div>
  );
};

const toneClass = {
  neutral: "from-zinc-900/80 to-police-panel",
  risk: "from-red-950/30 to-police-panel",
  safe: "from-emerald-950/25 to-police-panel",
  warning: "from-yellow-950/25 to-police-panel",
};

const Insight = ({ label, tone, value }) => (
  <article className={`rounded-lg border border-white/10 bg-gradient-to-br ${toneClass[tone] || toneClass.neutral} p-4 transition hover:border-white/20`}>
    <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
    <p className="mt-2 text-xl font-semibold text-white">{value}</p>
  </article>
);

export default RiskInsights;
