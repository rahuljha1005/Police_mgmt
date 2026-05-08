import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../../services/api";
import HeatLayer from "./HeatLayer";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const statuses = ["open", "investigating", "closed", "archived"];

const HeatmapPage = () => {
  const [points, setPoints] = useState([]);
  const [reference, setReference] = useState({ crimeTypes: [], policeStations: [] });
  const [filters, setFilters] = useState({ from: "", to: "", crime_type_id: "", zone_id: "", status: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const zones = useMemo(
    () => [...new Set(reference.policeStations.map((station) => station.zone).filter(Boolean))].sort(),
    [reference.policeStations]
  );

  const query = useMemo(() => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    return params;
  }, [filters]);

  useEffect(() => {
    const loadReference = async () => {
      try {
        const response = await api.get("/admin/reference-data");
        setReference(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load heatmap filters.");
      }
    };

    loadReference();
  }, []);

  useEffect(() => {
    const loadHeatmap = async () => {
      setError("");
      setIsLoading(true);
      try {
        const response = await api.get("/heatmap", { params: query });
        setPoints(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load heatmap data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadHeatmap();
  }, [query]);

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-police-accent">Crime Analytics</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Crime Heatmap</h1>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-white/10 bg-police-panel p-4">
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <div className="mt-4 space-y-3">
            <label className="block text-sm text-zinc-300">
              From
              <input className="mt-2 w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="from" onChange={updateFilter} type="date" value={filters.from} />
            </label>
            <label className="block text-sm text-zinc-300">
              To
              <input className="mt-2 w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="to" onChange={updateFilter} type="date" value={filters.to} />
            </label>
            <select className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="crime_type_id" onChange={updateFilter} value={filters.crime_type_id}>
              <option value="">All crime types</option>
              {reference.crimeTypes.map((crimeType) => <option key={crimeType._id} value={crimeType._id}>{crimeType.name}</option>)}
            </select>
            <select className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="zone_id" onChange={updateFilter} value={filters.zone_id}>
              <option value="">All zones</option>
              {zones.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
            </select>
            <select className="w-full rounded-md border border-white/10 bg-police-bg px-3 py-2 text-sm" name="status" onChange={updateFilter} value={filters.status}>
              <option value="">All FIR status</option>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </div>

          <div className="mt-6 rounded-md bg-police-bg p-4">
            <p className="text-sm text-zinc-400">Mapped FIR coordinates</p>
            <p className="mt-2 text-3xl font-semibold text-white">{isLoading ? "..." : points.length}</p>
          </div>
        </aside>

        <article className="overflow-hidden rounded-lg border border-white/10 bg-police-panel">
          <div className="h-[68vh] min-h-[520px]">
            <MapContainer center={[20.5937, 78.9629]} className="h-full w-full" scrollWheelZoom zoom={5}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <HeatLayer points={points} />
              {points.map((point, index) => (
                <Marker icon={markerIcon} key={`${point.latitude}-${point.longitude}-${point.createdAt}-${index}`} position={[point.latitude, point.longitude]}>
                  <Popup>
                    <div>
                      <strong>{point.crimeType}</strong>
                      <br />
                      Status: {point.status}
                      <br />
                      Date: {new Date(point.createdAt).toLocaleDateString()}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </article>
      </div>
    </section>
  );
};

export default HeatmapPage;
