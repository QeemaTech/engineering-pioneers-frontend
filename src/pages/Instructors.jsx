import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Search, Sparkles, Users } from "lucide-react";
import InstructorCard from "../components/public/InstructorCard";
import { usePublicInstructors } from "../features/public/instructors/hooks";

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="h-36 animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="mx-auto h-6 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function Instructors() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const { data, isLoading, isError, refetch } = usePublicInstructors({ search: q, limit: 48 });

  const instructors = useMemo(() => data?.instructors ?? [], [data]);

  const onSearch = (e) => {
    e.preventDefault();
    setQ(search.trim());
  };

  return (
    <div className="bg-white">
      <section className="border-b border-slate-100 bg-gradient-to-b from-pioneer-orange-light/40 to-white py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-pioneer-orange-normal shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {t("publicInstructors.badge", { defaultValue: "Expert instructors" })}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              {t("publicInstructors.title", { defaultValue: "Meet our instructors" })}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">
              {t("publicInstructors.subtitle", {
                defaultValue: "Browse profiles, explore their courses, and book a private 1-on-1 session.",
              })}
            </p>
          </div>

          <form onSubmit={onSearch} className="mx-auto mt-8 flex max-w-xl gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("publicInstructors.searchPlaceholder", { defaultValue: "Search by name or specialty…" })}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-10 text-sm shadow-sm outline-none focus:border-pioneer-orange-normal"
              />
            </div>
            <button type="submit" className="shrink-0 rounded-xl bg-pioneer-orange-normal px-5 text-sm font-bold text-white hover:bg-pioneer-orange-hover">
              {t("dashboard.common.search", { defaultValue: "Search" })}
            </button>
          </form>
        </div>
      </section>

      <section className="py-12 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
              {t("publicInstructors.loadError", { defaultValue: "Could not load instructors." })}{" "}
              <button type="button" onClick={() => void refetch()} className="font-semibold text-pioneer-orange-normal hover:underline">
                {t("takeExam.retry")}
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && instructors.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users className="h-12 w-12 text-slate-300" />
              <p className="text-slate-600">{t("publicInstructors.empty", { defaultValue: "No instructors match your search." })}</p>
              <Link to="/explore" className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
                {t("publicInstructors.browseCourses", { defaultValue: "Browse courses instead" })}
              </Link>
            </div>
          ) : null}

          {!isLoading && !isError && instructors.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {instructors.map((inst) => (
                <InstructorCard key={inst.id} instructor={inst} isRtl={isRtl} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
