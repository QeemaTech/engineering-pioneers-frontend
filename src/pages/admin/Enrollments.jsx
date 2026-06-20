import { CalendarDays, DollarSign, GraduationCap, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import StatsRow from "../../components/ui/StatsRow";
import FilterBar from "../../components/ui/FilterBar";
import { useAdminEnrollments } from "../../features/admin/enrollments/hooks";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import { getErrorMessage } from "../../api/error";

function StatusBadge({ kind, t }) {
  const styles = {
    completed: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30",
    active: "bg-sky-100 text-sky-800 ring-1 ring-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/30",
    cohort_ended: "bg-amber-100 text-amber-900 ring-1 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30",
  };
  const labels = {
    completed: t("adminPages.enrollments.statusCompleted", { defaultValue: "Completed" }),
    active: t("adminPages.enrollments.statusActive", { defaultValue: "Active" }),
    cohort_ended: t("adminPages.enrollments.statusCohortEnded", { defaultValue: "Cohort ended" }),
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[kind] || styles.active}`}>
      {labels[kind] || labels.active}
    </span>
  );
}

function Enrollments() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [courseId, setCourseId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 320);
    return () => clearTimeout(id);
  }, [search]);

  const queryParams = useMemo(
    () => ({
      page: 1,
      limit: 80,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
      ...(courseId ? { courseId } : {}),
      ...(statusFilter === "active" || statusFilter === "completed" ? { status: statusFilter } : {}),
    }),
    [debouncedSearch, dateFrom, dateTo, courseId, statusFilter]
  );

  const { data, isLoading, isError, error, refetch } = useAdminEnrollments(queryParams);
  const { data: coursesPayload } = useAdminCourses({ page: 1, limit: 200 });
  const coursesList = coursesPayload?.courses || coursesPayload?.data || [];

  const enrollments = data?.enrollments || [];
  const stats = data?.stats;
  const pagination = data?.meta;

  const statItems = useMemo(() => {
    const fmtMoney = (n) =>
      new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n ?? 0);
    return [
      {
        key: "total",
        label: t("adminPages.enrollments.total"),
        value: stats?.total ?? pagination?.total ?? enrollments.length,
        icon: Users,
        iconWrap: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300",
      },
      {
        key: "month",
        label: t("adminPages.enrollments.thisMonth"),
        value: stats?.thisMonth ?? "—",
        icon: CalendarDays,
        iconWrap: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
      },
      {
        key: "rate",
        label: t("adminPages.enrollments.completionRate"),
        value: stats?.completionRate != null ? `${stats.completionRate}%` : "—",
        icon: GraduationCap,
        iconWrap: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
      },
      {
        key: "rev",
        label: t("adminPages.enrollments.revenue"),
        value: fmtMoney(stats?.revenueFromEnrollments),
        icon: DollarSign,
        iconWrap: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200",
      },
    ];
  }, [stats, pagination, enrollments.length, t]);

  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.enrollments.title")} subtitle={t("adminPages.enrollments.subtitle")} />

      <StatsRow items={statItems} />

      <FilterBar>
        <div className="relative lg:col-span-4">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("adminPages.common.search")}
            className="h-10 w-full rounded-lg border border-slate-200 ps-9 pe-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
        />
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
        >
          <option value="">{t("adminPages.enrollments.allCourses", { defaultValue: "All courses" })}</option>
          {coursesList.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm lg:col-span-2 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
        >
          <option value="all">{t("adminPages.enrollments.allStatuses", { defaultValue: "All statuses" })}</option>
          <option value="active">{t("adminPages.enrollments.statusActive", { defaultValue: "Active" })}</option>
          <option value="completed">{t("adminPages.enrollments.statusCompleted", { defaultValue: "Completed" })}</option>
        </select>
      </FilterBar>

      {pagination?.total != null ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("adminPages.enrollments.showingCount", {
            count: enrollments.length,
            total: pagination.total,
            defaultValue: "Showing {{count}} of {{total}} enrollments",
          })}
        </p>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
          {t("dashboard.common.loading", { defaultValue: "Loading…" })}
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
          {getErrorMessage(error, "Failed to load enrollments.")}
          <button type="button" onClick={() => refetch()} className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white">
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center text-slate-500 dark:border-white/10 dark:bg-[#1A1A22] dark:text-slate-400">
          {t("adminPages.enrollments.empty", { defaultValue: "No enrollments match your filters." })}
        </div>
      ) : null}

      {!isLoading && !isError && enrollments.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-start text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/90 dark:border-white/10 dark:bg-white/5">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("adminPages.enrollments.student")}
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("adminPages.enrollments.course")}
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("adminPages.enrollments.instructor")}
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("adminPages.enrollments.cohort", { defaultValue: "Cohort" })}
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("adminPages.enrollments.enrolledDate")}
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("adminPages.enrollments.progress")}
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("adminPages.enrollments.status")}
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("adminPages.enrollments.price")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {enrollments.map((r) => {
                  const pct = Math.min(100, Math.max(0, Number(r.progressPercentage) || 0));
                  const paid = Number(r.amountPaid) || 0;
                  const list = Number(r.cohortPrice) || 0;
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-violet-50/40 dark:hover:bg-white/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {r.student?.avatar ? (
                            <img src={r.student.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm dark:ring-white/10" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
                              {(r.student?.fullName || "?").slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{r.student?.fullName || "—"}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{r.student?.email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[200px] font-medium text-slate-800 dark:text-slate-200">{r.course?.title || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700 dark:text-slate-300">{r.instructor?.fullName || "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[160px] text-xs text-slate-600 dark:text-slate-400">{r.cohort?.name || "—"}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {r.joinedAt || r.enrolledAt ? new Date(r.joinedAt || r.enrolledAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 w-44">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">{pct}%</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {t("adminPages.enrollments.lessonsDone", {
                            n: r.completedLessonsCount ?? 0,
                            defaultValue: "{{n}} lessons done",
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge kind={r.status} t={t} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(paid)}
                        </p>
                        {list > 0 && paid < list ? (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400">
                            {t("adminPages.enrollments.listPrice", {
                              amount: new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(list),
                              defaultValue: "List {{amount}}",
                            })}
                          </p>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Enrollments;
