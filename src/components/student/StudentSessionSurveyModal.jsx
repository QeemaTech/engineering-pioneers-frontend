import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import api from "../../lib/api";
import endpoints from "../../api/endpoints";
import { getErrorMessage } from "../../api/error";

// ─── Category metadata ─────────────────────────────────────────────────────────
const CATEGORY_META = {
  INSTRUCTOR: {
    ar: "تقييم المحاضر",
    en: "Instructor Evaluation",
    icon: "👨‍🏫",
    color: "from-blue-500/10 to-blue-600/5 border-blue-200/60",
    accent: "text-blue-600",
  },
  CONTENT: {
    ar: "مستوى الشرح والمحتوى",
    en: "Content & Explanation Quality",
    icon: "📚",
    color: "from-emerald-500/10 to-emerald-600/5 border-emerald-200/60",
    accent: "text-emerald-600",
  },
  PLATFORM: {
    ar: "التقييم العام للمنصة وتجربة الاتصال",
    en: "Platform & Connection Experience",
    icon: "🌐",
    color: "from-violet-500/10 to-violet-600/5 border-violet-200/60",
    accent: "text-violet-600",
  },
};

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
          className="group relative p-0.5 transition-transform duration-100 focus:outline-none disabled:cursor-not-allowed"
          style={{ transform: hovered === star ? "scale(1.25)" : active >= star ? "scale(1.1)" : "scale(1)" }}
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
        <span className="ms-2 min-w-[1.5rem] text-xs font-bold text-[#EE7C11]">
          {value}/5
        </span>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function SurveySkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-slate-200 p-5 space-y-3">
          <div className="h-4 w-32 rounded-full bg-slate-200" />
          <div className="h-3 w-3/4 rounded-full bg-slate-100" />
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

