import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import EmptyState from "../../../components/ui/EmptyState";

const ChartPanel = ({ data, dataKey, nameKey, title }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-5">
    <h2 className="text-xl font-semibold text-white">{title}</h2>
    <div className="mt-5 h-72">
      {data?.length ? (
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#2a2a2a" vertical={false} />
            <XAxis dataKey={nameKey} stroke="#a1a1aa" tick={{ fontSize: 12 }} />
            <YAxis stroke="#a1a1aa" />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} />
            <Bar dataKey={dataKey} fill="#8B5E3C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState message="No chart data available." />
      )}
    </div>
  </article>
);

const CrimeChart = ({ dashboard }) => (
  <div className="grid gap-4 xl:grid-cols-2">
    <ChartPanel data={dashboard?.crimeTypeDistribution || []} dataKey="count" nameKey="name" title="Crime Type Distribution" />
    <ChartPanel data={dashboard?.stationWiseFirCount || []} dataKey="count" nameKey="name" title="Station-wise FIR Count" />
  </div>
);

export default CrimeChart;
