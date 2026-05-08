import { Radio } from "lucide-react";

const formatTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "Unknown";

const ActivityFeed = ({ firs, complaints }) => {
  const entries = [
    ...firs.map((fir) => ({
      id: fir._id,
      type: "FIR",
      title: fir.title,
      meta: `${fir.priority} priority / ${fir.status}`,
      createdAt: fir.createdAt,
    })),
    ...complaints.map((complaint) => ({
      id: complaint._id,
      type: "Complaint",
      title: complaint.title,
      meta: `${complaint.priority} / ${complaint.status}`,
      createdAt: complaint.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 12);

  return (
    <article className="border border-[#262626] bg-[#151515]">
      <div className="flex items-center justify-between border-b border-[#262626] px-3 py-2">
        <h2 className="text-sm font-semibold text-zinc-100">Live Activity Feed</h2>
        <Radio className="h-4 w-4 animate-pulse text-[#C89B7B]" />
      </div>
      <div className="max-h-[364px] overflow-auto">
        {entries.map((entry) => (
          <div className="grid grid-cols-[12px_1fr] gap-3 border-b border-[#262626] px-3 py-2 last:border-b-0" key={`${entry.type}-${entry.id}`}>
            <span className="mt-1.5 h-2 w-2 animate-pulse rounded-full bg-[#C89B7B]" />
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-semibold text-zinc-200">{entry.title}</p>
                <span className="shrink-0 text-[10px] text-zinc-500">{formatTime(entry.createdAt)}</span>
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-zinc-500">{entry.type} / {entry.meta}</p>
            </div>
          </div>
        ))}
        {!entries.length && <p className="p-4 text-sm text-zinc-500">No live activity returned by the backend.</p>}
      </div>
    </article>
  );
};

export default ActivityFeed;
