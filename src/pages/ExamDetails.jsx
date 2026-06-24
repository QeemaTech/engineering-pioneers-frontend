import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Clock3, FileText, Target } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/dashboard/PageHeader";
import { useStudentExam } from "../features/student/exams/hooks";

function examTypeLabelKey(type) {
  const k = String(type || "STANDALONE").toUpperCase();
  if (["FINAL", "UNIT", "LESSON", "STANDALONE"].includes(k)) return `exams.type.${k}`;
  return "exams.type.STANDALONE";
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pioneer-orange-light dark:bg-pioneer-orange-normal/15">
        <Icon className="h-5 w-5 text-pioneer-orange-normal" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function ExamDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data: exam, isLoading, isError, error, refetch } = useStudentExam(id);

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500">{t("dashboard.common.loading")}</div>;
  }

  if (isError || !exam) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
        <p className="mt-4 text-red-600">{error?.response?.data?.message || t("examDetails.loadError", { defaultValue: "Exam not found." })}</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 text-sm text-pioneer-orange-normal hover:underline">
          {t("takeExam.retry")}
        </button>
        <Link to="/student/exams" className="mt-6 block text-sm text-slate-500 hover:text-pioneer-orange-normal">
          {t("examDetails.backToExams")}
        </Link>
      </div>
    );
  }

  const qCount = exam.questions?.length ?? 0;
  const typeKey = examTypeLabelKey(exam.type);
  const sub = exam.mySubmission;
  const finished = Boolean(sub?.submittedAt);

  return (
    <div className="space-y-6">
      <Link to="/student/exams" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-pioneer-orange-normal">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("examDetails.backToExams")}
      </Link>

      <PageHeader title={exam.title} subtitle={exam.description || t("examDetails.noDescription", { defaultValue: "No description provided." })} />

      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-pioneer-orange-light/50 to-white px-6 py-6 dark:border-slate-700/40 dark:from-pioneer-orange-normal/10 dark:to-[#1E293B] md:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <MetaItem icon={ClipboardList} label={t("examDetails.meta.examType")} value={t(typeKey)} />
            <MetaItem icon={Clock3} label={t("examDetails.meta.timeDuration")} value={`${exam.durationMinutes} ${t("takeExam.meta.minutes")}`} />
            <MetaItem icon={Target} label={t("examDetails.meta.passingScore")} value={`${exam.passingScore} / ${exam.totalPoints}`} />
            <MetaItem icon={FileText} label={t("examDetails.summary.questions")} value={String(qCount)} />
            <MetaItem icon={CalendarDays} label={t("examDetails.meta.status")} value={exam.status} />
          </div>
        </div>

        <div className="grid gap-8 px-6 py-8 md:grid-cols-2 md:px-8">
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("examDetails.about.title")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{exam.description || "—"}</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("examDetails.instructions.title", { defaultValue: "Instructions" })}</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                {t("examDetails.ins.timer")}
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                {t("examDetails.ins.graded")}
              </li>
            </ul>
          </section>
        </div>

        <div className="border-t border-slate-100 px-6 py-6 dark:border-slate-700/40 md:px-8">
          {finished && sub?.id ? (
            <div className="space-y-4">
              <p className="text-sm text-green-700 dark:text-green-400">
                {t("examDetails.alreadySubmitted", { defaultValue: "You have submitted this exam." })}
              </p>
              <Link
                to={`/student/exams/${exam.id}/results/${sub.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-pioneer-orange-normal bg-pioneer-orange-light px-8 py-3 text-sm font-bold text-pioneer-orange-normal hover:bg-pioneer-orange-light/80 dark:bg-pioneer-orange-normal/10"
              >
                {t("exams.actions.viewResults", { defaultValue: "View Results" })}
              </Link>
            </div>
          ) : exam.status === "AVAILABLE" ? (
            <Link
              to={`/student/exams/${exam.id}/take`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-8 py-3 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
            >
              <BookOpen className="h-4 w-4" />
              {sub && !sub.submittedAt ? t("exams.continue", { defaultValue: "Continue exam" }) : t("examDetails.startExam", { defaultValue: "Start exam" })}
            </Link>
          ) : (
            <p className="text-sm text-amber-700 dark:text-amber-400">{t("examDetails.notAvailable", { status: exam.status })}</p>
          )}
        </div>
      </div>
    </div>
  );
}
