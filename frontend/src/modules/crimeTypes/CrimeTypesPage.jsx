import { useEffect, useState } from "react";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../services/api";

const CrimeTypesPage = () => {
  const [crimeTypes, setCrimeTypes] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", severity: "medium" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadCrimeTypes = async () => {
    setError("");
    setIsLoading(true);
    try {
      const response = await api.get("/admin/crime-types");
      setCrimeTypes(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load crime types.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCrimeTypes();
  }, []);

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const createCrimeType = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/admin/crime-types", form);
      setForm({ name: "", description: "", severity: "medium" });
      loadCrimeTypes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create crime type.");
    }
  };

  const deleteCrimeType = async (id) => {
    setError("");
    try {
      await api.delete(`/admin/crime-types/${id}`);
      loadCrimeTypes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete crime type.");
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">Classification</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Crime Types</h1>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <article className="rounded-lg border border-white/10 bg-police-panel p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {crimeTypes.map((crimeType) => (
              <div className="rounded-lg border border-white/10 bg-police-bg p-4" key={crimeType._id}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-white">{crimeType.name}</h2>
                  <StatusBadge value={crimeType.severity} />
                </div>
                <p className="mt-3 min-h-10 text-sm text-zinc-400">{crimeType.description || "No description"}</p>
                <button className="mt-4 rounded-md border border-red-500/40 px-3 py-2 text-xs font-semibold text-red-200" onClick={() => deleteCrimeType(crimeType._id)} type="button">Delete</button>
              </div>
            ))}
          </div>
          {!isLoading && crimeTypes.length === 0 && <EmptyState message="No crime types found." />}
        </article>

        <form className="rounded-lg border border-white/10 bg-police-panel p-4" onSubmit={createCrimeType}>
          <h2 className="text-lg font-semibold text-white">Create Crime Type</h2>
          <div className="mt-4 space-y-3">
            <input className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="name" onChange={updateForm} placeholder="Name" value={form.name} />
            <textarea className="min-h-28 w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="description" onChange={updateForm} placeholder="Description" value={form.description} />
            <select className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="severity" onChange={updateForm} value={form.severity}>
              {["low", "medium", "high", "critical"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <button className="w-full rounded-md bg-police-primary px-4 py-2 font-semibold text-white hover:bg-police-accent hover:text-police-bg" type="submit">Create</button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CrimeTypesPage;
