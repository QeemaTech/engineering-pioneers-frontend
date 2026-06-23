import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Activity,
  Zap,
} from "lucide-react";
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
import { useInstructorOverview } from "../../features/instructor/overview/hooks";
import { useTheme } from "../../contexts/ThemeContext";

/* ─── colour palette ─── */
const BRAND_ORANGE = "#EE7C11";
const BAR_COLORS = ["#EE7C11", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

/* ─── chart tooltip ─── */
function ChartTooltip({ active, payload, label, valuePrefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-4 py-2.5 text-xs shadow-xl backdrop-blur dark:border-slate-600/50 dark:bg-[#1E293B]/95">
      <p className="mb-1.5 font-bold text-slate-400 dark:text-slate-500">{label}</p>
      {payload.map((item, idx) => (
        <p key={idx} className="font-bold text-slate-900 dark:text-white" dir="ltr">
          {item.name}: {valuePrefix}
          {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
        </p>
      ))}
    </div>
  );
}

/* ─── skeletons ─── */
function StatSkeleton() {
  return (
    <div className="h-[152px] animate-pulse rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-100 to-slate-50 dark:border-slate-700/40 dark:from-slate-800/50 dark:to-slate-800/20" />
  );
}

function ChartSkeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-100 to-slate-50 dark:border-slate-700/40 dark:from-slate-800/50 dark:to-slate-800/20 ${className}`}
    />
  );
}

/* ─── metric card ─── */
function MetricCard({ label, value, icon: Icon, gradient, iconBg, trend, trendLabel, trendUp = true }) {
  const isZero = value === 0 || value === "0" || value === "—";
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/40 dark:bg-[#1E293B] dark:hover:border-slate-600/60 dark:hover:shadow-2xl dark:hover:shadow-black/20">
      {/* decorative gradient stripe */}
      <div className={`absolute inset-x-0 top-0 h-1 ${gradient}`} />

      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
          {Icon && <Icon className="h-5 w-5 text-white" />}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${
              trendUp
                ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/15"
                : "bg-rose-500/10 text-rose-500 dark:bg-rose-500/15"
            }`}
            dir="ltr"
          >
            {trendUp ? "↑" : "↓"} {trend}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-0.5">
        <p className="text-2xl font-extrabold tabular-nums tracking-tight text-slate-900 dark:text-white" dir="ltr">
          {isZero ? "—" : value}
        </p>
        {isZero && <p className="text-[10px] font-medium text-slate-500">No data yet</p>}
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
      </div>

      {trend && trendLabel && (
        <p className="mt-2 text-[10px] font-medium text-slate-500">{trendLabel}</p>
      )}
    </article>
  );
}

