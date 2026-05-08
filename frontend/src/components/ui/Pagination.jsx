const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Page {pagination.page} of {pagination.totalPages} - {pagination.total} records
      </p>
      <div className="flex gap-2">
        <button
          className="rounded-md border border-white/10 px-3 py-2 text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          type="button"
        >
          Previous
        </button>
        <button
          className="rounded-md border border-white/10 px-3 py-2 text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
