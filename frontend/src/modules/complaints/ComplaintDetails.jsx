import { Link, useParams } from "react-router-dom";
import Badge from "../../components/ui/Badge";
import Loader from "../../components/ui/Loader";
import { useFetch } from "../../hooks/useFetch";
import { getComplaint } from "../../services/complaint.api";
import { formatDate } from "../../utils/formatDate";

const Detail = ({ label, value }) => <div className="rounded-md bg-police-bg p-4"><p className="text-xs font-semibold uppercase text-zinc-500">{label}</p><p className="mt-2 text-sm text-zinc-200">{value || "N/A"}</p></div>;

const ComplaintDetails = () => {
  const { id } = useParams();
  const { data: complaint, error, loading } = useFetch(() => getComplaint(id), [id]);
  if (loading) return <Loader rows={3} />;
  if (error) return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>;

  return (
    <section className="space-y-6">
      <Link className="text-sm font-semibold text-police-accent hover:text-white" to="/complaints">Back to Complaints</Link>
      <article className="rounded-lg border border-white/10 bg-police-panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-sm font-semibold uppercase text-police-accent">Complaint</p><h1 className="mt-2 text-3xl font-semibold text-white">{complaint.title}</h1></div>
          <Badge value={complaint.status} />
        </div>
        <p className="mt-5 text-sm leading-6 text-zinc-300">{complaint.description}</p>
      </article>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Detail label="Civilian" value={complaint.civilian_id?.name} />
        <Detail label="Phone" value={complaint.civilian_id?.phone} />
        <Detail label="Station" value={complaint.police_station_id?.name} />
        <Detail label="Assigned Officer" value={complaint.assigned_officer_id?.name} />
        <Detail label="Priority" value={complaint.priority} />
        <Detail label="Location" value={complaint.complaint_location?.address} />
        <Detail label="Created" value={formatDate(complaint.createdAt)} />
        <Detail label="Linked FIR" value={complaint.fir_id?.fir_number} />
      </div>
    </section>
  );
};

export default ComplaintDetails;
