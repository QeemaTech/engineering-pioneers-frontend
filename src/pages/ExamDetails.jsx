import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Clock3, FileText, Target } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useStudentExam } from "../features/student/exams/hooks";

function examTypeLabelKey(type) {
  const k = String(type || "STANDALONE").toUpperCase();
  if (["FINAL", "UNIT", "LESSON", "STANDALONE"].includes(k)) return `exams.type.${k}`;
  return "exams.type.STANDALONE";
}

function MetaItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pioneer-orange-light">
        <Icon className="h-5 w-5 text-pioneer-orange-normal" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-900">{value}</p>
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
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
        <p className="mt-4 text-red-600">{error?.response?.data?.message || t("examDetails.loadError", { defaultValue: "Exam not found." })}</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 text-sm text-pioneer-orange-normal hover:underline">
          {t("takeExam.retry")}
        </button>
      </div>
    );
  }

  const qCount = exam.questions?.length ?? 0;
  const typeKey = examTypeLabelKey(exam.type);
  const sub = exam.mySubmission;
  const finished = Boolean(sub?.submittedAt);

  return (
    <div className="min-h-screen bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <Link to="/exams" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-pioneer-orange-normal">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("examDetails.backToExams")}
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-pioneer-orange-light/50 to-white px-6 py-8 md:px-10">
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{exam.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{exam.description || t("examDetails.noDescription", { defaultValue: "No description provided." })}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <MetaItem icon={ClipboardList} label={t("examDetails.meta.examType")} value={t(typeKey)} />
              <MetaItem icon={Clock3} label={t("examDetails.meta.timeDuration")} value={`${exam.durationMinutes} ${t("takeExam.meta.minutes")}`} />
              <MetaItem icon={Target} label={t("examDetails.meta.passingScore")} value={`${exam.passingScore} / ${exam.totalPoints}`} />
              <MetaItem icon={FileText} label={t("examDetails.summary.questions")} value={String(qCount)} />
              <MetaItem icon={CalendarDays} label={t("examDetails.meta.status")} value={exam.status} />
            </div>
          </div>

          <div className="grid gap-8 px-6 py-8 md:grid-cols-2 md:px-10">
            <section>
              <h2 className="text-lg font-bold text-slate-900">{t("examDetails.about.title")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{exam.description || "—"}</p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900">{t("examDetails.instructions.title", { defaultValue: "Instructions" })}</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
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

          <div className="border-t border-slate-100 px-6 py-6 md:px-10">
            {finished && sub?.id ? (
              <div className="space-y-4">
                <p className="text-sm text-green-700">
                  {t("examDetails.alreadySubmitted", {
                    defaultValue: "You have submitted this exam.",
                  })}
                </p>
                <Link
                  to={`/exams/${exam.id}/results/${sub.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-pioneer-orange-normal bg-pioneer-orange-light px-8 py-3 text-sm font-bold text-pioneer-orange-normal hover:bg-pioneer-orange-light/80"
                >
                  {t("exams.actions.viewResults", { defaultValue: "View Results" })}
                </Link>
              </div>
            ) : exam.status === "AVAILABLE" ? (
              <Link
                to={`/exams/${exam.id}/take`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-8 py-3 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
              >
                <BookOpen className="h-4 w-4" />
                {sub && !sub.submittedAt
                  ? t("exams.continue", { defaultValue: "Continue exam" })
                  : t("examDetails.startExam", { defaultValue: "Start exam" })}
              </Link>
            ) : (
              <p className="text-sm text-amber-700">{t("examDetails.notAvailable", { status: exam.status })}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
