const toneStyles = {
  gold: "border-[#8B5E3C]/70 text-[#C89B7B]",
  warning: "border-orange-800/70 text-orange-300",
  danger: "border-red-900/70 text-red-300",
  stable: "border-emerald-900/70 text-emerald-300",
  live: "border-[#C89B7B]/50 text-[#C89B7B]",
};

const KPIGrid = ({ metrics }) => (
  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
    {metrics.map((metric) => (
      <article className={`border bg-[#151515] px-3 py-3 ${toneStyles[metric.tone] || toneStyles.gold}`} key={metric.label}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-50">{metric.value}</p>
          </div>
          <span className="mt-1 h-2 w-2 animate-pulse rounded-full bg-current" />
        </div>
        <p className="mt-2 truncate text-xs text-zinc-500">{metric.detail}</p>
      </article>
    ))}
  </div>
);

export default KPIGrid;
