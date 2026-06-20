import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock3, Flag } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useStartStudentExam, useStudentExam, useSubmitStudentExam } from "../features/student/exams/hooks";
import { getErrorMessage } from "../api/error";

function formatTime(secs) {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Admin MCQ options are often stored as string[]; API may return Json as array or objects.
 * Each choice needs { value, label } where value is submitted as answerText (matches correctAnswer).
 */
function normalizeMcqChoices(raw) {
  if (raw == null) return [];
  let v = raw;
  if (typeof raw === "string") {
    try {
      v = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return [];
    if (typeof v[0] === "string") {
      return v.map((s) => ({ value: String(s), label: String(s) }));
    }
    return v.map((o, i) => {
      if (o != null && typeof o === "object") {
        const label =
          o.text != null ? String(o.text) : o.label != null ? String(o.label) : String(o.id ?? `${i + 1}`);
        const value = o.text != null ? String(o.text) : o.id != null ? String(o.id) : label;
        return { value, label };
      }
      return { value: String(o), label: String(o) };
    });
  }
  if (typeof v === "object") {
    return Object.entries(v).map(([, val]) => ({
      value: String(val),
      label: String(val),
    }));
  }
  return [];
}

function isQuestionAnswered(q, answers) {
  const v = answers[q.id];
  if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
    return v != null && String(v).trim() !== "";
  }
  if (q.type === "SHORT_ANSWER" || q.type === "ESSAY") {
    return typeof v === "string" && v.trim().length > 0;
  }
  return v != null && String(v).trim() !== "";
}

function allQuestionsAnswered(sortedQuestions, answers) {
  if (!sortedQuestions.length) return false;
  return sortedQuestions.every((q) => isQuestionAnswered(q, answers));
}

function OptionRow({ label, selected, onPick }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`flex w-full items-center gap-4 rounded-xl border-2 px-5 py-4 text-start transition-all ${
        selected ? "border-pioneer-orange-normal bg-pioneer-orange-light" : "border-slate-200 bg-white hover:border-pioneer-orange-normal/40 hover:bg-slate-50"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? "border-pioneer-orange-normal bg-pioneer-orange-normal" : "border-slate-300"
        }`}
      >
        {selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
      </span>
      <span className={`text-sm font-medium leading-snug ${selected ? "text-pioneer-orange-dark" : "text-slate-700"}`}>{label}</span>
    </button>
  );
}

