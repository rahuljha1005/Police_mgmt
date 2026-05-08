import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const OfficerAnalytics = ({ officers, closureRate }) => {
  const ranked = [...officers].sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <article className="border border-[#262626] bg-[#151515]">
      <div className="flex items-center justify-between border-b border-[#262626] px-3 py-2">
        <h2 className="text-sm font-semibold text-zinc-100">Officer Performance Analytics</h2>
        <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">{closureRate}% force closure</span>
      </div>
      <div className="grid gap-3 p-3 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="h-64">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={ranked}>
              <CartesianGrid stroke="#262626" vertical={false} />
              <XAxis dataKey="officer" interval={0} tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis tick={{ fill: "#71717a", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #262626", color: "#e4e4e7" }} />
              <Bar dataKey="total" fill="#8B5E3C" name="Total FIRs" />
              <Bar dataKey="open" fill="#7f1d1d" name="Open FIRs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {ranked.slice(0, 7).map((officer) => {
            const load = officer.total ? Math.round((officer.open / officer.total) * 100) : 0;
            return (
              <div className="border border-[#262626] bg-[#101010] px-3 py-2" key={officer.officer}>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-zinc-200">{officer.officer}</p>
                  <span className="text-xs text-[#C89B7B]">{officer.total}</span>
                </div>
                <div className="mt-2 h-1.5 bg-[#262626]">
                  <div className="h-full bg-[#8B5E3C]" style={{ width: `${Math.min(load, 100)}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">{officer.open} open investigations</p>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
};

export default OfficerAnalytics;
