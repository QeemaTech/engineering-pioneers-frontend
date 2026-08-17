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
  X,
} from "lucide-react";
import { usePublicCourses, usePublicCategories } from "../features/public/hooks";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";
import { useToggleWishlist, useWishlist } from "../features/student/wishlist/hooks";
import { resolveMediaUrl } from "../utils/mediaUrl";

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
    resolveMediaUrl(course.thumbnail) || resolveMediaUrl(course.instructor?.avatar) || FALLBACK_THUMB;

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
  const [activeType, setActiveType] = useState("all");
  const [activeLevel, setActiveLevel] = useState("all");
  const [activePrice, setActivePrice] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const limit = 12;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeCategory, activeType, activeLevel, activePrice]);

  const { data: categoriesData = [] } = usePublicCategories();

  const { data, isLoading, isFetching } = usePublicCourses({
    page,
    limit,
    search: debouncedSearch || undefined,
    category: activeCategory !== "all" ? activeCategory : undefined,
    type: activeType !== "all" ? activeType : undefined,
    level: activeLevel !== "all" ? activeLevel : undefined,
    price: activePrice !== "all" ? activePrice : undefined,
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

  const sorted = useMemo(() => {
    const list = [...displayCourses];
    if (sortBy === "price-low") {
      list.sort((a, b) => (coursePrice(a) ?? Infinity) - (coursePrice(b) ?? Infinity));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (coursePrice(b) ?? -1) - (coursePrice(a) ?? -1));
    } else {
      list.sort((a, b) => Number(b._count?.purchases ?? 0) - Number(a._count?.purchases ?? 0));
    }
    return list;
  }, [displayCourses, sortBy]);

  const handleClearFilters = () => {
    setSearchInput("");
    setActiveCategory("all");
    setActiveType("all");
    setActiveLevel("all");
    setActivePrice("all");
    setPage(1);
  };

  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white pb-16 pt-10 md:pt-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-[2.65rem] font-cairo">
            {t("explore.titlePrefix")}{" "}
            <span className="text-[#EE7C11]">{t("explore.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base font-cairo">
            {t("explore.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-4 items-start">
          
          <aside className="hidden lg:block lg:col-span-1 sticky top-24">
            <FilterPanel
              categories={categoriesData}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              activeType={activeType}
              setActiveType={setActiveType}
              activeLevel={activeLevel}
              setActiveLevel={setActiveLevel}
              activePrice={activePrice}
              setActivePrice={setActivePrice}
              isRtl={isRtl}
              t={t}
              onClear={handleClearFilters}
            />
          </aside>

          <div className="lg:col-span-3 space-y-6">
            
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("explore.searchPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-3 pe-4 ps-10 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] focus:bg-white focus:ring-2 focus:ring-[#EE7C11]/15 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-900"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 lg:hidden w-full justify-center dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <SlidersHorizontal className="h-4 w-4 text-[#EE7C11]" />
                  <span>{isRtl ? "الفلاتر" : "Filters"}</span>
                </button>

                <div className="relative w-full sm:w-52 shrink-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 py-3 pe-10 ps-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#EE7C11] focus:bg-white focus:ring-2 focus:ring-[#EE7C11]/15 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="popular">{t("explore.sort.popular")}</option>
                    <option value="price-low">{t("explore.sort.priceLow")}</option>
                    <option value="price-high">{t("explore.sort.priceHigh")}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-500 font-cairo">
              {t("explore.showingPaged", {
                count: sorted.length,
                total: meta?.total ?? sorted.length,
                page: meta?.page ?? page,
              })}
            </p>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : sorted.length > 0 ? (
              <>
                <div
                  className={`grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 ${
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

                <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 sm:flex-row font-cairo">
                  <p className="text-sm text-slate-500">
                    {t("explore.pagination.page", { page, totalPages })}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#EE7C11]/30 hover:text-[#EE7C11] disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
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
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
                <SlidersHorizontal className="h-10 w-10 text-slate-300" />
                <p className="text-lg font-bold text-slate-600 dark:text-slate-400 font-cairo">{t("explore.noResults")}</p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-sm font-bold text-[#EE7C11] hover:text-[#d9700e] font-cairo"
                >
                  {t("explore.clearFilters")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[150] flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative z-50 flex h-full w-[85%] max-w-sm flex-col bg-white dark:bg-[#1E293B] shadow-xl p-5 overflow-y-auto animate-in slide-in-from-right duration-250">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white font-cairo">{isRtl ? "الفلاتر" : "Filters"}</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-505"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterPanel
              categories={categoriesData}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              activeType={activeType}
              setActiveType={setActiveType}
              activeLevel={activeLevel}
              setActiveLevel={setActiveLevel}
              activePrice={activePrice}
              setActivePrice={setActivePrice}
              isRtl={isRtl}
              t={t}
              onClear={handleClearFilters}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

const LEVELS = [
  { id: "GENERAL", labelAr: "عام / عمومي", labelEn: "General" },
  { id: "PREPARATORY", labelAr: "إعدادي هندسة", labelEn: "Preparatory Year" },
  { id: "FIRST_YEAR", labelAr: "الفرقة الأولى", labelEn: "First Year" },
  { id: "SECOND_YEAR", labelAr: "الفرقة الثانية", labelEn: "Second Year" },
  { id: "THIRD_YEAR", labelAr: "الفرقة الثالثة", labelEn: "Third Year" },
  { id: "FOURTH_YEAR", labelAr: "الفرقة الرابعة", labelEn: "Fourth Year" },
  { id: "GRADUATE", labelAr: "خريج", labelEn: "Graduate" }
];

function FilterPanel({
  categories,
  activeCategory,
  setActiveCategory,
  activeType,
  setActiveType,
  activeLevel,
  setActiveLevel,
  activePrice,
  setActivePrice,
  isRtl,
  t,
  onClear,
}) {
  return (
    <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#1E293B] font-cairo">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          {isRtl ? "تصفية النتائج" : "Filter Results"}
        </h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-bold text-pioneer-orange-normal hover:underline"
        >
          {isRtl ? "إعادة تعيين" : "Reset All"}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isRtl ? "الأقسام / الفئات" : "Categories"}
        </h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-start text-xs font-semibold transition ${
              activeCategory === "all"
                ? "bg-pioneer-orange-light text-[#EE7C11]"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            <span>{isRtl ? "كل الأقسام" : "All Categories"}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.slug)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-start text-xs font-semibold transition ${
                activeCategory === cat.slug
                  ? "bg-pioneer-orange-light text-[#EE7C11]"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isRtl ? "طريقة الدراسة" : "Study Type"}
        </h4>
        <div className="space-y-1.5">
          {[
            { id: "all", label: isRtl ? "الكل" : "All" },
            { id: "recorded", label: isRtl ? "مسجّل تفاعلي" : "Recorded" },
            { id: "hybrid", label: isRtl ? "مجموعات حية" : "Live Cohorts" }
          ].map((type) => (
            <label
              key={type.id}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <input
                type="radio"
                name="studyType"
                checked={activeType === type.id}
                onChange={() => setActiveType(type.id)}
                className="accent-pioneer-orange-normal"
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isRtl ? "السنة الدراسية" : "Academic Level"}
        </h4>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <input
              type="radio"
              name="academicLevel"
              checked={activeLevel === "all"}
              onChange={() => setActiveLevel("all")}
              className="accent-pioneer-orange-normal"
            />
            <span>{isRtl ? "كل المستويات" : "All Levels"}</span>
          </label>
          {LEVELS.map((level) => (
            <label
              key={level.id}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <input
                type="radio"
                name="academicLevel"
                checked={activeLevel === level.id}
                onChange={() => setActiveLevel(level.id)}
                className="accent-pioneer-orange-normal"
              />
              <span>{isRtl ? level.labelAr : level.labelEn}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800 font-cairo">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isRtl ? "سعر الكورس" : "Price"}
        </h4>
        <div className="space-y-1.5">
          {[
            { id: "all", label: isRtl ? "الكل" : "All" },
            { id: "free", label: isRtl ? "مجاني" : "Free" },
            { id: "paid", label: isRtl ? "مدفوع" : "Paid" }
          ].map((pr) => (
            <label
              key={pr.id}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <input
                type="radio"
                name="coursePrice"
                checked={activePrice === pr.id}
                onChange={() => setActivePrice(pr.id)}
                className="accent-pioneer-orange-normal"
              />
              <span>{pr.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
