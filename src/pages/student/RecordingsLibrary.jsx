import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, Headphones, Play, Search } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useStudentRecordings } from "../../features/student/recordings/hooks";
import { getErrorMessage } from "../../api/error";
import { resolveMediaUrl } from "../../utils/mediaUrl";

const THUMB_GRADIENTS = [
  "from-pioneer-orange-dark to-pioneer-orange-normal",
  "from-slate-700 to-slate-500",
  "from-pioneer-teal-dark to-pioneer-teal-normal",
];

function RecordingCard({ item, gradientClass }) {
  const { t } = useTranslation();
  const href = `/student/recordings/${item.sourceType}/${item.id}`;

  return (
    <Link
      to={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/40 dark:bg-[#1E293B]"
    >
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradientClass}`} style={{ paddingTop: "56.25%" }}>
        {item.thumbnailUrl ? (
          <img src={resolveMediaUrl(item.thumbnailUrl)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition group-hover:opacity-100">
          <Play className="h-12 w-12 text-white" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {item.courseTitle ? (
          <span className="mb-2 inline-block self-start rounded-full bg-pioneer-orange-light px-2.5 py-0.5 text-[11px] font-semibold text-pioneer-orange-normal">
            {item.courseTitle}
          </span>
        ) : null}
        <h3 className="text-base font-bold leading-snug text-slate-900 line-clamp-2 dark:text-white">{item.title}</h3>
        <p className="mt-2 text-xs text-slate-500">
          {item.sourceType === "LIVE_SESSION"
            ? t("student.recordings.typeLive", { defaultValue: "Live recording" })
            : t("student.recordings.typeLesson", { defaultValue: "Lesson video" })}
          {item.durationText ? ` · ${item.durationText}` : ""}
        </p>
      </div>
    </Link>
  );
}

export default function RecordingsLibrary() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading, isError, error, refetch } = useStudentRecordings();
  const recordings = data?.recordings ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return recordings.filter((r) => {
      const matchSearch =
        !q ||
        (r.title || "").toLowerCase().includes(q) ||
        (r.courseTitle || "").toLowerCase().includes(q);
      const matchType = !typeFilter || r.sourceType === typeFilter;
      return matchSearch && matchType;
    });
  }, [recordings, search, typeFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("student.recordings.title", { defaultValue: "Recordings" })}
        subtitle={t("student.recordings.subtitle", { defaultValue: "Watch recorded live sessions and lesson videos from your courses." })}
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pe-10 ps-4 text-sm dark:border-slate-600 dark:bg-[#1E293B] dark:text-white"
          >
            <option value="">{t("student.recordings.filterAll", { defaultValue: "All types" })}</option>
            <option value="LIVE_SESSION">{t("student.recordings.typeLive", { defaultValue: "Live recordings" })}</option>
            <option value="RECORDED_LESSON">{t("student.recordings.typeLesson", { defaultValue: "Lesson videos" })}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <div className="text-sm text-red-600">
          <p>{getErrorMessage(error, t("student.recordings.loadError", { defaultValue: "Could not load recordings." }))}</p>
          <button type="button" onClick={() => void refetch()} className="mt-2 font-semibold text-pioneer-orange-normal hover:underline">
            {t("takeExam.retry")}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && recordings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Headphones className="h-12 w-12 text-slate-300" />
          <p className="font-semibold text-slate-600">{t("student.recordings.empty", { defaultValue: "No recordings available yet." })}</p>
        </div>
      ) : null}

      {!isLoading && !isError && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <RecordingCard key={`${item.sourceType}-${item.id}`} item={item} gradientClass={THUMB_GRADIENTS[i % THUMB_GRADIENTS.length]} />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && recordings.length > 0 && filtered.length === 0 ? (
        <p className="py-12 text-center text-slate-500">{t("recordings.empty")}</p>
      ) : null}
    </div>
  );
}
