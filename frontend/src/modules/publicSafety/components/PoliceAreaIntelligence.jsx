import { useEffect, useMemo, useState } from "react";
import Loader from "../../../components/ui/Loader";
import { useAuth } from "../../../hooks/useAuth";
import { getComplaints } from "../../../services/complaint.api";
import { getFirs } from "../../../services/fir.api";

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const stationName = (item) => item?.police_station_id?.name || item?.police_station_id?.zone || "Unassigned area";
const stationId = (item) => normalizeId(item?.police_station_id);

const PoliceAreaIntelligence = () => {
  const { user } = useAuth();
  const [state, setState] = useState({ complaints: [], error: "", firs: [], loading: true });

  useEffect(() => {
    let mounted = true;
    Promise.all([getFirs({ page: 1, limit: 100 }), getComplaints({ page: 1, limit: 100 })])
      .then(([firResponse, complaintResponse]) => {
        if (!mounted) return;
        setState({
          complaints: complaintResponse.data.data || [],
          error: "",
          firs: firResponse.data.data || [],
          loading: false,
        });
      })
      .catch((err) =>
        mounted &&
        setState({
          complaints: [],
          error: err.response?.data?.message || "Unable to load area intelligence.",
          firs: [],
          loading: false,
        })
      );
    return () => {
      mounted = false;
    };
  }, []);

  const intelligence = useMemo(() => {
    const userStationId = normalizeId(user?.police_station_id);
    const hasStationScope = Boolean(userStationId);
    const localFirs = hasStationScope ? state.firs.filter((fir) => stationId(fir) === userStationId) : state.firs;
    const localComplaints = hasStationScope ? state.complaints.filter((complaint) => stationId(complaint) === userStationId) : state.complaints;
    const nearbyFirs = hasStationScope ? state.firs.filter((fir) => stationId(fir) !== userStationId) : [];
    const nearbyComplaints = hasStationScope ? state.complaints.filter((complaint) => stationId(complaint) !== userStationId) : [];
    const localCrimeTypes = countBy(localFirs, (fir) => fir.crime_type_id?.name || "Unclassified");
    const nearbyAreas = rankAreas([...nearbyFirs, ...nearbyComplaints]);
    const highPriorityLocal = [
      ...localFirs.filter((fir) => ["high", "critical"].includes(String(fir.priority).toLowerCase())),
      ...localComplaints.filter((complaint) => complaint.priority === "HIGH"),
    ].length;
    const openLocal = localFirs.filter((fir) => ["open", "investigating"].includes(String(fir.status).toLowerCase())).length;
    const pendingComplaints = localComplaints.filter((complaint) => ["PENDING", "UNDER_REVIEW"].includes(complaint.status)).length;

    return {
      hasStationScope,
      highPriorityLocal,
      localComplaints,
      localCrimeTypes,
      localFirs,
      nearbyAreas,
      nearbyComplaints,
      nearbyFirs,
      openLocal,
      pendingComplaints,
    };
  }, [state.complaints, state.firs, user?.police_station_id]);

  if (state.loading) return <Loader rows={3} />;

  return (
    <article className="rounded-lg border border-white/10 bg-police-panel p-4">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-police-accent">Officer area intelligence</p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {intelligence.hasStationScope ? "My Area and Nearby Crime/Safety Analysis" : "Command-Wide Area Crime/Safety Analysis"}
          </h2>
        </div>
        <p className="text-xs text-zinc-500">Role-scoped from FIR and complaint records visible to this officer</p>
      </div>

      {state.error && <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{state.error}</div>}

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Metric label="Local FIRs" value={intelligence.localFirs.length} />
        <Metric label="Open Local FIRs" value={intelligence.openLocal} />
        <Metric label="Pending Complaints" value={intelligence.pendingComplaints} />
        <Metric label="High Priority Signals" value={intelligence.highPriorityLocal} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel title="Dominant Local Crime Types">
          <div className="space-y-2">
            {intelligence.localCrimeTypes.length ? intelligence.localCrimeTypes.slice(0, 6).map((item) => (
              <RankRow detail={`${item.count} FIRs`} key={item.label} label={item.label} value={item.count} />
            )) : <Empty text="No local crime-type records visible." />}
          </div>
        </Panel>

        <Panel title="Nearby Area Pressure">
          <div className="space-y-2">
            {intelligence.nearbyAreas.length ? intelligence.nearbyAreas.slice(0, 6).map((item) => (
              <RankRow detail={`${item.count} visible records`} key={item.label} label={item.label} value={item.count} />
            )) : <Empty text="No nearby-area records visible for this role." />}
          </div>
        </Panel>

        <Panel title="Safety Interpretation">
          <div className="space-y-3 text-sm leading-6 text-zinc-300">
            <p>
              {intelligence.highPriorityLocal > 0
                ? "Local area has active high-priority signals. Patrol attention and complaint triage should stay elevated."
                : "No high-priority local signal is visible in the current role scope."}
            </p>
            <p>
              {intelligence.nearbyAreas.length
                ? `Nearby pressure is strongest around ${intelligence.nearbyAreas[0].label}, useful for cross-area watch coordination.`
                : "Nearby area comparison will populate as FIR/complaint records become visible."}
            </p>
            <p className="text-zinc-500">
              This section is officer-scoped and complements the national choropleth map with operational locality awareness.
            </p>
          </div>
        </Panel>
      </div>
    </article>
  );
};

const countBy = (items, getter) =>
  Object.entries(items.reduce((acc, item) => {
    const label = getter(item);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {}))
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

const rankAreas = (items) => countBy(items, stationName);

const Metric = ({ label, value }) => (
  <div className="rounded-md bg-police-bg p-3">
    <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
  </div>
);

const Panel = ({ children, title }) => (
  <section className="rounded-md bg-police-bg p-3">
    <h3 className="text-sm font-semibold text-white">{title}</h3>
    <div className="mt-3">{children}</div>
  </section>
);

const RankRow = ({ detail, label, value }) => (
  <div className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-white/5 bg-black/15 px-3 py-2">
    <div>
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-xs text-zinc-500">{detail}</p>
    </div>
    <p className="text-sm font-semibold text-police-accent">{value}</p>
  </div>
);

const Empty = ({ text }) => <p className="rounded-md border border-white/5 bg-black/15 p-3 text-sm text-zinc-500">{text}</p>;

export default PoliceAreaIntelligence;
