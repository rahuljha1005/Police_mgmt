import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltip = {
  contentStyle: { background: "#111", border: "1px solid #262626", color: "#e4e4e7" },
  labelStyle: { color: "#C89B7B" },
};

const axis = { stroke: "#71717a", fontSize: 11 };

const ZoneAnalytics = ({ station, trends, heatmap }) => {
  const zoneComparison = (heatmap.activeZones || trends.highCrimeZones || []).slice(0, 8);
  const stationRows = (station.stationComparison || []).slice(0, 8).map((item) => ({
    ...item,
    backlog: Math.max(Number(item.total || 0) - Number(item.closed || 0), 0),
    closure: item.total ? Math.round((item.closed / item.total) * 100) : 0,
  }));

  return (
    <div className="grid gap-4">
      <article className="border border-[#262626] bg-[#151515]">
        <div className="flex items-center justify-between border-b border-[#262626] px-3 py-2">
          <h2 className="text-sm font-semibold text-zinc-100">Zone-wise Crime Comparison</h2>
          <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">active zones</span>
        </div>
        <div className="h-64 p-2">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={zoneComparison}>
              <CartesianGrid stroke="#262626" vertical={false} />
              <XAxis dataKey="zone" tick={axis} />
              <YAxis tick={axis} />
              <Tooltip {...tooltip} />
              <Bar dataKey="count" fill="#8B5E3C" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="border border-[#262626] bg-[#151515]">
          <div className="border-b border-[#262626] px-3 py-2">
            <h2 className="text-sm font-semibold text-zinc-100">Case Status Mix</h2>
          </div>
          <div className="h-56 p-2">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie data={trends.openClosedRatio || []} dataKey="count" innerRadius={45} nameKey="status" outerRadius={78}>
                  {(trends.openClosedRatio || []).map((entry, index) => (
                    <Cell fill={["#8B5E3C", "#C89B7B", "#7f1d1d", "#525252"][index % 4]} key={entry.status} />
                  ))}
                </Pie>
                <Tooltip {...tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="border border-[#262626] bg-[#151515]">
          <div className="border-b border-[#262626] px-3 py-2">
            <h2 className="text-sm font-semibold text-zinc-100">Station Intelligence</h2>
          </div>
          <div className="max-h-56 overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-[#111] text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                <tr>
                  <th className="px-3 py-2">Station</th>
                  <th className="px-3 py-2">Zone</th>
                  <th className="px-3 py-2">Load</th>
                  <th className="px-3 py-2">Closure</th>
                </tr>
              </thead>
              <tbody>
                {stationRows.map((row) => (
                  <tr className="border-t border-[#262626] hover:bg-[#1c1c1c]" key={`${row.station}-${row.zone}`}>
                    <td className="px-3 py-2 font-medium text-zinc-200">{row.station}</td>
                    <td className="px-3 py-2 text-zinc-500">{row.zone}</td>
                    <td className="px-3 py-2 text-[#C89B7B]">{row.total}</td>
                    <td className="px-3 py-2 text-zinc-300">{row.closure}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ZoneAnalytics;
