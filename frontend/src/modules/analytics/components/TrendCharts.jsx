import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartColors = ["#8B5E3C", "#C89B7B", "#a16207", "#991b1b", "#7c2d12", "#525252"];
const axis = { stroke: "#71717a", fontSize: 11 };
const tooltip = {
  contentStyle: { background: "#111", border: "1px solid #262626", color: "#e4e4e7" },
  labelStyle: { color: "#C89B7B" },
};

const ChartPanel = ({ children, title, meta, className = "" }) => (
  <article className={`border border-[#262626] bg-[#151515] ${className}`}>
    <div className="flex items-center justify-between border-b border-[#262626] px-3 py-2">
      <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
      <span className="text-[11px] uppercase tracking-[0.14em] text-zinc-500">{meta}</span>
    </div>
    <div className="h-64 p-2">{children}</div>
  </article>
);

const TrendCharts = ({ trends, station, intelligence }) => {
  const stationEfficiency = (station.stationComparison || []).slice(0, 8).map((item) => ({
    ...item,
    backlog: Math.max(Number(item.total || 0) - Number(item.closed || 0), 0),
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-1">
      <ChartPanel title="Monthly FIR Trend" meta="area trend">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={trends.monthlyTrends || []}>
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="month" tick={axis} />
            <YAxis tick={axis} />
            <Tooltip {...tooltip} />
            <Area dataKey="count" fill="#8B5E3C" fillOpacity={0.45} stroke="#C89B7B" strokeWidth={2} type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="FIR Closure Efficiency" meta={`${intelligence.closureRate}% closure`}>
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={stationEfficiency}>
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="station" interval={0} tick={axis} />
            <YAxis tick={axis} />
            <Tooltip {...tooltip} />
            <Bar dataKey="closed" stackId="a" fill="#C89B7B" name="Closed" />
            <Bar dataKey="backlog" stackId="a" fill="#7f1d1d" name="Backlog" />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Crime Category Growth" meta="category load">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={trends.crimeTypeGrowth || []}>
            <CartesianGrid stroke="#262626" vertical={false} />
            <XAxis dataKey="name" interval={0} tick={axis} />
            <YAxis tick={axis} />
            <Tooltip {...tooltip} />
            <Line dataKey="count" dot={{ fill: "#C89B7B", r: 3 }} stroke="#C89B7B" strokeWidth={2} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel title="Complaint Conversion Analytics" meta={`${intelligence.conversionRate}% converted`}>
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie data={station.complaintConversionRate || []} dataKey="count" innerRadius={58} nameKey="status" outerRadius={92} paddingAngle={2}>
              {(station.complaintConversionRate || []).map((entry, index) => (
                <Cell fill={chartColors[index % chartColors.length]} key={entry.status} />
              ))}
            </Pie>
            <Tooltip {...tooltip} />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
};

export default TrendCharts;
