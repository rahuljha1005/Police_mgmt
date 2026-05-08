import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Loader from "../../components/ui/Loader";
import Pagination from "../../components/ui/Pagination";
import { assignFirOfficer, createFir, getFirs } from "../../services/fir.api";
import { getReferenceData } from "../../services/admin.api";
import AssignOfficerModal from "./components/AssignOfficerModal";
import CreateFirModal from "./components/CreateFirModal";
import FirFilters from "./components/FirFilters";
import FirTable from "./components/FirTable";

const Firs = () => {
  const [firs, setFirs] = useState([]);
  const [reference, setReference] = useState({ policeStations: [], crimeTypes: [], officers: [] });
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: "", police_station_id: "", assigned_officer_id: "", crime_type_id: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [assignFir, setAssignFir] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const params = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), [filters]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [firResponse, referenceResponse] = await Promise.all([getFirs(params), getReferenceData()]);
      setFirs(firResponse.data.data);
      setPagination(firResponse.data.pagination);
      setReference(referenceResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load FIRs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params]);
  const updateFilter = (event) => setFilters((current) => ({ ...current, page: 1, [event.target.name]: event.target.value }));
  const createNewFir = async (payload) => { await createFir(payload); setFeedback("FIR created."); setCreateOpen(false); load(); };
  const saveAssignment = async (id, officerId) => { await assignFirOfficer(id, officerId); setFeedback("Officer assigned."); setAssignFir(null); load(); };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold uppercase text-police-accent">Case Registry</p><h1 className="mt-2 text-3xl font-semibold text-white">FIR Management</h1></div>
        <Button onClick={() => setCreateOpen(true)}>Create FIR</Button>
      </div>
      {feedback && <div className="rounded-lg border border-police-accent/30 bg-police-primary/20 p-4 text-sm text-police-accent">{feedback}</div>}
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      <article className="rounded-lg border border-white/10 bg-police-panel">
        <FirFilters filters={filters} onChange={updateFilter} reference={reference} />
        {loading ? <div className="p-4"><Loader rows={3} /></div> : firs.length ? <FirTable firs={firs} onAssign={setAssignFir} /> : <div className="p-4"><EmptyState message="No FIRs found." /></div>}
        <Pagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
      </article>
      <CreateFirModal onClose={() => setCreateOpen(false)} onSubmit={createNewFir} open={createOpen} reference={reference} />
      <AssignOfficerModal fir={assignFir} officers={reference.officers} onClose={() => setAssignFir(null)} onSubmit={saveAssignment} />
    </section>
  );
};

export default Firs;
