import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Input, { Select, Textarea } from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import { useAuth } from "../../hooks/useAuth";
import {
  escalateSos,
  getPoliceSos,
  getSosAnalytics,
  markSosFalseAlert,
  markSosOnScene,
  respondSos,
  resolveSos,
} from "../../services/sos.api";

const priorityClass = {
  LOW: "border-emerald-500/30 text-emerald-200",
  MEDIUM: "border-yellow-500/30 text-yellow-200",
  HIGH: "border-orange-500/30 text-orange-200",
  CRITICAL: "border-red-500/40 text-red-200",
};

const activeStatuses = ["PENDING", "RESPONDING", "ON_SCENE", "ESCALATED"];

const PoliceEmergencies = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([getPoliceSos({ limit: 80 }), getSosAnalytics()])
      .then(([sosResponse, analyticsResponse]) => {
        const nextItems = sosResponse.data.data || [];
        setItems(nextItems);
        setAnalytics(analyticsResponse.data.data);
        setSelected((current) => nextItems.find((item) => item._id === current?._id) || nextItems[0] || null);
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load emergencies."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => ({
    active: items.filter((item) => activeStatuses.includes(item.status)).length,
    pending: items.filter((item) => item.status === "PENDING").length,
    critical: items.filter((item) => item.priority === "CRITICAL").length,
    escalated: items.filter((item) => item.status === "ESCALATED").length,
  }), [items]);

  const runAction = async (action) => {
    if (!selected) return;
    try {
      await action(selected._id);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update SOS incident.");
    }
  };

  if (loading) return <Loader rows={6} />;

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-police-accent">Emergency Dispatch</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">SOS Incident Command</h1>
          <p className="mt-2 text-sm text-zinc-400">Operational lifecycle from SOS creation through response, on-scene action, resolution, and FIR conversion.</p>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}

      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Active Incidents" value={counts.active} />
        <Stat label="Pending Dispatch" value={counts.pending} />
        <Stat label="Critical" value={counts.critical} />
        <Stat label="Escalated" value={counts.escalated} />
      </div>

      <ResponseAnalytics analytics={analytics} />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-3">
          {items.map((item) => (
            <SOSCard item={item} key={item._id} onSelect={setSelected} selected={selected?._id === item._id} />
          ))}
          {!items.length && <div className="rounded-lg border border-white/10 bg-police-panel p-4 text-sm text-zinc-400">No SOS incidents found.</div>}
        </section>

        <section className="space-y-4">
          <DispatchPanel
            item={selected}
            role={user?.role}
            onEscalate={() => setModal("ESCALATE")}
            onFalseAlert={() => setModal("FALSE_ALERT")}
            onOnScene={() => runAction(markSosOnScene)}
            onResolve={() => setModal("RESOLVE")}
            onRespond={() => runAction(respondSos)}
          />
          <SOSStatusTimeline item={selected} />
        </section>
      </div>

      {modal === "RESOLVE" && selected && <ResolveIncidentModal item={selected} onClose={() => setModal(null)} onDone={load} />}
      {modal === "ESCALATE" && selected && <EscalationModal item={selected} onClose={() => setModal(null)} onDone={load} />}
      {modal === "FALSE_ALERT" && selected && <FalseAlertModal item={selected} onClose={() => setModal(null)} onDone={load} />}
    </section>
  );
};

const Stat = ({ label, value }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-4">
    <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
  </article>
);

const SOSCard = ({ item, onSelect, selected }) => (
  <button
    className={`w-full rounded-lg border bg-police-panel p-4 text-left transition hover:border-police-accent/60 ${selected ? "border-police-accent/70" : "border-white/10"}`}
    onClick={() => onSelect(item)}
    type="button"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-white">{item.emergencyType}</p>
        <p className="mt-1 text-xs text-zinc-500">{item.location?.address}</p>
      </div>
      <span className={`rounded-full border px-2 py-1 text-xs ${priorityClass[item.priority]}`}>{item.priority}</span>
    </div>
    <div className="mt-3 flex flex-wrap gap-2 text-xs">
      <span className="rounded-full bg-police-bg px-2 py-1 text-zinc-300">{item.status}</span>
      <span className="rounded-full bg-police-bg px-2 py-1 text-zinc-400">{item.assigned_officer_id?.name || "Officer not assigned"}</span>
      <span className="rounded-full bg-police-bg px-2 py-1 text-zinc-400">{item.assigned_patrol_id?.name || "No patrol"}</span>
    </div>
  </button>
);

