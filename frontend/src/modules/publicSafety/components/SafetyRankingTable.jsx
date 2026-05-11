import { useMemo, useState } from "react";

const badgeClass = {
  SAFE: "bg-emerald-500/15 text-emerald-200",
  MODERATE: "bg-yellow-500/15 text-yellow-200",
  RISKY: "bg-orange-500/15 text-orange-200",
  "HIGH RISK": "bg-red-500/15 text-red-200",
};

const columns = [
  { key: "publicSafetyRank", label: "Rank" },
  { key: "state", label: "State" },
  { key: "safetyScore", label: "Score" },
  { key: "safetyCategory", label: "Risk" },
  { key: "growthPercent", label: "Growth" },
  { key: "commonCrimeType", label: "Dominant Crime" },
  { key: "complaintResolutionPercent", label: "Resolution" },
  { key: "emergencyIncidentCount", label: "Emergency Signals" },
];

const SafetyRankingTable = ({ states }) => {
  const [sortKey, setSortKey] = useState("publicSafetyRank");
  const [direction, setDirection] = useState("asc");

  const sortedStates = useMemo(() => {
    const next = [...states].sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      if (typeof left === "number" && typeof right === "number") return left - right;
      return String(left).localeCompare(String(right));
    });
    return direction === "asc" ? next : next.reverse();
  }, [direction, sortKey, states]);

  const changeSort = (key) => {
    if (key === sortKey) {
      setDirection((value) => (value === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(key === "publicSafetyRank" || key === "safetyScore" ? "asc" : "desc");
    }
  };

  return (
    <article className="rounded-lg border border-white/10 bg-police-panel p-4">
      <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-police-accent">Enterprise table</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Public Safety Intelligence Table</h2>
        </div>
        <p className="text-xs text-zinc-500">Sortable state-level public safety indicators</p>
      </div>

      <div className="mt-4 max-h-[520px] overflow-auto rounded-md border border-white/10">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#18120f] text-xs uppercase text-zinc-500">
            <tr>
              {columns.map((column) => (
                <th className="px-3 py-2" key={column.key}>
                  <button className="text-left hover:text-white" onClick={() => changeSort(column.key)} type="button">
                    {column.label}
                    {sortKey === column.key ? <span className="ml-1 text-police-accent">{direction === "asc" ? "up" : "down"}</span> : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {sortedStates.map((state) => (
              <tr className="hover:bg-white/[0.035]" key={state.id}>
                <td className="px-3 py-2 text-zinc-300">#{state.publicSafetyRank}</td>
                <td className="px-3 py-2 font-medium text-white">{state.state}</td>
                <td className="px-3 py-2 text-zinc-300">{state.safetyScore}/100</td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs ${badgeClass[state.safetyCategory]}`}>
                    {state.safetyCategory}
                  </span>
                </td>
                <td className="px-3 py-2 text-zinc-300">{state.growthPercent}%</td>
                <td className="px-3 py-2 text-zinc-300">{state.commonCrimeType}</td>
                <td className="px-3 py-2 text-zinc-300">{state.complaintResolutionPercent}%</td>
                <td className="px-3 py-2 text-zinc-300">{Number(state.emergencyIncidentCount || 0).toLocaleString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
};

export default SafetyRankingTable;
