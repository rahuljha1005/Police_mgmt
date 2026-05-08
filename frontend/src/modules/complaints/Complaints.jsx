import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { Select } from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import Pagination from "../../components/ui/Pagination";
import { getReferenceData } from "../../services/admin.api";
import { assignComplaintOfficer, convertComplaintToFir, createComplaint, getComplaints, updateComplaintStatus } from "../../services/complaint.api";
import { COMPLAINT_STATUSES } from "../../utils/constants";
import ComplaintFilters from "./components/ComplaintFilters";
import ComplaintTable from "./components/ComplaintTable";
import ConvertToFirModal from "./components/ConvertToFirModal";
import CreateComplaintModal from "./components/CreateComplaintModal";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [reference, setReference] = useState({ policeStations: [], crimeTypes: [], officers: [] });
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: "", police_station_id: "", assigned_officer_id: "", priority: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [assignComplaint, setAssignComplaint] = useState(null);
  const [statusComplaint, setStatusComplaint] = useState(null);
  const [convertComplaint, setConvertComplaint] = useState(null);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const params = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), [filters]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [complaintResponse, referenceResponse] = await Promise.all([getComplaints(params), getReferenceData()]);
      setComplaints(complaintResponse.data.data);
      setPagination(complaintResponse.data.pagination);
      setReference(referenceResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params]);
  const updateFilter = (event) => setFilters((current) => ({ ...current, page: 1, [event.target.name]: event.target.value }));
  const createNewComplaint = async (payload) => { await createComplaint(payload); setFeedback("Complaint created."); setCreateOpen(false); load(); };
  const assignOfficer = async () => { await assignComplaintOfficer(assignComplaint._id, selectedOfficer); setFeedback("Officer assigned."); setAssignComplaint(null); load(); };
  const saveStatus = async () => { await updateComplaintStatus(statusComplaint._id, selectedStatus); setFeedback("Status updated."); setStatusComplaint(null); load(); };
  const convert = async (id, payload) => { await convertComplaintToFir(id, payload); setFeedback("Complaint converted to FIR."); setConvertComplaint(null); load(); };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold uppercase text-police-accent">Civilian Desk</p><h1 className="mt-2 text-3xl font-semibold text-white">Complaint Management</h1></div>
        <Button onClick={() => setCreateOpen(true)}>Create Complaint</Button>
      </div>
      {feedback && <div className="rounded-lg border border-police-accent/30 bg-police-primary/20 p-4 text-sm text-police-accent">{feedback}</div>}
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}
      <article className="rounded-lg border border-white/10 bg-police-panel">
        <ComplaintFilters filters={filters} onChange={updateFilter} reference={reference} />
        {loading ? <div className="p-4"><Loader rows={3} /></div> : complaints.length ? <ComplaintTable complaints={complaints} onAssign={(row) => { setAssignComplaint(row); setSelectedOfficer(row.assigned_officer_id?._id || ""); }} onConvert={setConvertComplaint} onStatus={(row) => { setStatusComplaint(row); setSelectedStatus(row.status); }} /> : <div className="p-4"><EmptyState message="No complaints found." /></div>}
        <Pagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
      </article>
      <CreateComplaintModal onClose={() => setCreateOpen(false)} onSubmit={createNewComplaint} open={createOpen} reference={reference} />
      <ConvertToFirModal complaint={convertComplaint} onClose={() => setConvertComplaint(null)} onSubmit={convert} reference={reference} />
      <Modal onClose={() => setAssignComplaint(null)} open={Boolean(assignComplaint)} title="Assign Complaint Officer">
        <div className="space-y-4"><Select label="Officer" onChange={(event) => setSelectedOfficer(event.target.value)} value={selectedOfficer}><option value="">Select</option>{reference.officers.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select><Button onClick={assignOfficer}>Save Assignment</Button></div>
      </Modal>
      <Modal onClose={() => setStatusComplaint(null)} open={Boolean(statusComplaint)} title="Update Complaint Status">
        <div className="space-y-4"><Select label="Status" onChange={(event) => setSelectedStatus(event.target.value)} value={selectedStatus}>{COMPLAINT_STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</Select><Button onClick={saveStatus}>Save Status</Button></div>
      </Modal>
    </section>
  );
};

export default Complaints;
