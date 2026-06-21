function DataTable({ columns = [], rows = [], pagination = null, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#1E293B] ${className}`}>
      <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[920px] border-collapse text-start">
          <thead className="bg-slate-50 dark:bg-[#0F172A]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id || idx} className="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-start text-sm text-slate-700 dark:text-slate-300">
                    {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination ? <div className="border-t border-slate-100 p-3 dark:border-white/6">{pagination}</div> : null}
    </div>
  );
}

export default DataTable;

