import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BookOpen, Calendar, Loader2, Star } from "lucide-react";
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
    return <div className="py-20 text-center text-slate-500">{t("dashboard.common.loading")}</div>;
  }

  if (isError || !instructor) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-red-600">{t("publicInstructors.profileNotFound", { defaultValue: "Instructor not found." })}</p>
        <button type="button" onClick={() => void refetch()} className="mt-3 font-semibold text-pioneer-orange-normal hover:underline">
          {t("takeExam.retry")}
        </button>
        <div className="mt-4">
          <Link to="/instructors" className="text-sm text-slate-600 hover:underline">
            {t("publicInstructors.backToList", { defaultValue: "All instructors" })}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pb-16">
      <div className="border-b border-slate-100 bg-gradient-to-b from-pioneer-orange-light/30 to-white">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
          <Link to="/instructors" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-pioneer-orange-normal">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("publicInstructors.backToList", { defaultValue: "All instructors" })}
          </Link>

          <div className="mt-6 flex flex-col items-center gap-6 text-center md:flex-row md:text-start">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg ring-2 ring-pioneer-orange-normal/20">
              {instructor.avatar ? (
                <img src={instructor.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-pioneer-orange-normal">{initials(instructor.fullName)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">{instructor.fullName}</h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {rating ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {rating}
                  </span>
                ) : null}
                {instructor.experience != null && instructor.experience > 0 ? (
                  <span className="text-sm text-slate-500">
                    {t("publicInstructors.yearsExp", { n: instructor.experience, defaultValue: "{{n}}+ years experience" })}
                  </span>
                ) : null}
              </div>
              {instructor.bio ? (
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">{instructor.bio}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:px-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {courses.length > 0 ? (
            <section>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <BookOpen className="h-5 w-5 text-pioneer-orange-normal" />
                {t("publicInstructors.coursesTitle", { defaultValue: "Courses by this instructor" })}
              </h2>
              <ul className="mt-4 space-y-3">
                {courses.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/courses/${c.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-pioneer-orange-normal/40"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{c.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{c.type === "HYBRID" ? t("courseDetails.type.hybrid", { defaultValue: "Hybrid" }) : t("courseDetails.type.recorded", { defaultValue: "Recorded" })}</p>
                      </div>
                      {c.price != null ? (
                        <span className="shrink-0 text-sm font-bold text-pioneer-orange-normal">{formatSessionPrice(c.price, isRtl)}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {reviews.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold text-slate-900">{t("publicInstructors.reviewsTitle", { defaultValue: "Student reviews" })}</h2>
              <ul className="mt-4 space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{r.student?.fullName || t("student.qna.anonymous", { defaultValue: "Student" })}</p>
                      <span className="text-xs font-bold text-amber-600">{r.rating}/5</span>
                    </div>
                    {r.comment ? <p className="mt-2 text-sm text-slate-600">{r.comment}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside id="book" className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Calendar className="h-5 w-5 text-pioneer-orange-normal" />
              {t("publicInstructors.bookTitle", { defaultValue: "Book a 1-on-1 session" })}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t("publicInstructors.bookHint", { defaultValue: "Pick an open slot and complete payment to confirm your private session." })}
            </p>

            {bookMsg ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{bookMsg}</p> : null}

            {!isAuthenticated ? (
              <Link
                to={`/login?redirect=${encodeURIComponent(`/instructors/${id}#book`)}`}
                className="mt-4 block w-full rounded-xl bg-pioneer-orange-normal py-3 text-center text-sm font-bold text-white hover:bg-pioneer-orange-hover"
              >
                {t("publicInstructors.loginToBook", { defaultValue: "Sign in to book" })}
              </Link>
            ) : null}

            {slotsLoading ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("dashboard.common.loading")}
              </p>
            ) : null}

            {!slotsLoading && slots.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">{t("bookSession.empty")}</p>
            ) : null}

            <ul className="mt-4 space-y-2">
              {slots.map((slot) => (
                <li key={slot.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">{new Date(slot.startTime).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(slot.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {slot.price > 0 ? (
                    <p className="mt-1 text-sm font-bold text-pioneer-orange-normal">{formatSessionPrice(slot.price, isRtl)}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onBookClick(slot)}
                    disabled={!slot.price || slot.price <= 0}
                    className="mt-2 w-full rounded-lg bg-pioneer-orange-normal py-2 text-xs font-bold text-white hover:bg-pioneer-orange-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("bookSession.book")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {paySlot ? (
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
      ) : null}
    </div>
  );
}
