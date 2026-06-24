import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, ChevronDown, Clock, Search } from "lucide-react";
import { useMemo, useState } from "react";
import PageHeader from "../components/dashboard/PageHeader";
import { useMyHomework } from "../features/student/homework/hooks";
import {
  deriveHomeworkUiStatus,
  HOMEWORK_STATUS_BADGE,
  HOMEWORK_STATUS_LABEL,
} from "../utils/homeworkStatus";

function homeworkTypeKey(type) {
  const k = String(type || "TEXT").toUpperCase();
  if (["TEXT", "FILE", "LINK"].includes(k)) return `homework.type.${k}`;
  return "homework.type.TEXT";
}

export default function Homework() {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const { data: items = [], isLoading, isError, refetch } = useMyHomework();

  const courseOptions = useMemo(() => {
    const map = new Map();
    for (const h of items) {
      const id = h.courseId;
      if (id && !map.has(id)) map.set(id, { id, title: h.courseTitle || id });
    }
    return Array.from(map.values()).sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (courseFilter) list = list.filter((h) => h.courseId === courseFilter);
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (h) =>
        (h.title || "").toLowerCase().includes(s) ||
        (h.courseTitle || "").toLowerCase().includes(s) ||
        (h.cohortName || "").toLowerCase().includes(s) ||
        String(h.type || "").toLowerCase().includes(s)
    );
  }, [items, q, courseFilter]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${t("homework.titlePrefix")} ${t("homework.titleAccent")}`}
        subtitle={t("homework.subtitle")}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch lg:max-w-3xl">
            <div className="relative min-w-0 flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("homework.searchPlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-4 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light dark:border-slate-600 dark:bg-[#1E293B] dark:text-white sm:pe-3"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pioneer-orange-normal text-white shadow-sm hover:bg-pioneer-orange-hover"
              aria-label={t("homework.searchAria", { defaultValue: "Search" })}
            >
              <Search className="h-5 w-5" />
            </button>
            <div className="relative min-w-[180px] sm:min-w-[200px]">
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2 pe-10 ps-4 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light dark:border-slate-600 dark:bg-[#1E293B] dark:text-white"
              >
                <option value="">{t("homework.filter.allClasses", { defaultValue: "All classes" })}</option>
                {courseOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <p className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
            {filtered.length === 0
              ? t("homework.showingNone", { defaultValue: "No assignments to show" })
              : t("homework.showingRange", {
                  from: 1,
                  to: filtered.length,
                  total: items.length,
                  defaultValue: "Showing {{from}}–{{to}} of {{total}} results",
                })}
          </p>
        </div>

        {isLoading ? <p className="mt-12 text-center text-slate-500">{t("dashboard.common.loading")}</p> : null}
        {isError ? (
          <div className="mt-12 text-center text-red-600">
            {t("homework.hubLoadError", { defaultValue: "Could not load homework." })}{" "}
            <button type="button" onClick={() => void refetch()} className="ms-2 text-sm font-semibold text-pioneer-orange-normal hover:underline">
              {t("takeExam.retry", { defaultValue: "Retry" })}
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && items.length === 0 ? (
          <p className="mt-12 text-center text-slate-500">{t("homework.hubEmpty", { defaultValue: "No homework yet for your classes." })}</p>
        ) : null}

        {!isLoading && !isError && items.length > 0 && filtered.length === 0 ? (
          <p className="mt-12 text-center text-slate-500">{t("homework.emptyFilter", { defaultValue: "No assignments match your search." })}</p>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {!isLoading && !isError
            ? filtered.map((hw) => {
                const st = deriveHomeworkUiStatus(hw);
                const badgeClass = HOMEWORK_STATUS_BADGE[st.key] || HOMEWORK_STATUS_BADGE.pending;
                const typeKey = homeworkTypeKey(hw.type);
                const ctx = hw.courseTitle || t("homework.filter.allClasses", { defaultValue: "Course" });
                const canSubmit = st.key === "pending" || st.key === "late";
                const ctaKey = canSubmit ? "homework.actions.submit" : "homework.actions.viewDetails";

                return (
                  <article key={hw.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{hw.title}</h3>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {ctx}
                            {hw.courseId ? (
                              <>
                                {" · "}
                                <Link
                                  to={`/student/homework/course/${hw.courseId}`}
                                  className="font-semibold text-pioneer-orange-normal hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {t("homework.viewCourse", { defaultValue: "All course homework" })}
                                </Link>
                              </>
                            ) : null}
                          </p>
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-pioneer-orange-normal/90">{t(typeKey)}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>{t(HOMEWORK_STATUS_LABEL[st.key])}</span>
                      </div>

                      <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex flex-wrap items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <span>
                            {t("homework.due")} {new Date(hw.dueDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                          </span>
                        </div>
                        {hw.submission?.submittedAt ? (
                          <div className="flex flex-wrap items-center gap-1">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span>
                              {t("homework.submitted")} {new Date(hw.submission.submittedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      {st.key === "pending" && st.daysLeft != null ? (
                        <p className="mt-2 text-xs font-medium text-orange-700">
                          {t("homework.daysLeft", { n: st.daysLeft, defaultValue: "({{n}} days left)" })}
                        </p>
                      ) : null}
                      {st.key === "late" && st.overdueDays != null ? (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          {t("homework.overdue", { n: st.overdueDays, defaultValue: "{{n}} days overdue" })}
                        </p>
                      ) : null}
                      {st.key === "completed" && st.gradePct != null ? (
                        <p className="mt-2 text-xs font-medium text-green-700">
                          {t("homework.gradePct", { pct: st.gradePct, defaultValue: "Grade: {{pct}}%" })}
                        </p>
                      ) : null}

                      <Link
                        to={`/student/homework/assignment/${hw.id}`}
                        className="mt-5 block w-full rounded-xl bg-pioneer-orange-light py-3 text-center text-sm font-bold text-pioneer-orange-normal transition hover:bg-pioneer-orange-light/80 dark:bg-pioneer-orange-normal/15 dark:hover:bg-pioneer-orange-normal/25"
                      >
                        {t(ctaKey)}
                      </Link>
                    </div>
                  </article>
                );
              })
            : null}
        </div>
    </div>
  );
}
