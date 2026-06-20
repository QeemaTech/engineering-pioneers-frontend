import { CalendarDays, Clock, MessageSquare, ShieldCheck, Star, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PerformanceDashboardUI } from "../../components/features/performance/PerformanceDashboardUI";
import {
  useAdminInstructorAvailability,
  useAdminInstructorById,
  useAdminInstructorPerformance,
} from "../../features/admin/instructors/hooks";
import DataTable from "../../components/ui/DataTable";
import { getErrorMessage } from "../../api/error";
import { useAdminPayouts } from "../../features/admin/finance/hooks";

function InstructorDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: entity, isLoading, isError, error, refetch } = useAdminInstructorById(id);
  const performanceQuery = useAdminInstructorPerformance(id, { enabled: Boolean(id) && activeTab === "performance" });
  const availabilityQuery = useAdminInstructorAvailability(id, { enabled: Boolean(id) && activeTab === "availability" });
  const { data: payouts = [] } = useAdminPayouts({});

  const instructor = entity
    ? {
        id: entity.id,
        name: entity.fullName || "-",
        email: entity.email || "-",
        bio: entity.bio || "-",
        coursesCount: entity?.stats?.totalCourses || entity?.coursesTaught?.length || 0,
        totalStudents: entity?.stats?.totalStudents || 0,
        revenue: payouts
          .filter((p) => p?.instructor?.id === entity.id && p.status === "PAID")
          .reduce((a, b) => a + Number(b.amount || 0), 0),
        rating: entity.averageRating || 0,
      }
    : null;

  const courseRows = (entity?.coursesTaught || []).map((c) => ({
    ...c,
    students: c?._count?.enrollments || 0,
    price: 0,
    rating: entity?.averageRating || 0,
    status: c.isActive ? "Active" : "Inactive",
  }));
  const payRows = payouts.filter((p) => p?.instructor?.id === entity?.id).slice(0, 8);

  const coursesPie = [
    { name: "Active", value: courseRows.filter((c) => c.isActive).length },
    { name: "Inactive", value: courseRows.filter((c) => !c.isActive).length },
  ];
  const enrollBars = courseRows.map((c) => ({
    name: String(c.title || "-").slice(0, 12),
    enrollments: c.students || 0,
  }));
  const revenueTrend = useMemo(
    () =>
      payRows
        .map((p) => ({
          day: p.createdAt
            ? new Date(p.createdAt).toLocaleDateString("en", { day: "2-digit", month: "short" })
            : "-",
          amount: Number(p.amount || 0),
        }))
        .reverse(),
    [payRows]
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
        Loading instructor...
      </div>
    );
  }
  if (isError || !instructor) {
    return (
      <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
        {getErrorMessage(error, "Failed to load instructor.")}
        <button onClick={() => refetch()} className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white">
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
              {instructor.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{instructor.name}</h1>
              <p className="text-sm text-slate-500">{instructor.email}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Star className="h-3.5 w-3.5 text-amber-500" /> {Number(instructor.rating || 0).toFixed(1)}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{instructor.bio || "-"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { id: "overview", label: "Overview" },
            { id: "performance", label: t("adminPages.instructorDetail.tabPerformance") },
            { id: "availability", label: t("adminPages.instructorDetail.tabAvailability") },
            { id: "courses", label: "Courses" },
            { id: "reviews", label: "Reviews" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                activeTab === tab.id
                  ? "bg-[#EE7C11] text-white"
                  : "border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
                <p className="text-xs text-slate-500">{t("adminPages.instructorDetail.totalCourses")}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{instructor.coursesCount}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
                <p className="text-xs text-slate-500">{t("adminPages.instructorDetail.totalStudents")}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{instructor.totalStudents}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
                <p className="text-xs text-slate-500">{t("adminPages.instructorDetail.totalRevenue")}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  ${Number(instructor.revenue).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
              <h4 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Revenue Trend</h4>
              <div className="h-64" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fill="#8B5CF630" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <aside className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
              <h4 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Course Status Mix</h4>
              <div className="h-48" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={coursesPie} dataKey="value" nameKey="name" outerRadius={70} fill="#EE7C11" />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
              <h4 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Enrollments by Course</h4>
              <div className="h-48" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollBars}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="enrollments" fill="#14B8A6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {activeTab === "courses" ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <DataTable
            columns={[
              { key: "title", title: t("adminPages.instructorDetail.course") },
              { key: "students", title: t("adminPages.instructorDetail.enrollments") },
              { key: "price", title: t("adminPages.instructorDetail.revenue"), render: (v) => `$${v}` },
              { key: "rating", title: t("adminPages.instructorDetail.rating") },
              { key: "status", title: t("adminPages.instructorDetail.status") },
            ]}
            rows={courseRows}
          />
        </div>
      ) : null}

      {activeTab === "availability" ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-5 dark:border-white/[0.08] dark:bg-[#1A1A22]">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{t("adminPages.instructorDetail.tabAvailability")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("adminPages.instructorDetail.availabilitySubtitle")}</p>
              </div>
            </div>
          </div>
          {availabilityQuery.isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22] dark:text-slate-400">
              {t("dashboard.common.loading")}
            </div>
          ) : availabilityQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
              {t("adminPages.instructorDetail.availabilityLoadError")}
              <button
                type="button"
                onClick={() => availabilityQuery.refetch()}
                className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white"
              >
                {t("dashboard.common.refresh")}
              </button>
            </div>
          ) : !(availabilityQuery.data || []).length ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {t("adminPages.instructorDetail.availabilityEmpty")}
            </div>
          ) : (
            <ul className="space-y-3">
              {(availabilityQuery.data || []).map((slot) => (
                <li
                  key={slot.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:border-violet-300/50 dark:border-white/[0.08] dark:bg-[#1A1A22] dark:hover:border-violet-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-white/10">
                      <Clock className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {new Date(slot.startTime).toLocaleString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        →{" "}
                        {new Date(slot.endTime).toLocaleString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        {t("adminPages.instructorDetail.availabilitySlotStatus")}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {activeTab === "performance" ? (
        <div className="space-y-4">
          {performanceQuery.isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22] dark:text-slate-400">
              {t("dashboard.common.loading")}
            </div>
          ) : performanceQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
              {t("adminPages.instructorDetail.performanceLoadError")}
              <button
                type="button"
                onClick={() => performanceQuery.refetch()}
                className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white"
              >
                {t("dashboard.common.refresh")}
              </button>
            </div>
          ) : performanceQuery.data ? (
            <PerformanceDashboardUI data={performanceQuery.data} />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
              {t("adminPages.instructorDetail.performanceLoadError")}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === "reviews" ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <h3 className="mb-3 font-bold text-slate-900 dark:text-white">{t("adminPages.instructorDetail.reviews")}</h3>
              {(entity?.receivedReviews || []).length ? (
                (entity?.receivedReviews || []).map((r) => (
                  <div key={r.id} className="mb-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">
                    {r?.student?.fullName || "Student"}: {r.comment || "No comment"}
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">
                  No reviews yet.
                </div>
              )}
            </div>
          </div>
          <aside className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <DataTable
                columns={[
                  {
                    key: "period",
                    title: t("adminPages.instructorDetail.period"),
                    render: (_, r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"),
                  },
                  {
                    key: "amount",
                    title: t("adminPages.instructorDetail.amount"),
                    render: (v) => `$${Number(v || 0).toLocaleString()}`,
                  },
                  { key: "status", title: t("adminPages.instructorDetail.status") },
                ]}
                rows={payRows}
              />
            </div>
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              {[
                [ShieldCheck, t("adminPages.instructorDetail.approve")],
                [UserX, t("adminPages.instructorDetail.suspend")],
                [MessageSquare, t("adminPages.instructorDetail.sendMessage")],
              ].map(([Icon, label]) => (
                <button
                  key={label}
                  disabled
                  className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm opacity-60 dark:border-white/10 dark:text-slate-200"
                  title="Action pending backend workflow"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

export default InstructorDetail;

