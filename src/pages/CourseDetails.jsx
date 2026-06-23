import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Headphones,
  ChevronRight,
  FileText,
  Globe,
  Calendar,
  Play,
  ShieldCheck,
  Star,
  Users,
  Video,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { usePublicCourse } from "../features/public/hooks";
import { useMyCourses } from "../features/student/courses/hooks";
import { fetchCourseReviews, computeAverageRating } from "../features/student/reviews/api";

function Stars({ rating, max = 5, size = "h-4 w-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);
        return (
          <span key={i} className="relative inline-block">
            <Star className={`${size} text-slate-200`} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} fill-amber-400 text-amber-400`} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatPrice(price, isRtl) {
  const value = Math.round(Number(price) || 0);
  return isRtl ? `${value} جنيه` : `${value} EGP`;
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

const INCLUSIONS = [
  { icon: Video, key: "liveSession" },
  { icon: BookOpen, key: "videoHours" },
  { icon: FileText, key: "downloadable" },
  { icon: Headphones, key: "instructorSupport" },
  { icon: Globe, key: "fullLifetime" },
  { icon: ShieldCheck, key: "guarantee" },
];

export default function CourseDetails() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { id } = useParams();

  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);
  const isStudent = role === APP_ROLES.STUDENT;

  const { data: course, isLoading, isError, refetch } = usePublicCourse(id);

  const { data: reviewsData } = useQuery({
    queryKey: ["public", "course-reviews", id],
    queryFn: () => fetchCourseReviews(id, 1, 50),
    enabled: Boolean(id),
    retry: false,
  });

  const reviewStats = useMemo(() => {
    const reviews = reviewsData?.reviews ?? [];
    return computeAverageRating(reviews);
  }, [reviewsData]);

  const { data: myCourses = [], isLoading: enrollmentsLoading } = useMyCourses({
    enabled: Boolean(hydrated && isAuth && isStudent),
  });

  const enrolledCourseIds = useMemo(() => {
    const set = new Set();
    for (const row of myCourses) {
      if (row?.id) set.add(row.id);
      if (row?.courseId) set.add(row.courseId);
    }
    return set;
  }, [myCourses]);

  const isEnrolled = Boolean(isStudent && course?.id && enrolledCourseIds.has(course.id));
  const showAuthHydrating = Boolean(course?.id && !hydrated);
  const showEnrollmentSpinner = Boolean(course?.id && hydrated && isAuth && isStudent && enrollmentsLoading);

  const coursePath = course?.id ? `/courses/${course.id}` : `/courses/${id ?? ""}`;

  const loginHref = useMemo(() => {
    const redirect = encodeURIComponent(coursePath);
    return `/login?redirect=${redirect}`;
  }, [coursePath]);

  const checkoutHref = course?.id ? `/student/checkout?courseId=${encodeURIComponent(course.id)}` : "/student/checkout";
  const continueLearningHref = course?.id ? `/student/courses/${course.id}/learn` : "/student/classes";

  const displayPrice = course?.isLifetimePurchasable ? Number(course.price) : null;
  const liveSessions = course?.type === "HYBRID" ? course.liveSessions ?? [] : [];
  const instructorForCard = course?.instructor;
  const displayRating = reviewStats.count > 0 ? Math.round(reviewStats.average * 10) / 10 : 0;
  const reviewCount = reviewStats.count;
  const purchaseCount = course?._count?.purchases ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center text-slate-600">
        {t("courseDetails.loading", { defaultValue: "Loading course…" })}
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <p className="text-red-600">{t("courseDetails.loadError", { defaultValue: "Course not found." })}</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 text-pioneer-orange-normal hover:underline">
          {t("courseDetails.retry", { defaultValue: "Retry" })}
        </button>
        <div className="mt-6">
          <Link to="/explore" className="text-sm font-semibold text-pioneer-orange-normal">
            {t("courseDetails.breadcrumb.explore")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
          <Link to="/explore" className="transition hover:text-[#EE7C11]">
            {t("courseDetails.breadcrumb.explore")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          <span className="max-w-xs truncate font-medium text-slate-700">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <main className="space-y-8 lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
              {course.category?.name ? (
                <span className="inline-block rounded-full bg-pioneer-orange-light px-3 py-1 text-xs font-bold text-pioneer-orange-normal">
                  {course.category.name}
                </span>
              ) : null}
              <h1 className="mt-3 text-2xl font-bold leading-snug text-slate-900 md:text-3xl">{course.title}</h1>
              <p className="mt-3 text-base leading-relaxed text-slate-600">{course.description || "—"}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  {reviewCount > 0 ? (
                    <>
                      <Stars rating={displayRating} />
                      <span className="text-sm font-bold text-amber-600">{displayRating}</span>
                    </>
                  ) : (
                    <span className="text-sm text-slate-500">{t("courseDetails.noReviewsYet", { defaultValue: "No reviews yet" })}</span>
                  )}
                  <span className="text-sm text-slate-500">
                    ({reviewCount} {t("courseDetails.reviews")})
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Users className="h-4 w-4 text-slate-400" />
                  {purchaseCount} {t("courseDetails.students")}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {course.type === "HYBRID"
                    ? t("courseDetails.type.hybrid", { defaultValue: "Hybrid (live + recorded)" })
                    : t("courseDetails.type.recorded", { defaultValue: "Recorded" })}
                </span>
              </div>
            </div>

            {course.type === "HYBRID" ? (
              <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-2 text-xl font-bold text-slate-900">
                  {t("courseDetails.liveSessions.title", { defaultValue: "Upcoming live sessions" })}
                </h2>
                <p className="mb-5 text-sm text-slate-500">
                  {t("courseDetails.liveSessions.subtitle", { defaultValue: "Included with your course purchase." })}
                </p>
                {liveSessions.length === 0 ? (
                  <p className="text-sm text-amber-700">
                    {t("courseDetails.liveSessions.none", { defaultValue: "No upcoming sessions scheduled yet." })}
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {liveSessions.map((session) => (
                      <li
                        key={session.id}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-pioneer-orange-normal" />
                        <div>
                          <p className="font-semibold text-slate-900">{session.title || t("courseDetails.liveSessions.untitled", { defaultValue: "Live session" })}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDateTime(session.startTime)} → {formatDateTime(session.endTime)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {t("courseDetails.liveSessions.status", { defaultValue: "Status" })}: {session.status}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-4 text-xl font-bold text-slate-900">{t("courseDetails.curriculum.title")}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{t("courseDetails.curriculum.publicNotice")}</p>
            </section>

            {instructorForCard ? (
              <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-5 text-xl font-bold text-slate-900">{t("courseDetails.instructor.title")}</h2>
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-pioneer-orange-normal text-xl font-extrabold text-white shadow">
                    {initials(instructorForCard.fullName)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900">{instructorForCard.fullName}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{instructorForCard.bio || t("courseDetails.instructor.noBio", { defaultValue: "Bio coming soon." })}</p>
                  </div>
                </div>
              </section>
            ) : null}
          </main>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
              <div className="relative overflow-hidden bg-gradient-to-br from-pioneer-orange-dark to-pioneer-orange-normal" style={{ paddingTop: "56.25%" }}>
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="absolute -end-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
                    <div className="absolute -bottom-6 -start-6 h-20 w-20 rounded-full bg-white/10" />
                  </>
                )}
                <button type="button" className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition hover:scale-105">
                    <Play className="ms-1 h-6 w-6 fill-pioneer-orange-normal text-pioneer-orange-normal" />
                  </span>
                </button>
                <span className="absolute bottom-2.5 start-2.5 rounded-lg bg-black/50 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur">
                  {t("courseDetails.card.previewVideo")}
                </span>
              </div>

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t("courseDetails.card.priceLabel", { defaultValue: "Course price" })}
                </p>

                <div className="mb-4 mt-3 flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {displayPrice == null
                      ? "—"
                      : displayPrice === 0
                        ? t("explore.free", { defaultValue: "Free" })
                        : formatPrice(displayPrice, isRtl)}
                  </span>
                </div>

                {!course.isLifetimePurchasable ? (
                  <p className="mb-3 text-xs text-amber-700">
                    {t("courseDetails.card.notPurchasable", { defaultValue: "This course is not available for purchase." })}
                  </p>
                ) : null}

                {showAuthHydrating ? (
                  <div className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-200 py-3 text-sm font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {t("courseDetails.card.loadingSession", { defaultValue: "Loading…" })}
                  </div>
                ) : showEnrollmentSpinner ? (
                  <div className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-200 py-3 text-sm font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    <BookOpen className="h-4 w-4 animate-pulse" />
                    {t("courseDetails.card.checkingEnrollment", { defaultValue: "Checking your enrollment…" })}
                  </div>
                ) : !isAuth ? (
                  <div className="space-y-2">
                    <Link
                      to={loginHref}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover"
                    >
                      <BookOpen className="h-4 w-4" />
                      {t("courseDetails.card.logInToEnroll", { defaultValue: "Log in to Enroll" })}
                    </Link>
                    <Link
                      to={`/signup?redirect=${encodeURIComponent(coursePath)}`}
                      className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-800 transition hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal dark:border-white/10 dark:text-slate-200"
                    >
                      {t("courseDetails.cohorts.continueSignup")}
                    </Link>
                  </div>
                ) : isStudent && isEnrolled ? (
                  <Link
                    to={continueLearningHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EE7C11] py-3 text-sm font-bold text-white transition hover:bg-[#d9700e]"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("courseDetails.card.continueLearning")}
                  </Link>
                ) : course.isLifetimePurchasable ? (
                  <Link
                    to={checkoutHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("courseDetails.card.enrollWithPrice", {
                      price: displayPrice != null ? formatPrice(displayPrice, isRtl) : "—",
                    })}
                  </Link>
                ) : null}

                <p className="mt-3 text-center text-xs text-slate-400">{t("courseDetails.card.guarantee")}</p>

                <div className="my-4 border-t border-slate-100" />

                <p className="mb-3 text-sm font-bold text-slate-800">{t("courseDetails.card.includes")}</p>
                <ul className="space-y-2.5">
                  {INCLUSIONS.map(({ icon: Icon, key }) => (
                    <li key={key} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-pioneer-orange-normal" />
                      {t(`courseDetails.inclusions.${key}`)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
