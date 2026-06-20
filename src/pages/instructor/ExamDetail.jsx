import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/dashboard/DataTable";
import { getErrorMessage } from "../../api/error";
import {
  useAddInstructorExamQuestion,
  useInstructorExamDetail,
  useInstructorExamSubmissions,
} from "../../features/instructor/exams/hooks";

function InstructorExamDetail() {
  const { examId } = useParams();
  const { t } = useTranslation();
  const { data: exam, isLoading: loadingExam, isError: examError, error: examErr } = useInstructorExamDetail(
    examId
  );
  const { data: submissions = [], isLoading: loadingSubs } = useInstructorExamSubmissions(examId);
  const addQ = useAddInstructorExamQuestion(examId);

  const [notice, setNotice] = useState(null);
  const [qText, setQText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [correct, setCorrect] = useState("a");
  const [qPoints, setQPoints] = useState("1");

  const submitQuestion = async (e) => {
    e.preventDefault();
    setNotice(null);
    const pts = Number(qPoints);
    const nextOrder = (exam?.questions?.length || 0) + 1;
    if (!qText.trim() || !optA.trim() || !optB.trim() || Number.isNaN(pts) || pts < 1) {
      setNotice({ type: "error", message: t("dashboard.common.validation") });
      return;
    }
    try {
      await addQ.mutateAsync({
        questionText: qText.trim(),
        type: "MULTIPLE_CHOICE",
        points: pts,
        order: nextOrder,
        options: [
          { id: "a", text: optA.trim() },
          { id: "b", text: optB.trim() },
        ],
        correctAnswer: correct,
      });
      setNotice({ type: "success", message: t("dashboard.instructor.exams.detailPage.questionAdded") });
      setQText("");
      setOptA("");
      setOptB("");
      setCorrect("a");
      setQPoints("1");
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Failed to add question.") });
    }
  };

  if (loadingExam) {
    return <p className="text-slate-500 dark:text-slate-400">{t("dashboard.common.loading")}</p>;
  }

  if (examError || !exam) {
    return (
      <section>
        <p className="text-red-600">{getErrorMessage(examErr, t("dashboard.instructor.exams.detailPage.loadError"))}</p>
        <Link to="/instructor/exams" className="mt-2 inline-block text-pioneer-orange-normal underline">
          {t("dashboard.instructor.exams.detailPage.back")}
        </Link>
      </section>
    );
  }

  const metaLine = t("dashboard.instructor.exams.detailPage.metaLine", {
    questions: exam.questions?.length ?? 0,
    points: exam.totalPoints,
    duration: exam.durationMinutes,
  });

  return (
    <section className="space-y-8">
      <div>
        <Link to="/instructor/exams" className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
          ← {t("dashboard.instructor.exams.detailPage.back")}
        </Link>
        <PageHeader title={exam.title} subtitle={metaLine} />
        {exam.description && (
          <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">{exam.description}</p>
        )}
      </div>

      <Notice type={notice?.type} message={notice?.message} />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
          {t("dashboard.instructor.exams.detailPage.addMcTitle")}
        </h3>
        <form onSubmit={submitQuestion} className="grid gap-3 md:grid-cols-2">
          <label className="md:col-span-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("dashboard.instructor.exams.detailPage.questionText")}
            <textarea
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("dashboard.instructor.exams.detailPage.optionA")}
            <input
              value={optA}
              onChange={(e) => setOptA(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("dashboard.instructor.exams.detailPage.optionB")}
            <input
              value={optB}
              onChange={(e) => setOptB(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("dashboard.instructor.exams.detailPage.correct")}
            <select
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            >
              <option value="a">A</option>
              <option value="b">B</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {t("dashboard.instructor.exams.detailPage.points")}
            <input
              type="number"
              min={1}
              value={qPoints}
              onChange={(e) => setQPoints(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              required
            />
          </label>
          <div className="flex items-end md:col-span-2">
            <button
              type="submit"
              disabled={addQ.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2 text-sm font-semibold text-white"
            >
              {addQ.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("dashboard.instructor.exams.detailPage.addQuestion")}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
          {t("dashboard.instructor.exams.detailPage.questionsTitle")}
        </h3>
        <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {(exam.questions || []).map((q, i) => (
            <li key={q.id} className="rounded-xl border border-slate-200/80 bg-white p-3 dark:border-white/10 dark:bg-[#1A1A22]">
              <span className="font-semibold text-slate-900 dark:text-white">
                {i + 1}.{" "}
              </span>
              {q.questionText}{" "}
              <span className="text-slate-400">
                ({q.points} {t("dashboard.instructor.exams.points")})
              </span>
            </li>
          ))}
          {!exam.questions?.length && (
            <li className="text-slate-500 dark:text-slate-400">{t("dashboard.instructor.exams.emptyDescription")}</li>
          )}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-white">
          {t("dashboard.instructor.exams.detailPage.submissionsTitle")}
        </h3>
        {loadingSubs ? (
          <p className="text-slate-500">{t("dashboard.common.loading")}</p>
        ) : (
          <DataTable
            columns={[
              { key: "student", title: t("dashboard.instructor.exams.detailPage.student"), render: (_, row) => row.student?.fullName || "—" },
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
          />
        )}
      </div>
    </section>
  );
}

export default InstructorExamDetail;
