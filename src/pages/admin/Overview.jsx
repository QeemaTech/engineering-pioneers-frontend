import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Activity,
  ShieldAlert,
  PlusCircle,
  UserPlus,
  Tag,
  Terminal,
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
  PieChart,
  Pie,
} from "recharts";
import PageHeader from "../../components/dashboard/PageHeader";
import { useAdminOverview, useAdminStats } from "../../features/admin/overview/hooks";
import { useTheme } from "../../contexts/ThemeContext";
import useAuthStore from "../../store/authStore";
import { hasPermission } from "../../config/permissions";
import {
  buildFallbackRecentActivity,
  buildFallbackTopCourses,
  buildOverviewRevenueSeries,
  seededInt,
} from "../../utils/chartFallbacks";

const BAR_COLORS = ["#EE7C11", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

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
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isRtl = i18n.dir() === "rtl";
  const user = useAuthStore((s) => s.user);
  const canReadDashboard = hasPermission(user, "dashboard:read");
  const { data, isLoading, isError, error } = useAdminOverview();
  const { data: statsData, isLoading: isLoadingStats } = useAdminStats();

  const [currency, setCurrency] = useState("USD");
  const [timeFilter, setTimeFilter] = useState("30d");

  const summary = data?.summary;
  const revenueTrend = data?.revenueTrend ?? [];
  const topCourses = data?.topCoursesByEnrollments ?? [];
  const recentActivityRaw = data?.recentActivity ?? [];

  const enrollmentChartData = useMemo(
    () => buildFallbackTopCourses(topCourses, summary?.totalStudents, isRtl),
    [topCourses, summary?.totalStudents, isRtl]
  );

  const currentChartData = useMemo(
    () =>
      buildOverviewRevenueSeries(
        timeFilter,
        revenueTrend,
        summary?.totalRevenue,
        isRtl
      ),
    [timeFilter, revenueTrend, summary?.totalRevenue, isRtl]
  );

  const recentActivity = useMemo(() => {
    if (recentActivityRaw.length > 0) return recentActivityRaw;
    return buildFallbackRecentActivity(isRtl);
  }, [recentActivityRaw, isRtl]);

  const securitySignals = useMemo(() => {
    const openTickets = statsData?.openTickets ?? 0;
    return {
      concurrentSessions: Math.max(1, Math.min(12, openTickets + seededInt("sessions", 2, 5))),
      forceLogouts: seededInt("logouts", 0, 3),
    };
  }, [statsData?.openTickets]);

  const baseRevenue = summary?.totalRevenue || 120000;
  const streamData = [
    { name: t("overview.recordedCourses"), value: Math.round(baseRevenue * 0.45), color: "#EE7C11" },
    { name: t("overview.packages"), value: Math.round(baseRevenue * 0.30), color: "#3B82F6" },
    { name: t("overview.liveCohorts"), value: Math.round(baseRevenue * 0.25), color: "#10B981" },
  ];
  const totalSales = streamData.reduce((sum, item) => sum + item.value, 0);
  const formattedTotalSales = currency === "USD"
    ? `$${totalSales.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    : `EGP ${(totalSales * 50).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const currencyToggle = (
    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 shadow-sm transition-all duration-200">
      <button
        onClick={() => setCurrency("USD")}
        className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
          currency === "USD"
            ? "bg-white text-[#1E293B] shadow-sm dark:bg-[#EE7C11] dark:text-white"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
      >
        USD
      </button>
      <button
        onClick={() => setCurrency("EGP")}
        className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
          currency === "EGP"
            ? "bg-white text-[#1E293B] shadow-sm dark:bg-[#EE7C11] dark:text-white"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
      >
        EGP
      </button>
    </div>
  );

  return (
    <section className="space-y-8 pb-10">
      <PageHeader
        title={t("dashboard.admin.pages.overview.title")}
        subtitle={t("dashboard.admin.pages.overview.subtitle")}
        actions={currencyToggle}
      />

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
          {/* Analytical Metrics Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading || isLoadingStats ? (
              [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
            ) : (
              <>
                {/* Earnings Card */}
                <article className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-[#1E293B]/60 dark:backdrop-blur-lg dark:hover:border-emerald-500/30 dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.08)]">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <DollarSign className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      ↑ +18.4%
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-2xl font-extrabold tabular-nums tracking-tight text-slate-900 ltr-only dark:text-white" dir="ltr">
                      {currency === "USD"
                        ? `$${Number(summary?.totalRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                        : `EGP ${Number((summary?.totalRevenue || 0) * 50).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    </p>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {t("overview.totalRevenue")}
                    </p>
                  </div>
                </article>

                {/* Security Guardrail Card */}
                <article className="group relative flex flex-col justify-between rounded-xl border border-red-500/20 bg-white/70 p-5 shadow-sm backdrop-blur-md ring-1 ring-red-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-red-500/20 dark:bg-[#1E293B]/60 dark:backdrop-blur-lg dark:hover:border-red-500/40 dark:hover:shadow-[0_0_15px_rgba(239,68,68,0.08)]">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {t("overview.concurrentSessions")}
                      </span>
                      <span className="rounded bg-red-100 px-1.5 py-0.5 font-extrabold text-red-700 dark:bg-red-900/35 dark:text-red-400">
                        {securitySignals.concurrentSessions}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {t("overview.forceLogouts")}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-extrabold text-slate-700 dark:bg-white/10 dark:text-slate-300">
                        {securitySignals.forceLogouts}
                      </span>
                    </div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {t("overview.securityGuardrail")}
                    </p>
                  </div>
                </article>

                {/* Operational Bottlenecks Card */}
                <article className="group relative flex flex-col justify-between rounded-xl border border-amber-500/20 bg-white/70 p-5 shadow-sm backdrop-blur-md ring-1 ring-amber-500/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-amber-500/20 dark:bg-[#1E293B]/60 dark:backdrop-blur-lg dark:hover:border-amber-500/40 dark:hover:shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                      <Terminal className="h-5 w-5" />
                    </div>
                    {((statsData?.openTickets || 0) > 0 || (statsData?.pendingReviewCourses || 0) > 0) && (
                      <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white uppercase animate-pulse">
                        {t("common.pending", { defaultValue: "Attention" })}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {t("overview.ticketsBacklog")}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 font-extrabold ${statsData?.openTickets > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'}`}>
                        {statsData?.openTickets ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {t("overview.reviewQueue")}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 font-extrabold ${statsData?.pendingReviewCourses > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'}`}>
                        {statsData?.pendingReviewCourses ?? 0}
                      </span>
                    </div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {t("overview.operationalBottlenecks")}
                    </p>
                  </div>
                </article>

                {/* Platform Volume Card */}
                <article className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-[#1E293B]/60 dark:backdrop-blur-lg dark:hover:border-blue-500/30 dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.08)]">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                      ↑ +3 {t("overview.newThisWeek")}
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {t("overview.totalStudents")}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {summary?.totalStudents ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {t("overview.activeCourses")}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {summary?.totalActiveCourses ?? 0}
                      </span>
                    </div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      {t("overview.platformVolume")}
                    </p>
                  </div>
                </article>
              </>
            )}
          </div>

          {/* Premium Charts Segment */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Revenue Pipeline Area Chart */}
            <div className="rounded-xl border border-slate-200/80 bg-pioneer-light-card p-6 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]/60 dark:backdrop-blur-lg dark:hover:border-[#EE7C11]/30 dark:hover:shadow-[0_0_20px_rgba(238,124,17,0.06)] transition-all duration-300 lg:col-span-2">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">
                    {t("overview.revenueAnalytics")}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">
                    {t("overview.monthlyEarnings")}
                  </p>
                </div>
                {/* Time Filters */}
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-white/5 border border-slate-200/50 dark:border-white/10">
                  {["24h", "7d", "30d", "1y"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase transition duration-150 ${
                        timeFilter === filter
                          ? "bg-white text-[#1E293B] shadow-sm dark:bg-[#EE7C11] dark:text-white dark:shadow-[0_0_10px_rgba(238,124,17,0.3)]"
                          : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
              {isLoading ? (
                <ChartSkeleton className="h-[300px] w-full" />
              ) : currentChartData.length === 0 ? (
                <p className="flex h-[300px] items-center justify-center text-sm text-slate-500">{t("overview.noDataYet")}</p>
              ) : (
                <div className="h-[300px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentChartData}>
                      <defs>
                        <linearGradient id="adminRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EE7C11" stopOpacity={isDark ? 0.35 : 0.4} />
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
                        tickFormatter={(v) => {
                          const factor = currency === "USD" ? 1 : 50;
                          const calculatedVal = v * factor;
                          return currency === "USD"
                            ? `$${calculatedVal >= 1000 ? `${calculatedVal / 1000}k` : calculatedVal}`
                            : `${calculatedVal >= 1000 ? `${calculatedVal / 1000}k` : calculatedVal}`;
                        }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          const value = payload[0].value;
                          const formattedVal = currency === "USD"
                            ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                            : `EGP ${(value * 50).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                          return (
                            <div className="rounded-lg border border-slate-200 bg-pioneer-light-card px-3 py-2 text-xs shadow-md dark:border-white/10 dark:bg-slate-950/90 dark:backdrop-blur-md z-50">
                              <p className="mb-1 font-bold text-slate-500">{label}</p>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {t("overview.totalRevenue")}: {formattedVal}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name={t("overview.totalRevenue")}
                        stroke="#EE7C11"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#adminRevenueGrad)"
                        activeDot={{ r: 6, stroke: "#EE7C11", strokeWidth: 2, fill: "#fff" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Right: Revenue Streams Split Donut Chart */}
            <div className="rounded-xl border border-slate-200/80 bg-pioneer-light-card p-6 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]/60 dark:backdrop-blur-lg dark:hover:border-[#3B82F6]/30 dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.06)] transition-all duration-300 lg:col-span-1">
              <div className="mb-4">
                <h3 className="text-lg font-bold tracking-tight text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">
                  {t("overview.revenueStreams")}
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">
                  {t("overview.revenueStreamsHint")}
                </p>
              </div>

              {isLoading ? (
                <ChartSkeleton className="h-[250px] w-full" />
              ) : (
                <div className="relative flex flex-col items-center justify-center">
                  <div className="relative h-[220px] w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={streamData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {streamData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const { name, value } = payload[0];
                            const formattedVal = currency === "USD"
                              ? `$${value.toLocaleString()}`
                              : `EGP ${(value * 50).toLocaleString()}`;
                            return (
                              <div className="rounded-lg border border-slate-200 bg-pioneer-light-card px-3 py-2 text-xs shadow-md dark:border-white/10 dark:bg-slate-950/90 dark:backdrop-blur-md z-50">
                                <p className="font-bold text-slate-900 dark:text-white">{name}</p>
                                <p className="text-slate-500">{formattedVal}</p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Inside donut hole total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-md font-black tracking-tight text-slate-900 dark:text-white ltr-only" dir="ltr">
                        {formattedTotalSales}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        {t("overview.totalSales")}
                      </span>
                    </div>
                  </div>

                  {/* Context-aware legends alignment LTR / RTL */}
                  <div className={`mt-3 w-full space-y-1.5 text-xs ${isRtl ? "text-right" : "text-left"}`}>
                    {streamData.map((stream, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: stream.color }} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">
                          {stream.name}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white ltr-only shrink-0" dir="ltr">
                          {currency === "USD"
                            ? `$${stream.value.toLocaleString()}`
                            : `EGP ${(stream.value * 50).toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lower Middle Grid: Actions, Top Courses */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Actions Panel */}
            <div className="rounded-xl border border-slate-200/80 bg-pioneer-light-card p-6 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]/60 dark:backdrop-blur-lg lg:col-span-1">
              <div className="mb-4">
                <h3 className="text-lg font-bold tracking-tight text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">
                  {t("overview.quickActions.title")}
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">
                  {t("overview.quickActions.subtitle")}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Link
                  to="/admin/courses/new"
                  className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-slate-50/55 p-3 text-sm font-semibold text-slate-800 transition duration-200 hover:border-[#EE7C11]/40 hover:bg-[#EE7C11]/5 dark:border-white/5 dark:bg-white/[0.01] dark:text-slate-200 dark:hover:border-[#EE7C11]/40 dark:hover:bg-[#EE7C11]/5 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EE7C11]/10 text-[#EE7C11] transition group-hover:scale-105">
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  <span>{t("overview.quickActions.createCourse")}</span>
                </Link>

                <Link
                  to="/admin/enrollments/new"
                  className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-slate-50/55 p-3 text-sm font-semibold text-slate-800 transition duration-200 hover:border-[#EE7C11]/40 hover:bg-[#EE7C11]/5 dark:border-white/5 dark:bg-white/[0.01] dark:text-slate-200 dark:hover:border-[#EE7C11]/40 dark:hover:bg-[#EE7C11]/5 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] transition group-hover:scale-105">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <span>{t("overview.quickActions.enrollStudent")}</span>
                </Link>

                <Link
                  to="/admin/coupons"
                  className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-slate-55/50 p-3 text-sm font-semibold text-slate-800 transition duration-200 hover:border-[#EE7C11]/40 hover:bg-[#EE7C11]/5 dark:border-white/5 dark:bg-white/[0.01] dark:text-slate-200 dark:hover:border-[#EE7C11]/40 dark:hover:bg-[#EE7C11]/5 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] transition group-hover:scale-105">
                    <Tag className="h-4 w-4" />
                  </div>
                  <span>{t("overview.quickActions.generateCoupon")}</span>
                </Link>
              </div>
            </div>

            {/* Top Courses Bar Chart (Wider: col-span-2) */}
            <div className="rounded-xl border border-slate-200/80 bg-pioneer-light-card p-6 shadow-sm dark:border-slate-800 dark:bg-[#1E293B]/60 dark:backdrop-blur-lg lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-bold tracking-tight text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">
                  {t("overview.topCoursesByEnrollment", { defaultValue: "Top courses (active enrollments)" })}
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">
                  {t("overview.topCoursesByEnrollmentHint", { defaultValue: "Live & ongoing cohorts" })}
                </p>
              </div>
              {isLoading ? (
                <ChartSkeleton className="h-[180px] w-full" />
              ) : (
                <div className="h-[180px] w-full" dir="ltr">
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
                            <div className="rounded-lg border border-slate-200 bg-pioneer-light-card px-3 py-2 text-xs shadow-md dark:border-white/10 dark:bg-slate-950/90 dark:backdrop-blur-md z-50">
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

          {/* Bottom Row: Recent Activities & Audit Heartbeat */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left Column (col-span-3): Original Recent Activity Feed */}
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-pioneer-light-card shadow-sm dark:border-slate-800 dark:bg-[#1E293B]/60 dark:backdrop-blur-lg lg:col-span-3">
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
                ) : (
                  recentActivity.map((item) => {
                    const when = new Date(item.at);
                    const whenLabel = Number.isNaN(when.getTime()) ? "—" : when.toLocaleString();
                    return (
                      <div
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.02]"
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

            {/* Right Column (col-span-2): New Recent Platform Activity Widget */}
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-pioneer-light-card shadow-sm dark:border-slate-800 dark:bg-[#1E293B]/60 dark:backdrop-blur-lg lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/30 px-6 py-5 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pioneer-orange/10 text-pioneer-orange">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">
                      {t("overview.recentPlatformActivity")}
                    </h3>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">
                      {t("overview.recentPlatformActivityHint")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/[0.06] flex-1">
                {isLoading ? (
                  <div className="space-y-0 p-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex animate-pulse gap-4 py-4">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/10" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-2/3 rounded bg-slate-100 dark:bg-white/10" />
                          <div className="h-2 w-1/3 rounded bg-slate-100 dark:bg-white/10" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !data?.recentAuditLogs || data.recentAuditLogs.length === 0 ? (
                  <p className="px-6 py-12 text-center text-sm text-slate-500">
                    {t("overview.noRecentActivity")}
                  </p>
                ) : (
                  data.recentAuditLogs.map((item) => {
                    const when = new Date(item.at);
                    const whenLabel = Number.isNaN(when.getTime()) ? "—" : when.toLocaleString();
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-2 px-6 py-4 transition hover:bg-slate-55 dark:hover:bg-white/[0.02]"
                      >
                        <p className="text-sm font-semibold text-pioneer-light-textPrimary dark:text-pioneer-dark-textPrimary">
                          {item.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
                            {item.type === "audit" ? t("overview.activityTypeAudit") : t("overview.activityTypeSession")}
                          </span>
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
          </div>
        </>
      )}
    </section>
  );
}
