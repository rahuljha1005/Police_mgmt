import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Button from "../../components/ui/Button";
import Input, { Select, Textarea } from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import {
  bulkTransferCases,
  getTransferAssignments,
  getTransferSuggestions,
  getTransferWorkloads,
} from "../../services/transfer.api";

const reasons = [
  "Officer Transfer",
  "Suspension",
  "Workload Redistribution",
  "Emergency Reassignment",
  "Promotion",
  "Temporary Assignment",
];

const emptySelection = { firIds: [], complaintIds: [], sosIds: [] };

const TransferDashboard = () => {
  const [workloads, setWorkloads] = useState([]);
  const [jurisdiction, setJurisdiction] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [assignments, setAssignments] = useState({ firs: [], complaints: [], sosIncidents: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [selection, setSelection] = useState(emptySelection);
  const [reason, setReason] = useState("Workload Redistribution");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadWorkloads = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getTransferWorkloads();
      setWorkloads(response.data.data.officers || []);
      setJurisdiction(response.data.data.jurisdiction);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load transfer command data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkloads();
  }, []);

  useEffect(() => {
    if (!selectedOfficerId) return;
    setSelection(emptySelection);
    setSelectedTargetId("");
    Promise.all([getTransferAssignments(selectedOfficerId), getTransferSuggestions(selectedOfficerId)])
      .then(([assignmentResponse, suggestionResponse]) => {
        setAssignments(assignmentResponse.data.data);
        setSuggestions(suggestionResponse.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Unable to load officer assignments."));
  }, [selectedOfficerId]);

  const selectedCount = selection.firIds.length + selection.complaintIds.length + selection.sosIds.length;
  const chartData = useMemo(
    () =>
      workloads.slice(0, 10).map((item) => ({
        name: item.officer.name.split(" ")[0],
        FIR: item.workload.activeFirs,
        Complaints: item.workload.pendingComplaints,
        SOS: item.workload.activeSos,
      })),
    [workloads]
  );

  const toggle = (bucket, id) => {
    setSelection((current) => ({
      ...current,
      [bucket]: current[bucket].includes(id)
        ? current[bucket].filter((item) => item !== id)
        : [...current[bucket], id],
    }));
  };

  const transfer = async () => {
    setError("");
    setFeedback("");
    setActionLoading(true);
    try {
      const response = await bulkTransferCases({
        fromOfficerId: selectedOfficerId,
        toOfficerId: selectedTargetId,
        reason,
        notes,
        ...selection,
      });
      setFeedback(`${response.data.data.totalTransferred} assignment(s) handed over successfully.`);
      setNotes("");
      setSelection(emptySelection);
      await loadWorkloads();
      if (selectedOfficerId) {
        const assignmentResponse = await getTransferAssignments(selectedOfficerId);
        setAssignments(assignmentResponse.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader rows={6} />;

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-police-accent">Operational Handover</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Case Transfer Command</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {jurisdiction?.level}: {jurisdiction?.label}. Bulk reassignment with handover notes, workload checks, and audit continuity.
          </p>
        </div>
      </div>

      {feedback && <div className="rounded-lg border border-police-accent/30 bg-police-primary/20 p-4 text-sm text-police-accent">{feedback}</div>}
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="rounded-lg border border-white/10 bg-police-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-police-accent">Officer Workload</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Redistribution Queue</h2>
            </div>
            <span className="rounded-full bg-police-bg px-3 py-1 text-xs text-zinc-400">{workloads.length} officers</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#2a201b" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={11} />
                <Tooltip contentStyle={{ background: "#17100d", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }} />
                <Bar dataKey="FIR" stackId="a" fill="#d6a15f" />
                <Bar dataKey="Complaints" stackId="a" fill="#8b5cf6" />
                <Bar dataKey="SOS" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {workloads.map((item) => (
              <button
                className={`w-full rounded-md border p-3 text-left transition ${selectedOfficerId === item.officer._id ? "border-police-accent/70 bg-police-primary/20" : "border-white/10 bg-police-bg hover:border-white/25"}`}
                key={item.officer._id}
                onClick={() => setSelectedOfficerId(item.officer._id)}
                type="button"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{item.officer.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">{item.officer.role} / {item.officer.police_station_id?.name || "No station"}</p>
                  </div>
                  <span className="rounded-full bg-black/30 px-3 py-1 text-sm font-semibold text-police-accent">{item.workload.total}</span>
                </div>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-police-panel p-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-police-accent">Transfer Selection</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Active Assignments</h2>
            </div>
            <div className="rounded-md bg-police-bg p-3 text-sm text-zinc-400">
              Selected for handover: <span className="font-semibold text-white">{selectedCount}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            <AssignmentList title="FIRs" items={assignments.firs} bucket="firIds" label={(item) => item.fir_number || item.title} selected={selection.firIds} onToggle={toggle} />
            <AssignmentList title="Complaints" items={assignments.complaints} bucket="complaintIds" label={(item) => item.title} selected={selection.complaintIds} onToggle={toggle} />
            <AssignmentList title="SOS" items={assignments.sosIncidents} bucket="sosIds" label={(item) => `${item.emergencyType} / ${item.status}`} selected={selection.sosIds} onToggle={toggle} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Select label="Suggested Replacement Officer" onChange={(event) => setSelectedTargetId(event.target.value)} value={selectedTargetId}>
                <option value="">Select replacement</option>
                {suggestions.map((item) => (
                  <option key={item.officer._id} value={item.officer._id}>
                    {item.officer.name} / {item.officer.role} / load {item.workload.total}
                  </option>
                ))}
              </Select>
              <Select label="Transfer Reason" onChange={(event) => setReason(event.target.value)} value={reason}>
                {reasons.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </div>
            <div className="space-y-3">
              <Textarea label="Operational Handover Notes" onChange={(event) => setNotes(event.target.value)} value={notes} />
              <Button disabled={!selectedTargetId || !selectedCount || notes.trim().length < 5 || actionLoading} onClick={transfer}>
                {actionLoading ? "Transferring..." : "Complete Bulk Handover"}
              </Button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

const AssignmentList = ({ bucket, items = [], label, onToggle, selected, title }) => (
  <div className="rounded-md bg-police-bg p-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</p>
    <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
      {items.length ? items.map((item) => (
        <label className="flex cursor-pointer gap-2 rounded-md bg-black/20 p-2 text-sm text-zinc-300 hover:bg-black/30" key={item._id}>
          <input checked={selected.includes(item._id)} className="mt-1 h-4 w-4 accent-police-accent" onChange={() => onToggle(bucket, item._id)} type="checkbox" />
          <span>
            <span className="block font-medium text-white">{label(item)}</span>
            <span className="text-xs text-zinc-500">{item.police_station_id?.name || item.priority || item.status}</span>
          </span>
        </label>
      )) : <p className="text-sm text-zinc-600">No active assignments.</p>}
    </div>
  </div>
);

export default TransferDashboard;
