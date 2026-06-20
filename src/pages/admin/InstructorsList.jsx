import { DollarSign, Eye, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminInstructors } from "../../features/admin/instructors/hooks";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import { getErrorMessage } from "../../api/error";

function InstructorsList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error, refetch } = useAdminInstructors({ search, page: 1, limit: 20 });
  const instructors = data?.instructors || [];
  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.instructorsList.title")} subtitle={t("adminPages.instructorsList.subtitle")} action={<Link to="/admin/instructors" className="inline-flex items-center rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white">Add Instructor</Link>} />
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white ps-9 pe-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" placeholder={t("adminPages.common.search")} />
        </div>
      </div>
      {isLoading ? <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">Loading instructors...</div> : null}
      {isError ? (
        <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
          {getErrorMessage(error, "Failed to load instructors.")}
          <button onClick={() => refetch()} className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white">Retry</button>
        </div>
      ) : null}
      {!isLoading && !isError ? <DataTable
        columns={[
          {
            key: "name",
            title: t("adminPages.instructorsList.name"),
            render: (_, r) => {
              const name = r.fullName || r.name || "—";
              const initials = String(name)
                .split(/\s+/)
                .filter(Boolean)
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#EE7C11]/90 to-amber-600/90 text-xs font-bold text-white shadow-sm">
                    {initials || "?"}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{name}</span>
                </div>
              );
            },
          },
          { key: "email", title: t("adminPages.instructorsList.email"), render: (_, r) => <span className="text-slate-700 dark:text-slate-300">{r.email || "—"}</span> },
          {
            key: "coursesCount",
            title: t("adminPages.instructorsList.coursesCount"),
            render: (_, r) => (
              <div className="max-w-[220px]">
                <span className="font-semibold text-slate-900 dark:text-white">{r.coursesCount ?? 0}</span>
                {r.coursesSummary ? (
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400" title={r.coursesSummary}>
                    {r.coursesSummary}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400">—</p>
                )}
              </div>
            ),
          },
          {
            key: "totalStudents",
            title: t("adminPages.instructorsList.totalStudents"),
            render: (_, r) => (
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{r.totalStudents ?? 0}</span>
            ),
          },
          {
            key: "rating",
            title: t("adminPages.instructorsList.rating"),
            render: (_, r) => {
              const val = r.rating != null ? Number(r.rating) : null;
              if (val == null || Number.isNaN(val)) {
                return <span className="text-slate-400">—</span>;
              }
              return (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-sm font-semibold text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
                  <span className="text-amber-500">★</span>
                  {val.toFixed(2)}
                </span>
              );
            },
          },
          {
            key: "revenue",
            title: t("adminPages.instructorsList.revenue"),
            render: (_, r) => (
              <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(r.revenue) || 0)}
              </span>
            ),
          },
          { key: "status", title: t("adminPages.instructorsList.status"), render: (_, r) => <StatusBadge label={r.isActive ? "Active" : "Inactive"} tone={r.isActive ? "success" : "warning"} /> },
          { key: "actions", title: t("adminPages.common.actions"), render: (_, r) => <div className="flex gap-2"><Link to={`/admin/instructors/${r.id}`} className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-white/15"><Eye className="h-4 w-4" /></Link><Link to="/admin/instructors/payouts" className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-white/15"><DollarSign className="h-4 w-4" /></Link></div> },
        ]}
        rows={instructors}
      /> : null}
    </section>
  );
}

export default InstructorsList;

