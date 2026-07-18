import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Loader2,
  Star,
  GraduationCap,
  Briefcase,
  Award,
  Video,
  ChevronRight,
  UserCheck
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import PrivateSessionPayModal, { formatSessionPrice } from "../components/student/PrivateSessionPayModal";
import {
  usePublicInstructor,
  usePublicInstructorCourses,
  usePublicInstructorSlots,
} from "../features/public/instructors/hooks";

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function InstructorProfile() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isStudent = normalizeRole(user?.role) === APP_ROLES.STUDENT;

  const { data: instructor, isLoading, isError, refetch } = usePublicInstructor(id);
  const { data: courses = [] } = usePublicInstructorCourses(id);
  const { data: slots = [], isLoading: slotsLoading } = usePublicInstructorSlots(id);
  const [paySlot, setPaySlot] = useState(null);
  const [bookMsg, setBookMsg] = useState("");

  const reviews = useMemo(() => instructor?.receivedReviews ?? [], [instructor]);
  const rating = instructor?.averageRating != null ? Number(instructor.averageRating).toFixed(1) : null;

  const onBookClick = (slot) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/instructors/${id}#book`)}`);
      return;
    }
    if (!isStudent) {
      setBookMsg(t("publicInstructors.studentsOnly", { defaultValue: "Private sessions are available for student accounts." }));
      return;
    }
    setPaySlot({ ...slot, instructor: { fullName: instructor?.fullName } });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" />
        <span className="text-sm font-semibold">{t("dashboard.common.loading")}</span>
      </div>
    );
  }

  if (isError || !instructor) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
          <GraduationCap className="h-7 w-7" />
        </div>
        <p className="text-slate-800 dark:text-slate-200 font-bold">
          {t("publicInstructors.profileNotFound", { defaultValue: "Instructor not found." })}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-xl bg-[#EE7C11] px-5 py-2 text-sm font-bold text-white shadow-md hover:bg-orange-600 transition"
        >
          {t("takeExam.retry")}
        </button>
        <div className="pt-2">
          <Link to="/instructors" className="text-sm text-slate-650 hover:underline">
            {t("publicInstructors.backToList", { defaultValue: "Back to all instructors" })}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50/50 pb-20">
      
      {/* 1. Global Premium Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-50/60 to-blue-50/40 border-b border-slate-200/80 px-4 py-16 text-slate-900 md:px-6 lg:py-20 font-cairo">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="profile-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#profile-grid)" />
          </svg>
        </div>
        
        {/* Accent light glows */}
        <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-[#EE7C11]/10 blur-3xl" />
        <div className="absolute right-12 bottom-0 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />

        <div className="relative mx-auto max-w-5xl">
          {/* Back link */}
          <Link
            to="/instructors"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200/60 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            {t("publicInstructors.backToList", { defaultValue: "All Instructors" })}
          </Link>

          {/* Profile Card Intro */}
          <div className="mt-8 flex flex-col items-center gap-6 text-center md:flex-row md:text-start">
            
            {/* Main Avatar with glowing tech ring */}
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 ring-4 ring-[#EE7C11]/20 shadow-xl">
              {instructor.avatar ? (
                <img src={instructor.avatar} alt={instructor.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600">
                  <GraduationCap className="h-9 w-9 opacity-80 mb-1" />
                  <span className="text-2xl font-black tracking-wider text-white">{initials(instructor.fullName)}</span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-0.5 text-xs font-bold text-[#EE7C11]">
                  {isRtl ? "محاضر هندسي معتمد" : "Certified Instructor"}
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{instructor.fullName}</h1>
              
              {/* Profile Meta Badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-650 md:justify-start">
                {rating ? (
                  <span className="flex items-center gap-1 font-bold text-amber-500">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    {rating} <span className="text-xs text-slate-500 font-normal font-cairo font-cairo">({reviews.length} {isRtl ? "تقييم" : "reviews"})</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-500 text-xs">
                    <Star className="h-4 w-4" />
                    {isRtl ? "لا توجد تقييمات بعد" : "No reviews yet"}
                  </span>
                )}
                
                {instructor.experience != null && instructor.experience > 0 && (
                  <span className="flex items-center gap-1.5 border-s border-slate-200 ps-4">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    {t("publicInstructors.yearsExp", { n: instructor.experience, defaultValue: `${instructor.experience}+ Years Experience` })}
                  </span>
                )}

                <span className="flex items-center gap-1.5 border-s border-slate-200 ps-4">
                  <BookOpen className="h-4 w-4 text-slate-500" />
                  {courses.length} {courses.length === 1 ? (isRtl ? "كورس" : "Course") : (isRtl ? "كورسات" : "Courses")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Page Grid */}
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-3">
        
        {/* Left Column: Bio & Courses & Reviews */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* About / Bio Section */}
          <section className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-[#EE7C11]" />
              {isRtl ? "النبذة التعريفية" : "About the Instructor"}
            </h2>
            <p className="text-sm leading-relaxed text-slate-655 whitespace-pre-line">
              {instructor.bio?.trim() || t("publicInstructors.noBio", { defaultValue: "No bio available for this instructor." })}
            </p>
          </section>

          {/* Courses List - Redesigned as modern Grid Cards */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#EE7C11]" />
              {t("publicInstructors.coursesTitle", { defaultValue: "Courses Offered" })}
            </h2>
            
            {courses.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 border-dashed p-8 text-center text-slate-500">
                {isRtl ? "لم يقم المحاضر بنشر أي دورات بعد." : "This instructor has not published any courses yet."}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {courses.map((c) => (
                  <Link
                    key={c.id}
                    to={`/courses/${c.id}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white transition shadow-sm hover:border-[#EE7C11]/30 hover:shadow-md"
                  >
                    {/* Course Header Banner */}
                    <div className="h-2 bg-gradient-to-r from-orange-400 to-[#EE7C11] opacity-70 group-hover:opacity-100 transition" />
                    
                    <div className="flex flex-1 flex-col p-5 space-y-3">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {c.type === "HYBRID" ? (isRtl ? "مدمج لايف" : "Hybrid Live") : (isRtl ? "مسجل" : "Recorded")}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-slate-850 text-sm line-clamp-2 group-hover:text-[#EE7C11] transition flex-1">
                        {c.title}
                      </h3>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <span className="font-semibold text-slate-500 flex items-center gap-1">
                          {isRtl ? "استكشاف" : "Explore"}
                          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
                        </span>
                        {c.price != null && (
                          <span className="font-black text-[#EE7C11] text-sm">
                            {formatSessionPrice(c.price, isRtl)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Student Reviews Section - Redesigned */}
          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-[#EE7C11]" />
              {t("publicInstructors.reviewsTitle", { defaultValue: "Student Reviews & Ratings" })}
            </h2>

            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 border-dashed p-8 text-center text-slate-500">
                {isRtl ? "لا توجد تقييمات لهذا المحاضر بعد." : "No student reviews available yet."}
              </div>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {/* Student Placeholder Avatar */}
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#EE7C11] font-bold text-xs">
                          {initials(r.student?.fullName || "Student")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {r.student?.fullName || t("student.qna.anonymous", { defaultValue: "Student" })}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString(isRtl ? "ar-EG" : "en-US") : ""}
                          </p>
                        </div>
                      </div>
                      
                      {/* Review Rating */}
                      <span className="inline-flex items-center gap-0.5 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {r.rating}
                      </span>
                    </div>

                    {r.comment && (
                      <p className="text-xs leading-relaxed text-slate-600 bg-slate-50/50 p-3 rounded-xl">
                        {r.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right Column: Dynamic Floating Booking Widget */}
        <aside id="book" className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-slate-200/70 bg-white p-6 shadow-md space-y-4">
            
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EE7C11]/15 text-[#EE7C11]">
                <Calendar className="h-5 w-5" />
              </span>
              <h2 className="text-base font-extrabold text-slate-900">
                {t("publicInstructors.bookTitle", { defaultValue: "Private 1-on-1 Sessions" })}
              </h2>
            </div>
            
            <p className="text-xs leading-relaxed text-slate-500">
              {t("publicInstructors.bookHint", {
                defaultValue: "Schedule a dedicated 1-on-1 private lesson with this instructor to review homework, prepare for exams, or seek career mentorship.",
              })}
            </p>

            {bookMsg && (
              <div className="rounded-xl bg-orange-50 border border-orange-200/50 p-3 text-xs text-orange-700 font-semibold">
                {bookMsg}
              </div>
            )}

            {!isAuthenticated && (
              <Link
                to={`/login?redirect=${encodeURIComponent(`/instructors/${id}#book`)}`}
                className="mt-2 block w-full rounded-xl bg-[#EE7C11] py-3 text-center text-xs font-bold text-white shadow-md shadow-orange-500/10 hover:bg-orange-600 transition"
              >
                {t("publicInstructors.loginToBook", { defaultValue: "Sign in to book slot" })}
              </Link>
            )}

            {slotsLoading && (
              <div className="flex items-center gap-2 justify-center py-4 text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin text-[#EE7C11]" />
                {t("dashboard.common.loading")}
              </div>
            )}

            {!slotsLoading && slots.length === 0 && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                {isRtl ? "لا توجد مواعيد متاحة للحجز حالياً." : "No slots available at the moment."}
              </div>
            )}

            {slots.length > 0 && (
              <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">
                          {new Date(slot.startTime).toLocaleDateString(isRtl ? "ar-EG" : "en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(slot.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" - "}
                          {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {slot.price > 0 && (
                        <span className="font-extrabold text-[#EE7C11] text-xs">
                          {formatSessionPrice(slot.price, isRtl)}
                        </span>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => onBookClick(slot)}
                      disabled={!slot.price || slot.price <= 0}
                      className="w-full rounded-xl bg-[#EE7C11] py-2 text-xs font-bold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 transition"
                    >
                      {t("bookSession.book")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Booking Pay Modal */}
      {paySlot && (
        <PrivateSessionPayModal
          slot={paySlot}
          instructorName={instructor.fullName}
          isRtl={isRtl}
          onClose={() => setPaySlot(null)}
          onSuccess={() => {
            setPaySlot(null);
            setBookMsg(t("bookSession.success"));
          }}
        />
      )}
    </div>
  );
}
