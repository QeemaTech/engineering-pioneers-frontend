import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, Clock3, FileText, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useStudentExams } from "../features/student/exams/hooks";

const STATUS_MAP = {
  UPCOMING: { label: "exams.status.upcoming", style: "bg-pioneer-teal-light text-pioneer-teal-dark" },
  AVAILABLE: { label: "exams.status.available", style: "bg-cyan-50 text-cyan-700" },
  COMPLETED: { label: "exams.status.completed", style: "bg-green-50 text-green-600" },
  EXPIRED: { label: "exams.status.expired", style: "bg-slate-100 text-slate-500" },
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
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center md:text-start">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {t("exams.titlePrefix")}{" "}
            <span className="text-pioneer-orange-normal">{t("exams.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500 md:mx-0">{t("exams.subtitle")}</p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-slate-400 md:mx-0">{t("exams.enrolledOnlyHint")}</p>
        </div>

        <div className="relative mx-auto mt-8 max-w-xl md:mx-0">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("exams.searchPlaceholder")}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-10 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light"
          />
        </div>

        {isLoading ? <p className="mt-12 text-center text-slate-500">{t("dashboard.common.loading")}</p> : null}
        {isError ? (
          <div className="mt-12 text-center text-red-600">
            {t("exams.loadError", { defaultValue: "Could not load exams." })}
            <button type="button" onClick={() => void refetch()} className="ms-3 text-sm font-semibold text-pioneer-orange-normal hover:underline">
              {t("takeExam.retry")}
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && filtered.length === 0 ? (
          <p className="mt-12 text-center text-slate-500">{t("exams.empty", { defaultValue: "No exams found." })}</p>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
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
                  <article key={exam.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{exam.title}</h3>
                          <p className="mt-0.5 text-xs font-medium text-pioneer-orange-normal">{courseLabel(exam)}</p>
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t(typeKey)}</p>
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
                        <div className="mt-3">
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-pioneer-orange-normal" style={{ width: `${Math.min(100, scorePct)}%` }} />
                          </div>
                        </div>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          to={`/exams/${exam.id}`}
                          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal"
                        >
                          {t("exams.actions.viewDetails", { defaultValue: "View Exam Details" })}
                        </Link>
                        {studentFinished && sub?.id ? (
                          <Link
                            to={`/exams/${exam.id}/results/${sub.id}`}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal"
                          >
                            {t("exams.actions.viewResults", { defaultValue: "View Results" })}
                          </Link>
                        ) : null}
                        {exam.status === "AVAILABLE" && !studentFinished ? (
                          <Link
                            to={`/exams/${exam.id}/take`}
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
    </div>
  );
}
