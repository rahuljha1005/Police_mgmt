import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/ui/Loader";
import { getReferenceData } from "../../services/admin.api";
import { getHeatmap } from "../../services/heatmap.api";
import HeatmapFilters from "./components/HeatmapFilters";
import HeatmapView from "./components/HeatmapView";

const Heatmap = () => {
  const [points, setPoints] = useState([]);
  const [reference, setReference] = useState({ crimeTypes: [], policeStations: [] });
  const [filters, setFilters] = useState({ from: "", to: "", crime_type_id: "", zone_id: "", status: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const zones = useMemo(() => [...new Set(reference.policeStations.map((station) => station.zone).filter(Boolean))].sort(), [reference.policeStations]);
  const params = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), [filters]);

  useEffect(() => {
    getReferenceData().then((response) => setReference(response.data.data)).catch((err) => setError(err.response?.data?.message || "Unable to load filters."));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    getHeatmap(params)
      .then((response) => setPoints(response.data.data))
      .catch((err) => setError(err.response?.data?.message || "Unable to load heatmap."))
      .finally(() => setLoading(false));
  }, [params]);

  const updateFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <section className="space-y-6">
      <div><p className="text-sm font-semibold uppercase text-police-accent">Crime Analytics</p><h1 className="mt-2 text-3xl font-semibold text-white">Crime Heatmap</h1></div>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}
      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <HeatmapFilters filters={filters} onChange={updateFilter} reference={reference} zones={zones} />
          <div className="rounded-lg border border-white/10 bg-police-panel p-4"><p className="text-sm text-zinc-400">Mapped FIR coordinates</p><p className="mt-2 text-3xl font-semibold text-white">{loading ? "..." : points.length}</p></div>
        </div>
        {loading ? <Loader rows={4} /> : <HeatmapView points={points} />}
      </div>
    </section>
  );
};

export default Heatmap;
