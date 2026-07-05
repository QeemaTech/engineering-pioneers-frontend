import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, Clock3, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import PageHeader from "../components/dashboard/PageHeader";
import { useStudentExams } from "../features/student/exams/hooks";

const STATUS_MAP = {
  UPCOMING: { label: "exams.status.upcoming", style: "bg-pioneer-teal-light text-pioneer-teal-dark" },
  AVAILABLE: { label: "exams.status.available", style: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300" },
  COMPLETED: { label: "exams.status.completed", style: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" },
  EXPIRED: { label: "exams.status.expired", style: "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400" },
};

function courseLabel(exam) {
  return exam.course?.title || exam.unit?.course?.title || exam.lesson?.unit?.course?.title || exam.unit?.title || "—";
}

function examTypeLabelKey(type) {
  const k = String(type || "STANDALONE").toUpperCase();
  if (["FINAL", "UNIT", "LESSON", "STANDALONE"].includes(k)) return `exams.type.${k}`;
  return "exams.type.STANDALONE";
}

export default function Exams() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const { data: exams = [], isLoading, isError, refetch } = useStudentExams();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return exams;
    return exams.filter((e) => (e.title || "").toLowerCase().includes(s) || courseLabel(e).toLowerCase().includes(s));
  }, [exams, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t("header.dashboardMenu.studentPanel", { defaultValue: "Student panel" })}
        title={
          <>
            {t("exams.titlePrefix")}{" "}
            <span className="text-pioneer-orange-normal">{t("exams.titleAccent")}</span>
          </>
        }
        subtitle={t("exams.subtitle")}
      />
      <p className="-mt-4 text-xs text-slate-500">{t("exams.enrolledOnlyHint")}</p>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("exams.searchPlaceholder")}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-10 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal dark:border-slate-600 dark:bg-[#1E293B] dark:text-white"
        />
      </div>

      {isLoading ? <p className="text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <div className="text-red-600">
          {t("exams.loadError", { defaultValue: "Could not load exams." })}
          <button type="button" onClick={() => void refetch()} className="ms-3 text-sm font-semibold text-pioneer-orange-normal hover:underline">
            {t("takeExam.retry")}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && filtered.length === 0 ? (
        <p className="py-12 text-center text-slate-500">{t("exams.empty", { defaultValue: "No exams found." })}</p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {!isLoading && !isError
          ? filtered.map((exam) => {
              const sub = exam.mySubmission;
              const studentFinished = Boolean(sub?.submittedAt);
              const inProgress = Boolean(sub && !sub.submittedAt);
              const displayStatus = studentFinished ? "COMPLETED" : exam.status;
              const st = STATUS_MAP[displayStatus] || STATUS_MAP.UPCOMING;
              const typeKey = examTypeLabelKey(exam.type);
              const maxPts = Number(exam.totalPoints) || 1;
              const score = sub?.totalScore != null ? Number(sub.totalScore) : null;
              const scorePct = studentFinished && score != null ? Math.round((score / maxPts) * 100) : null;

              return (
                <article
                  key={exam.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition hover:border-pioneer-orange-normal/30 dark:border-slate-700/40 dark:bg-[#1E293B]"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{exam.title}</h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {courseLabel(exam) !== "—" ? (
                            <p className="text-xs font-medium text-pioneer-orange-normal">{courseLabel(exam)}</p>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                              {t("explore.free", { defaultValue: "FREE / مجاني" })}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-550 dark:text-slate-400">{t(typeKey)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${st.style}`}>{t(st.label)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                      {exam.scheduledAt ? (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(exam.scheduledAt).toLocaleString()}
                        </span>
                      ) : null}
                      {studentFinished && sub?.submittedAt ? (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {t("exams.completedOn")}: {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {exam.durationMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {studentFinished && score != null
                          ? t("exams.scoreLine", { score, max: maxPts, pct: scorePct })
                          : `${exam.totalPoints} pts`}
                      </span>
                    </div>
                    {studentFinished && scorePct != null ? (
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                        <div className="h-full rounded-full bg-pioneer-orange-normal" style={{ width: `${Math.min(100, scorePct)}%` }} />
                      </div>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to={`/student/exams/${exam.id}`}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal dark:border-slate-600 dark:text-slate-200"
                      >
                        {t("exams.actions.viewDetails", { defaultValue: "View Exam Details" })}
                      </Link>
                      {studentFinished && sub?.id ? (
                        <Link
                          to={`/student/exams/${exam.id}/results/${sub.id}`}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal dark:border-slate-600 dark:text-slate-200"
                        >
                          {t("exams.actions.viewResults", { defaultValue: "View Results" })}
                        </Link>
                      ) : null}
                      {exam.status === "AVAILABLE" && !studentFinished ? (
                        <Link
                          to={`/student/exams/${exam.id}/take`}
                          className="rounded-lg bg-pioneer-orange-normal px-4 py-2 text-sm font-semibold text-white hover:bg-pioneer-orange-hover"
                        >
                          {inProgress ? t("exams.continue", { defaultValue: "Continue exam" }) : t("exams.start", { defaultValue: "Start" })}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </div>
  );
}
