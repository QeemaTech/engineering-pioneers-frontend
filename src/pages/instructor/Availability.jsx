import { useMemo, useState } from "react";
import { CalendarDays, Clock, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import EmptyState from "../../components/dashboard/EmptyState";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { getErrorMessage } from "../../api/error";
import { useCreateAvailabilitySlot, useDeleteAvailabilitySlot, useInstructorAvailability } from "../../features/instructor/availability/hooks";

function todayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function combineLocalDateAndTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [y, m, day] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, m - 1, day, hh, mm || 0, 0, 0);
}

function dayKeyFromIso(iso) {
  const dt = new Date(iso);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDayHeading(iso, locale) {
  const dt = new Date(iso);
  return dt.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatTimeRange(startIso, endIso, locale) {
  const opts = { hour: "2-digit", minute: "2-digit" };
  return `${new Date(startIso).toLocaleTimeString(locale, opts)} – ${new Date(endIso).toLocaleTimeString(locale, opts)}`;
}

function Availability() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en";
  const { data: slots = [], isLoading } = useInstructorAvailability();
  const createMut = useCreateAvailabilitySlot();
  const deleteMut = useDeleteAvailabilitySlot();
  const [notice, setNotice] = useState(null);

  const [dateStr, setDateStr] = useState(todayDateStr);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const grouped = useMemo(() => {
    const map = new Map();
    for (const slot of slots) {
      const key = dayKeyFromIso(slot.startTime);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(slot);
    }
    const keys = [...map.keys()].sort();
    return keys.map((k) => ({
      key: k,
      label: formatDayHeading(map.get(k)[0].startTime, locale),
      items: map.get(k).sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    }));
  }, [slots, locale]);

  const onCreate = async (e) => {
    e.preventDefault();
    setNotice(null);
    const start = combineLocalDateAndTime(dateStr, startTime);
    const end = combineLocalDateAndTime(dateStr, endTime);
    if (!start || !end || end <= start) {
      setNotice({ type: "error", message: t("dashboard.instructor.pages.availability.invalidRange") });
      return;
    }
    try {
      await createMut.mutateAsync({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      setNotice({ type: "success", message: t("dashboard.instructor.pages.availability.added") });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Could not add slot.") });
    }
  };

  const onDelete = async (id) => {
    setNotice(null);
    try {
      await deleteMut.mutateAsync(id);
      setNotice({ type: "success", message: t("dashboard.instructor.pages.availability.removed") });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Could not remove slot.") });
    }
  };

  const fieldClass =
    "mt-1.5 block h-11 w-full rounded-xl border border-slate-200/90 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-400/80 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white dark:focus:border-violet-500/50";

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-violet-500/10 via-transparent to-teal-500/5 p-6 dark:border-white/[0.08] dark:from-violet-500/15 dark:to-teal-500/10">
        <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -start-10 h-40 w-40 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 shadow-sm dark:bg-white/10">
            <Sparkles className="h-6 w-6 text-violet-600 dark:text-violet-300" />
          </div>
          <div className="min-w-0 flex-1">
            <PageHeader title={t("dashboard.instructor.pages.availability.heroTitle")} subtitle={t("dashboard.instructor.pages.availability.heroHint")} />
          </div>
        </div>
      </div>

      <Notice type={notice?.type} message={notice?.message} />

      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5">
          <form
            onSubmit={onCreate}
            className="sticky top-4 space-y-5 rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/90 p-6 shadow-lg shadow-slate-900/5 dark:border-white/[0.08] dark:from-[#1A1A22] dark:to-[#14141c] dark:shadow-black/40"
          >
            <div className="flex items-center gap-2 border-b border-slate-200/80 pb-4 dark:border-white/10">
              <CalendarDays className="h-5 w-5 text-violet-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("dashboard.instructor.pages.availability.addSectionTitle")}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("dashboard.instructor.pages.availability.addSectionHint")}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("dashboard.instructor.pages.availability.labelDate")}
              </label>
              <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className={fieldClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("dashboard.instructor.pages.availability.labelStart")}
                </label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldClass} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t("dashboard.instructor.pages.availability.labelEnd")}
                </label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldClass} />
              </div>
            </div>

            <button
              type="submit"
              disabled={createMut.isPending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:from-violet-500 hover:to-violet-400 disabled:opacity-60"
            >
              {createMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {createMut.isPending ? t("dashboard.instructor.pages.availability.adding") : t("dashboard.instructor.pages.availability.addCta")}
            </button>
          </form>
        </div>

        <div className="space-y-5 lg:col-span-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.instructor.pages.availability.scheduleTitle")}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.instructor.pages.availability.scheduleHint")}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16 text-slate-500 dark:text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            </div>
          ) : !slots.length ? (
            <EmptyState title={t("dashboard.instructor.pages.availability.emptyTitle")} message={t("dashboard.instructor.pages.availability.emptyHint")} />
          ) : (
            <div className="space-y-8">
              {grouped.map((group) => (
                <div key={group.key}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2 dark:border-white/10">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{group.label}</p>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {t("dashboard.instructor.pages.availability.slotsCount", { count: group.items.length })}
                    </span>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-1">
                    {group.items.map((slot) => (
                      <li
                        key={slot.id}
                        className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition hover:border-violet-300/60 hover:shadow-md hover:shadow-violet-500/5 dark:border-white/[0.08] dark:bg-[#1A1A22]/95 dark:hover:border-violet-500/30"
                      >
                        <div className="pointer-events-none absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-violet-500 to-teal-400 opacity-90" />
                        <div className="flex flex-wrap items-center justify-between gap-3 ps-2">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-300">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-base font-semibold text-slate-900 dark:text-white">
                                {formatTimeRange(slot.startTime, slot.endTime, locale)}
                              </p>
                              <p className="mt-0.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {slot.status === "AVAILABLE" ? (
                                  <span className="text-emerald-600 dark:text-emerald-400">{t("dashboard.instructor.pages.availability.openStatus")}</span>
                                ) : (
                                  slot.status
                                )}
                              </p>
                            </div>
                          </div>
                          {slot.status === "AVAILABLE" && (
                            <button
                              type="button"
                              onClick={() => onDelete(slot.id)}
                              disabled={deleteMut.isPending}
                              title={t("dashboard.common.cancel")}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-300/80 hover:bg-[#EE7C11]/10 hover:text-red-500 dark:border-white/10 dark:text-slate-500 dark:hover:border-red-500/40 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Availability;
