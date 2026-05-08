import Badge from "../../../components/ui/Badge";
import { formatDate } from "../../../utils/formatDate";
import Button from "../../../components/ui/Button";
import EvidenceList from "./EvidenceList";

const TimelineList = ({ onUploadEvidence, updates }) => (
  <div className="space-y-4">
    {updates.map((update) => (
      <article className="rounded-lg border border-white/10 bg-police-panel p-5" key={update._id}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge value={update.updateType} />
            <h2 className="mt-3 text-lg font-semibold text-white">{update.title}</h2>
            <p className="mt-2 text-sm text-zinc-300">{update.description}</p>
          </div>
          <p className="text-sm text-zinc-500">{formatDate(update.createdAt)}</p>
        </div>
        <p className="mt-3 text-sm text-zinc-400">Officer: {update.officer_id?.name || "N/A"}</p>
        {update.updateType === "STATUS_CHANGED" && (
          <p className="mt-3 text-sm text-police-accent">{update.previousStatus} to {update.newStatus}</p>
        )}
        <EvidenceList attachments={update.attachments} />
        <Button className="mt-4" onClick={() => onUploadEvidence(update)} variant="outline">Upload Evidence</Button>
      </article>
    ))}
  </div>
);

export default TimelineList;
