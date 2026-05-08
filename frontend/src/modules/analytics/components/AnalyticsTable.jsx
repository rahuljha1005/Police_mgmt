import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

const normalize = (value) => String(value ?? "").toLowerCase();

const badgeClass = (value) => {
  const key = normalize(value);
  if (["critical", "high", "rejected"].includes(key)) return "border-red-900/70 bg-red-950/30 text-red-300";
  if (["medium", "under_review", "investigating", "pending"].includes(key)) return "border-orange-900/70 bg-orange-950/20 text-orange-300";
  if (["closed", "converted_to_fir", "low"].includes(key)) return "border-emerald-900/70 bg-emerald-950/20 text-emerald-300";
  return "border-[#333] bg-[#191919] text-zinc-300";
};

const AnalyticsTable = ({ title, rows, columns, pageSize = 8 }) => {
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState({ key: columns[0]?.key, direction: "asc" });
  const [page, setPage] = useState(1);

  const prepared = useMemo(() => {
    const filtered = rows.filter((row) =>
      columns.some((column) => normalize(column.render(row)).includes(normalize(filter)))
    );
    const sorted = [...filtered].sort((a, b) => {
      const column = columns.find((item) => item.key === sort.key) || columns[0];
      const left = normalize(column.render(a));
      const right = normalize(column.render(b));
      return sort.direction === "asc" ? left.localeCompare(right) : right.localeCompare(left);
    });
    return sorted;
  }, [columns, filter, rows, sort]);

  const totalPages = Math.max(1, Math.ceil(prepared.length / pageSize));
  const visibleRows = prepared.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <article className="border border-[#262626] bg-[#151515]">
      <div className="flex flex-col gap-2 border-b border-[#262626] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
        <label className="flex h-8 items-center gap-2 border border-[#262626] bg-[#101010] px-2 text-xs text-zinc-500">
          <Search className="h-3.5 w-3.5" />
          <input
            className="w-44 bg-transparent text-zinc-200 outline-none placeholder:text-zinc-600"
            onChange={(event) => {
              setFilter(event.target.value);
              setPage(1);
            }}
            placeholder="Filter rows"
            value={filter}
          />
        </label>
      </div>
      <div className="max-h-[360px] overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#101010] text-[10px] uppercase tracking-[0.14em] text-zinc-500">
            <tr>
              {columns.map((column) => (
                <th className="border-b border-[#262626] px-3 py-2 font-semibold" key={column.key}>
                  <button className="flex items-center gap-1 text-left" onClick={() => toggleSort(column.key)} type="button">
                    {column.label}
                    {sort.key === column.key && (sort.direction === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr
                className={`border-b border-[#262626] hover:bg-[#1d1d1d] ${
                  ["critical", "HIGH", "high"].includes(row.priority) ? "bg-red-950/10" : ""
                }`}
                key={row._id || row.officer || `${title}-${index}`}
              >
                {columns.map((column) => {
                  const value = column.render(row);
                  return (
                    <td className="max-w-[220px] truncate px-3 py-2 text-zinc-300" key={column.key} title={String(value ?? "")}>
                      {column.status ? (
                        <span className={`inline-flex border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${badgeClass(value)}`}>
                          {value}
                        </span>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {!visibleRows.length && <p className="p-4 text-sm text-zinc-500">No matching records returned.</p>}
      </div>
      <div className="flex items-center justify-between border-t border-[#262626] px-3 py-2 text-xs text-zinc-500">
        <span>{prepared.length} records</span>
        <div className="flex items-center gap-2">
          <button
            className="border border-[#262626] px-2 py-1 text-zinc-300 disabled:opacity-30"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
          >
            Prev
          </button>
          <span>Page {page} / {totalPages}</span>
          <button
            className="border border-[#262626] px-2 py-1 text-zinc-300 disabled:opacity-30"
            disabled={page === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </article>
  );
};

export default AnalyticsTable;
