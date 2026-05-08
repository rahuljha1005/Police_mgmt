import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../services/api";

const DetailRow = ({ label, value }) => (
  <div className="rounded-md bg-police-bg p-4">
    <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
    <p className="mt-2 text-sm text-zinc-200">{value || "N/A"}</p>
  </div>
);

const FirDetailPage = () => {
  const { id } = useParams();
  const [fir, setFir] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFir = async () => {
      try {
        const response = await api.get(`/firs/${id}`);
        setFir(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load FIR.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFir();
  }, [id]);

  if (isLoading) return <div className="h-40 animate-pulse rounded-lg bg-police-panel" />;
  if (error) return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>;

  return (
    <section className="space-y-6">
      <Link className="text-sm font-semibold text-police-accent hover:text-white" to="/firs">
        Back to FIRs
      </Link>

      <article className="rounded-lg border border-white/10 bg-police-panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-police-accent">{fir.fir_number}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{fir.title}</h1>
          </div>
          <StatusBadge value={fir.status} />
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{fir.description}</p>
      </article>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailRow label="Crime Type" value={fir.crime_type_id?.name} />
        <DetailRow label="Priority" value={fir.priority} />
        <DetailRow label="Police Station" value={fir.police_station_id?.name} />
        <DetailRow label="Assigned Officer" value={fir.assigned_officer_id?.name} />
        <DetailRow label="Created By" value={fir.created_by?.name} />
        <DetailRow label="Created At" value={new Date(fir.createdAt).toLocaleString()} />
        <DetailRow label="Station Zone" value={fir.police_station_id?.zone} />
        <DetailRow label="Officer Role" value={fir.assigned_officer_id?.role} />
      </div>
    </section>
  );
};

export default FirDetailPage;
