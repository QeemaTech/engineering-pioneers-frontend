import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, Search, Video } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import LiveSessionCard from "../../components/student/LiveSessionCard";
import { useStudentClasses } from "../../features/student/classes/hooks";
import { getErrorMessage } from "../../api/error";

export default function LiveSessions() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const { data: classes = [], isLoading, isError, error, refetch } = useStudentClasses(true);

  const courseOptions = useMemo(() => {
    const titles = new Set();
    for (const c of classes) {
      const title = c.course?.title;
      if (title) titles.add(title);
    }
    return ["", ...Array.from(titles).sort()];
  }, [classes]);

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      const courseTitle = c.course?.title || "";
      const instructorName = c.instructor?.fullName || "";
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        courseTitle.toLowerCase().includes(q) ||
        instructorName.toLowerCase().includes(q);
      const matchCourse = !courseFilter || courseTitle === courseFilter;
      return matchSearch && matchCourse;
    });
  }, [classes, search, courseFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("student.liveSessions.title", { defaultValue: "Live Sessions" })}
        subtitle={t("student.liveSessions.subtitle", { defaultValue: "Join scheduled live classes for your enrolled courses." })}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("recordings.searchPlaceholder")}
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-10 text-sm outline-none focus:border-pioneer-orange-normal dark:border-slate-600 dark:bg-[#1E293B] dark:text-white"
          />
        </div>
        <div className="relative w-full sm:w-52">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pe-10 ps-4 text-sm dark:border-slate-600 dark:bg-[#1E293B] dark:text-white"
          >
            {courseOptions.map((c) => (
              <option key={c || "all"} value={c}>
                {c || t("recordings.filter.all")}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <div className="text-sm text-red-600">
          <p>{getErrorMessage(error, t("recordings.loadError"))}</p>
          <button type="button" onClick={() => void refetch()} className="mt-2 font-semibold text-pioneer-orange-normal hover:underline">
            {t("takeExam.retry")}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && classes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Video className="h-12 w-12 text-slate-300" />
          <p className="font-semibold text-slate-600">{t("recordings.emptyCohorts")}</p>
        </div>
      ) : null}

      {!isLoading && !isError && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <LiveSessionCard key={item.id} session={item} locale={i18n.language} />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && classes.length > 0 && filtered.length === 0 ? (
        <p className="py-12 text-center text-slate-500">{t("recordings.empty")}</p>
      ) : null}
    </div>
  );
}
