import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Star,
  Users,
  Sparkles,
} from "lucide-react";
import { useRecommendedCourses } from "../features/public/hooks";
import { resolveMediaUrl } from "../utils/mediaUrl";

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80";

function formatLearnerCount(n) {
  const count = Number(n) || 0;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

function formatPrice(price, isRtl) {
  const value = Math.round(Number(price) || 0);
  return isRtl ? `${value} جنيه` : `${value} EGP`;
}

function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="aspect-[5/3] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-4/5 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
          <div className="h-6 w-14 animate-pulse rounded-full bg-slate-100" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function RecommendedCourseCard({ course, isRtl }) {
  const { t } = useTranslation();
  const imageSrc =
    resolveMediaUrl(course.thumbnail) ||
    resolveMediaUrl(course.instructor?.avatar) ||
    FALLBACK_THUMB;

  const isHybrid = course.type === "HYBRID";
  const typeLabel = isHybrid
    ? t("recommendedCourses.type.live", { defaultValue: isRtl ? "مجموعة حية" : "Live Cohort" })
    : t("recommendedCourses.type.recorded", { defaultValue: isRtl ? "مسجّل تفاعلي" : "Interactive Recorded" });

  const instructorName =
    course.instructor?.fullName ||
    t("recommendedCourses.instructorFallback", { defaultValue: isRtl ? "مدرّس معتمد" : "Certified Instructor" });

  const ratingDisplay =
    course.rating != null ? course.rating.toFixed(1) : "4.8";
  const learners = formatLearnerCount(
    course.purchaseCount > 0 ? course.purchaseCount : course.reviewCount * 12 + 48
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100/90 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#EE7C11]/25 hover:shadow-[0_20px_50px_rgba(238,124,17,0.14)]"
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={course.title || "Engineering Pioneers Course Thumbnail"}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-80" />

        <span className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 rounded-full bg-[#EE7C11]/95 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg backdrop-blur-sm">
          <Users className="h-3.5 w-3.5 shrink-0 opacity-90" />
          {typeLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-slate-900 md:text-[1.05rem]">
          {course.title}
        </h3>

        <p className="mt-1.5 text-sm font-medium text-slate-500">
          {t("recommendedCourses.withInstructor", { defaultValue: isRtl ? "مع" : "With" })}{" "}
          <span className="text-slate-700">{instructorName}</span>
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {course.isBestSeller ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200/80">
              <Sparkles className="h-3 w-3" />
              {t("recommendedCourses.bestSeller", { defaultValue: isRtl ? "الأكثر مبيعاً" : "Best Seller" })}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {ratingDisplay}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" />
            {learners}{" "}
            {t("recommendedCourses.learners", { defaultValue: isRtl ? "متعلّم" : "learners" })}
          </span>
        </div>

        <p className="mt-4 text-2xl font-black tracking-tight text-[#D96B07]">
          {formatPrice(course.price, isRtl)}
        </p>

        <div className="mt-auto pt-5">
          <Link
            to={`/courses/${course.id}`}
            aria-label={`${t("recommendedCourses.subscribeNow", { defaultValue: isRtl ? "اشترك الآن" : "Enroll Now" })} - ${course.title}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#EE7C11]/10 px-4 text-sm font-extrabold text-[#D96B07] ring-1 ring-[#EE7C11]/20 transition hover:bg-[#EE7C11] hover:text-white hover:ring-[#EE7C11] active:scale-[0.99]"
          >
            {t("recommendedCourses.subscribeNow", { defaultValue: isRtl ? "اشترك الآن" : "Enroll Now" })}
            {isRtl ? (
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            ) : (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function RecommendedCourses() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [activeFilter, setActiveFilter] = useState("bestseller");

  const { data, isLoading, isError } = useRecommendedCourses(activeFilter, 8);

  const tabs = useMemo(() => {
    if (data?.tabs?.length) return data.tabs;
    return [
      {
        id: "bestseller",
        label: "Best Sellers",
        labelAr: "أكثر مبيعاً",
        courseCount: 0,
      },
      {
        id: "all",
        label: "All Courses",
        labelAr: "جميع الدورات",
        courseCount: 0,
      },
    ];
  }, [data?.tabs]);

  const courses = data?.courses ?? [];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/80 to-white py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(238,124,17,0.08),transparent)]" />
      <div className="pointer-events-none absolute -end-24 top-20 h-72 w-72 rounded-full bg-[#EE7C11]/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-[2.65rem] lg:leading-tight">
            {t("recommendedCourses.heroTitle", {
              defaultValue: isRtl ? "اكتشف دوراتنا التدريبية المختلفة" : "Discover Our Training Courses",
            })}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 md:text-lg">
            {t("recommendedCourses.heroSubtitle", {
              defaultValue: isRtl
                ? "الآن يمكنك اختيار التجربة التعليمية الأنسب لك — دورات هندسية عملية يقدّمها خبراء من الصناعة."
                : "Choose the learning path that fits you — practical engineering courses led by industry experts.",
            })}
          </p>
        </div>

        <div className="mt-10 md:mt-12">
          <div
            className="scrollbar-hide -mx-4 flex gap-1 overflow-x-auto border-b border-slate-200/80 px-4 pb-px md:mx-0 md:justify-center md:px-0"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {tabs.map((tab) => {
              const isActive = activeFilter === tab.id;
              const label = isRtl ? tab.labelAr || tab.label : tab.label;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`relative shrink-0 whitespace-nowrap px-4 py-3 text-sm font-bold transition-colors md:px-5 md:text-[0.95rem] ${
                    isActive ? "text-[#EE7C11]" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {label}
                  {isActive ? (
                    <motion.span
                      layoutId="recommendedTabUnderline"
                      className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#EE7C11]"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 md:mt-12">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 px-6 py-14 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-amber-500" />
              <p className="text-sm font-semibold text-slate-700">
                {t("recommendedCourses.loadError", {
                  defaultValue: isRtl ? "تعذّر تحميل الدورات. حاول مرة أخرى لاحقاً." : "Could not load courses. Please try again later.",
                })}
              </p>
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-16 text-center">
              <p className="text-sm font-medium text-slate-500">
                {t("recommendedCourses.empty", {
                  defaultValue: isRtl ? "لا توجد دورات في هذا التصنيف حالياً." : "No courses in this category yet.",
                })}
              </p>
              <Link
                to="/explore"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#EE7C11] hover:text-[#d9700e]"
              >
                {t("recommendedCourses.browseAll", { defaultValue: isRtl ? "تصفح كل الدورات" : "Browse all courses" })}
                {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </Link>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {courses.map((course) => (
                  <RecommendedCourseCard key={course.id} course={course} isRtl={isRtl} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-800 shadow-sm transition hover:border-[#EE7C11]/30 hover:text-[#EE7C11] hover:shadow-md"
          >
            {t("recommendedCourses.viewCatalog", { defaultValue: isRtl ? "عرض كامل الكتالوج" : "View full catalog" })}
            {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Link>
        </div>
      </div>
    </section>
  );
}
