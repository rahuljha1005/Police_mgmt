import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import { useFetch } from "../../hooks/useFetch";
import { getDashboard } from "../../services/admin.api";
import CrimeChart from "./components/CrimeChart";
import RecentActivity from "./components/RecentActivity";
import StatCards from "./components/StatCards";

const Dashboard = () => {
  const { data, error, loading } = useFetch(getDashboard, [], { errorMessage: "Unable to load dashboard." });

  if (loading) return <Loader rows={4} />;
  if (error) return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>;
  if (!data) return <EmptyState message="No dashboard data found." />;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">Live Overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
      </div>
      <StatCards dashboard={data} />
      <CrimeChart dashboard={data} />
      <RecentActivity logs={data.latestAuditLogs || []} />
    </section>
  );
};

export default Dashboard;
