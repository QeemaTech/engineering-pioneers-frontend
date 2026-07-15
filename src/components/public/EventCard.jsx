import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Video, Clock, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

function formatTimeLeft(ms, isRtl) {
  if (ms <= 0) return null;
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const days = Math.floor(hr / 24);

  const finalHrs = hr % 24;
  const finalMins = min % 60;
  const finalSecs = sec % 60;

  const parts = [];
  if (days > 0) parts.push(isRtl ? `${days} يوم` : `${days}d`);
  if (finalHrs > 0 || days > 0) parts.push(isRtl ? `${finalHrs} ساعة` : `${finalHrs}h`);
  parts.push(isRtl ? `${finalMins} دقيقة` : `${finalMins}m`);

  return parts.join(" ");
}

export default function EventCard({ event }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const eventTime = new Date(event.eventDate).getTime();
  const [timeLeft, setTimeLeft] = useState(eventTime - Date.now());

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(eventTime - Date.now());
    }, 10000); // update every 10 seconds is efficient
    return () => clearInterval(timer);
  }, [eventTime, timeLeft]);

  // Status computation
  const isOnline = event.location?.startsWith("http://") || event.location?.startsWith("https://");
  const isOngoing = timeLeft <= 0 && Math.abs(timeLeft) < 7200000; // Ongoing if started less than 2 hours ago
  const isUpcoming = timeLeft > 0;
  const isPast = timeLeft <= 0 && !isOngoing;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white transition-shadow hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-[#1E293B]"
    >
      {/* Accent color strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-[#EE7C11] opacity-80" />

      {/* Banner / Graphic Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        {event.bannerUrl ? (
          <img
            src={event.bannerUrl}
            alt={isRtl ? event.titleAr : event.titleEn}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          /* SVG Blueprint Engineering fallback */
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-850 to-slate-950 p-6 text-[#EE7C11]/15">
            <svg className="h-full w-full" fill="none" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 10 H190 V90 H10 Z" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="150" cy="50" r="20" stroke="currentColor" strokeWidth="1.5" />
              <path d="M80 50 H130" stroke="currentColor" strokeWidth="1.5" />
              <path d="M50 20 V80 M150 30 V70" stroke="currentColor" strokeWidth="1" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-slate-200/10 dark:text-slate-200/5 font-mono text-3xl font-extrabold select-none">
              PIONEERS
            </div>
          </div>
        )}

        {/* Floating status badges */}
        <div className="absolute start-4 top-4 flex flex-wrap gap-2">
          {isOngoing && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-black text-white shadow-md animate-pulse">
              <span className="h-2 w-2 rounded-full bg-white" />
              {isRtl ? "فعال الآن 🎥" : "Live Now 🎥"}
            </span>
          )}
          {isUpcoming && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-black text-white shadow-md">
              {isRtl ? "قريباً" : "Upcoming"}
            </span>
          )}
          {isPast && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/90 px-3 py-1 text-[11px] font-black text-white shadow-md">
              {isRtl ? "منتهي" : "Finished"}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        
        {/* Category & Date */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-450 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-[#EE7C11]" />
            {new Date(event.eventDate).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {new Date(event.eventDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#EE7C11] transition duration-150 line-clamp-2 dark:text-white leading-snug">
          {isRtl ? event.titleAr : event.titleEn}
        </h3>

        {/* Description */}
        <p className="mt-3 text-xs leading-relaxed text-slate-650 line-clamp-3 flex-1 dark:text-slate-350">
          {isRtl ? event.descriptionAr : event.descriptionEn}
        </p>

        {/* Live Countdown widget for upcoming events */}
        {isUpcoming && timeLeft > 0 && (
          <div className="mt-4 rounded-2xl bg-orange-50/50 border border-orange-100 p-3 dark:bg-orange-950/10 dark:border-orange-900/10">
            <div className="flex justify-between items-center text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wide">
              <span>{isRtl ? "يبدأ البث خلال" : "Starts in"}</span>
              <span className="font-mono text-xs font-bold text-[#EE7C11]">{formatTimeLeft(timeLeft, isRtl)}</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          {isOnline ? (
            <a
              href={event.location}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[#EE7C11] hover:bg-orange-600 py-3 text-xs font-bold text-white transition shadow-sm active:scale-[0.98]"
            >
              <Video className="h-4 w-4" />
              <span>{isRtl ? "انضم للبث المباشر" : "Join Webinar Live"}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-650 dark:text-slate-350 font-bold">
                <MapPin className="h-4 w-4 text-[#EE7C11]" />
                {event.location || (isRtl ? "موقع غير محدد" : "TBA")}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {isRtl ? "مقر الفعالية" : "Venue Location"}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
