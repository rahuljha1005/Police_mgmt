const StatCard = ({ label, value, helper }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-5">
    <p className="text-sm font-medium text-zinc-400">{label}</p>
    <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
    {helper && <p className="mt-2 text-sm text-police-accent">{helper}</p>}
  </article>
);

const StatCards = ({ dashboard }) => (
  <div className="grid gap-4 md:grid-cols-3">
    <StatCard label="Total FIRs" value={dashboard?.totalFirs ?? 0} helper="All registered FIRs" />
    <StatCard label="Open FIRs" value={dashboard?.openFirCount ?? 0} helper="Currently open" />
    <StatCard label="Closed FIRs" value={dashboard?.closedFirCount ?? 0} helper="Closed investigations" />
  </div>
);

export default StatCards;
