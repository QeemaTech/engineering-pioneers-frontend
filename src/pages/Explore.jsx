import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Users,
  ChevronDown,
  SlidersHorizontal,
  Star,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
} from "lucide-react";
import { usePublicCourses } from "../features/public/hooks";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { useToggleWishlist, useWishlist } from "../features/student/wishlist/hooks";

const FALLBACK_THUMB =
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80";

const TYPE_FILTERS = ["hybrid", "recorded"];

function coursePrice(course) {
  const n = Number(course?.price);
  return Number.isNaN(n) ? null : n;
}

function formatPrice(price, isRtl) {
  const value = Math.round(Number(price) || 0);
  return isRtl ? `${value} جنيه` : `${value} EGP`;
}

function formatLearnerCount(n) {
  const count = Number(n) || 0;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(count);
}

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="aspect-[5/3] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-4/5 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function CourseCard({ course, isRtl, isWishlisted, onToggleWishlist, showWishlist }) {
  const { t } = useTranslation();
  const price = coursePrice(course);
  const purchaseCount = Number(course._count?.purchases ?? 0);
  const isHybrid = course.type === "HYBRID";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const imageSrc =
    course.thumbnail || course.instructor?.avatar || FALLBACK_THUMB;

  const typeLabel = isHybrid
    ? t("explore.categories.hybrid", { defaultValue: isRtl ? "مجموعة حية" : "Live Cohort" })
    : t("explore.categories.recorded", { defaultValue: isRtl ? "مسجّل تفاعلي" : "Recorded" });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100/90 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#EE7C11]/25 hover:shadow-[0_16px_40px_rgba(238,124,17,0.12)]">
      <Link to={`/courses/${course.id}`} className="relative block aspect-[5/3] overflow-hidden bg-slate-100">
        {showWishlist ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist?.(course.id);
            }}
            className="absolute end-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:scale-105"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-slate-500"}`} />
          </button>
        ) : null}
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
        {course.categoryLabel ? (
          <span className="absolute start-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-sm">
            {course.categoryLabel}
          </span>
        ) : null}
        <span className="absolute bottom-3 end-3 inline-flex items-center gap-1 rounded-full bg-[#EE7C11]/95 px-2.5 py-1 text-[10px] font-bold text-white">
          <Users className="h-3 w-3" />
          {typeLabel}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link to={`/courses/${course.id}`} className="line-clamp-2 text-base font-extrabold leading-snug text-slate-900 transition hover:text-[#EE7C11]">
          {course.title}
        </Link>

        <p className="mt-1 text-sm font-medium text-slate-500">
          {t("recommendedCourses.withInstructor", { defaultValue: isRtl ? "مع" : "With" })}{" "}
          <span className="text-slate-700">{course.instructorName}</span>
        </p>

        {course.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{course.description}</p>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {purchaseCount >= 3 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-700 ring-1 ring-amber-200/80">
              <Sparkles className="h-3 w-3" />
              {t("recommendedCourses.bestSeller", { defaultValue: isRtl ? "الأكثر مبيعاً" : "Best Seller" })}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            4.8
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatLearnerCount(purchaseCount)}{" "}
            {t("explore.enrollmentsLabel", { defaultValue: isRtl ? "متعلّم" : "learners" })}
          </span>
        </div>

        <p className="mt-4 text-xl font-black text-[#EE7C11]">
          {price == null ? (
            <span className="text-sm font-semibold text-slate-500">{t("explore.pricing.contact")}</span>
          ) : price === 0 ? (
            <span className="text-emerald-600">{t("explore.free")}</span>
          ) : (
            formatPrice(price, isRtl)
          )}
        </p>

        <Link
          to={`/courses/${course.id}`}
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#EE7C11]/10 text-sm font-extrabold text-[#EE7C11] ring-1 ring-[#EE7C11]/20 transition hover:bg-[#EE7C11] hover:text-white hover:ring-[#EE7C11]"
        >
          {t("explore.enroll")}
          <Arrow className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default function Explore() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const user = useAuthStore((s) => s.user);
  const isStudent = normalizeRole(user?.role) === APP_ROLES.STUDENT;
  const { data: wishlist = [] } = useWishlist({ enabled: isStudent });
  const toggleWishlist = useToggleWishlist();
  const wishlistIds = useMemo(() => new Set(wishlist.map((w) => w.courseId || w.course?.id)), [wishlist]);

  const handleToggleWishlist = (courseId) => {
    if (!courseId) return;
    void toggleWishlist.mutateAsync({ courseId, isWishlisted: wishlistIds.has(courseId) });
  };

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeCategory]);

  const { data, isLoading, isFetching } = usePublicCourses({
    page,
    limit,
    search: debouncedSearch || undefined,
  });
  const courses = data?.courses ?? [];
  const meta = data?.meta;

  const displayCourses = useMemo(() => {
    return courses.map((c) => ({
      ...c,
      categoryLabel: c.category?.name || null,
      instructorName: c.instructor?.fullName || t("explore.instructorFallback"),
    }));
  }, [courses, t]);

  const categoryTabs = useMemo(() => {
    const fromApi = new Map();
    for (const c of displayCourses) {
      const slug = c.category?.slug;
      const name = c.category?.name;
      if (slug && name) fromApi.set(slug, name);
    }

    return [
      { id: "all", label: t("explore.categories.all") },
      ...Array.from(fromApi.entries()).map(([id, label]) => ({ id, label })),
      ...TYPE_FILTERS.map((id) => ({
        id,
        label: t(`explore.categories.${id}`),
      })),
    ];
  }, [displayCourses, t]);

  const filtered = useMemo(() => {
    return displayCourses.filter((c) => {
      if (activeCategory === "all") return true;
      if (activeCategory === "hybrid") return c.type === "HYBRID";
      if (activeCategory === "recorded") return c.type === "RECORDED";
      return c.category?.slug === activeCategory;
    });
  }, [displayCourses, activeCategory]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "price-low") {
      list.sort((a, b) => (coursePrice(a) ?? Infinity) - (coursePrice(b) ?? Infinity));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (coursePrice(b) ?? -1) - (coursePrice(a) ?? -1));
    } else {
      list.sort((a, b) => Number(b._count?.purchases ?? 0) - Number(a._count?.purchases ?? 0));
    }
    return list;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white pb-16 pt-10 md:pt-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-[2.65rem]">
            {t("explore.titlePrefix")}{" "}
            <span className="text-[#EE7C11]">{t("explore.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">
            {t("explore.subtitle")}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("explore.searchPlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pe-4 ps-10 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] focus:bg-white focus:ring-2 focus:ring-[#EE7C11]/15 placeholder:text-slate-400"
              />
            </div>

            <div className="relative w-full sm:w-52">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 py-3 pe-10 ps-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#EE7C11] focus:bg-white focus:ring-2 focus:ring-[#EE7C11]/15"
              >
                <option value="popular">{t("explore.sort.popular")}</option>
                <option value="price-low">{t("explore.sort.priceLow")}</option>
                <option value="price-high">{t("explore.sort.priceHigh")}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="mt-4 flex gap-1 overflow-x-auto border-b border-slate-100 pb-px scrollbar-hide">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`relative shrink-0 whitespace-nowrap px-4 py-2.5 text-sm font-bold transition ${
                    isActive ? "text-[#EE7C11]" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                  {isActive ? (
                    <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#EE7C11]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-500">
          {t("explore.showingPaged", {
            count: sorted.length,
            total: meta?.total ?? sorted.length,
            page: meta?.page ?? page,
          })}
        </p>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <>
            <div
              className={`mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
                isFetching ? "opacity-70" : ""
              }`}
            >
              {sorted.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isRtl={isRtl}
                  showWishlist={isStudent}
                  isWishlisted={wishlistIds.has(course.id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 sm:flex-row">
              <p className="text-sm text-slate-500">
                {t("explore.pagination.page", { page, totalPages })}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#EE7C11]/30 hover:text-[#EE7C11] disabled:opacity-40"
                >
                  {t("explore.pagination.prev")}
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d9700e] disabled:opacity-40"
                >
                  {t("explore.pagination.next")}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
            <SlidersHorizontal className="h-10 w-10 text-slate-300" />
            <p className="text-lg font-bold text-slate-600">{t("explore.noResults")}</p>
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setActiveCategory("all");
                setPage(1);
              }}
              className="text-sm font-bold text-[#EE7C11] hover:text-[#d9700e]"
            >
              {t("explore.clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
