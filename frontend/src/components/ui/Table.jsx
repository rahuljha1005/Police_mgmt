const Table = ({ columns, data, getKey }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-left text-sm">
      <thead className="text-xs uppercase text-zinc-500">
        <tr>
          {columns.map((column) => (
            <th className="px-4 py-3" key={column.key}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/10">
        {data.map((row, index) => (
          <tr key={getKey ? getKey(row) : row._id || index}>
            {columns.map((column) => (
              <td className="px-4 py-3 text-zinc-300" key={column.key}>
                {column.render ? column.render(row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Table;
