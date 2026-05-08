import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../services/api";

const roles = ["CONSTABLE", "INSPECTOR", "SP", "DGP", "ADMIN"];
const statuses = ["pending", "active", "rejected"];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  role: "CONSTABLE",
  police_station_id: "",
};

const OfficersPage = () => {
  const [officers, setOfficers] = useState([]);
  const [reference, setReference] = useState({ policeStations: [] });
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10, role: "", status: "", police_station_id: "" });
  const [form, setForm] = useState(initialForm);
  const [roleEdit, setRoleEdit] = useState({ id: "", role: "" });
  const [tempPassword, setTempPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const query = useMemo(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    return params;
  }, [filters]);

  const loadData = async () => {
    setError("");
    setIsLoading(true);
    try {
      const [officerResponse, referenceResponse] = await Promise.all([
        api.get("/admin/officers", { params: query }),
        api.get("/admin/reference-data"),
      ]);
      setOfficers(officerResponse.data.data);
      setPagination(officerResponse.data.pagination);
      setReference(referenceResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load officers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [query]);

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, page: 1, [event.target.name]: event.target.value }));
  };

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const createOfficer = async (event) => {
    event.preventDefault();
    setError("");
    setTempPassword("");
    try {
      const response = await api.post("/admin/officers", form);
      setTempPassword(response.data.data.tempPassword);
      setForm(initialForm);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create officer.");
    }
  };

  const verifyOfficer = async (id, status) => {
    setError("");
    try {
      await api.patch(`/admin/officers/${id}/verify`, { status });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to verify officer.");
    }
  };

  const updateRole = async (event) => {
    event.preventDefault();
    if (!roleEdit.id) return;
    setError("");
    try {
      await api.patch(`/admin/officers/${roleEdit.id}/role`, { role: roleEdit.role });
      setRoleEdit({ id: "", role: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update role.");
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">Personnel</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Officers</h1>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {tempPassword && (
        <div className="rounded-lg border border-police-accent/30 bg-police-primary/20 p-4 text-sm text-police-accent">
          Temporary password: <span className="font-semibold text-white">{tempPassword}</span>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <article className="rounded-lg border border-white/10 bg-police-panel">
          <div className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-4">
            <select className="rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="role" onChange={updateFilter} value={filters.role}>
              <option value="">All roles</option>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select className="rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="status" onChange={updateFilter} value={filters.status}>
              <option value="">All status</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <select className="rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="police_station_id" onChange={updateFilter} value={filters.police_station_id}>
              <option value="">All stations</option>
              {reference.policeStations.map((station) => <option key={station._id} value={station._id}>{station.name}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Officer</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Station</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {officers.map((officer) => (
                  <tr key={officer._id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{officer.name}</p>
                      <p className="text-xs text-zinc-400">{officer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{officer.role}</td>
                    <td className="px-4 py-3 text-zinc-300">{officer.police_station_id?.name || "N/A"}</td>
                    <td className="px-4 py-3"><StatusBadge value={officer.status} /></td>
                    <td className="space-x-2 px-4 py-3">
                      {officer.status === "pending" && (
                        <>
                          <button className="rounded-md bg-emerald-700 px-3 py-2 text-xs font-semibold text-white" onClick={() => verifyOfficer(officer._id, "approved")} type="button">Approve</button>
                          <button className="rounded-md bg-red-700 px-3 py-2 text-xs font-semibold text-white" onClick={() => verifyOfficer(officer._id, "rejected")} type="button">Reject</button>
                        </>
                      )}
                      <button className="rounded-md border border-police-primary px-3 py-2 text-xs font-semibold text-police-accent" onClick={() => setRoleEdit({ id: officer._id, role: officer.role })} type="button">Role</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && officers.length === 0 && <div className="p-4"><EmptyState message="No officers found." /></div>}
          <Pagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
        </article>

        <div className="space-y-4">
          <form className="rounded-lg border border-white/10 bg-police-panel p-4" onSubmit={createOfficer}>
            <h2 className="text-lg font-semibold text-white">Create Officer</h2>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="name" onChange={updateForm} placeholder="Name" value={form.name} />
              <input className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="email" onChange={updateForm} placeholder="Email" value={form.email} />
              <input className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="phone" onChange={updateForm} placeholder="10 digit phone" value={form.phone} />
              <select className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="role" onChange={updateForm} value={form.role}>
                {roles.filter((role) => role !== "ADMIN").map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <select className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="police_station_id" onChange={updateForm} value={form.police_station_id}>
                <option value="">Select station</option>
                {reference.policeStations.map((station) => <option key={station._id} value={station._id}>{station.name}</option>)}
              </select>
              <button className="w-full rounded-md bg-police-primary px-4 py-2 font-semibold text-white hover:bg-police-accent hover:text-police-bg" type="submit">Create</button>
            </div>
          </form>

          <form className="rounded-lg border border-white/10 bg-police-panel p-4" onSubmit={updateRole}>
            <h2 className="text-lg font-semibold text-white">Update Role</h2>
            <select className="mt-4 w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" onChange={(event) => setRoleEdit((current) => ({ ...current, role: event.target.value }))} value={roleEdit.role}>
              <option value="">Select role</option>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <button className="mt-3 w-full rounded-md border border-police-primary px-4 py-2 font-semibold text-police-accent disabled:opacity-40" disabled={!roleEdit.id} type="submit">Save Role</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default OfficersPage;