const DispatchPanel = ({ item, onEscalate, onFalseAlert, onOnScene, onResolve, onRespond, role }) => {
  if (!item) return <div className="rounded-lg border border-white/10 bg-police-panel p-4 text-zinc-400">Select an SOS incident.</div>;
  const canRespond = ["SP", "INSPECTOR", "CONSTABLE"].includes(role);
  const canFieldAction = ["INSPECTOR", "CONSTABLE"].includes(role);
  const canCloseAsFalse = ["SP", "INSPECTOR"].includes(role);
  const canEscalate = ["DGP", "SP", "INSPECTOR", "CONSTABLE"].includes(role);
  return (
    <article className="rounded-lg border border-white/10 bg-police-panel p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-police-accent">Dispatch Control</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{item.emergencyType} / {item.status}</h2>
          <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs ${priorityClass[item.priority]}`}>{item.priority}</span>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        <Button disabled={!canRespond || (item.status !== "PENDING" && item.status !== "ESCALATED")} onClick={onRespond} variant="outline">Respond</Button>
        <Button disabled={!canFieldAction || (item.status !== "RESPONDING" && item.status !== "ESCALATED")} onClick={onOnScene} variant="outline">Mark On Scene</Button>
        <Button disabled={!canFieldAction || (item.status !== "ON_SCENE" && item.status !== "ESCALATED")} onClick={onResolve}>Resolve Incident</Button>
        <Button disabled={!canEscalate || ["RESOLVED", "FALSE_ALERT", "REJECTED"].includes(item.status)} onClick={onEscalate} variant="outline">Escalate</Button>
        <Button disabled={!canCloseAsFalse || ["RESOLVED", "FALSE_ALERT", "REJECTED"].includes(item.status)} onClick={onFalseAlert} variant="danger">False Alert</Button>
      </div>
    </article>
  );
};

const SOSStatusTimeline = ({ item }) => (
  <article className="rounded-lg border border-white/10 bg-police-panel p-4">
    <h2 className="text-lg font-semibold text-white">Incident Timeline</h2>
    <div className="mt-4 space-y-3">
      {(item?.incidentTimeline || []).length ? item.incidentTimeline.map((entry, index) => (
        <div className="border-l border-police-accent/40 pl-4" key={`${entry.action}-${index}`}>
          <p className="text-sm font-semibold text-white">{entry.action}</p>
          <p className="mt-1 text-xs text-zinc-500">{entry.officerName || entry.officer_id?.name || "System"} / {new Date(entry.createdAt).toLocaleString()}</p>
          {entry.notes && <p className="mt-1 text-sm text-zinc-300">{entry.notes}</p>}
        </div>
      )) : <p className="text-sm text-zinc-500">No timeline entries yet.</p>}
    </div>
  </article>
);

const ResponseAnalytics = ({ analytics }) => (
  <div className="grid gap-3 md:grid-cols-4">
    <Stat label="Avg Response Min" value={analytics?.averageResponseMinutes ?? 0} />
    <Stat label="Avg Resolution Min" value={analytics?.averageResolutionMinutes ?? 0} />
    <Stat label="Patrol Utilization" value={analytics?.patrolUtilization ?? 0} />
    <Stat label="Escalation Count" value={analytics?.escalated ?? 0} />
    {(analytics?.districtLoad || []).slice(0, 4).map((item) => (
      <Stat key={item.district} label={`${item.district} Load`} value={item.count} />
    ))}
  </div>
);

const ResolveIncidentModal = ({ item, onClose, onDone }) => {
  const [form, setForm] = useState({ incidentSummary: "", actionTaken: "", injuriesReported: false, arrestsMade: false, firRequired: false, additionalNotes: "" });
  return <IncidentModal title="Resolve Incident" onClose={onClose} onSubmit={() => resolveSos(item._id, form).then(() => { onClose(); onDone(); })}>
    <Textarea label="Incident Summary" name="incidentSummary" onChange={(e) => setForm({ ...form, incidentSummary: e.target.value })} value={form.incidentSummary} />
    <Textarea label="Action Taken" name="actionTaken" onChange={(e) => setForm({ ...form, actionTaken: e.target.value })} value={form.actionTaken} />
    <div className="grid gap-3 md:grid-cols-3">
      <Toggle checked={form.injuriesReported} label="Injuries reported" onChange={(value) => setForm({ ...form, injuriesReported: value })} />
      <Toggle checked={form.arrestsMade} label="Arrests made" onChange={(value) => setForm({ ...form, arrestsMade: value })} />
      <Toggle checked={form.firRequired} label="FIR required" onChange={(value) => setForm({ ...form, firRequired: value })} />
    </div>
    <Textarea label="Additional Notes" name="additionalNotes" onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} value={form.additionalNotes} />
  </IncidentModal>;
};

const EscalationModal = ({ item, onClose, onDone }) => {
  const [form, setForm] = useState({ supportType: "BACKUP", reason: "" });
  return <IncidentModal title="Escalate Incident" onClose={onClose} onSubmit={() => escalateSos(item._id, form).then(() => { onClose(); onDone(); })}>
    <Select label="Support Type" name="supportType" onChange={(e) => setForm({ ...form, supportType: e.target.value })} value={form.supportType}>
      {["BACKUP", "MEDICAL", "FIRE", "SENIOR_OFFICER", "OTHER"].map((type) => <option key={type} value={type}>{type}</option>)}
    </Select>
    <Textarea label="Escalation Reason" name="reason" onChange={(e) => setForm({ ...form, reason: e.target.value })} value={form.reason} />
  </IncidentModal>;
};

const FalseAlertModal = ({ item, onClose, onDone }) => {
  const [reason, setReason] = useState("");
  return <IncidentModal title="Mark False Alert" onClose={onClose} onSubmit={() => markSosFalseAlert(item._id, { reason }).then(() => { onClose(); onDone(); })}>
    <Textarea label="Mandatory Reason" name="reason" onChange={(e) => setReason(e.target.value)} value={reason} />
  </IncidentModal>;
};

const IncidentModal = ({ children, onClose, onSubmit, title }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form className="w-full max-w-2xl space-y-4 rounded-lg border border-white/10 bg-police-panel p-5 shadow-2xl" onSubmit={submit}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button className="text-sm text-zinc-400 hover:text-white" onClick={onClose} type="button">Close</button>
        </div>
        {children}
        {error && <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
        <Button disabled={loading} type="submit">{loading ? "Saving..." : "Confirm Action"}</Button>
      </form>
    </div>
  );
};

const Toggle = ({ checked, label, onChange }) => (
  <label className="flex items-center gap-2 rounded-md bg-police-bg p-3 text-sm text-zinc-300">
    <input checked={checked} className="h-4 w-4 accent-police-accent" onChange={(e) => onChange(e.target.checked)} type="checkbox" />
    {label}
  </label>
);

export default PoliceEmergencies;
