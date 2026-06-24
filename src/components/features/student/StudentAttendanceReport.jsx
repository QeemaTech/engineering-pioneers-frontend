import { CheckCircle2, UserX, LogOut, Radio } from "lucide-react";
import { useTranslation } from "react-i18next";

const STATUS_STYLES = {
  PRESENT: {
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    labelKey: "studentAttendance.status.present",
  },
  LEFT: {
    icon: LogOut,
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    labelKey: "studentAttendance.status.left",
  },
  ABSENT: {
    icon: UserX,
    className: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300",
    labelKey: "studentAttendance.status.absent",
  },
};

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.ABSENT;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {t(cfg.labelKey)}
    </span>
  );
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold tabular-nums ${accent || "text-slate-900 dark:text-white"}`}>{value}</p>
    </div>
  );
}

export default function StudentAttendanceReport({ summary, records = [], live = false, emptyMessage }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en";

  if (!records.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
        {emptyMessage || t("studentAttendance.empty")}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {live ? (
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          {t("studentAttendance.live")}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label={t("studentAttendance.summary.total")} value={summary?.totalSessions ?? 0} />
        <SummaryCard
          label={t("studentAttendance.summary.present")}
          value={summary?.presentCount ?? 0}
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <SummaryCard
          label={t("studentAttendance.summary.absent")}
          value={summary?.absentCount ?? 0}
          accent="text-red-600 dark:text-red-400"
        />
        <SummaryCard
          label={t("studentAttendance.summary.rate")}
          value={`${summary?.attendanceRatePercent ?? 0}%`}
          accent="text-pioneer-orange-normal"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
                <th className="px-4 py-3">{t("studentAttendance.col.session")}</th>
                <th className="px-4 py-3">{t("studentAttendance.col.course")}</th>
                <th className="px-4 py-3">{t("studentAttendance.col.date")}</th>
                <th className="px-4 py-3">{t("studentAttendance.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => (
                <tr key={row.sessionId} className="border-b border-slate-50 last:border-0 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {row.title || t("studentAttendance.untitledSession")}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.courseTitle}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {row.startTime ? new Date(row.startTime).toLocaleString(locale) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
