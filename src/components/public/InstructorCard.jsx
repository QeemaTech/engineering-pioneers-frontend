import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, CalendarClock, Star, User } from "lucide-react";

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function InstructorCard({ instructor, isRtl }) {
  const { t } = useTranslation();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const rating = instructor.averageRating != null ? Number(instructor.averageRating).toFixed(1) : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#EE7C11]/25 hover:shadow-[0_16px_40px_rgba(238,124,17,0.12)]">
      <Link to={`/instructors/${instructor.id}`} className="relative block bg-gradient-to-br from-pioneer-orange-light/80 to-white px-6 pb-6 pt-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md ring-2 ring-pioneer-orange-normal/20">
          {instructor.avatar ? (
            <img src={instructor.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-pioneer-orange-normal">{initials(instructor.fullName)}</span>
          )}
        </div>
        {rating ? (
          <span className="absolute end-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-amber-600 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {rating}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5 pt-4">
        <Link to={`/instructors/${instructor.id}`} className="text-lg font-bold text-slate-900 transition hover:text-pioneer-orange-normal">
          {instructor.fullName}
        </Link>
        {instructor.experience != null && instructor.experience > 0 ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <User className="h-3.5 w-3.5" />
            {t("publicInstructors.yearsExp", { n: instructor.experience, defaultValue: "{{n}}+ years experience" })}
          </p>
        ) : null}
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
          {instructor.bio?.trim() || t("publicInstructors.noBio", { defaultValue: "Expert engineering instructor on Engineering Pioneers." })}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            to={`/instructors/${instructor.id}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal"
          >
            {t("publicInstructors.viewProfile", { defaultValue: "View profile" })}
          </Link>
          <Link
            to={`/instructors/${instructor.id}#book`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2.5 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover"
          >
            <CalendarClock className="h-4 w-4" />
            {t("publicInstructors.bookSession", { defaultValue: "Book 1-on-1" })}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
