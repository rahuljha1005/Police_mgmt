import { AlertTriangle, Crosshair, ShieldAlert, TrendingUp } from "lucide-react";

const RiskRow = ({ label, value, detail, tone = "text-[#C89B7B]" }) => (
  <div className="border border-[#262626] bg-[#101010] px-3 py-2">
    <div className="flex items-center justify-between gap-3">
      <p className="truncate text-xs font-semibold text-zinc-200">{label}</p>
      <span className={`text-sm font-semibold ${tone}`}>{value}</span>
    </div>
    <p className="mt-1 truncate text-[11px] text-zinc-500">{detail}</p>
  </div>
);

const IntelligencePanel = ({ heatmap, highPriorityFirs, highPriorityComplaints, activeInvestigations, variant = "operations" }) => {
  const hotspots = heatmap.hotspots || [];
  const spikes = heatmap.recentSpikes || [];
  const topHotspot = hotspots[0];
  const topSpike = spikes[0];

  if (variant === "predictive") {
    return (
      <article className="border border-[#262626] bg-[#151515]">
        <div className="flex items-center gap-2 border-b border-[#262626] px-3 py-2">
          <TrendingUp className="h-4 w-4 text-[#C89B7B]" />
          <h2 className="text-sm font-semibold text-zinc-100">Predictive Insights</h2>
        </div>
        <div className="space-y-2 p-3">
          <RiskRow
            detail={topHotspot ? "recurring hotspot by FIR density" : "no hotspot data returned"}
            label="High-risk area indicator"
            tone="text-red-300"
            value={topHotspot?.area || "None"}
          />
          <RiskRow
            detail={topSpike ? "30-day category spike" : "no recent spike data returned"}
            label="Unusual activity warning"
            tone="text-orange-300"
            value={topSpike?.crimeType || "Stable"}
          />
          <RiskRow
            detail={`${highPriorityFirs.length} urgent FIRs and ${highPriorityComplaints.length} urgent complaints`}
            label="Crime increase alert"
            tone="text-[#C89B7B]"
            value={highPriorityFirs.length + highPriorityComplaints.length}
          />
          <RiskRow
            detail="open and investigating FIR pressure"
            label="Investigation backlog"
            tone="text-zinc-100"
            value={activeInvestigations}
          />
        </div>
      </article>
    );
  }

  return (
    <article className="border border-[#262626] bg-[#151515]">
      <div className="flex items-center gap-2 border-b border-[#262626] px-3 py-2">
        <ShieldAlert className="h-4 w-4 text-[#C89B7B]" />
        <h2 className="text-sm font-semibold text-zinc-100">Operational Intelligence</h2>
      </div>
      <div className="grid gap-2 p-3">
        <RiskRow detail="open and investigating FIRs" label="Active investigations" value={activeInvestigations} />
        <RiskRow detail="unresolved high-priority FIR queue" label="High-priority FIRs" tone="text-red-300" value={highPriorityFirs.length} />
        <RiskRow detail="civilian reports requiring triage" label="High-priority complaints" tone="text-orange-300" value={highPriorityComplaints.length} />
      </div>
      <div className="border-t border-[#262626] p-3">
        <div className="mb-2 flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-[#C89B7B]" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">High-risk zones</p>
        </div>
        <div className="space-y-2">
          {hotspots.slice(0, 5).map((hotspot) => (
            <RiskRow detail={`${hotspot.latitude?.toFixed?.(3) || "n/a"}, ${hotspot.longitude?.toFixed?.(3) || "n/a"}`} key={hotspot.area} label={hotspot.area} value={hotspot.count} />
          ))}
          {!hotspots.length && <p className="text-sm text-zinc-500">No hotspot intelligence returned.</p>}
        </div>
      </div>
      <div className="border-t border-[#262626] p-3">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-300" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Recent spikes</p>
        </div>
        <div className="space-y-2">
          {spikes.slice(0, 4).map((spike) => (
            <RiskRow detail="last 30 days" key={spike.crimeType} label={spike.crimeType} tone="text-orange-300" value={spike.count} />
          ))}
          {!spikes.length && <p className="text-sm text-zinc-500">No spike analytics returned.</p>}
        </div>
      </div>
    </article>
  );
};

export default IntelligencePanel;
