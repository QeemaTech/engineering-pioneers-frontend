import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, ChevronDown, Clock3, ExternalLink, Search, Video } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useStudentClasses } from "../../features/student/classes/hooks";
import { getErrorMessage } from "../../api/error";

const THUMB_GRADIENTS = [
  "from-pioneer-orange-dark to-pioneer-orange-normal",
  "from-slate-700 to-slate-500",
  "from-pioneer-teal-dark to-pioneer-teal-normal",
];

function formatWhen(iso, locale) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(locale === "ar" ? "ar" : undefined, { dateStyle: "medium", timeStyle: "short" });
}

function isUpcoming(iso) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && t > Date.now();
}

function SessionThumbnail({ gradientClass }) {
  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-br ${gradientClass}`} style={{ paddingTop: "56.25%" }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Video className="h-10 w-10 text-white/90" />
      </div>
    </div>
  );
}

function SessionCard({ item, gradientClass, locale }) {
  const { t } = useTranslation();
  const upcoming = isUpcoming(item.scheduledAt);
  const courseTitle = item.course?.title || t("recordings.unknownCourse");
  const instructorName = item.instructor?.fullName || "—";
  const whenLabel = formatWhen(item.scheduledAt, locale);
  const durationLabel =
    item.durationMinutes != null && item.durationMinutes > 0
      ? t("recordings.durationMinutes", { n: item.durationMinutes })
      : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/40 dark:bg-[#1E293B]">
      <SessionThumbnail gradientClass={gradientClass} />
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 inline-block self-start rounded-full bg-pioneer-orange-light px-2.5 py-0.5 text-[11px] font-semibold text-pioneer-orange-normal">
          {courseTitle}
        </span>
        <h3 className="text-base font-bold leading-snug text-slate-900 line-clamp-2 dark:text-white">{item.title}</h3>
        <p className="mt-1 text-sm text-pioneer-orange-normal">{instructorName}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {whenLabel}
          </span>
          {durationLabel ? (
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {durationLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-auto pt-4">
          {item.meetingUrl ? (
            <a
              href={item.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-pioneer-orange-normal py-2.5 text-sm font-semibold text-pioneer-orange-normal transition hover:bg-pioneer-orange-light"
            >
              <ExternalLink className="h-4 w-4" />
              {upcoming ? t("recordings.joinLive") : t("recordings.openMeeting")}
            </a>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs text-slate-500">
              {t("recordings.noMeetingLink")}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

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
          {filtered.map((item, i) => (
            <SessionCard key={item.id} item={item} gradientClass={THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]} locale={i18n.language} />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && classes.length > 0 && filtered.length === 0 ? (
        <p className="py-12 text-center text-slate-500">{t("recordings.empty")}</p>
      ) : null}
    </div>
  );
}
