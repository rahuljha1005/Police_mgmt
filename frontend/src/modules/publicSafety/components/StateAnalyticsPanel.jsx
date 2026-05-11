const riskColors = {
  SAFE: "bg-emerald-500 text-black",
  MODERATE: "bg-yellow-500 text-black",
  RISKY: "bg-orange-500 text-black",
  "HIGH RISK": "bg-red-500 text-white",
};

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const StateAnalyticsPanel = ({ state }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-zinc-500">Selected State Intelligence</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">{state?.state || "Select a state"}</h2>
      </div>
      {state?.safetyCategory && (
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskColors[state.safetyCategory]}`}>
          {state.safetyCategory}
        </span>
      )}
    </div>

    {state ? (
      <div className="mt-5 space-y-3">
        <div className="rounded-lg border border-white/10 bg-police-bg p-4">
          <p className="text-xs uppercase text-zinc-500">Public Safety Score</p>
          <p className="mt-2 text-5xl font-semibold text-white">{state.safetyScore}</p>
          <div className="mt-3 h-2 rounded-full bg-zinc-800">
            <div className="h-2 rounded-full bg-police-accent" style={{ width: `${state.safetyScore}%` }} />
          </div>
        </div>

        <Metric label="Annual Crime Count" value={formatNumber(state.yearlyCrimeCount)} />
        <Metric label="Yearly Crime Growth" value={`${state.growthPercent}%`} />
        <Metric label="Most Common Crime" value={state.commonCrimeType} />
        <Metric label="Emergency Incidents" value={formatNumber(state.emergencyIncidentCount)} />
        <Metric label="Complaint Resolution" value={`${state.complaintResolutionPercent}%`} />
        <Metric label="Public Safety Rank" value={`#${state.publicSafetyRank}`} />

        <div className="rounded-lg bg-police-bg p-3">
          <p className="text-sm font-medium text-white">Risk Intelligence</p>
          <div className="mt-2 space-y-1">
            {(state.riskDrivers || []).map((driver) => (
              <p className="text-xs capitalize text-zinc-400" key={driver}>{driver}</p>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <p className="mt-5 text-sm text-zinc-400">Click a state on the India map to view its public safety profile.</p>
    )}
  </article>
);

const Metric = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-md bg-police-bg px-3 py-2">
    <span className="text-sm text-zinc-400">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);

export default StateAnalyticsPanel;
