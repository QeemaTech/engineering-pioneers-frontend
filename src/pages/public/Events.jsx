import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, Search, Loader2 } from "lucide-react";
import client from "../../api/client";
import endpoints from "../../api/endpoints";
import EventCard from "../../components/public/EventCard";

function GridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm animate-pulse dark:border-slate-800 dark:bg-slate-900">
          <div className="h-44 bg-slate-200 dark:bg-slate-800" />
          <div className="p-6 space-y-4">
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Events() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await client.get(endpoints.public.events);
      setEvents(data?.data || []);
    } catch (err) {
      setError(isRtl ? "تعذر تحميل الفعاليات. يرجى المحاولة لاحقاً." : "Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events by title search query
  const filteredEvents = events.filter((ev) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      ev.titleAr?.toLowerCase().includes(query) ||
      ev.titleEn?.toLowerCase().includes(query) ||
      ev.location?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0F0F13] pb-20">
      
      {/* Hero Banner */}
      <section className="relative border-b border-slate-250/20 bg-slate-900 text-white py-16 md:py-20 overflow-hidden">
        {/* Tech Grid Backdrop */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="events-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#events-grid)" />
          </svg>
        </div>
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#EE7C11]/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-5xl px-4 md:px-6 text-center space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-orange-400">
            <Sparkles className="h-3.5 w-3.5 text-[#EE7C11]" />
            {isRtl ? "ملتقى الفعاليات والأخبار" : "Events & News Hub"}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            {isRtl ? "ملتقى رواد الهندسة للأخبار والفعاليات" : "Engineering Pioneers Seminars & Semesters"}
          </h1>
          <p className="mx-auto max-w-2xl text-slate-350 text-sm leading-relaxed md:text-base">
            {isRtl
              ? "تابع آخر الندوات الهندسية، ورش العمل الأكاديمية، ومحاضرات البث المباشر مع نخبة من أساتذة الهندسة."
              : "Keep up with the latest live engineering seminars, dynamic webinars, and university academic announcements."}
          </p>

          {/* Search bar */}
          <div className="mx-auto max-w-lg pt-4">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-450" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? "ابحث عن ندوة، محاضرة أو مكان..." : "Search webinars, seminars, rooms..."}
                className="h-11 w-full rounded-2xl border border-slate-700 bg-slate-800/80 px-4 ps-10 text-sm text-white placeholder-slate-500 outline-none focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11]/30 transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Events Grid */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 py-12">
        {loading ? (
          <GridSkeleton />
        ) : error ? (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-red-700">
            <p className="font-bold">{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-3 text-xs font-black uppercase text-[#EE7C11] hover:underline"
            >
              {isRtl ? "إعادة المحاولة" : "Retry Loading"}
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center rounded-3xl border border-dashed border-slate-200 bg-white p-10 dark:border-slate-800 dark:bg-[#1E293B]">
            <Calendar className="h-14 w-14 text-slate-300 dark:text-slate-650" />
            <h3 className="text-lg font-bold text-slate-850 dark:text-white">
              {isRtl ? "لا توجد فعاليات نشطة حالياً" : "No Active Events"}
            </h3>
            <p className="text-slate-500 text-xs">
              {isRtl ? "تابعنا لاحقاً لاستكشاف الندوات وورش العمل القادمة!" : "Stay tuned for upcoming engineering webinars and workshops!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((ev) => (
              <div key={ev.id}>
                <EventCard event={ev} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
