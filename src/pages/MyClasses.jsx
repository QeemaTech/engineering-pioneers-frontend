import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, TrendingUp, User, Video } from "lucide-react";
import { useMyCourses } from "../features/student/courses/hooks";

export default function MyClasses() {
  const { t } = useTranslation();
  const { data: rows = [], isLoading, isError, refetch } = useMyCourses();

  return (
    <div className="space-y-8">
      <div className="text-center md:text-start">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {t("myCohorts.titlePrefix")}{" "}
            <span className="text-pioneer-orange-normal">{t("myCohorts.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500 md:mx-0">{t("myCohorts.subtitle")}</p>
        </div>

        {isLoading ? <p className="mt-12 text-center text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p> : null}
        {isError ? (
          <div className="mt-12 text-center">
            <p className="text-red-600">{t("myCohorts.loadError")}</p>
            <button type="button" onClick={() => void refetch()} className="mt-3 text-sm font-semibold text-pioneer-orange-normal hover:underline">
              {t("takeExam.retry", { defaultValue: "Retry" })}
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && rows.length === 0 ? (
          <p className="mt-12 text-center text-slate-500">{t("myCohorts.empty")}</p>
        ) : null}

        {!isLoading && !isError && rows.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((c) => (
              <article key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative h-36 bg-gradient-to-br from-pioneer-orange-light to-white">
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt="" className="h-full w-full object-cover opacity-90" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-pioneer-orange-normal/30" />
                    </div>
                  )}
                  <span className="absolute start-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow">
                    {c.type === "HYBRID"
                      ? t("courseDetails.type.hybrid", { defaultValue: "Hybrid" })
                      : t("courseDetails.type.recorded", { defaultValue: "Recorded" })}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="text-lg font-bold text-slate-900">{c.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
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
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                    <TrendingUp className="h-4 w-4 text-pioneer-orange-normal" />
                    <span>
                      {Math.round(Number(c.progressPercentage || 0))}% {t("myCohorts.progress")}
                    </span>
                  </div>
                  <div className="mt-auto pt-5">
                    <Link
                      to={`/student/courses/${c.id}/learn`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-pioneer-orange-normal py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover"
                    >
                      {t("myCohorts.continue")}
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
