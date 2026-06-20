import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmptyState from "../../components/dashboard/EmptyState";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { getErrorMessage } from "../../api/error";
import {
  useGradeHomeworkSubmission,
  useInstructorHomeworkQueue,
  usePatchHomeworkReviewStatus,
} from "../../features/instructor/homework/hooks";

const TABS = ["all", "notOpened", "opened", "closed"];

function tabMatches(tab, sub) {
  const graded = sub.status === "GRADED";
  const closed = graded || sub.instructorReviewStatus === "CLOSED";
  const opened = sub.instructorReviewStatus === "OPENED";
  const notOpened = sub.instructorReviewStatus === "NOT_OPENED" && !graded;

  if (tab === "all") return true;
  if (tab === "closed") return closed;
  if (tab === "opened") return !graded && opened;
  if (tab === "notOpened") return notOpened;
  return true;
}

function Homework() {
  const { t } = useTranslation();
  const { data, isLoading } = useInstructorHomeworkQueue();
  const submissions = data?.submissions ?? [];
  const counts = data?.counts ?? { notOpened: 0, opened: 0, closed: 0 };

  const gradeMutation = useGradeHomeworkSubmission();
  const reviewMutation = usePatchHomeworkReviewStatus();

  const [notice, setNotice] = useState(null);
  const [tab, setTab] = useState("all");
  const [active, setActive] = useState(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  const filtered = useMemo(() => submissions.filter((s) => tabMatches(tab, s)), [submissions, tab]);

  const openGrade = async (sub) => {
    setNotice(null);
    setActive(sub);
    setGrade(sub.grade != null ? String(sub.grade) : "");
    setFeedback(sub.feedback || "");
    if (sub.instructorReviewStatus === "NOT_OPENED" && sub.status === "PENDING") {
      try {
        await reviewMutation.mutateAsync({ submissionId: sub.id, instructorReviewStatus: "OPENED" });
      } catch {
        /* queue still usable */
      }
    }
  };

  const submitGrade = async (e) => {
    e.preventDefault();
    if (!active) return;
    const g = Number(grade);
    if (Number.isNaN(g) || g < 0) {
      setNotice({ type: "error", message: "Enter a valid grade." });
      return;
    }
    setNotice(null);
    try {
      await gradeMutation.mutateAsync({
        submissionId: active.id,
        grade: g,
        feedback: feedback || "",
      });
      setNotice({ type: "success", message: "Submission graded." });
      setActive(null);
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Grading failed.") });
    }
  };

  const setReviewState = async (submissionId, instructorReviewStatus) => {
    setNotice(null);
    try {
      await reviewMutation.mutateAsync({ submissionId, instructorReviewStatus });
      setNotice({ type: "success", message: t("dashboard.instructor.homework.queue.stateUpdated") });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Update failed.") });
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("dashboard.instructor.pages.homework.title")}
        subtitle={t("dashboard.instructor.pages.homework.subtitle")}
      />
      <Notice type={notice?.type} message={notice?.message} />

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setTab("notOpened")}
          className={`rounded-2xl border p-4 text-start shadow-sm transition-colors ${
            tab === "notOpened"
              ? "border-pioneer-orange-normal bg-[#EE7C11]/10 dark:border-pioneer-orange-normal dark:bg-[#EE7C11]/20"
              : "border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#1A1A22]"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("dashboard.instructor.homework.queue.notOpened")}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{counts.notOpened}</p>
        </button>
        <button
          type="button"
          onClick={() => setTab("opened")}
          className={`rounded-2xl border p-4 text-start shadow-sm transition-colors ${
            tab === "opened"
              ? "border-pioneer-orange-normal bg-[#EE7C11]/10 dark:border-pioneer-orange-normal dark:bg-[#EE7C11]/20"
              : "border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#1A1A22]"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("dashboard.instructor.homework.queue.opened")}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{counts.opened}</p>
        </button>
        <button
          type="button"
          onClick={() => setTab("closed")}
          className={`rounded-2xl border p-4 text-start shadow-sm transition-colors ${
            tab === "closed"
              ? "border-pioneer-orange-normal bg-[#EE7C11]/10 dark:border-pioneer-orange-normal dark:bg-[#EE7C11]/20"
              : "border-slate-200/80 bg-white dark:border-white/10 dark:bg-[#1A1A22]"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("dashboard.instructor.homework.queue.closed")}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{counts.closed}</p>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              tab === key
                ? "bg-pioneer-orange-normal text-white"
                : "border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-[#1A1A22] dark:text-slate-200"
            }`}
          >
            {key === "all" ? t("dashboard.instructor.homework.queue.all") : t(`dashboard.instructor.homework.queue.${key}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-slate-500 dark:text-slate-400">{t("dashboard.common.loading")}</p>
      ) : !filtered.length ? (
        <EmptyState
          title={submissions.length ? t("dashboard.instructor.homework.queue.all") : t("dashboard.instructor.homework.queue.emptyTitle")}
          message={
            submissions.length
              ? t("dashboard.instructor.homework.queue.emptyFilter")
              : t("dashboard.instructor.homework.queue.emptyAll")
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((sub) => {
            const courseTitle = sub.homework?.cohort?.course?.title || "";
            const cohortName = sub.homework?.cohort?.name || "";
            const ctx = t("dashboard.instructor.homework.queue.courseLine", {
              course: courseTitle || "—",
              cohort: cohortName || "—",
            });
            return (
              <article
                key={sub.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{sub.homework?.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {ctx} · {sub.student?.fullName} · Max {sub.homework?.totalPoints} pts
                      {sub.status === "GRADED" && sub.grade != null && (
                        <span className="ms-1 font-semibold text-pioneer-orange-normal">
                          · Graded: {sub.grade}/{sub.homework?.totalPoints}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openGrade(sub)}
                    className="rounded-xl bg-pioneer-orange-normal px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    Review & grade
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t("dashboard.instructor.homework.queue.stateLabel")}:
                  </span>
                  <select
                    value={sub.instructorReviewStatus || "NOT_OPENED"}
                    disabled={sub.status === "GRADED" || reviewMutation.isPending}
                    onChange={(e) => setReviewState(sub.id, e.target.value)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="NOT_OPENED">{t("dashboard.instructor.homework.queue.notOpened")}</option>
                    <option value="OPENED">{t("dashboard.instructor.homework.queue.opened")}</option>
                    <option value="CLOSED">{t("dashboard.instructor.homework.queue.closed")}</option>
                  </select>
                </div>
                <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 dark:bg-white/5 dark:text-slate-300">
                  {sub.content && <p className="whitespace-pre-wrap">{sub.content}</p>}
                  {sub.fileUrl && (
                    <a
                      href={sub.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-pioneer-orange-normal underline"
                    >
                      Open submitted file
                    </a>
                  )}
                  {!sub.content && !sub.fileUrl && <span className="text-slate-400">No content submitted.</span>}
                </div>
                {sub.feedback && sub.status === "GRADED" && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Feedback: </span>
                    {sub.feedback}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Submitted {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "—"}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={submitGrade}
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1A1A22]"
          >
            <h3 className="mb-1 text-lg font-bold text-slate-900 dark:text-white">Grade submission</h3>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{active.homework?.title}</p>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Grade (0–{active.homework?.totalPoints ?? 100})
              <input
                type="number"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                min={0}
                max={active.homework?.totalPoints ?? 100}
                required
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Feedback
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActive(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10 dark:text-slate-200"
              >
                {t("dashboard.common.cancel")}
              </button>
              <button
                type="submit"
                disabled={gradeMutation.isPending || active.status === "GRADED"}
                className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2 text-sm font-semibold text-white"
              >
                {gradeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("dashboard.common.submit")}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Homework;
