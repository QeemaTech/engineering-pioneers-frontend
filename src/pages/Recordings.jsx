import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronDown, Clock3, ExternalLink, Search, Video } from "lucide-react";
import useAuthStore from "../store/authStore";
import { APP_ROLES, hasAnyRole } from "../config/permissions";
import { useStudentClasses } from "../features/student/classes/hooks";
import { getErrorMessage } from "../api/error";

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
      <div className="absolute -end-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -start-4 h-16 w-16 rounded-full bg-white/10" />
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
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <SessionThumbnail gradientClass={gradientClass} />

      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 inline-block self-start rounded-full bg-pioneer-orange-light px-2.5 py-0.5 text-[11px] font-semibold text-pioneer-orange-normal">
          {courseTitle}
        </span>

        <h3 className="text-base font-bold leading-snug text-slate-900 line-clamp-2">{item.title}</h3>

        <p className="mt-1 text-sm text-pioneer-orange-normal">{instructorName}</p>

        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {item.status} · {item.type || "—"}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
            {whenLabel}
          </span>
          {durationLabel ? (
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-slate-400" />
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
            <p className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs text-slate-500">{t("recordings.noMeetingLink")}</p>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Recordings() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isStudent = hasAnyRole(user, [APP_ROLES.STUDENT]);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const { data: classes = [], isLoading, isError, error, refetch } = useStudentClasses(isAuthenticated && isStudent);

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

  const loginRedirect = `/login?redirect=${encodeURIComponent("/recordings")}`;

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-pioneer-orange-light">
            <Video className="h-6 w-6 text-pioneer-orange-normal" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
            {t("recordings.titlePrefix")}{" "}
            <span className="text-pioneer-orange-normal">{t("recordings.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-500">{t("recordings.subtitle")}</p>
        </div>

        {!isAuthenticated ? (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-slate-600">{t("recordings.signInPrompt")}</p>
            <Link
              to={loginRedirect}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-pioneer-orange-normal py-3 text-sm font-bold text-white transition hover:bg-pioneer-orange-hover"
            >
              {t("recordings.signInCta")}
            </Link>
          </div>
        ) : null}

        {isAuthenticated && !isStudent ? (
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            {t("recordings.studentsOnly")}
          </div>
        ) : null}

        {isAuthenticated && isStudent ? (
          <>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("recordings.searchPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-10 text-sm outline-none transition focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light placeholder:text-slate-400"
                />
              </div>
              <div className="relative w-full sm:w-52">
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pe-10 ps-4 text-sm text-slate-700 outline-none focus:border-pioneer-orange-normal"
                >
                  {courseOptions.map((c) => (
                    <option key={c || "all"} value={c}>
                      {c ? c : t("recordings.filter.all")}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {isLoading ? (
              <p className="mt-8 text-center text-sm text-slate-500">{t("recordings.loading")}</p>
            ) : null}

            {isError ? (
              <div className="mt-8 text-center text-sm text-red-600">
                <p>{getErrorMessage(error, t("recordings.loadError"))}</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="mt-2 font-semibold text-pioneer-orange-normal hover:underline"
                >
                  {t("takeExam.retry", { defaultValue: "Retry" })}
                </button>
              </div>
            ) : null}

            {!isLoading && !isError ? (
              <p className="mt-4 text-sm text-slate-500">
                {t("recordings.showing", { count: filtered.length, total: classes.length })}
              </p>
            ) : null}

            {!isLoading && !isError && classes.length === 0 ? (
              <div className="mt-16 flex flex-col items-center gap-3 text-center">
                <Video className="h-12 w-12 text-slate-300" />
                <p className="max-w-md font-semibold text-slate-600">{t("recordings.emptyCohorts")}</p>
              </div>
            ) : null}

            {!isLoading && !isError && classes.length > 0 && filtered.length > 0 ? (
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item, i) => (
                  <SessionCard
                    key={item.id}
                    item={item}
                    gradientClass={THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]}
                    locale={i18n.language}
                  />
                ))}
              </div>
            ) : null}

            {!isLoading && !isError && classes.length > 0 && filtered.length === 0 ? (
              <div className="mt-16 flex flex-col items-center gap-3 text-center">
                <Video className="h-12 w-12 text-slate-300" />
                <p className="font-semibold text-slate-500">{t("recordings.empty")}</p>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
