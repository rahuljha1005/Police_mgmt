import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../services/api";

const initialForm = {
  title: "",
  description: "",
  location: {
    address: "",
    latitude: "",
    longitude: "",
  },
  crime_type_id: "",
  police_station_id: "",
  assigned_officer_id: "",
  priority: "medium",
};

const statuses = ["open", "investigating", "closed", "archived"];

const FirsPage = () => {
  const [firs, setFirs] = useState([]);
  const [reference, setReference] = useState({ policeStations: [], crimeTypes: [], officers: [] });
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: "", police_station_id: "", assigned_officer_id: "", crime_type_id: "" });
  const [form, setForm] = useState(initialForm);
  const [assign, setAssign] = useState({ id: "", assigned_officer_id: "" });
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
      const [firsResponse, referenceResponse] = await Promise.all([
        api.get("/firs", { params: query }),
        api.get("/admin/reference-data"),
      ]);
      setFirs(firsResponse.data.data);
      setPagination(firsResponse.data.pagination);
      setReference(referenceResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load FIRs.");
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

  const updateLocation = (event) => {
    setForm((current) => ({
      ...current,
      location: {
        ...current.location,
        [event.target.name]: event.target.value,
      },
    }));
  };

  const stationOfficers = (stationId) =>
    reference.officers.filter((officer) => !stationId || String(officer.police_station_id) === String(stationId));

  const createFir = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/firs", {
        ...form,
        location: {
          ...form.location,
          latitude: Number(form.location.latitude),
          longitude: Number(form.location.longitude),
        },
      });
      setForm(initialForm);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create FIR.");
    }
  };

  const assignOfficer = async (event) => {
    event.preventDefault();
    if (!assign.id) return;
    setError("");
    try {
      await api.patch(`/firs/${assign.id}/assign`, { assigned_officer_id: assign.assigned_officer_id });
      setAssign({ id: "", assigned_officer_id: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to assign officer.");
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">Case Registry</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">FIR Management</h1>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <article className="rounded-lg border border-white/10 bg-police-panel">
          <div className="grid gap-3 border-b border-white/10 p-4 md:grid-cols-4">
            <select className="rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="status" onChange={updateFilter} value={filters.status}>
              <option value="">All status</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <select className="rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="police_station_id" onChange={updateFilter} value={filters.police_station_id}>
              <option value="">All stations</option>
              {reference.policeStations.map((station) => <option key={station._id} value={station._id}>{station.name}</option>)}
            </select>
            <select className="rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="crime_type_id" onChange={updateFilter} value={filters.crime_type_id}>
              <option value="">All crime types</option>
              {reference.crimeTypes.map((crimeType) => <option key={crimeType._id} value={crimeType._id}>{crimeType.name}</option>)}
            </select>
            <select className="rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="assigned_officer_id" onChange={updateFilter} value={filters.assigned_officer_id}>
              <option value="">All officers</option>
              {reference.officers.map((officer) => <option key={officer._id} value={officer._id}>{officer.name}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">FIR</th>
                  <th className="px-4 py-3">Crime</th>
                  <th className="px-4 py-3">Station</th>
                  <th className="px-4 py-3">Officer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {firs.map((fir) => (
                  <tr key={fir._id}>
                    <td className="px-4 py-3">
                      <Link className="font-medium text-white hover:text-police-accent" to={`/firs/${fir._id}`}>{fir.title}</Link>
                      <p className="text-xs text-zinc-400">{fir.fir_number}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{fir.crime_type_id?.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{fir.police_station_id?.name}</td>
                    <td className="px-4 py-3 text-zinc-300">{fir.assigned_officer_id?.name}</td>
                    <td className="px-4 py-3"><StatusBadge value={fir.status} /></td>
                    <td className="px-4 py-3">
                      <button className="rounded-md border border-police-primary px-3 py-2 text-xs font-semibold text-police-accent" onClick={() => setAssign({ id: fir._id, assigned_officer_id: fir.assigned_officer_id?._id || "" })} type="button">Assign</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && firs.length === 0 && <div className="p-4"><EmptyState message="No FIRs found." /></div>}
          <Pagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
        </article>

        <div className="space-y-4">
          <form className="rounded-lg border border-white/10 bg-police-panel p-4" onSubmit={createFir}>
            <h2 className="text-lg font-semibold text-white">Create FIR</h2>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="title" onChange={updateForm} placeholder="Title" value={form.title} />
              <textarea className="min-h-28 w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="description" onChange={updateForm} placeholder="Description" value={form.description} />
              <input className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="address" onChange={updateLocation} placeholder="Crime location address" value={form.location.address} />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="latitude" onChange={updateLocation} placeholder="Latitude" type="number" value={form.location.latitude} />
                <input className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="longitude" onChange={updateLocation} placeholder="Longitude" type="number" value={form.location.longitude} />
              </div>
              <select className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="crime_type_id" onChange={updateForm} value={form.crime_type_id}>
                <option value="">Crime type</option>
                {reference.crimeTypes.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
              <select className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="police_station_id" onChange={updateForm} value={form.police_station_id}>
                <option value="">Police station</option>
                {reference.policeStations.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
              <select className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="assigned_officer_id" onChange={updateForm} value={form.assigned_officer_id}>
                <option value="">Assigned officer</option>
                {stationOfficers(form.police_station_id).map((item) => <option key={item._id} value={item._id}>{item.name} - {item.role}</option>)}
              </select>
              <select className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="priority" onChange={updateForm} value={form.priority}>
                {["low", "medium", "high", "critical"].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <button className="w-full rounded-md bg-police-primary px-4 py-2 font-semibold text-white hover:bg-police-accent hover:text-police-bg" type="submit">Create FIR</button>
            </div>
          </form>

          <form className="rounded-lg border border-white/10 bg-police-panel p-4" onSubmit={assignOfficer}>
            <h2 className="text-lg font-semibold text-white">Assign Officer</h2>
            <select className="mt-4 w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" onChange={(event) => setAssign((current) => ({ ...current, assigned_officer_id: event.target.value }))} value={assign.assigned_officer_id}>
              <option value="">Select officer</option>
              {reference.officers.map((item) => <option key={item._id} value={item._id}>{item.name} - {item.role}</option>)}
            </select>
            <button className="mt-3 w-full rounded-md border border-police-primary px-4 py-2 font-semibold text-police-accent disabled:opacity-40" disabled={!assign.id} type="submit">Save Assignment</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default FirsPage;
