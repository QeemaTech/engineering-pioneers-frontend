import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  RefreshCw,
  ExternalLink,
  Video,
  Search,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../lib/api";
import endpoints from "../../api/endpoints";
import { getErrorMessage } from "../../api/error";

// ─── Status Config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: { ar: "في الانتظار", en: "Pending" },
    color: "amber",
    icon: Clock,
    bar: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  PAID: {
    label: { ar: "مؤكد", en: "Confirmed" },
    color: "emerald",
    icon: CheckCircle2,
    bar: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  FAILED: {
    label: { ar: "مرفوض", en: "Rejected" },
    color: "red",
    icon: XCircle,
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  REFUNDED: {
    label: { ar: "مُسترد", en: "Refunded" },
    color: "slate",
    icon: AlertCircle,
    bar: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400",
  },
};

// ─── Session Card ────────────────────────────────────────────────────────────────
function BookingCard({ booking, isRtl }) {
  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.icon;

  const dateStr = booking.startTime
    ? new Intl.DateTimeFormat(isRtl ? "ar-EG" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(booking.startTime))
    : "—";

  const timeStr =
    booking.startTime && booking.endTime
      ? `${new Date(booking.startTime).toLocaleTimeString(isRtl ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })} – ${new Date(booking.endTime).toLocaleTimeString(isRtl ? "ar-EG" : "en-US", { hour: "2-digit", minute: "2-digit" })}`
      : null;

  const createdStr = new Intl.DateTimeFormat(isRtl ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(booking.createdAt));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-slate-700/40 dark:bg-[#1E293B]"
    >
      {/* Left accent bar */}
      <div className={`absolute start-0 top-0 h-full w-1 ${cfg.bar}`} />

      <div className="p-5 ps-6">
        {/* Top row: instructor + status badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {booking.instructor?.avatar ? (
              <img
                src={booking.instructor.avatar}
                alt=""
                className="h-11 w-11 shrink-0 rounded-xl object-cover ring-2 ring-white dark:ring-slate-700"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-700">
                <User className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900 dark:text-white">
                {booking.instructor?.fullName ?? "—"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isRtl ? "جلسة خاصة" : "Private Session"}
              </p>
            </div>
          </div>

          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${cfg.badge}`}>
            <StatusIcon className="h-3.5 w-3.5" />
            {isRtl ? cfg.label.ar : cfg.label.en}
          </span>
        </div>

        {/* Date/time row */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Calendar className="h-4 w-4 text-slate-400" />
            {dateStr}
          </div>
          {timeStr && (
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-400" />
              {timeStr}
            </div>
          )}
        </div>

        {/* Price + booked at */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-base font-extrabold text-[#EE7C11]">
            {Math.round(booking.amount)} {isRtl ? "جنيه" : "EGP"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {isRtl ? "تم الحجز في" : "Booked"}: {createdStr}
          </p>
        </div>

        {/* Confirmed — show meeting link or session info */}
        {booking.status === "PAID" && booking.liveSession && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-4 py-2.5 dark:border-emerald-700/30 dark:bg-emerald-900/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <Video className="h-4 w-4" />
              {isRtl ? "الجلسة مؤكدة" : "Session Confirmed"}
            </div>
            {booking.liveSession.meetingUrl && (
              <a
                href={booking.liveSession.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              >
                {isRtl ? "انضم" : "Join"}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Rejected — rebook suggestion */}
        {booking.status === "FAILED" && (
          <div className="mt-3 rounded-xl border border-red-200/60 bg-red-50/50 px-4 py-2.5 dark:border-red-700/30 dark:bg-red-900/10">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {isRtl
                ? "تم رفض هذا الحجز. يمكنك اختيار موعد آخر أو إعادة المحاولة."
                : "This booking was rejected. You may choose another slot or contact support."}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Filter Tabs ─────────────────────────────────────────────────────────────────
const FILTERS = ["all", "PENDING", "PAID", "FAILED"];
const FILTER_LABELS = {
  all: { ar: "الكل", en: "All" },
  PENDING: { ar: "في الانتظار", en: "Pending" },
  PAID: { ar: "مؤكد", en: "Confirmed" },
  FAILED: { ar: "مرفوض", en: "Rejected" },
};

// ─── Page ────────────────────────────────────────────────────────────────────────
export default function MyPrivateSessions() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get(endpoints.student.myPrivateSessions);
      setBookings(data?.data ?? []);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load bookings."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = bookings;
    if (filter !== "all") list = list.filter((b) => b.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        b.instructor?.fullName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [bookings, filter, search]);

  const counts = useMemo(
    () => ({
      all: bookings.length,
      PENDING: bookings.filter((b) => b.status === "PENDING").length,
      PAID: bookings.filter((b) => b.status === "PAID").length,
      FAILED: bookings.filter((b) => b.status === "FAILED").length,
    }),
    [bookings]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-4 dark:from-slate-900 dark:to-slate-950 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EE7C11] to-orange-500 shadow-md shadow-orange-500/30">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {isRtl ? "جلساتي الخاصة" : "My Private Sessions"}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {isRtl
                ? "تتبع حالة حجوزاتك مع المحاضرين"
                : "Track your booking status with instructors"}
            </p>
          </div>
        </div>

        {/* Stats */}
        {!loading && bookings.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { key: "all", label: isRtl ? "الكل" : "Total", gradient: "from-slate-600 to-slate-700" },
              { key: "PENDING", label: isRtl ? "انتظار" : "Pending", gradient: "from-amber-500 to-orange-500" },
              { key: "PAID", label: isRtl ? "مؤكد" : "Confirmed", gradient: "from-emerald-500 to-emerald-600" },
              { key: "FAILED", label: isRtl ? "مرفوض" : "Rejected", gradient: "from-red-500 to-red-600" },
            ].map((s) => (
              <div
                key={s.key}
                className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/50"
              >
                <p className={`text-2xl font-extrabold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
                  {counts[s.key]}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters + Search */}
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
              {isRtl ? FILTER_LABELS[f].ar : FILTER_LABELS[f].en}
              <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                {counts[f] ?? 0}
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
            placeholder={isRtl ? "بحث بالمحاضر..." : "Search by instructor..."}
            className="h-9 w-full rounded-xl border border-slate-200 bg-white ps-9 pe-3 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-[#EE7C11]/50 focus:ring-1 focus:ring-[#EE7C11]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 sm:w-56"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" />
          <p className="text-sm">{isRtl ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 py-12 text-center dark:border-red-900/40 dark:bg-red-900/10">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
          >
            <RefreshCw className="h-4 w-4" />
            {isRtl ? "إعادة المحاولة" : "Try again"}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center dark:border-slate-700 dark:bg-slate-800/30">
          <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {isRtl ? "لا توجد حجوزات بعد." : "No bookings found yet."}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {filtered.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isRtl={isRtl} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Refresh button */}
      {!loading && !error && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {isRtl ? "تحديث" : "Refresh"}
          </button>
        </div>
      )}
    </div>
  );
}
