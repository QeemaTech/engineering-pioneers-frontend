import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Loader2, CheckCircle2, ClipboardList, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import api from "../../lib/api";
import endpoints from "../../api/endpoints";
import { getErrorMessage } from "../../api/error";

// ─── Star Rating Component ─────────────────────────────────────────────────────
function StarRating({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(0)}
      role="group"
      aria-label="Star rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star === value ? 0 : star)}
          onMouseEnter={() => !disabled && setHovered(star)}
          className="group p-0.5 transition-transform duration-100 focus:outline-none disabled:cursor-not-allowed"
          style={{
            transform: hovered === star ? "scale(1.25)" : active >= star ? "scale(1.1)" : "scale(1)",
          }}
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            className={`h-7 w-7 transition-colors duration-150 ${
              active >= star
                ? "fill-[#EE7C11] text-[#EE7C11] drop-shadow-[0_0_4px_rgba(238,124,17,0.5)]"
                : "text-slate-300 group-hover:text-[#EE7C11]/60"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ms-2 text-xs font-bold text-[#EE7C11]">{value}/5</span>
      )}
    </div>
  );
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
function ReportSkeleton() {
  return (
    <div className="space-y-5 animate-pulse p-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
          <div className="h-3.5 w-3/4 rounded-full bg-slate-200" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="h-7 w-7 rounded-full bg-slate-200" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ answered, total }) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/30">
        <motion.div
          className="h-full rounded-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <span className="min-w-[3.5rem] text-end text-xs font-semibold text-orange-100">
        {answered}/{total}
      </span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function InstructorSessionReportModal({
  sessionId,
  sessionTitle,
  onClose,
}) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: { rating?, comment? } }
  const [error, setError] = useState("");

  // Load instructor self-evaluation questions
  const loadQuestions = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(endpoints.instructor.surveyPending(sessionId));
      const pending = data?.data?.questions || [];
      setQuestions(pending);

      if (data?.data?.alreadySubmitted) {
        setSubmitted(true);
        return;
      }

      // Pre-seed answers map
      const initial = {};
      pending.forEach((q) => {
        initial[q.id] = { rating: null, comment: "" };
      });
      setAnswers(initial);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load evaluation questions."));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const setRating = (questionId, rating) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], rating } }));
  };

  const setComment = (questionId, comment) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], comment } }));
  };

  // Client-side validation for RATING questions
  const validate = () => {
    for (const q of questions) {
      if (q.type === "RATING") {
        const rating = answers[q.id]?.rating;
        if (rating != null && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
          toast.error(
            isRtl
              ? `التقييم يجب أن يكون بين 1 و 5 للسؤال: "${q.textAr}"`
              : `Rating must be between 1 and 5 for question: "${q.textEn}"`
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    // Build payload — include answers that have some input
    const payload = questions
      .map((q) => {
        const ans = answers[q.id] || {};
        return {
          questionId: q.id,
          rating: q.type === "RATING" ? (ans.rating ?? null) : null,
          comment: ans.comment?.trim() || null,
        };
      })
      .filter((a) => a.rating != null || a.comment);

    if (payload.length === 0) {
      toast.error(
        isRtl
          ? "يرجى الإجابة على سؤال واحد على الأقل قبل الإرسال."
          : "Please answer at least one question before submitting."
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.post(endpoints.instructor.surveySubmit, {
        sessionId,
        answers: payload,
      });
      setSubmitted(true);
      toast.success(
        isRtl
          ? "تم إرسال تقرير ما بعد الجلسة بنجاح ✅"
          : "Post-session report submitted successfully ✅"
      );
      setTimeout(onClose, 1800);
    } catch (err) {
      const msg = getErrorMessage(
        err,
        isRtl ? "فشل إرسال التقرير." : "Failed to submit report."
      );
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Progress tracking: count how many questions have been touched
  const answeredCount = questions.filter((q) => {
    const ans = answers[q.id];
    return ans && (ans.rating != null || (ans.comment && ans.comment.trim().length > 0));
  }).length;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 14 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 14 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700/50 dark:bg-[#1E293B]"
          style={{ maxHeight: "90vh" }}
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-6">
            {/* Decorative accent strip */}
            <div className="absolute start-0 top-0 h-full w-1 bg-[#EE7C11]" />
            <div className="absolute end-0 top-0 h-full w-24 bg-[#EE7C11]/5" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EE7C11]/20">
                    <ClipboardList className="h-4 w-4 text-[#EE7C11]" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {isRtl ? "تقرير ما بعد الجلسة" : "Post-Session Report"}
                  </p>
                </div>
                <h2 className="mt-2 text-lg font-extrabold leading-snug text-white">
                  {sessionTitle || (isRtl ? "تقييم الجلسة الذاتي" : "Self-Evaluation Form")}
                </h2>

                {!loading && questions.length > 0 && !submitted && (
                  <div className="mt-3">
                    <ProgressBar answered={answeredCount} total={questions.length} />
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl bg-white/10 p-2 text-slate-400 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 190px)" }}>
            {submitted ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                  className="rounded-full bg-emerald-100 p-4"
                >
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </motion.div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {isRtl ? "تم إرسال التقرير! 🎉" : "Report Submitted! 🎉"}
                </h3>
                <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  {isRtl
                    ? "شكراً لك — ملاحظاتك تساعد الإدارة الأكاديمية على التحسين المستمر."
                    : "Thank you — your report helps the academic team continuously improve."}
                </p>
              </div>
            ) : loading ? (
              <ReportSkeleton />
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={loadQuestions}
                  className="text-sm font-semibold text-[#EE7C11] hover:underline"
                >
                  {isRtl ? "إعادة المحاولة" : "Try again"}
                </button>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <p className="font-semibold text-slate-600 dark:text-slate-300">
                  {isRtl
                    ? "لا توجد أسئلة تقييم ذاتي متاحة حالياً."
                    : "No self-evaluation questions configured yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {questions.map((q, idx) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className={`rounded-2xl border p-5 transition-shadow ${
                      answers[q.id]?.rating || answers[q.id]?.comment
                        ? "border-[#EE7C11]/30 bg-orange-50/40 dark:bg-orange-900/10 shadow-sm"
                        : "border-slate-200 bg-slate-50/80 dark:border-slate-700/50 dark:bg-slate-800/30"
                    }`}
                  >
                    <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      <span className="me-1.5 font-bold text-[#EE7C11]">{idx + 1}.</span>
                      {isRtl ? q.textAr : q.textEn}
                    </p>

                    {q.type === "RATING" ? (
                      <div className="space-y-3">
                        <StarRating
                          value={answers[q.id]?.rating || 0}
                          onChange={(r) => setRating(q.id, r)}
                          disabled={submitting}
                        />
                        <textarea
                          rows={2}
                          value={answers[q.id]?.comment || ""}
                          onChange={(e) => setComment(q.id, e.target.value)}
                          disabled={submitting}
                          placeholder={isRtl ? "ملاحظات إضافية (اختياري)" : "Additional notes (optional)"}
                          className="w-full resize-none rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-xs text-slate-700 placeholder-slate-400 transition focus:border-[#EE7C11]/50 focus:outline-none focus:ring-1 focus:ring-[#EE7C11]/25 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-200 disabled:opacity-60"
                        />
                      </div>
                    ) : (
                      <textarea
                        rows={4}
                        value={answers[q.id]?.comment || ""}
                        onChange={(e) => setComment(q.id, e.target.value)}
                        disabled={submitting}
                        placeholder={isRtl ? "اكتب إجابتك التفصيلية هنا..." : "Write your detailed answer here..."}
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition focus:border-[#EE7C11]/50 focus:outline-none focus:ring-1 focus:ring-[#EE7C11]/30 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500 disabled:opacity-60"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!submitted && !loading && !error && questions.length > 0 && (
            <div className="border-t border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-700/50 dark:bg-slate-900/40">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {isRtl ? "لاحقاً" : "Later"}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/25 transition hover:bg-orange-600 active:scale-95 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  )}
                  {isRtl ? "إرسال التقرير" : "Submit Report"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
