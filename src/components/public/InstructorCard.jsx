import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, CalendarClock, Star, Briefcase, GraduationCap } from "lucide-react";

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Map of names/IDs to pretty gradient combinations for placeholders
const PLACEHOLDER_GRADIENTS = [
  "from-orange-500/20 via-amber-500/10 to-transparent",
  "from-blue-500/20 via-indigo-500/10 to-transparent",
  "from-violet-500/20 via-purple-500/10 to-transparent",
  "from-emerald-500/20 via-teal-500/10 to-transparent"
];

export default function InstructorCard({ instructor, isRtl }) {
  const { t } = useTranslation();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const rating = instructor.averageRating != null ? Number(instructor.averageRating).toFixed(1) : null;
  
  // Deterministic gradient choice based on instructor name length
  const gradientIdx = (instructor.fullName?.length || 0) % PLACEHOLDER_GRADIENTS.length;
  const bgGradient = PLACEHOLDER_GRADIENTS[gradientIdx];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/60 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#EE7C11]/30 hover:shadow-[0_20px_50px_rgba(238,124,17,0.08)] dark:border-slate-800 dark:bg-[#1E293B]">
      
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-[#EE7C11] to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Top Banner Card & Avatar */}
      <Link 
        to={`/instructors/${instructor.id}`} 
        className={`relative block bg-gradient-to-br ${bgGradient} px-6 pb-6 pt-10 text-center overflow-hidden`}
      >
        {/* Subtle background circuit path effect */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay dark:opacity-[0.08]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Avatar with dynamic glow */}
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-lg ring-4 ring-white transition-transform duration-300 group-hover:scale-105 dark:bg-[#1E293B] dark:ring-[#1E293B]">
          {instructor.avatar ? (
            <img 
              src={instructor.avatar} 
              alt={instructor.fullName} 
              className="h-full w-full object-cover" 
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600 text-white">
              <GraduationCap className="h-7 w-7 opacity-75 mb-1" />
              <span className="text-xl font-black tracking-wider">{initials(instructor.fullName)}</span>
            </div>
          )}
        </div>

        {/* Rating Badge */}
        {rating ? (
          <span className="absolute end-4 top-4 inline-flex items-center gap-1 rounded-2xl bg-white/95 px-2.5 py-1 text-xs font-black text-amber-600 shadow-sm border border-amber-100 dark:bg-slate-800 dark:border-slate-700 dark:text-amber-500">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {rating}
          </span>
        ) : null}
      </Link>

      {/* Card Info */}
      <div className="flex flex-1 flex-col p-6 pt-4">
        {/* Name */}
        <Link 
          to={`/instructors/${instructor.id}`} 
          className="text-lg font-bold text-slate-850 dark:text-white transition hover:text-[#EE7C11]"
        >
          {instructor.fullName}
        </Link>

        {/* Specialty & Experience Tags */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {instructor.experience != null && instructor.experience > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-[#EE7C11] dark:bg-orange-950/20">
              <Briefcase className="h-3 w-3" />
              {t("publicInstructors.yearsExp", { n: instructor.experience, defaultValue: `${instructor.experience}+ Years Exp` })}
            </span>
          )}
        </div>

        {/* Bio */}
        <p className="mt-4 line-clamp-3 flex-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {instructor.bio?.trim() || t("publicInstructors.noBio", { defaultValue: "Expert engineering instructor on Engineering Pioneers." })}
        </p>

        {/* Action CTAs */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Link
            to={`/instructors/${instructor.id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-bold text-slate-650 transition hover:border-[#EE7C11] hover:text-[#EE7C11] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#EE7C11]"
          >
            {t("publicInstructors.viewProfile", { defaultValue: "View Profile" })}
          </Link>
          <Link
            to={`/instructors/${instructor.id}#book`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#EE7C11] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-orange-500/10 transition hover:bg-orange-600 active:scale-[0.98]"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            {t("publicInstructors.bookSession", { defaultValue: "Book 1-on-1" })}
            <Arrow className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
