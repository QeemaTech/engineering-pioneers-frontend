import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useExamResult } from "../features/student/exams/hooks";

export default function ExamResult() {
  const { t } = useTranslation();
  const { id: examId, submissionId } = useParams();
  const { data: result, isLoading, isError, error, refetch } = useExamResult(examId, submissionId);

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500">{t("dashboard.common.loading")}</div>;
  }

  if (isError || !result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
        <p className="mt-4 text-red-600">{error?.response?.data?.message || t("examResult.loadError")}</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 text-sm text-pioneer-orange-normal hover:underline">
          {t("takeExam.retry")}
        </button>
        <Link to="/exams" className="mt-6 block text-sm text-slate-500 hover:text-pioneer-orange-normal">
          {t("examDetails.backToExams")}
        </Link>
      </div>
    );
  }

  const passed = !!result.isPassed;
  const score = result.totalScore ?? 0;
  const max = result.exam?.totalPoints ?? 1;
  const pct = Math.round((score / max) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <Link to="/exams" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-pioneer-orange-normal">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("examDetails.backToExams")}
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-pioneer-orange-light/40 to-white px-6 py-8">
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${passed ? "bg-green-100" : "bg-[#EE7C11]/10"}`}>
                {passed ? <CheckCircle2 className="h-8 w-8 text-green-600" /> : <XCircle className="h-8 w-8 text-pioneer-orange-normal" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{result.exam?.title || t("examResult.title")}</h1>
                <p className="mt-2 text-sm text-slate-600">
                  {t("examResult.scoreSummary", { score, max, pct })}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {t("examResult.passingLine", { passing: result.exam?.passingScore ?? "—" })}
                </p>
              </div>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-pioneer-orange-normal transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
          </div>

          <div className="divide-y divide-slate-100 px-6 py-6">
            {(result.answers || []).map((a, idx) => (
              <div key={a.questionId || idx} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-slate-900">{a.question?.questionText || `Q${idx + 1}`}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {t("examResult.yourAnswer")}: <span className="font-medium text-slate-700">{a.answerText || "—"}</span>
                </p>
                {a.question?.correctAnswer != null && String(a.question.correctAnswer).length > 0 ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {t("examResult.correctAnswer")}: <span className="font-medium text-slate-700">{a.question.correctAnswer}</span>
                  </p>
                ) : null}
                <p className="mt-1 text-xs">
                  <span className={a.isCorrect ? "font-semibold text-green-600" : "font-semibold text-pioneer-orange-normal"}>
                    {a.isCorrect ? t("examResult.correct") : t("examResult.incorrect")} · {a.pointsEarned ?? 0} / {a.question?.points ?? "—"}{" "}
                    {t("examResult.pts")}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
