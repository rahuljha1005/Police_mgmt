import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../hooks/useAuth";
import { getDashboard } from "../../services/admin.api";
import { getComplaints } from "../../services/complaint.api";
import { getFirs } from "../../services/fir.api";
import { getHierarchyOverview } from "../../services/hierarchy.api";
import CrimeChart from "./components/CrimeChart";
import RecentActivity from "./components/RecentActivity";
import StatCards from "./components/StatCards";

const Dashboard = () => {
  const { user } = useAuth();

  if (["ADMIN", "DGP"].includes(user?.role)) {
    return <AdminDashboard />;
  }

  return <OfficerDashboard user={user} />;
};

const AdminDashboard = () => {
  const [state, setState] = useState({ data: null, hierarchy: null, error: "", loading: true });

  useEffect(() => {
    let mounted = true;
    Promise.all([getDashboard(), getHierarchyOverview()])
      .then(([dashboardResponse, hierarchyResponse]) => mounted && setState({ data: dashboardResponse.data.data, hierarchy: hierarchyResponse.data.data, error: "", loading: false }))
      .catch((err) =>
        mounted &&
        setState({
          data: null,
          hierarchy: null,
          error: err.response?.data?.message || "Unable to load dashboard.",
          loading: false,
        })
      );
    return () => {
      mounted = false;
    };
  }, []);

  if (state.loading) return <Loader rows={4} />;
  if (state.error) return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{state.error}</div>;
  if (!state.data) return <EmptyState message="No dashboard data found." />;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">Live Overview</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{state.hierarchy?.role === "DGP" ? "DGP State Command Center" : "Command Dashboard"}</h1>
        <p className="mt-2 text-sm text-zinc-400">{state.data.jurisdiction?.level || state.hierarchy?.jurisdiction?.level}: {state.data.jurisdiction?.label || state.hierarchy?.jurisdiction?.label}</p>
      </div>
      <StatCards dashboard={state.data} />
      <HierarchyCommandPanel overview={state.hierarchy} />
      <CrimeChart dashboard={state.data} />
      <RecentActivity logs={state.data.latestAuditLogs || []} />
    </section>
  );
};

const OfficerDashboard = ({ user }) => {
  const [state, setState] = useState({ complaints: [], error: "", firs: [], hierarchy: null, loading: true });

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getFirs({ limit: 8 }),
      getComplaints({ limit: 8 }),
      getHierarchyOverview(),
    ])
      .then(([firResponse, complaintResponse, hierarchyResponse]) => {
        if (!mounted) return;
        setState({
          complaints: complaintResponse.data.data || [],
          error: "",
          firs: firResponse.data.data || [],
          hierarchy: hierarchyResponse.data.data,
          loading: false,
        });
      })
      .catch((err) =>
        mounted &&
        setState({
          complaints: [],
          error: err.response?.data?.message || "Unable to load officer dashboard.",
          firs: [],
          hierarchy: null,
          loading: false,
        })
      );
    return () => {
      mounted = false;
    };
  }, []);

  const intelligence = useMemo(() => {
    const openFirs = state.firs.filter((fir) => ["open", "investigating"].includes(String(fir.status).toLowerCase())).length;
    const pendingComplaints = state.complaints.filter((complaint) => ["PENDING", "UNDER_REVIEW"].includes(complaint.status)).length;
    const highPriority = [
      ...state.firs.filter((fir) => String(fir.priority).toLowerCase() === "high"),
      ...state.complaints.filter((complaint) => complaint.priority === "HIGH"),
    ].length;

    return {
      openFirs,
      pendingComplaints,
      highPriority,
      totalWorkItems: state.firs.length + state.complaints.length,
    };
  }, [state.complaints, state.firs]);

  if (state.loading) return <Loader rows={4} />;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">{roleTitle(user?.role)}</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">{dashboardTitle(user?.role)}</h1>
        <p className="mt-2 text-sm text-zinc-400">{state.hierarchy?.jurisdiction?.level}: {state.hierarchy?.jurisdiction?.label}</p>
      </div>

      {state.error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{state.error}</div>}

      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Open FIRs" value={intelligence.openFirs} />
        <Metric label="Pending Complaints" value={intelligence.pendingComplaints} />
        <Metric label="High Priority" value={intelligence.highPriority} />
        <Metric label="Visible Work Items" value={intelligence.totalWorkItems} />
      </div>

      <HierarchyCommandPanel overview={state.hierarchy} />

      <div className="grid gap-4 xl:grid-cols-2">
        <WorkPanel
          empty="No FIRs visible for your role."
          items={state.firs}
          title="Recent FIR Intelligence"
          render={(fir) => (
            <>
              <p className="font-medium text-white">{fir.title || fir.fir_number || "FIR"}</p>
              <p className="mt-1 text-xs text-zinc-500">{fir.status} / {fir.priority || "priority not set"}</p>
            </>
          )}
        />
        <WorkPanel
          empty="No complaints visible for your role."
          items={state.complaints}
          title="Complaint Queue"
          render={(complaint) => (
            <>
              <p className="font-medium text-white">{complaint.title || "Complaint"}</p>
              <p className="mt-1 text-xs text-zinc-500">{complaint.status} / {complaint.priority || "priority not set"}</p>
            </>
          )}
        />
      </div>
    </section>
  );
};

