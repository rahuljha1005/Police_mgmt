import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CrimeHeatInsights = ({ heatmap, maxZoneCount }) => {
  const hotspots = heatmap.hotspots || [];
  const activeZones = heatmap.activeZones || [];

  return (
    <article className="border border-[#262626] bg-[#151515]">
      <div className="flex items-center justify-between border-b border-[#262626] px-3 py-2">
        <h2 className="text-sm font-semibold text-zinc-100">Crime Hotspot Intelligence</h2>
        <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">heat intensity</span>
      </div>
      <div className="grid gap-3 p-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-64">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={hotspots.slice(0, 10)} layout="vertical">
              <CartesianGrid stroke="#262626" horizontal={false} />
              <XAxis tick={{ fill: "#71717a", fontSize: 11 }} type="number" />
              <YAxis dataKey="area" tick={{ fill: "#71717a", fontSize: 10 }} type="category" width={108} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #262626", color: "#e4e4e7" }} />
              <Bar dataKey="count" fill="#8B5E3C" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {activeZones.slice(0, 8).map((zone) => {
            const intensity = Math.max(8, Math.round((zone.count / maxZoneCount) * 100));
            return (
              <div className="border border-[#262626] bg-[#101010] px-3 py-2" key={zone.zone}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-zinc-200">{zone.zone}</p>
                  <span className="text-xs text-[#C89B7B]">{zone.count}</span>
                </div>
                <div className="mt-2 grid grid-cols-12 gap-1">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <span
                      className="h-2"
                      key={index}
                      style={{
                        background: index < Math.ceil(intensity / 8.4) ? "linear-gradient(90deg, #8B5E3C, #C89B7B)" : "#262626",
                      }}
                    />
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">{intensity}% relative intensity</p>
              </div>
            );
          })}
          {!activeZones.length && <p className="text-sm text-zinc-500">No active zone intensity returned.</p>}
        </div>
      </div>
    </article>
  );
};

export default CrimeHeatInsights;
