import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Clock, FileQuestion, Loader2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import DataTable from "../../components/dashboard/DataTable";
import { getErrorMessage } from "../../api/error";
import {
  useAddInstructorExamQuestion,
  useDeleteInstructorExamQuestion,
  useInstructorExamDetail,
  useInstructorExamSubmissions,
  useUpdateInstructorExamQuestion,
} from "../../features/instructor/exams/hooks";
import { AddQuestionForm, QuestionCard } from "./ExamQuestionEditor";

const CARD = "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1A1A22]";

function ExamStatusBadge({ status, t }) {
  const styles = {
    AVAILABLE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    UPCOMING: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    COMPLETED: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    EXPIRED: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[status] || styles.COMPLETED}`}>
      {t(`dashboard.instructor.exams.statusLabels.${status}`, { defaultValue: status })}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className={`${CARD} p-4`}>
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function InstructorExamDetail() {
  const { examId } = useParams();
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const { data: exam, isLoading: loadingExam, isError: examError, error: examErr } = useInstructorExamDetail(examId);
  const { data: submissions = [], isLoading: loadingSubs } = useInstructorExamSubmissions(examId);

  const addQ = useAddInstructorExamQuestion(examId);
  const updateQ = useUpdateInstructorExamQuestion(examId);
  const deleteQ = useDeleteInstructorExamQuestion(examId);

  const [notice, setNotice] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const pointsUsed = useMemo(
    () => (exam?.questions || []).reduce((sum, q) => sum + (Number(q.points) || 0), 0),
    [exam?.questions]
  );

  const handleAddQuestion = async (payload) => {
    setNotice(null);
    const nextOrder = (exam?.questions?.length || 0) + 1;
    try {
      await addQ.mutateAsync({ ...payload, order: nextOrder });
      setNotice({ type: "success", message: t("dashboard.instructor.exams.detailPage.questionAdded") });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, t("dashboard.instructor.exams.detailPage.addError")) });
      throw err;
    }
  };

  const handleUpdateQuestion = async (questionId, body) => {
    setNotice(null);
    await updateQ.mutateAsync({ questionId, body });
    setNotice({ type: "success", message: t("dashboard.instructor.exams.detailPage.questionSaved") });
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm(t("dashboard.instructor.exams.detailPage.deleteConfirm"))) return;
    setNotice(null);
    setDeletingId(questionId);
    try {
      await deleteQ.mutateAsync({ questionId });
      setNotice({ type: "success", message: t("dashboard.instructor.exams.detailPage.questionDeleted") });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, t("dashboard.instructor.exams.detailPage.deleteError")) });
    } finally {
      setDeletingId(null);
    }
  };

  if (loadingExam) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" />
      </div>
    );
  }

  if (examError || !exam) {
    return (
      <section className="space-y-3">
        <p className="text-red-600">{getErrorMessage(examErr, t("dashboard.instructor.exams.detailPage.loadError"))}</p>
        <Link to="/instructor/exams" className="inline-flex items-center gap-1 text-sm font-semibold text-[#EE7C11] hover:underline">
          {dir === "rtl" ? <ArrowRight className="h-4 w-4 rotate-180" /> : <ArrowRight className="h-4 w-4 rotate-180" />}
          {t("dashboard.instructor.exams.detailPage.back")}
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <Link
          to="/instructor/exams"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#EE7C11] hover:underline"
        >
          <ArrowRight className={`h-4 w-4 ${dir === "rtl" ? "" : "rotate-180"}`} />
          {t("dashboard.instructor.exams.detailPage.back")}
        </Link>

        <div className={`${CARD} p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <ExamStatusBadge status={exam.status} t={t} />
                {exam.course?.title ? (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{exam.course.title}</span>
                ) : null}
              </div>
              <h1 className="font-cairo text-2xl font-bold text-slate-900 dark:text-white">{exam.title}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {t("dashboard.instructor.exams.detailPage.metaLine", {
                  questions: exam.questions?.length ?? 0,
                  points: exam.totalPoints,
                  duration: exam.durationMinutes,
                })}
              </p>
              {exam.description ? (
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">{exam.description}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <Notice type={notice?.type} message={notice?.message} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileQuestion}
          label={t("dashboard.instructor.exams.questionsCount")}
          value={exam.questions?.length ?? 0}
          accent="text-[#EE7C11]"
        />
        <StatCard
          icon={Clock}
          label={t("dashboard.instructor.exams.duration")}
          value={`${exam.durationMinutes} ${t("dashboard.instructor.exams.minutesShort")}`}
          accent="text-blue-500"
        />
        <StatCard
          icon={FileQuestion}
          label={t("dashboard.instructor.exams.detailPage.pointsUsed")}
          value={`${pointsUsed} / ${exam.totalPoints}`}
          accent="text-violet-500"
        />
        <StatCard
          icon={Users}
          label={t("dashboard.instructor.exams.submissionsCount")}
          value={exam._count?.submissions ?? submissions.length}
          accent="text-emerald-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        {/* Add question */}
        <div className={`${CARD} p-5 xl:col-span-2`}>
          <h2 className="mb-1 text-base font-bold text-slate-900 dark:text-white">
            {t("dashboard.instructor.exams.detailPage.addQuestionTitle")}
          </h2>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            {t("dashboard.instructor.exams.detailPage.addQuestionHint")}
          </p>
          <AddQuestionForm onSubmit={handleAddQuestion} isPending={addQ.isPending} />
        </div>

        {/* Questions list */}
        <div className="space-y-4 xl:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t("dashboard.instructor.exams.detailPage.questionsTitle")}
            </h2>
            <span className="text-xs font-semibold text-slate-400">
              {exam.questions?.length ?? 0} {t("dashboard.instructor.exams.questionsCount")}
            </span>
          </div>

          {!exam.questions?.length ? (
            <div className={`${CARD} p-10 text-center`}>
              <FileQuestion className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                {t("dashboard.instructor.exams.detailPage.questionsEmpty")}
              </p>
              <p className="mt-1 text-xs text-slate-400">{t("dashboard.instructor.exams.detailPage.questionsEmptyHint")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exam.questions.map((q, i) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={i}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                  isUpdating={updateQ.isPending}
                  isDeleting={deletingId === q.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submissions */}
      <div className={`${CARD} overflow-hidden`}>
        <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t("dashboard.instructor.exams.detailPage.submissionsTitle")}
          </h2>
        </div>
        <div className="p-2">
          {loadingSubs ? (
            <p className="p-4 text-sm text-slate-500">{t("dashboard.common.loading")}</p>
          ) : (
            <DataTable
              columns={[
                {
                  key: "student",
                  title: t("dashboard.instructor.exams.detailPage.student"),
                  render: (_, row) => row.student?.fullName || "—",
                },
                {
                  key: "totalScore",
                  title: t("dashboard.instructor.exams.detailPage.score"),
                  render: (v) => (v == null ? "—" : String(v)),
                },
                {
                  key: "isPassed",
                  title: t("dashboard.instructor.exams.detailPage.passed"),
                  render: (v) =>
                    v === true
                      ? t("dashboard.instructor.exams.detailPage.yes")
                      : v === false
                        ? t("dashboard.instructor.exams.detailPage.no")
                        : "—",
                },
                {
                  key: "submittedAt",
                  title: t("dashboard.instructor.exams.detailPage.submitted"),
                  render: (v) => (v ? new Date(v).toLocaleString() : t("dashboard.instructor.exams.detailPage.pending")),
                },
              ]}
              rows={submissions}
              emptyNode={
                <p className="p-6 text-center text-sm text-slate-500">{t("dashboard.instructor.exams.detailPage.noSubmissions")}</p>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default InstructorExamDetail;