export default function TakeExam() {
  const { t } = useTranslation();
  const { id: examId } = useParams();
  const { data: exam, isLoading, isError, error, refetch } = useStudentExam(examId);
  const startExam = useStartStudentExam();
  const submitExam = useSubmitStudentExam();

  const [phase, setPhase] = useState("loading");
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showWarn, setShowWarn] = useState(false);
  const [result, setResult] = useState(null);
  const [localErr, setLocalErr] = useState("");

  const answersRef = useRef(answers);
  const examRef = useRef(exam);
  const submissionRef = useRef(submission);
  const submitOnceRef = useRef(false);
  const timeUpHandledRef = useRef(false);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    examRef.current = exam;
  }, [exam]);
  useEffect(() => {
    submissionRef.current = submission;
  }, [submission]);

  const questions = useMemo(() => {
    const qs = exam?.questions || [];
    return [...qs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [exam]);

  const total = questions.length;

  const runSubmit = useCallback(async () => {
    if (!examId || submitOnceRef.current) return;
    const ex = examRef.current;
    const qs = (ex?.questions || []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const map = answersRef.current;

    if (!qs.length) {
      setLocalErr(t("takeExam.noQuestions"));
      return;
    }

    if (!allQuestionsAnswered(qs, map)) {
      if (timeUpHandledRef.current) {
        setPhase("expiredIncomplete");
      } else {
        setLocalErr(t("takeExam.validation.incomplete"));
      }
      return;
    }

    const payload = qs.map((q) => ({
      questionId: q.id,
      answerText: map[q.id] != null && map[q.id] !== "" ? String(map[q.id]) : null,
    }));

    submitOnceRef.current = true;
    setLocalErr("");
    try {
      const data = await submitExam.mutateAsync({ examId, answers: payload });
      setResult(data);
      setPhase("done");
    } catch (e) {
      submitOnceRef.current = false;
      setLocalErr(getErrorMessage(e, t("takeExam.errors.submit")));
    }
  }, [examId, submitExam, t]);

  useEffect(() => {
    if (isLoading) setPhase("loading");
    else if (isError) setPhase("error");
    else if (exam) setPhase("intro");
  }, [isLoading, isError, exam]);

  useEffect(() => {
    if (phase !== "active" || !submission?.startedAt || !exam?.durationMinutes) return undefined;
    const tick = () => {
      const started = new Date(submission.startedAt).getTime();
      const allowedSec = exam.durationMinutes * 60 + 120;
      const elapsed = (Date.now() - started) / 1000;
      const left = Math.max(0, Math.floor(allowedSec - elapsed));
      setTimeLeft(left);
      if (left <= 0 && !submitOnceRef.current && !timeUpHandledRef.current) {
        timeUpHandledRef.current = true;
        void runSubmit();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase, submission, exam, runSubmit]);

  useEffect(() => {
    if (phase !== "active") return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [phase]);

  const begin = async () => {
    if (!examId) return;
    submitOnceRef.current = false;
    timeUpHandledRef.current = false;
    setLocalErr("");
    try {
      const sub = await startExam.mutateAsync(examId);
      setSubmission(sub);
      if (sub?.submittedAt) {
        setResult(sub);
        setPhase("done");
        return;
      }
      setPhase("active");
      setCurrentIdx(0);
    } catch (e) {
      setLocalErr(getErrorMessage(e, t("takeExam.errors.start")));
    }
  };

  const current = questions[currentIdx];
  const isLow = timeLeft < 300 && phase === "active";
  const isLast = currentIdx >= total - 1;
  const isFirst = currentIdx === 0;

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        {t("takeExam.loading", { defaultValue: "Loading exam…" })}
      </div>
    );
  }

  if (phase === "error" || !exam) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-red-600">{getErrorMessage(error, t("takeExam.errors.load"))}</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 text-pioneer-orange-normal hover:underline">
          {t("takeExam.retry", { defaultValue: "Retry" })}
        </button>
        <Link to="/exams" className="mt-6 block text-sm text-slate-500 hover:text-pioneer-orange-normal">
          {t("takeExam.backExams")}
        </Link>
      </div>
    );
  }

  if (phase === "expiredIncomplete") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("takeExam.expiredIncomplete.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("takeExam.expiredIncomplete.body")}</p>
        <Link to="/exams" className="mt-8 inline-block rounded-xl bg-pioneer-orange-normal px-6 py-3 text-sm font-bold text-white hover:bg-pioneer-orange-hover">
          {t("takeExam.backExams")}
        </Link>
      </div>
    );
  }

  if (phase === "intro") {
    const canStart = exam.status === "AVAILABLE";
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-lg px-4">
          <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{exam.description || ""}</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600">
            <li>
              {t("takeExam.meta.duration")}: {exam.durationMinutes} {t("takeExam.meta.minutes")}
            </li>
            <li>
              {t("takeExam.meta.passing")}: {exam.passingScore} / {exam.totalPoints}
            </li>
            <li>
              {t("takeExam.meta.questions")}: {total}
            </li>
          </ul>
          {localErr ? <p className="mt-4 text-sm text-red-600">{localErr}</p> : null}
          {!canStart ? <p className="mt-4 text-sm text-amber-700">{t("takeExam.notAvailable", { status: exam.status })}</p> : null}
          <button
            type="button"
            disabled={!canStart || startExam.isPending}
            onClick={() => void begin()}
            className="mt-8 w-full rounded-xl bg-pioneer-orange-normal py-3 text-sm font-bold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
          >
            {startExam.isPending ? t("takeExam.starting") : t("takeExam.begin")}
          </button>
          <Link to={`/exams/${examId}`} className="mt-4 block text-center text-sm text-slate-500 hover:text-pioneer-orange-normal">
            {t("takeExam.backDetail")}
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    const passed = !!result.isPassed;
    const scoreVal = result.totalScore ?? 0;
    const maxPts = exam.totalPoints || 1;
    const pct = Math.round((scoreVal / maxPts) * 100);
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-lg px-4 text-center">
          <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${passed ? "bg-green-100" : "bg-[#EE7C11]/10"}`}>
            {passed ? <CheckCircle2 className="h-10 w-10 text-green-500" /> : <AlertCircle className="h-10 w-10 text-pioneer-orange-normal" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{passed ? t("takeExam.result.passed") : t("takeExam.result.failed")}</h1>
          <p className="mt-2 text-slate-500">{exam.title}</p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white py-4 shadow-sm">
              <p className="text-2xl font-extrabold text-slate-900">
                {scoreVal}/{maxPts}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{t("takeExam.result.score")}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white py-4 shadow-sm">
              <p className="text-2xl font-extrabold text-slate-900">{pct}%</p>
              <p className="mt-0.5 text-xs text-slate-500">{t("takeExam.result.percent")}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white py-4 shadow-sm">
              <p className="text-2xl font-extrabold text-slate-900">{exam.passingScore}</p>
              <p className="mt-0.5 text-xs text-slate-500">{t("takeExam.result.passing")}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/exams" className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal">
              {t("takeExam.result.backToExams")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="p-8 text-center text-slate-600">
        {t("takeExam.noQuestions", { defaultValue: "This exam has no questions yet." })}
      </div>
    );
  }

  const mcqChoices = normalizeMcqChoices(current.options);
  const pctBar = total ? ((currentIdx + (answers[current.id] ? 1 : 0)) / total) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-[72px] z-30 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold leading-tight text-slate-900">{exam.title}</p>
              <p className="text-xs text-slate-500">{t("takeExam.strip.questionOf", { n: currentIdx + 1, total })}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-bold tabular-nums transition ${
                  isLow ? "animate-pulse border-pioneer-orange-normal bg-pioneer-orange-light text-pioneer-orange-normal" : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                <Clock3 className="h-4 w-4 shrink-0" />
                {formatTime(timeLeft)}
              </div>
              <button
                type="button"
                onClick={() => setShowWarn(true)}
                className="flex items-center gap-1.5 rounded-xl bg-pioneer-orange-normal px-4 py-2 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover"
              >
                <Flag className="h-4 w-4" />
                <span className="hidden sm:inline">{t("takeExam.strip.submit")}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="h-1.5 w-full bg-slate-100">
          <motion.div className="h-full bg-pioneer-orange-normal" animate={{ width: `${pctBar}%` }} transition={{ duration: 0.25 }} />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        {localErr ? <p className="mb-4 text-center text-sm text-red-600">{localErr}</p> : null}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{t("takeExam.question.label", { n: currentIdx + 1 })}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{current.questionText}</p>

              {(current.type === "MULTIPLE_CHOICE" || current.type === "TRUE_FALSE") && (
                <div className="mt-6 space-y-3">
                  {current.type === "TRUE_FALSE" ? (
                    <>
                      <OptionRow
                        label={t("takeExam.true")}
                        selected={answers[current.id] === "true"}
                        onPick={() => setAnswers((p) => ({ ...p, [current.id]: "true" }))}
                      />
                      <OptionRow
                        label={t("takeExam.false")}
                        selected={answers[current.id] === "false"}
                        onPick={() => setAnswers((p) => ({ ...p, [current.id]: "false" }))}
                      />
                    </>
                  ) : mcqChoices.length > 0 ? (
                    mcqChoices.map((opt, oidx) => (
                      <OptionRow
                        key={`${current.id}-mcq-${oidx}`}
                        label={opt.label}
                        selected={answers[current.id] === opt.value}
                        onPick={() => setAnswers((p) => ({ ...p, [current.id]: opt.value }))}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-amber-700">{t("takeExam.noMcqOptions")}</p>
                  )}
                </div>
              )}

              {(current.type === "SHORT_ANSWER" || current.type === "ESSAY") && (
                <textarea
                  value={answers[current.id] || ""}
                  onChange={(e) => setAnswers((p) => ({ ...p, [current.id]: e.target.value }))}
                  rows={current.type === "ESSAY" ? 10 : 4}
                  className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light"
                  placeholder={t("takeExam.shortAnswerPlaceholder")}
                />
              )}
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 md:px-8">
              <button
                type="button"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={isFirst}
                className={`flex items-center gap-2 rounded-xl border-2 px-5 py-2.5 text-sm font-semibold ${
                  isFirst ? "cursor-not-allowed border-slate-100 text-slate-300" : "border-slate-200 text-slate-600 hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal"
                }`}
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {t("takeExam.nav.prev")}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isLast) setShowWarn(true);
                  else setCurrentIdx((i) => i + 1);
                }}
                disabled={submitExam.isPending}
                className="flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-semibold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
              >
                {isLast ? t("takeExam.nav.submitNow") : t("takeExam.nav.next")}
                {!isLast ? <ArrowRight className="h-4 w-4 rtl:rotate-180" /> : <Flag className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showWarn ? (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowWarn(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="fixed inset-x-4 top-1/3 z-50 mx-auto max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl md:inset-x-auto"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900">{t("takeExam.warn.title")}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{t("takeExam.warn.body", { answered: Object.keys(answers).length, total })}</p>
              </div>
              <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                <button type="button" onClick={() => setShowWarn(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  {t("takeExam.warn.cancel")}
                </button>
                <button
                  type="button"
                  disabled={submitExam.isPending}
                  onClick={() => {
                    setShowWarn(false);
                    void runSubmit();
                  }}
                  className="flex-1 rounded-xl bg-pioneer-orange-normal py-2.5 text-sm font-semibold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
                >
                  {t("takeExam.warn.confirm")}
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
