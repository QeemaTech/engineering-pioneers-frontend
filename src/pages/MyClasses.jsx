import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, TrendingUp, User, Video } from "lucide-react";
import { useMyCourses } from "../features/student/courses/hooks";
import { resolveMediaUrl } from "../utils/mediaUrl";

export default function MyClasses() {
  const { t } = useTranslation();
  const { data: rows = [], isLoading, isError, refetch } = useMyCourses();

  return (
    <div className="space-y-8">
      <div className="text-center md:text-start">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
            {t("myCohorts.titlePrefix")}{" "}
            <span className="text-pioneer-orange-normal">{t("myCohorts.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500 dark:text-slate-400 md:mx-0">{t("myCohorts.subtitle")}</p>
        </div>

        {isLoading ? <p className="mt-12 text-center text-slate-500 dark:text-slate-400">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p> : null}
        {isError ? (
          <div className="mt-12 text-center">
            <p className="text-red-600">{t("myCohorts.loadError")}</p>
            <button type="button" onClick={() => void refetch()} className="mt-3 text-sm font-semibold text-pioneer-orange-normal hover:underline">
              {t("takeExam.retry", { defaultValue: "Retry" })}
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && rows.length === 0 ? (
          <p className="mt-12 text-center text-slate-500 dark:text-slate-400">{t("myCohorts.empty")}</p>
        ) : null}

        {!isLoading && !isError && rows.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((c) => (
              <article key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700/40 dark:bg-[#1E293B]">
                <div className="relative h-36 bg-gradient-to-br from-pioneer-orange-light to-white dark:from-pioneer-orange-normal/20 dark:to-[#1E293B]">
                  {c.thumbnail ? (
                    <img src={resolveMediaUrl(c.thumbnail)} alt="" className="h-full w-full object-cover opacity-90" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-pioneer-orange-normal/30" />
                    </div>
                  )}
                  <span className="absolute start-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow dark:bg-slate-800/95 dark:text-slate-200">
                    {c.type === "HYBRID"
                      ? t("courseDetails.type.hybrid", { defaultValue: "Hybrid" })
                      : t("courseDetails.type.recorded", { defaultValue: "Recorded" })}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{c.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {c.instructor?.fullName || "—"}
                    </span>
                    {c.type === "HYBRID" ? (
                      <span className="flex items-center gap-1">
                        <Video className="h-3.5 w-3.5" />
                        {t("courseDetails.liveSessions.title", { defaultValue: "Live sessions" })}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <TrendingUp className="h-4 w-4 text-pioneer-orange-normal" />
                    <span>
                      {Math.round(Number(c.progressPercentage || 0))}% {t("myCohorts.progress")}
                    </span>
                  </div>
                  <div className="mt-auto flex flex-col gap-2 pt-5">
                    <Link
                      to={`/student/courses/${c.id}/learn`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-pioneer-orange-normal py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover"
                    >
                      {t("myCohorts.continue")}
                    </Link>
                    <Link
                      to={`/student/homework/course/${c.id}`}
                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal dark:border-slate-600 dark:text-slate-300"
                    >
                      {t("homework.titleAccent")}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
    </div>
  );
}