// ─── Main Modal Component ──────────────────────────────────────────────────────
export default function StudentSessionSurveyModal({ sessionId, sessionTitle, onClose }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState({}); // { INSTRUCTOR: [], CONTENT: [], PLATFORM: [] }
  const [answers, setAnswers] = useState({}); // { [questionId]: { rating?, comment? } }
  const [error, setError] = useState("");

  // Load pending questions
  const loadQuestions = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(endpoints.student.surveyPending(sessionId));
      const grouped = data?.data?.questions || {};
      setQuestions(grouped);

      // Pre-seed answers map
      const initialAnswers = {};
      Object.values(grouped).flat().forEach((q) => {
        initialAnswers[q.id] = { rating: null, comment: "" };
      });
      setAnswers(initialAnswers);

      // If already submitted
      if (data?.data?.alreadySubmitted) {
        setSubmitted(true);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load survey questions."));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Update an answer field
  const setRating = (questionId, rating) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], rating } }));
  };

  const setComment = (questionId, comment) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], comment } }));
  };

  // Build and send submission payload
  const handleSubmit = async () => {
    const allQuestions = Object.values(questions).flat();
    if (allQuestions.length === 0) {
      onClose();
      return;
    }

    // Build answers array — include only questions that have some input
    const payload = allQuestions
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
      toast.error(isRtl ? "يرجى الإجابة على سؤال واحد على الأقل." : "Please answer at least one question.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post(endpoints.student.surveySubmit, { sessionId, answers: payload });
      setSubmitted(true);
      toast.success(isRtl ? "شكراً! تم إرسال تقييمك بنجاح ✅" : "Survey submitted successfully! Thank you ✅");
      setTimeout(onClose, 1800);
    } catch (err) {
      const msg = getErrorMessage(err, isRtl ? "فشل إرسال التقييم." : "Failed to submit survey.");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOrder = Object.keys(CATEGORY_META);
  const orderedCategories = categoryOrder.filter((cat) => questions[cat]?.length > 0);
  const totalQuestions = Object.values(questions).flat().length;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl dark:border-slate-700/50 dark:bg-[#1E293B]"
          style={{ maxHeight: "90vh" }}
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#EE7C11] to-orange-500 p-6">
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-white"
                  style={{
                    width: `${60 + i * 40}px`,
                    height: `${60 + i * 40}px`,
                    top: `${-20 + i * 10}px`,
                    right: `${-20 + i * 10}px`,
                  }}
                />
              ))}
            </div>
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-orange-100">
                  {isRtl ? "تقييم ما بعد الجلسة" : "Post-Session Evaluation"}
                </p>
                <h2 className="mt-1 text-xl font-extrabold leading-snug text-white">
                  {sessionTitle || (isRtl ? "تقييم الجلسة" : "Session Evaluation")}
                </h2>
                {!loading && totalQuestions > 0 && !submitted && (
                  <p className="mt-1.5 text-xs text-orange-100">
                    {isRtl
                      ? `${totalQuestions} سؤال للإجابة عليهم`
                      : `${totalQuestions} question${totalQuestions !== 1 ? "s" : ""} to answer`}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                disabled={submitting}
                className="rounded-xl bg-white/20 p-2 text-white transition hover:bg-white/30 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
            {/* Success State */}
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
                  {isRtl ? "تم إرسال التقييم! 🎉" : "Survey Submitted! 🎉"}
                </h3>
                <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  {isRtl
                    ? "شكراً لوقتك — رأيك يساعدنا على تحسين المنصة باستمرار."
                    : "Thank you for your time — your feedback helps us continuously improve."}
                </p>
              </div>
            ) : loading ? (
              <SurveySkeleton />
            ) : error ? (
              <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
                <p className="text-sm font-semibold text-red-600">{error}</p>
                <button
                  onClick={loadQuestions}
                  className="text-sm font-semibold text-[#EE7C11] hover:underline"
                >
                  {isRtl ? "إعادة المحاولة" : "Try again"}
                </button>
              </div>
            ) : orderedCategories.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {isRtl ? "لا توجد أسئلة تقييم متاحة حالياً." : "No survey questions available right now."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-6">
                {orderedCategories.map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const catQuestions = questions[cat] || [];
                  return (
                    <motion.section
                      key={cat}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`rounded-2xl border bg-gradient-to-br p-5 ${meta.color}`}
                    >
                      {/* Category Header */}
                      <div className="mb-4 flex items-center gap-2">
                        <span className="text-xl">{meta.icon}</span>
                        <h3 className={`text-sm font-bold ${meta.accent}`}>
                          {isRtl ? meta.ar : meta.en}
                        </h3>
                      </div>

                      {/* Questions */}
                      <div className="space-y-5">
                        {catQuestions.map((q, idx) => (
                          <div key={q.id} className="space-y-2">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              <span className="me-1.5 text-slate-400">{idx + 1}.</span>
                              {isRtl ? q.textAr : q.textEn}
                            </p>

                            {q.type === "RATING" ? (
                              <StarRating
                                value={answers[q.id]?.rating || 0}
                                onChange={(r) => setRating(q.id, r)}
                                disabled={submitting}
                              />
                            ) : null}

                            {/* Optional comment for RATING, required content for TEXT */}
                            {q.type === "TEXT" ? (
                              <textarea
                                rows={3}
                                value={answers[q.id]?.comment || ""}
                                onChange={(e) => setComment(q.id, e.target.value)}
                                disabled={submitting}
                                placeholder={isRtl ? "اكتب إجابتك هنا..." : "Write your answer here..."}
                                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition focus:border-[#EE7C11]/50 focus:outline-none focus:ring-1 focus:ring-[#EE7C11]/30 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:placeholder-slate-500 disabled:opacity-60"
                              />
                            ) : (
                              <textarea
                                rows={2}
                                value={answers[q.id]?.comment || ""}
                                onChange={(e) => setComment(q.id, e.target.value)}
                                disabled={submitting}
                                placeholder={isRtl ? "ملاحظات إضافية (اختياري)" : "Additional notes (optional)"}
                                className="w-full resize-none rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 transition focus:border-[#EE7C11]/40 focus:outline-none focus:ring-1 focus:ring-[#EE7C11]/20 dark:border-slate-700/50 dark:bg-slate-800/30 dark:text-slate-200 disabled:opacity-60"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.section>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {!submitted && !loading && !error && orderedCategories.length > 0 && (
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
                  className="flex items-center gap-2 rounded-xl bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-orange-600 active:scale-95 disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  )}
                  {isRtl ? "إرسال التقييم" : "Submit Survey"}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
