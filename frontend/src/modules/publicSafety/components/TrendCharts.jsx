import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

const colors = ["#d79a35", "#2fa66a", "#4aa3c7", "#d7772f", "#8b6fd6", "#c9443d", "#8f6a44", "#b05f4a"];

const TrendCharts = ({ analytics }) => {
  const states = analytics?.states || [];
  const highRisk = [...states].sort((a, b) => a.safetyScore - b.safetyScore).slice(0, 8);
  const improving = [...states]
    .filter((state) => state.safetyScore >= 60 || state.trend === "DECLINING")
    .sort((a, b) => b.complaintResolutionPercent - a.complaintResolutionPercent)
    .slice(0, 8);
  const monthlyTrend = buildMonthlyTrend(states);
  const crimeMix = analytics?.categoryDistribution || [];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartPanel
        eyebrow="Five-year signal"
        title="National Crime Trend Intelligence"
        note="Crime volume and emergency signals move together, but resolution efficiency helps explain improving safety perception."
      >
        <ResponsiveContainer height={280} width="100%">
          <ComposedChart data={analytics?.yearlyTrend || []}>
            <CartesianGrid stroke="#2f2a27" />
            <XAxis dataKey="year" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip />
            <Area dataKey="crimeCount" fill="#6f4b21" fillOpacity={0.42} name="Crime Count" stroke="#d79a35" />
            <Line dataKey="emergencyIncidents" name="Emergency Signals" stroke="#c9443d" strokeWidth={3} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        eyebrow="Monthly pressure"
        title="Monthly Crime Pressure Pattern"
        note="Synthetic monthly trend captures seasonal fluctuation instead of a flat linear curve."
      >
        <ResponsiveContainer height={280} width="100%">
          <AreaChart data={monthlyTrend}>
            <CartesianGrid stroke="#2f2a27" />
            <XAxis dataKey="label" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" />
            <Tooltip />
            <Area dataKey="crimeCount" fill="#2d5d45" fillOpacity={0.5} name="National Monthly Crime" stroke="#2fa66a" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        eyebrow="Ranked risk"
        title="Top High-Risk States"
        note="Ordered by lowest safety score so the most urgent public awareness regions are visible first."
      >
        <ResponsiveContainer height={320} width="100%">
          <BarChart data={highRisk} layout="vertical" margin={{ left: 26, right: 20 }}>
            <CartesianGrid stroke="#2f2a27" />
            <XAxis domain={[0, 100]} stroke="#a1a1aa" type="number" />
            <YAxis dataKey="state" stroke="#d4d4d8" type="category" width={112} />
            <Tooltip />
            <Bar dataKey="safetyScore" name="Safety Score">
              {highRisk.map((state) => (
                <Cell fill={state.safetyScore < 40 ? "#c9443d" : "#d7772f"} key={state.id} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        eyebrow="Improving systems"
        title="Safest and Best-Resolving States"
        note="Highlights public safety maturity: safer states usually combine lower growth pressure with higher resolution efficiency."
      >
        <ResponsiveContainer height={320} width="100%">
          <BarChart data={improving} layout="vertical" margin={{ left: 26, right: 20 }}>
            <CartesianGrid stroke="#2f2a27" />
            <XAxis domain={[0, 100]} stroke="#a1a1aa" type="number" />
            <YAxis dataKey="state" stroke="#d4d4d8" type="category" width={112} />
            <Tooltip />
            <Bar dataKey="complaintResolutionPercent" fill="#2fa66a" name="Resolution %" />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        eyebrow="Dominant categories"
        title="Dominant Crime Intelligence"
        note="Shows which crime types dominate state risk profiles rather than listing raw case counts."
      >
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <ResponsiveContainer height={280} width="100%">
            <PieChart>
              <Pie data={crimeMix} dataKey="count" innerRadius={62} nameKey="category" outerRadius={102}>
                {crimeMix.map((entry, index) => (
                  <Cell fill={colors[index % colors.length]} key={entry.category} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {crimeMix.map((item, index) => (
              <div className="flex items-center justify-between rounded-md bg-police-bg px-3 py-2" key={item.category}>
                <span className="flex items-center gap-2 text-sm text-zinc-300">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
                  {item.category}
                </span>
                <span className="text-sm font-semibold text-white">{item.count} states</span>
              </div>
            ))}
          </div>
        </div>
      </ChartPanel>

      <ChartPanel
        eyebrow="Risk matrix"
        title="Public Safety Risk Matrix"
        note="X-axis is crime growth pressure, Y-axis is safety score, and bubble size reflects incident volume."
      >
        <ResponsiveContainer height={320} width="100%">
          <ScatterChart margin={{ left: 4, right: 20, top: 10, bottom: 8 }}>
            <CartesianGrid stroke="#2f2a27" />
            <XAxis dataKey="growthPercent" name="Crime Growth %" stroke="#a1a1aa" type="number" unit="%" />
            <YAxis dataKey="safetyScore" domain={[20, 95]} name="Safety Score" stroke="#a1a1aa" type="number" />
            <ZAxis dataKey="yearlyCrimeCount" range={[80, 780]} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => [value, name]} />
            <Scatter data={states} name="States" fill="#d79a35" />
          </ScatterChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
};

const buildMonthlyTrend = (states) => {
  const months = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    label: new Date(2026, index, 1).toLocaleString("en-US", { month: "short" }),
    crimeCount: 0,
  }));

  states.forEach((state) => {
    const latestMonthly = state.monthlyTrend || [];
    latestMonthly.forEach((point, index) => {
      if (months[index]) months[index].crimeCount += point.crimeCount || 0;
    });
  });

  return months;
};

const ChartPanel = ({ children, eyebrow, note, title }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-police-accent">{eyebrow}</p>
    <h2 className="mt-1 text-lg font-semibold text-white">{title}</h2>
    <p className="mt-1 min-h-[36px] text-xs leading-5 text-zinc-500">{note}</p>
    <div className="mt-3">{children}</div>
  </article>
);

export default TrendCharts;