/* ─── time helpers ─── */
function formatRelativeTime(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  if (diff < 0) return "Started";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 0) return `in ${days}d ${hours % 24}h`;
  if (hours > 0) return `in ${hours}h`;
  const mins = Math.floor(diff / (1000 * 60));
  return `in ${mins}m`;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function Overview() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data, isLoading, isError, error } = useInstructorOverview();

  const summary = data?.summary;
  const earningsTrend = data?.earningsTrend ?? [];
  const topCourses = data?.topCoursesByEnrollments ?? [];
  const upcomingSessionsList = data?.upcomingSessionsList ?? [];
  const recentActivity = data?.recentActivity ?? [];

  const courseChartData = topCourses.map((c) => ({
    name: (c.title || "").length > 18 ? `${c.title.slice(0, 16)}…` : c.title || "—",
    fullName: c.title || "—",
    enrollments: c.enrollmentCount,
  }));

  const gridStroke = isDark ? "#334155" : "#e2e8f0";
  const axisTick = { fill: isDark ? "#64748b" : "#94a3b8", fontSize: 11 };

  return (
    <section className="space-y-8">
      <PageHeader
        title={t("dashboard.instructor.pages.overview.title")}
        subtitle={t("dashboard.instructor.pages.overview.subtitle")}
      />

      {/* ─── error banner ─── */}
      {isError ? (
        <div className="rounded-xl border border-red-200/60 bg-red-50 px-5 py-3.5 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error?.message || t("common.error", { defaultValue: "Something went wrong." })}
        </div>
      ) : null}

      {/* ═══════════════════════════════════════════
          1 ▸ PREMIUM 4-CARD METRIC GRID
          ═══════════════════════════════════════════ */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <MetricCard
              label={t("dashboard.instructor.overview.walletBalance", { defaultValue: "Wallet balance" })}
              value={`EGP ${Number(summary?.walletBalance ?? 0).toLocaleString()}`}
              icon={Wallet}
              gradient="bg-gradient-to-r from-amber-400 to-orange-500"
              iconBg="bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25"
            />
            <MetricCard
              label={t("dashboard.instructor.overview.totalStudents", { defaultValue: "Total students" })}
              value={summary?.totalStudents ?? 0}
              icon={Users}
              gradient="bg-gradient-to-r from-blue-400 to-blue-600"
              iconBg="bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/25"
            />
            <MetricCard
              label={t("dashboard.instructor.overview.totalEarnings", { defaultValue: "Gross revenue" })}
              value={`EGP ${Number(summary?.totalEarnings ?? 0).toLocaleString()}`}
              icon={DollarSign}
              gradient="bg-gradient-to-r from-emerald-400 to-emerald-600"
              iconBg="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25"
            />
            <MetricCard
              label={t("dashboard.instructor.stats.averageRating")}
              value={
                summary?.averageRating != null && summary.averageRating > 0
                  ? `${Number(summary.averageRating).toFixed(1)} / 5.0`
                  : "—"
              }
              icon={Star}
              gradient={`bg-gradient-to-r from-[${BRAND_ORANGE}] to-orange-600`}
              iconBg={`bg-gradient-to-br from-[${BRAND_ORANGE}] to-orange-600 shadow-lg shadow-orange-500/25`}
              trend={summary?.totalReviews ? `${summary.totalReviews} reviews` : null}
              trendUp
            />
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          2 ▸ QUICK STATS MINI STRIP
          ═══════════════════════════════════════════ */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              icon: BookOpen,
              label: t("dashboard.instructor.overview.activeCourses"),
              value: summary?.activeCourses ?? 0,
              color: "text-purple-500",
              bg: "bg-purple-500/10 dark:bg-purple-500/15",
            },
            {
              icon: Calendar,
              label: t("dashboard.instructor.overview.upcomingSessions"),
              value: summary?.upcomingSessions ?? 0,
              color: "text-amber-500",
              bg: "bg-amber-500/10 dark:bg-amber-500/15",
            },
            {
              icon: BookOpen,
              label: t("dashboard.instructor.overview.totalCoursesLabel", { defaultValue: "Total courses" }),
              value: summary?.totalCourses ?? 0,
              color: "text-blue-500",
              bg: "bg-blue-500/10 dark:bg-blue-500/15",
            },
            {
              icon: Star,
              label: t("dashboard.instructor.stats.totalReviews"),
              value: summary?.totalReviews ?? 0,
              color: "text-orange-500",
              bg: "bg-orange-500/10 dark:bg-orange-500/15",
            },
          ].map((s, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3 transition-colors dark:border-slate-700/40 dark:bg-[#1E293B]"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold tabular-nums text-slate-900 dark:text-white" dir="ltr">
                  {s.value === 0 ? "—" : s.value}
                </p>
                <p className="truncate text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          3 ▸ CHART MATRIX
          ═══════════════════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── left: earnings spline ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-700/30">
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t("dashboard.instructor.overview.earningsTrend", { defaultValue: "Monthly Earnings" })}
              </h3>
              <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("overview.monthlyEarnings", { defaultValue: "Last 6 months" })}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#EE7C11] to-orange-600 shadow-lg shadow-orange-500/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="p-6">
            {isLoading ? (
              <ChartSkeleton className="h-[300px] w-full" />
            ) : earningsTrend.length === 0 || earningsTrend.every((m) => m.total === 0) ? (
              <p className="flex h-[300px] items-center justify-center text-sm text-slate-400">
                {t("overview.noDataYet")}
              </p>
            ) : (
              <div className="h-[300px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsTrend}>
                    <defs>
                      <linearGradient id="instrEarnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={BRAND_ORANGE} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={BRAND_ORANGE} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={axisTick}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={axisTick}
                      tickFormatter={(v) => `${v.toLocaleString()}`}
                    />
                    <Tooltip content={(props) => <ChartTooltip {...props} valuePrefix="EGP " />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name={t("dashboard.instructor.overview.earnings", { defaultValue: "Earnings" })}
                      stroke={BRAND_ORANGE}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#instrEarnGrad)"
                      dot={{ fill: BRAND_ORANGE, strokeWidth: 2, r: 4, stroke: isDark ? "#1E293B" : "#fff" }}
                      activeDot={{ r: 6, stroke: BRAND_ORANGE, strokeWidth: 2, fill: isDark ? "#1E293B" : "#fff" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── right: course distribution ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
          <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-700/30">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t("dashboard.instructor.overview.topCourses")}
            </h3>
            <p className="mt-0.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {t("dashboard.instructor.overview.allYourCourses", { defaultValue: "By enrollments" })}
            </p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <ChartSkeleton className="h-[300px] w-full" />
            ) : courseChartData.length === 0 ? (
              <p className="flex h-[300px] items-center justify-center text-sm text-slate-400">
                {t("overview.noDataYet")}
              </p>
            ) : (
              <div className="h-[300px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={courseChartData} layout="vertical" margin={{ left: 4, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 10 }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0]?.payload;
                        return (
                          <div className="rounded-lg border border-slate-200 bg-white/95 px-4 py-2.5 text-xs shadow-xl backdrop-blur dark:border-slate-600/50 dark:bg-[#1E293B]/95">
                            <p className="font-bold text-slate-900 dark:text-white">{row?.fullName}</p>
                            <p className="mt-1 text-slate-500">
                              {t("overview.enrollmentCount", { defaultValue: "Enrollments" })}: {row?.enrollments}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="enrollments" radius={[0, 6, 6, 0]} barSize={18}>
                      {courseChartData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          4 ▸ OPERATIONAL HUB
          ═══════════════════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── left: activity feed ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B] lg:col-span-3">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-700/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#EE7C11] to-orange-600 shadow-lg shadow-orange-500/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t("overview.activityFeed", { defaultValue: "Activity Feed" })}
              </h3>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("overview.recentActivityHint", { defaultValue: "Latest enrollments & payments" })}
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {isLoading ? (
              <div className="p-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex animate-pulse gap-4 py-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700/50" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-3 w-2/5 rounded bg-slate-100 dark:bg-slate-700/50" />
                      <div className="h-2 w-1/4 rounded bg-slate-100 dark:bg-slate-700/50" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-slate-400">{t("overview.noDataYet")}</p>
            ) : (
              recentActivity.map((item) => {
                const when = new Date(item.at);
                const whenLabel = Number.isNaN(when.getTime()) ? "—" : when.toLocaleString();
                const isPayment = item.type === "payment";
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* avatar circle */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                          isPayment
                            ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                            : "bg-gradient-to-br from-blue-400 to-blue-600"
                        }`}
                      >
                        {isPayment ? <DollarSign className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          <span className="text-[#EE7C11]">{item.studentName}</span>
                          <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                          <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                              isPayment
                                ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                                : "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                            }`}
                          >
                            {isPayment
                              ? t("overview.activityPayment", { defaultValue: "Payment" })
                              : t("nav.enrollments", { defaultValue: "Enrollment" })}
                          </span>
                          <span className="text-[10px] text-slate-400" dir="ltr">
                            {whenLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                    {item.amount != null && (
                      <p className="text-sm font-extrabold tabular-nums text-emerald-500" dir="ltr">
                        +EGP {Number(item.amount).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── right: upcoming sessions ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B] lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-700/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/20">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t("dashboard.instructor.overview.upcomingSessionsTitle", { defaultValue: "Upcoming Sessions" })}
              </h3>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("dashboard.instructor.overview.upcomingSessionsHint", { defaultValue: "Your next live classes" })}
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {isLoading ? (
              <div className="space-y-4 p-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-700/30" />
                ))}
              </div>
            ) : upcomingSessionsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700/40">
                  <Calendar className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-400">
                  {t("dashboard.instructor.overview.noUpcomingSessions", { defaultValue: "No upcoming live sessions" })}
                </p>
                <p className="max-w-xs text-xs text-slate-500">
                  {t("dashboard.instructor.overview.noUpcomingSessionsHint", {
                    defaultValue: "Schedule group sessions from My Courses, or set a lesson as Live in the curriculum.",
                  })}
                </p>
                <Link
                  to="/instructor/courses"
                  className="mt-1 inline-flex items-center rounded-lg bg-[#EE7C11] px-4 py-2 text-xs font-bold text-white hover:bg-[#d9700e]"
                >
                  {t("dashboard.instructor.pages.courses.title", { defaultValue: "My Courses" })}
                </Link>
              </div>
            ) : (
              upcomingSessionsList.map((s) => {
                const isLiveLesson = s.source === "live_lesson";
                const courseId = s.course?.id;
                const manageHref = isLiveLesson && courseId
                  ? `/instructor/courses/${courseId}/edit?tab=curriculum`
                  : courseId
                    ? "/instructor/courses"
                    : null;
                return (
                <div key={s.id} className="px-5 py-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {s.title || s.course?.title || "—"}
                        </p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                          isLiveLesson
                            ? "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400"
                            : s.type === "PRIVATE"
                              ? "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                              : "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400"
                        }`}>
                          {isLiveLesson
                            ? t("dashboard.instructor.overview.liveLesson", { defaultValue: "Live lesson" })
                            : s.type === "PRIVATE"
                              ? t("dashboard.instructor.overview.privateSession", { defaultValue: "Private" })
                              : t("dashboard.instructor.overview.groupSession", { defaultValue: "Group session" })}
                        </span>
                      </div>
                      {s.course?.title ? (
                        <p className="mt-0.5 text-xs text-slate-500">{s.course.title}</p>
                      ) : null}
                      {s.studentName ? (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {t("dashboard.instructor.overview.withStudent", { defaultValue: "With" })}: {s.studentName}
                        </p>
                      ) : null}
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(s.startTime)}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-500" dir="ltr">
                      <span>{formatDate(s.startTime)}</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span>
                        {formatTime(s.startTime)} – {formatTime(s.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {manageHref ? (
                        <Link
                          to={manageHref}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                        >
                          {t("dashboard.instructor.overview.manageSession", { defaultValue: "Manage" })}
                        </Link>
                      ) : null}
                      {s.meetingUrl ? (
                        <a
                          href={s.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#EE7C11] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm transition-all hover:bg-[#d96e0e] hover:shadow-md"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t("dashboard.instructor.overview.joinSession", { defaultValue: "Join" })}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
              })
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          5 ▸ REVIEWS SNAPSHOT
          ═══════════════════════════════════════════ */}
      {!isLoading && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-700/30">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/20">
              <Star className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t("dashboard.instructor.overview.reviewsSnapshot", { defaultValue: "Reviews & Rating" })}
              </h3>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t("dashboard.instructor.stats.totalReviews", { defaultValue: "Total reviews" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-8 px-6 py-8">
            {/* rating circle */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke={isDark ? "#334155" : "#e2e8f0"} strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={BRAND_ORANGE}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${((summary?.averageRating ?? 0) / 5) * 327} 327`}
                />
              </svg>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {summary?.averageRating != null ? Number(summary.averageRating).toFixed(1) : "—"}
                </p>
                <p className="text-[10px] font-bold text-slate-400">/ 5.0</p>
              </div>
            </div>
            {/* stars & count */}
            <div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = summary?.averageRating ?? 0;
                  const filled = star <= Math.floor(rating);
                  const partial = !filled && star === Math.ceil(rating) && rating % 1 > 0;
                  return (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        filled
                          ? "fill-amber-400 text-amber-400"
                          : partial
                          ? "fill-amber-400/50 text-amber-400"
                          : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {summary?.totalReviews ?? 0} {t("dashboard.instructor.overview.totalReviewsLabel", { defaultValue: "total reviews" })}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {t("dashboard.instructor.overview.avgRatingLine", {
                  defaultValue: "Avg. {{rating}} / 5",
                  rating: summary?.averageRating != null ? Number(summary.averageRating).toFixed(1) : "—",
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
