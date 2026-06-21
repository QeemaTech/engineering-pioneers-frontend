import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Users,
  BookOpen,
  ChevronDown,
  SlidersHorizontal,
  Layers,
} from "lucide-react";
import { usePublicCourses } from "../features/public/hooks";

const CATEGORIES = ["all", "beginner", "hsk1", "hsk2", "hsk3", "conversation", "writing", "oneToOne"];

function slugToCategoryKey(slug, title) {
  const s = (slug || "").toLowerCase();
  const tl = (title || "").toLowerCase();
  if (s.includes("hsk1") || tl.includes("hsk 1")) return "hsk1";
  if (s.includes("hsk2") || tl.includes("hsk 2")) return "hsk2";
  if (s.includes("hsk3") || tl.includes("hsk 3")) return "hsk3";
  if (s.includes("conversation") || tl.includes("conversation")) return "conversation";
  if (s.includes("writing") || tl.includes("writing")) return "writing";
  if (s.includes("private") || s.includes("1-1") || tl.includes("one-to-one") || tl.includes("1-1")) return "oneToOne";
  return "beginner";
}

function coursePrice(course) {
  const n = Number(course?.price);
  return Number.isNaN(n) ? null : n;
}

function CourseCard({ course }) {
  const { t } = useTranslation();
  const price = coursePrice(course);
  const purchaseCount = Number(course._count?.purchases ?? 0);
  const isHybrid = course.type === "HYBRID";
  const isOneToOne = course.displayCategory === "oneToOne";

  const palette = [
    ["bg-pioneer-orange-light", "bg-pioneer-orange-normal"],
    ["bg-pioneer-teal-light", "bg-pioneer-teal-normal"],
    ["bg-blue-50", "bg-blue-500"],
    ["bg-green-50", "bg-green-500"],
    ["bg-purple-50", "bg-purple-500"],
    ["bg-orange-50", "bg-orange-400"],
  ];
  const idx = Math.abs(String(course.id).split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % palette.length;
  const [color, accent] = palette[idx];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className={`relative flex h-44 items-center justify-center ${color}`}>
        <div className={`h-16 w-16 rounded-full ${accent} flex items-center justify-center opacity-20`} />
        <BookOpen className={`absolute h-10 w-10 ${accent.replace("bg-", "text-")}`} />

        <span className="absolute start-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
          {course.categoryLabel}
        </span>

        {isOneToOne ? (
          <span className="absolute end-3 top-3 rounded-full bg-pioneer-teal-normal px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
            {t("explore.badge.oneToOne")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">{course.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">{course.description || "—"}</p>

        <p className="mt-2 text-xs font-medium text-pioneer-orange-normal">{course.instructorName}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 shrink-0" />
            {isHybrid
              ? t("courseDetails.type.hybrid", { defaultValue: "Hybrid" })
              : t("courseDetails.type.recorded", { defaultValue: "Recorded" })}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {purchaseCount} {t("explore.enrollmentsLabel", { defaultValue: "students" })}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold text-slate-900">
            {price == null ? (
              <span className="text-sm font-semibold text-slate-500">{t("explore.pricing.contact", { defaultValue: "See details" })}</span>
            ) : price === 0 ? (
              <span className="text-green-600">{t("explore.free")}</span>
            ) : (
              `$${price.toFixed(0)}`
            )}
          </span>
          <Link
            to={`/courses/${course.id}`}
            className="rounded-lg bg-pioneer-orange-normal px-4 py-2 text-sm font-semibold text-white transition hover:bg-pioneer-orange-hover"
          >
            {t("explore.enroll")}
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Explore() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = usePublicCourses({ page, limit, search: debouncedSearch || undefined });
  const courses = data?.courses ?? [];
  const meta = data?.meta;

  const displayCourses = useMemo(() => {
    return courses.map((c) => {
      const slug = c.category?.slug || "";
      const displayCategory = slugToCategoryKey(slug, c.title);
      const categoryLabel = c.category?.name || t(`explore.categories.${displayCategory}`);
      return {
        ...c,
        displayCategory,
        categoryLabel,
        instructorName: c.instructor?.fullName || t("explore.instructorFallback", { defaultValue: "Instructor TBA" }),
      };
    });
  }, [courses, t]);

  const filtered = useMemo(() => {
    return displayCourses.filter((c) => activeCategory === "all" || c.displayCategory === activeCategory);
  }, [displayCourses, activeCategory]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "price-low") {
      list.sort((a, b) => (coursePrice(a) ?? Infinity) - (coursePrice(b) ?? Infinity));
    } else if (sortBy === "price-high") {
      list.sort((a, b) => (coursePrice(b) ?? -1) - (coursePrice(a) ?? -1));
    } else if (sortBy === "rating") {
      list.sort((a, b) => Number(b._count?.purchases ?? 0) - Number(a._count?.purchases ?? 0));
    } else {
      list.sort((a, b) => Number(b._count?.purchases ?? 0) - Number(a._count?.purchases ?? 0));
    }
    return list;
  }, [filtered, sortBy]);

  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
            {t("explore.titlePrefix")}{" "}
            <span className="text-pioneer-orange-normal">{t("explore.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500">{t("explore.subtitle")}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("explore.searchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-10 text-sm text-slate-900 outline-none transition focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light placeholder:text-slate-400"
            />
          </div>

          <div className="relative w-full sm:w-52">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pe-10 ps-4 text-sm text-slate-700 outline-none focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light"
            >
              <option value="popular">{t("explore.sort.popular")}</option>
              <option value="rating">{t("explore.sort.rating")}</option>
              <option value="price-low">{t("explore.sort.priceLow")}</option>
              <option value="price-high">{t("explore.sort.priceHigh")}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCategory === cat
                  ? "bg-pioneer-orange-normal text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal"
              }`}
            >
              {t(`explore.categories.${cat}`)}
            </button>
          ))}
        </div>

        <p className="mt-5 text-sm text-slate-500">
          {t("explore.showingPaged", {
            count: sorted.length,
            total: meta?.total ?? sorted.length,
            page: meta?.page ?? page,
            defaultValue: `Showing ${sorted.length} of ${meta?.total ?? sorted.length} (page ${meta?.page ?? page})`,
          })}
        </p>

        {isLoading ? (
          <div className="mt-16 text-center text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</div>
        ) : sorted.length > 0 ? (
          <>
            <div className={`mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${isFetching ? "opacity-70" : ""}`}>
              {sorted.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <p className="text-xs text-slate-500">
                {t("explore.pagination.page", { page, totalPages, defaultValue: `Page ${page} of ${totalPages}` })}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                >
                  {t("explore.pagination.prev", { defaultValue: "Previous" })}
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                >
                  {t("explore.pagination.next", { defaultValue: "Next" })}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <SlidersHorizontal className="h-10 w-10 text-slate-300" />
            <p className="text-lg font-semibold text-slate-500">{t("explore.noResults")}</p>
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setActiveCategory("all");
                setPage(1);
              }}
              className="text-sm font-medium text-pioneer-orange-normal hover:underline"
            >
              {t("explore.clearFilters")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
