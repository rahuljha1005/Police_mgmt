const toneMap = {
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  open: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  investigating: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  pending: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200",
  rejected: "border-red-500/30 bg-red-500/10 text-red-200",
  closed: "border-zinc-500/30 bg-zinc-500/10 text-zinc-200",
  archived: "border-zinc-600/30 bg-zinc-600/10 text-zinc-300",
  critical: "border-red-500/30 bg-red-500/10 text-red-200",
  high: "border-orange-500/30 bg-orange-500/10 text-orange-200",
  medium: "border-police-accent/30 bg-police-primary/20 text-police-accent",
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
};

const StatusBadge = ({ value }) => (
  <span
    className={[
      "inline-flex rounded-md border px-2 py-1 text-xs font-semibold uppercase",
      toneMap[value] || "border-white/10 bg-white/5 text-zinc-200",
    ].join(" ")}
  >
    {value || "unknown"}
  </span>
);

export default StatusBadge;
