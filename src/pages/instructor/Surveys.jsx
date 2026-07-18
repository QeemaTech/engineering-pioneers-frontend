import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  BookOpen,
  Calendar,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../lib/api";
import endpoints from "../../api/endpoints";
import { getErrorMessage } from "../../api/error";
import InstructorSessionReportModal from "../../components/student/InstructorSessionReportModal";

// ─── Filter Tabs ────────────────────────────────────────────────────────────────
const FILTERS = ["all", "pending", "completed"];

// ─── Session Card ───────────────────────────────────────────────────────────────
function SessionCard({ session, onFill, isRtl }) {
  const dateStr = session.scheduledAt
    ? new Intl.DateTimeFormat(isRtl ? "ar-EG" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(session.scheduledAt))
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-[#1E293B] ${
        session.alreadySubmitted
          ? "border-emerald-200/70 dark:border-emerald-700/40"
          : "border-slate-200/70 dark:border-slate-700/40"
      }`}
    >
      {/* Side accent bar */}
      <div
        className={`absolute start-0 top-0 h-full w-1 rounded-s-2xl ${
          session.alreadySubmitted ? "bg-emerald-500" : "bg-slate-600"
        }`}
      />

      <div className="flex items-center gap-4 p-5 ps-6">
        {/* Icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            session.alreadySubmitted
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300"
          }`}
        >
          {session.alreadySubmitted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <ClipboardList className="h-5 w-5" />
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-800 dark:text-white">
            {session.title}
          </p>
          {session.courseTitle && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
              <BookOpen className="h-3 w-3 shrink-0" />
              {session.courseTitle}
            </p>
          )}
          {dateStr && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <Calendar className="h-3 w-3 shrink-0" />
              {dateStr}
            </p>
          )}
        </div>

        {/* Status badge + action */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          {session.alreadySubmitted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              {isRtl ? "تم الإرسال" : "Submitted"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              <Clock className="h-3 w-3" />
              {isRtl ? "في الانتظار" : "Pending"}
            </span>
          )}
          {!session.alreadySubmitted && (
            <button
              onClick={() => onFill(session)}
              className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-700 active:scale-95 dark:bg-slate-600 dark:hover:bg-slate-500"
            >
              {isRtl ? "تعبئة التقرير" : "Fill Report"}
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────────
function EmptyState({ filter, isRtl }) {
  const messages = {
    all: {
      ar: "لا توجد جلسات منتهية بعد.",
      en: "No ended sessions found yet.",
    },
    pending: {
      ar: "لا توجد تقارير في الانتظار — أحسنت! 🎉",
      en: "No pending reports — great job! 🎉",
    },
    completed: {
      ar: "لم ترسل أي تقرير بعد.",
      en: "No reports submitted yet.",
    },
  };
  const msg = messages[filter] || messages.all;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/30"
    >
      <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
        <ClipboardList className="h-8 w-8 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {isRtl ? msg.ar : msg.en}
      </p>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function InstructorSurveys() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(endpoints.instructor.surveySessions);
      setSessions(data?.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load survey sessions."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = sessions;
    if (filter === "pending") list = list.filter((s) => !s.alreadySubmitted);
    if (filter === "completed") list = list.filter((s) => s.alreadySubmitted);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.courseTitle?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sessions, filter, search]);

  const pendingCount = sessions.filter((s) => !s.alreadySubmitted).length;
  const completedCount = sessions.filter((s) => s.alreadySubmitted).length;

  const handleModalClose = () => {
    setActiveSession(null);
    load();
  };

  const filterLabels = {
    all: { ar: "الكل", en: "All" },
    pending: { ar: "في الانتظار", en: "Pending" },
    completed: { ar: "مكتمل", en: "Completed" },
  };
  const filterCounts = {
    all: sessions.length,
    pending: pendingCount,
    completed: completedCount,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 dark:from-slate-900 dark:to-slate-950 md:p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 shadow-md shadow-slate-500/30">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isRtl ? "نماذج الاستبيان الذاتي" : "Self-Evaluation Forms"}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {isRtl
                ? "تقييمات ما بعد الجلسة — جلساتك المنتهية فقط"
                : "Post-session self-evaluations — ended sessions only"}
            </p>
          </div>
        </div>

        {/* Stats bar */}
        {!loading && sessions.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              {
                label: isRtl ? "إجمالي الجلسات" : "Total Sessions",
                value: sessions.length,
                color: "from-slate-600 to-slate-700",
              },
              {
                label: isRtl ? "في الانتظار" : "Pending",
                value: pendingCount,
                color: "from-amber-500 to-orange-500",
              },
              {
                label: isRtl ? "مكتمل" : "Completed",
                value: completedCount,
                color: "from-emerald-500 to-emerald-600",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50"
              >
                <p
                  className={`text-2xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Filters + Search ── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                filter === f
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {isRtl ? filterLabels[f].ar : filterLabels[f].en}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                  filter === f
                    ? "bg-slate-800/10 text-slate-700 dark:bg-white/10 dark:text-white"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                }`}
              >
                {filterCounts[f]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRtl ? "بحث عن جلسة..." : "Search sessions..."}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white ps-9 pe-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 sm:w-56"
          />
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 py-12 text-center dark:border-red-900/40 dark:bg-red-900/10">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            <RefreshCw className="h-4 w-4" />
            {isRtl ? "إعادة المحاولة" : "Try again"}
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <EmptyState filter={filter} isRtl={isRtl} />
          ) : (
            <div className="space-y-3">
              {filtered.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isRtl={isRtl}
                  onFill={setActiveSession}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      )}

      {!loading && !error && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {isRtl ? "تحديث القائمة" : "Refresh list"}
          </button>
        </div>
      )}

      {/* ── Modal ── */}
      {activeSession && (
        <InstructorSessionReportModal
          sessionId={activeSession.id}
          sessionTitle={activeSession.title}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
