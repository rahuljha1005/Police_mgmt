import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { Select } from "../../components/ui/Input";
import Loader from "../../components/ui/Loader";
import Pagination from "../../components/ui/Pagination";
import { changeOfficerRole, createOfficer, getOfficers, getReferenceData, verifyOfficer } from "../../services/admin.api";
import { OFFICER_STATUSES, ROLES } from "../../utils/constants";
import CreateOfficerModal from "./components/CreateOfficerModal";
import OfficerTable from "./components/OfficerTable";
import RoleChangeModal from "./components/RoleChangeModal";

const Officers = () => {
  const [officers, setOfficers] = useState([]);
  const [reference, setReference] = useState({ policeStations: [] });
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10, role: "", status: "", police_station_id: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [roleOfficer, setRoleOfficer] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), [filters]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [officerResponse, referenceResponse] = await Promise.all([getOfficers(params), getReferenceData()]);
      setOfficers(officerResponse.data.data);
      setPagination(officerResponse.data.pagination);
      setReference(referenceResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load officers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [params]);

  const updateFilter = (event) => setFilters((current) => ({ ...current, page: 1, [event.target.name]: event.target.value }));
  const createNewOfficer = async (payload) => {
    const response = await createOfficer(payload);
    setFeedback(`Officer created. Temporary password: ${response.data.data.tempPassword}`);
    setModalOpen(false);
    load();
  };

  const verify = async (id, status) => {
    await verifyOfficer(id, status);
    setFeedback("Officer verification updated.");
    load();
  };

  const saveRole = async (id, role) => {
    await changeOfficerRole(id, role);
    setFeedback("Officer role updated.");
    setRoleOfficer(null);
    load();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-police-accent">Personnel</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Officer Management</h1>
        </div>
        <Button onClick={() => setModalOpen(true)}>Create Officer</Button>
      </div>
      {feedback && <div className="rounded-lg border border-police-accent/30 bg-police-primary/20 p-4 text-sm text-police-accent">{feedback}</div>}
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      <article className="rounded-lg border border-white/10 bg-police-panel">
        <div className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-3">
          <Select name="role" onChange={updateFilter} value={filters.role}><option value="">All roles</option>{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</Select>
          <Select name="status" onChange={updateFilter} value={filters.status}><option value="">All statuses</option>{OFFICER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
          <Select name="police_station_id" onChange={updateFilter} value={filters.police_station_id}><option value="">All stations</option>{reference.policeStations.map((station) => <option key={station._id} value={station._id}>{station.name}</option>)}</Select>
        </div>
        {loading ? <div className="p-4"><Loader rows={3} /></div> : officers.length ? <OfficerTable officers={officers} onRoleChange={setRoleOfficer} onVerify={verify} /> : <div className="p-4"><EmptyState message="No officers found." /></div>}
        <Pagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
      </article>
      <CreateOfficerModal onClose={() => setModalOpen(false)} onSubmit={createNewOfficer} open={modalOpen} stations={reference.policeStations} />
      <RoleChangeModal officer={roleOfficer} onClose={() => setRoleOfficer(null)} onSubmit={saveRole} />
    </section>
  );
};

export default Officers;
