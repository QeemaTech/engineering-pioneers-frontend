import { useTranslation } from "react-i18next";
import { BookOpen, Calendar, DollarSign, Star, MessageSquare, TrendingUp, Users, Wallet, Activity } from "lucide-react";
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
import { useInstructorOverview } from "../../features/instructor/overview/hooks";
const BAR_COLORS = ["#EE7C11", "#ca9a1a", "#64748B", "#10B981", "#8B5CF6"];

function ChartTooltip({ active, payload, label, valuePrefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-white/10 dark:bg-[#1E1E2A]">
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
  return <div className="h-[140px] animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-white/8 dark:bg-white/5" />;
}

function ChartSkeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-white/8 dark:bg-white/5 ${className}`} />
  );
}

export default function Overview() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useInstructorOverview();

  const summary = data?.summary;
  const earningsTrend = data?.earningsTrend ?? [];
  const topCohorts = data?.topCohortsByEnrollments ?? [];
  const recentActivity = data?.recentActivity ?? [];

  const cohortChartData = topCohorts.map((c) => ({
    name: c.name.length > 20 ? `${c.name.slice(0, 18)}…` : c.name,
    fullName: c.name,
    enrollments: c.enrollmentCount,
  }));

  return (
    <section className="space-y-8">
      <PageHeader
        title={t("dashboard.instructor.pages.overview.title")}
        subtitle={t("dashboard.instructor.pages.overview.subtitle")}
      />

      {isError ? (
        <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-200">
          {error?.message || t("common.error", { defaultValue: "Something went wrong." })}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label={t("dashboard.instructor.overview.totalStudents", { defaultValue: "Total students" })}
              value={summary?.totalStudents ?? 0}
              icon={Users}
              colorClass="blue"
            />
            <StatCard
              label={t("dashboard.instructor.overview.activeCohorts", { defaultValue: "Active cohorts" })}
              value={summary?.activeCohorts ?? 0}
              icon={BookOpen}
              colorClass="purple"
            />
            <StatCard
              label={t("dashboard.instructor.overview.upcomingCohorts", { defaultValue: "Upcoming cohorts" })}
              value={summary?.upcomingCohorts ?? 0}
              icon={Calendar}
              colorClass="amber"
            />
            <StatCard
              label={t("dashboard.instructor.overview.totalEarnings", { defaultValue: "Total earnings" })}
              value={`$${Number(summary?.totalEarnings ?? 0).toLocaleString()}`}
              icon={DollarSign}
              colorClass="green"
            />
            <StatCard
              label={t("dashboard.instructor.overview.walletBalance", { defaultValue: "Wallet balance" })}
              value={`$${Number(summary?.walletBalance ?? 0).toLocaleString()}`}
              icon={Wallet}
              colorClass="amber"
            />
            <StatCard
              label={t("dashboard.instructor.stats.averageRating")}
              value={summary?.averageRating != null ? Number(summary.averageRating).toFixed(1) : "—"}
              icon={Star}
              colorClass="blue"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22] lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {t("dashboard.instructor.overview.earningsTrend", { defaultValue: "Earnings trend" })}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("overview.monthlyEarnings")}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EE7C11]/10 text-pioneer-orange-normal">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          {isLoading ? (
            <ChartSkeleton className="h-[300px] w-full" />
          ) : earningsTrend.length === 0 || earningsTrend.every((m) => m.total === 0) ? (
            <p className="flex h-[300px] items-center justify-center text-sm text-slate-500">{t("overview.noDataYet")}</p>
          ) : (
            <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={earningsTrend}>
                  <defs>
                    <linearGradient id="instructorEarnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ca9a1a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ca9a1a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip content={(props) => <ChartTooltip {...props} valuePrefix="$" />} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name={t("dashboard.instructor.overview.earnings", { defaultValue: "Earnings" })}
                    stroke="#ca9a1a"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#instructorEarnGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="mb-6">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {t("dashboard.instructor.overview.reviewsSnapshot", { defaultValue: "Reviews" })}
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("dashboard.instructor.stats.totalReviews")}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-full border-8 border-red-50 text-pioneer-orange-normal ring-8 ring-pioneer-orange-light/10 dark:border-white/10">
              <MessageSquare className="h-10 w-10" />
            </div>
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-white/10" />
            ) : (
              <>
                <p className="text-center text-3xl font-bold text-slate-900 dark:text-white">
                  {summary?.totalReviews ?? 0}
                </p>
                <p className="mt-1 text-center text-sm font-medium text-slate-500">
                  {t("dashboard.instructor.overview.avgRatingLine", {
                    defaultValue: "Avg. {{rating}} / 5",
                    rating: summary?.averageRating != null ? Number(summary.averageRating).toFixed(1) : "—",
                  })}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="mb-6">
          <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            {t("dashboard.instructor.overview.topCohorts", { defaultValue: "Top cohorts by enrollment" })}
          </h3>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("dashboard.instructor.overview.allYourCohorts", { defaultValue: "All your cohorts" })}
          </p>
        </div>
        {isLoading ? (
          <ChartSkeleton className="h-[280px] w-full" />
        ) : cohortChartData.length === 0 ? (
          <p className="flex h-[200px] items-center justify-center text-sm text-slate-500">{t("overview.noDataYet")}</p>
        ) : (
          <div className="h-[280px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cohortChartData} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={96}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0]?.payload;
                    return (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-white/10 dark:bg-[#1E1E2A]">
                        <p className="font-semibold text-slate-900 dark:text-white">{row?.fullName}</p>
                        <p className="mt-1 text-slate-600 dark:text-slate-300">
                          {t("overview.enrollmentCount", { defaultValue: "Enrollments" })}: {row?.enrollments}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="enrollments" radius={[0, 4, 4, 0]} barSize={16}>
                  {cohortChartData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EE7C11]/10 text-[#EE7C11]">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{t("overview.activityFeed")}</h3>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
              {t("overview.recentActivityHint", { defaultValue: "Latest enrollments & payments" })}
            </p>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {isLoading ? (
            <div className="p-4">
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
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      <span className="text-pioneer-orange-normal">{item.studentName}</span>
                      <span className="mx-1 text-slate-400">·</span>
                      {item.label}
                    </p>
                    {item.detail ? <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p> : null}
                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {item.type === "payment"
                        ? t("overview.activityPayment", { defaultValue: "Payment" })
                        : t("nav.enrollments")}
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
    </section>
  );
}