const Metric = ({ label, value }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-4">
    <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
  </article>
);

const roleTitle = (role) => ({
  SP: "District Operations",
  INSPECTOR: "Station Command",
  CONSTABLE: "Execution Desk",
}[role] || "Operational Access");

const dashboardTitle = (role) => ({
  SP: "SP District Intelligence Dashboard",
  INSPECTOR: "Inspector Station Operations Dashboard",
  CONSTABLE: "Constable Assigned Task Dashboard",
}[role] || `${role || "Officer"} Dashboard`);

const HierarchyCommandPanel = ({ overview }) => {
  if (!overview) return null;
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-lg border border-white/10 bg-police-panel p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-police-accent">Authority Scope</p>
        <h2 className="mt-2 text-xl font-semibold text-white">{overview.jurisdiction?.label}</h2>
        <p className="mt-1 text-sm text-zinc-500">{overview.jurisdiction?.level}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(overview.capabilities || []).map((capability) => (
            <span className="rounded-full border border-white/10 bg-police-bg px-3 py-1 text-xs text-zinc-300" key={capability}>{capability}</span>
          ))}
        </div>
      </article>

      <article className="rounded-lg border border-white/10 bg-police-panel p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-police-accent">Jurisdiction Load</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <MiniBreakdown title="FIR Status" items={overview.firStatus} labelKey="status" />
          <MiniBreakdown title="SOS Status" items={overview.sosStatus} labelKey="status" />
          <MiniBreakdown title="Patrol Coverage" items={overview.patrolStatus} labelKey="status" />
        </div>
      </article>
    </div>
  );
};

const MiniBreakdown = ({ items = [], labelKey, title }) => (
  <div className="rounded-md bg-police-bg p-3">
    <p className="text-xs uppercase tracking-wide text-zinc-500">{title}</p>
    <div className="mt-2 space-y-1">
      {items.length ? items.map((item) => (
        <div className="flex items-center justify-between text-sm" key={item[labelKey]}>
          <span className="text-zinc-400">{item[labelKey]}</span>
          <span className="font-semibold text-white">{item.count}</span>
        </div>
      )) : <p className="text-sm text-zinc-600">No data</p>}
    </div>
  </div>
);

const WorkPanel = ({ empty, items, render, title }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-4">
    <h2 className="text-lg font-semibold text-white">{title}</h2>
    <div className="mt-3 space-y-2">
      {items.length ? (
        items.map((item) => (
          <div className="rounded-md bg-police-bg p-3" key={item._id || item.id}>
            {render(item)}
          </div>
        ))
      ) : (
        <p className="rounded-md bg-police-bg p-3 text-sm text-zinc-400">{empty}</p>
      )}
    </div>
  </article>
);

export default Dashboard;
