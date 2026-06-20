import { useTranslation } from "react-i18next";
import { Users, GraduationCap, BookOpen, DollarSign, TrendingUp, Activity } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import { useAdminOverview } from "../../features/admin/overview/hooks";
import { useTheme } from "../../contexts/ThemeContext";
import useAuthStore from "../../store/authStore";
import { hasPermission } from "../../config/permissions";
import { ShieldAlert } from "lucide-react";

const BAR_COLORS = ["#EE7C11", "#0D9488", "#093443", "#10B981", "#8B5CF6"];

function ChartTooltip({ active, payload, label, valuePrefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-pioneer-light-card px-3 py-2 text-xs shadow-md dark:border-white/10 dark:bg-pioneer-dark-card">
      <p className="mb-1 font-bold text-slate-500">{label}</p>
      {payload.map((item, idx) => (
        <p key={idx} className="font-bold text-slate-900 dark:text-white ltr-only" dir="ltr">
          {item.name}: {valuePrefix}
          {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
        </p>
      ))}
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="h-[140px] animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-white/8 dark:bg-white/5" />
  );
}

function ChartSkeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-white/8 dark:bg-white/5 ${className}`}
    />
  );
}

export default function Overview() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const user = useAuthStore((s) => s.user);
  const canReadDashboard = hasPermission(user, "dashboard:read");
  const { data, isLoading, isError, error } = useAdminOverview();

  const summary = data?.summary;
  const revenueTrend = data?.revenueTrend ?? [];
  const topCourses = data?.topCoursesByEnrollments ?? [];
  const recentActivity = data?.recentActivity ?? [];

  const enrollmentChartData = topCourses.map((c) => ({
    name: c.title.length > 24 ? `${c.title.slice(0, 22)}…` : c.title,
    fullTitle: c.title,
    enrollments: c.enrollmentCount,
  }));

  const stats = [
    {
      key: "totalStudents",
      label: t("overview.totalStudents"),
      icon: Users,
      colorClass: "blue",
      format: (v) => v,
    },
    {
      key: "totalInstructors",
      label: t("overview.totalInstructors"),
      icon: GraduationCap,
      colorClass: "purple",
      format: (v) => v,
    },
    {
      key: "totalActiveCourses",
      label: t("overview.activeCourses"),
      icon: BookOpen,
      colorClass: "amber",
      format: (v) => v,
    },
    {
      key: "totalRevenue",
      label: t("overview.totalRevenue"),
      icon: DollarSign,
      colorClass: "green",
      format: (v) => `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    },
  ];

  return (
    <section className="space-y-8 pb-10">
      <PageHeader title={t("dashboard.admin.pages.overview.title")} subtitle={t("dashboard.admin.pages.overview.subtitle")} />

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-200">
          {error?.message || t("common.error", { defaultValue: "Something went wrong." })}
        </div>
      ) : null}

      {!canReadDashboard ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-pioneer-light-card p-12 text-center shadow-sm dark:border-white/5 dark:bg-pioneer-dark-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pioneer-orange/10 text-pioneer-orange mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">
            {t("common.accessDenied", { defaultValue: "Access Denied" })}
          </h3>
          <p className="mt-2 max-w-md text-sm text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">
            {t("common.dashboardReadPermissionRequired", { defaultValue: "You do not have the required permissions (dashboard:read) to view the administration overview metrics and analytics panels." })}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
              : stats.map((s) => {
                  const raw = summary?.[s.key];
                  const display = raw === undefined || raw === null ? "—" : s.format(raw);
                  return (
                    <StatCard
                      key={s.key}
                      label={s.label}
                      value={display}
                      icon={s.icon}
                      colorClass={s.colorClass}
                    />
                  );
                })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200/80 bg-pioneer-light-card p-6 shadow-sm dark:border-white/5 dark:bg-pioneer-dark-card lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">{t("overview.revenueAnalytics")}</h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">{t("overview.monthlyEarnings")}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pioneer-orange/10 text-pioneer-orange">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              {isLoading ? (
                <ChartSkeleton className="h-[300px] w-full" />
              ) : revenueTrend.length === 0 ? (
                <p className="flex h-[300px] items-center justify-center text-sm text-slate-500">{t("overview.noDataYet")}</p>
              ) : (
                <div className="h-[300px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EE7C11" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#EE7C11" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" strokeOpacity={isDark ? 0.06 : 0.2} />
                      <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }}
                        tickFormatter={(v) => `$${v >= 1000 ? `${v / 1000}k` : v}`}
                      />
                      <Tooltip content={(props) => <ChartTooltip {...props} valuePrefix="$" />} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name={t("overview.totalRevenue")}
                        stroke="#EE7C11"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#adminRevenueGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-pioneer-light-card p-6 shadow-sm dark:border-white/5 dark:bg-pioneer-dark-card">
              <div className="mb-6">
                <h3 className="text-lg font-bold tracking-tight text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">
                  {t("overview.topCoursesByEnrollment", { defaultValue: "Top courses (active enrollments)" })}
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">
                  {t("overview.topCoursesByEnrollmentHint", { defaultValue: "Live & ongoing cohorts" })}
                </p>
              </div>
              {isLoading ? (
                <ChartSkeleton className="h-[300px] w-full" />
              ) : enrollmentChartData.length === 0 ? (
                <p className="flex h-[300px] items-center justify-center text-sm text-slate-500">{t("overview.noDataYet")}</p>
              ) : (
                <div className="h-[300px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={enrollmentChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#94A3B8" strokeOpacity={isDark ? 0.06 : 0.2} />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 10 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const row = payload[0]?.payload;
                          return (
                            <div className="rounded-lg border border-slate-200 bg-pioneer-light-card px-3 py-2 text-xs shadow-md dark:border-white/10 dark:bg-pioneer-dark-card">
                              <p className="font-semibold text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">{row?.fullTitle}</p>
                              <p className="mt-1 text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">
                                {t("overview.enrollmentCount", { defaultValue: "Enrollments" })}: {row?.enrollments}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="enrollments" radius={[0, 4, 4, 0]} barSize={14}>
                        {enrollmentChartData.map((_, i) => (
                          <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-pioneer-light-card shadow-sm dark:border-white/5 dark:bg-pioneer-dark-card">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/30 px-6 py-5 dark:border-white/5 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pioneer-orange/10 text-pioneer-orange">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">{t("overview.activityFeed")}</h3>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">
                    {t("overview.recentActivityHint", { defaultValue: "Latest enrollments & payments" })}
                  </p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {isLoading ? (
                <div className="space-y-0 p-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex animate-pulse gap-4 py-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-white/10" />
                        <div className="h-2 w-1/4 rounded bg-slate-100 dark:bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <p className="px-6 py-12 text-center text-sm text-slate-500">{t("overview.noDataYet")}</p>
              ) : (
                recentActivity.map((item) => {
                  const when = new Date(item.at);
                  const whenLabel = Number.isNaN(when.getTime()) ? "—" : when.toLocaleString();
                  return (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">
                          <span className="text-pioneer-orange">{item.studentName}</span>
                          <span className="mx-1 text-slate-400">·</span>
                          {item.label}
                        </p>
                        {item.detail ? <p className="mt-0.5 text-xs text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">{item.detail}</p> : null}
                        <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
                          {item.type === "payment" ? t("overview.activityPayment", { defaultValue: "Payment" }) : t("nav.enrollments")}
                        </span>
                      </div>
                      <div className="text-end">
                        {item.amount != null ? (
                          <p className="text-sm font-bold text-emerald-600 ltr-only dark:text-emerald-400" dir="ltr">
                            +${Number(item.amount).toLocaleString()}
                          </p>
                        ) : null}
                        <p className="text-xs text-slate-500 ltr-only" dir="ltr">
                          {whenLabel}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
