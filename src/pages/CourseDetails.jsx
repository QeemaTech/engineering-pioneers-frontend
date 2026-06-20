import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Headphones,
  ChevronRight,
  FileText,
  Globe,
  Layers,
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

function Stars({ rating, max = 5, size = "h-4 w-4" }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const fill = Math.min(Math.max(rating - i, 0), 1);
        return (
          <span key={i} className="relative inline-block">
            <Star className={`${size} text-slate-200`} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} fill-pioneer-teal-normal text-pioneer-teal-normal`} />
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

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
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
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const cohortFromUrl = searchParams.get("cohort") || searchParams.get("cohortId") || "";

  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);
  const isStudent = role === APP_ROLES.STUDENT;

  const { data: course, isLoading, isError, refetch } = usePublicCourse(id);

  const { data: myCourses = [], isLoading: enrollmentsLoading } = useMyCourses({
    enabled: Boolean(hydrated && isAuth && isStudent),
  });

  const cohorts = course?.availableCohorts ?? [];
  const [selectedCohortId, setSelectedCohortId] = useState("");

  useEffect(() => {
    if (!cohorts.length) {
      setSelectedCohortId("");
      return;
    }
    if (cohortFromUrl && cohorts.some((c) => c.id === cohortFromUrl)) {
      setSelectedCohortId(cohortFromUrl);
      return;
    }
    setSelectedCohortId((prev) => (prev && cohorts.some((c) => c.id === prev) ? prev : cohorts[0].id));
  }, [cohorts, cohortFromUrl]);

  const enrolledCohortIds = useMemo(() => {
    const set = new Set();
    for (const row of myCourses) {
      if (row?.cohortId) set.add(row.cohortId);
    }
    return set;
  }, [myCourses]);

  const isEnrolledInSelected = Boolean(isStudent && selectedCohortId && enrolledCohortIds.has(selectedCohortId));

  /** Wait for persisted auth before choosing guest vs logged-in CTAs. */
  const showAuthHydrating = Boolean(selectedCohortId && !hydrated);

  /** Students: wait for my-courses to know enrolled vs checkout CTA. */
  const showEnrollmentSpinner = Boolean(
    selectedCohortId && hydrated && isAuth && isStudent && enrollmentsLoading
  );

  const selectedCohort = useMemo(
    () => cohorts.find((c) => c.id === selectedCohortId) ?? null,
    [cohorts, selectedCohortId]
  );

  const enrollQuery = useMemo(() => {
    if (!course?.id || !selectedCohortId) return "";
    const p = new URLSearchParams({ courseId: course.id, cohortId: selectedCohortId });
    return p.toString();
  }, [course?.id, selectedCohortId]);

  const coursePathWithCohort = useMemo(() => {
    if (!course?.id) return `/courses/${id ?? ""}`;
    const base = `/courses/${course.id}`;
    return selectedCohortId ? `${base}?cohort=${encodeURIComponent(selectedCohortId)}` : base;
  }, [course?.id, id, selectedCohortId]);

  const loginHref = useMemo(() => {
    const redirect = encodeURIComponent(coursePathWithCohort);
    return `/login?redirect=${redirect}`;
  }, [coursePathWithCohort]);

  const checkoutHref = useMemo(() => {
    if (!course?.id || !selectedCohortId) return "/checkout";
    const q = new URLSearchParams({ courseId: course.id, cohortId: selectedCohortId });
    return `/checkout?${q.toString()}`;
  }, [course?.id, selectedCohortId]);

  const continueLearningHref = useMemo(() => {
    if (!course?.id || !selectedCohortId) return "/my-classes";
    const q = new URLSearchParams({ cohortId: selectedCohortId });
    return `/course/${course.id}?${q.toString()}`;
  }, [course?.id, selectedCohortId]);

  const instructorForCard = selectedCohort?.instructor || course?.instructor;
  const displayRating = 4.8;
  const reviewCount = 0;

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
    <div className="min-h-screen bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
          <Link to="/explore" className="transition-colors hover:text-pioneer-orange-normal">
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
                  <Stars rating={displayRating} />
                  <span className="text-sm font-bold text-pioneer-teal-dark">{displayRating}</span>
                  <span className="text-sm text-slate-500">
                    ({reviewCount} {t("courseDetails.reviews")})
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Users className="h-4 w-4 text-slate-400" />
                  {cohorts.reduce((acc, c) => acc + Number(c._count?.enrollments ?? 0), 0)} {t("courseDetails.students")}
                </span>
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <LayersIcon cohorts={cohorts} />
                </span>
              </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-2 text-xl font-bold text-slate-900">{t("courseDetails.cohorts.title")}</h2>
              <p className="mb-5 text-sm text-slate-500">{t("courseDetails.cohorts.subtitle")}</p>
              {cohorts.length === 0 ? (
                <p className="text-sm text-amber-700">{t("courseDetails.cohorts.none")}</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {cohorts.map((c) => (
                    <CohortOption key={c.id} cohort={c} selected={c.id === selectedCohortId} onSelect={() => setSelectedCohortId(c.id)} />
                  ))}
                </div>
              )}
            </section>

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
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("courseDetails.cohorts.selected")}</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{selectedCohort?.name || "—"}</p>

                <div className="mb-4 mt-3 flex items-end gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {selectedCohort ? `$${Number(selectedCohort.price).toFixed(0)}` : "—"}
                  </span>
                </div>

                {!selectedCohortId ? (
                  <p className="mb-3 text-xs text-amber-700">{t("courseDetails.cohorts.pickFirst")}</p>
                ) : null}

                {!selectedCohortId ? null : showAuthHydrating ? (
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
                      to={`/signup?${enrollQuery}`}
                      className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-800 transition hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal dark:border-white/10 dark:text-slate-200"
                    >
                      {t("courseDetails.cohorts.continueSignup")}
                    </Link>
                  </div>
                ) : isStudent && isEnrolledInSelected ? (
                  <Link
                    to={continueLearningHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-pioneer-teal-normal py-3 text-sm font-bold text-white transition hover:bg-pioneer-teal-hover"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("courseDetails.card.continueLearning")}
                  </Link>
                ) : (
                  <Link
                    to={checkoutHref}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("courseDetails.card.enrollWithPrice", {
                      price: selectedCohort ? `$${Number(selectedCohort.price).toFixed(0)}` : "—",
                    })}
                  </Link>
                )}

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

function LayersIcon({ cohorts }) {
  const { t } = useTranslation();
  const n = cohorts.length;
  return (
    <span className="flex items-center gap-1.5 text-sm text-slate-500">
      <Layers className="h-4 w-4 text-slate-400" />
      {n > 1 ? t("explore.cohorts.multiple", { count: n }) : t("explore.cohorts.single", { count: n || 0 })}
    </span>
  );
}

function CohortOption({ cohort, selected, onSelect }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border p-4 text-start transition ${
        selected ? "border-pioneer-orange-normal bg-pioneer-orange-light ring-1 ring-pioneer-orange-normal" : "border-slate-200 bg-white hover:border-pioneer-orange-normal/50"
      }`}
    >
      <p className="font-bold text-slate-900">{cohort.name}</p>
      <p className="mt-1 text-xs text-slate-500">
        {t("courseDetails.cohorts.type")}: {cohort.type} · {t("courseDetails.cohorts.status")}: {cohort.status}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {t("courseDetails.cohorts.starts")}: {formatDate(cohort.startDate)}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {t("courseDetails.cohorts.instructor")}: {cohort.instructor?.fullName || t("explore.instructorFallback", { defaultValue: "Instructor TBA" })}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {t("courseDetails.cohorts.enrolled")}: {cohort._count?.enrollments ?? 0}
      </p>
      <p className="mt-2 text-lg font-extrabold text-pioneer-orange-normal">${Number(cohort.price).toFixed(0)}</p>
    </button>
  );
}
