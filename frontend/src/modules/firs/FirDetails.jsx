import { Link, useParams } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useFetch } from "../../hooks/useFetch";
import { getFir } from "../../services/fir.api";
import { formatDate } from "../../utils/formatDate";

const DetailCard = ({ label, value }) => <div className="rounded-md bg-police-bg p-4"><p className="text-xs font-semibold uppercase text-zinc-500">{label}</p><p className="mt-2 text-sm text-zinc-200">{value || "N/A"}</p></div>;

const FirDetails = () => {
  const { id } = useParams();
  const { data: fir, error, loading } = useFetch(() => getFir(id), [id]);
  if (loading) return <Loader rows={3} />;
  if (error) return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>;

  return (
    <section className="space-y-6">
      <Link className="text-sm font-semibold text-police-accent hover:text-white" to="/firs">Back to FIRs</Link>
      <article className="rounded-lg border border-white/10 bg-police-panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-sm font-semibold uppercase text-police-accent">{fir.fir_number}</p><h1 className="mt-2 text-3xl font-semibold text-white">{fir.title}</h1></div>
          <Badge value={fir.status} />
        </div>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{fir.description}</p>
        <Link to={`/case-timeline/${fir._id}`}><Button className="mt-5">Open Case Timeline</Button></Link>
      </article>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Crime Type" value={fir.crime_type_id?.name} />
        <DetailCard label="Police Station" value={fir.police_station_id?.name} />
        <DetailCard label="Assigned Officer" value={fir.assigned_officer_id?.name} />
        <DetailCard label="Created Date" value={formatDate(fir.createdAt)} />
        <DetailCard label="Location" value={fir.location?.address} />
        <DetailCard label="Latitude" value={fir.location?.latitude} />
        <DetailCard label="Longitude" value={fir.location?.longitude} />
        <DetailCard label="Priority" value={fir.priority} />
      </div>
    </section>
  );
};

export default FirDetails;
