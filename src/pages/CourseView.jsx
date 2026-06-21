import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, BookOpen, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, FileText, Menu, Play, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useCourseUnits } from "../features/student/courses/hooks";
import {
  useCompletedLessonIds,
  useCourseProgressStats,
  useCourseResume,
  useMarkLessonComplete,
  useTrackLessonAccess,
} from "../features/student/progress/hooks";
import { useLessonResources } from "../features/student/resources/hooks";

const TYPE_ICON = {
  video: <Play className="h-3.5 w-3.5" />,
  pdf: <FileText className="h-3.5 w-3.5" />,
  default: <ClipboardCheck className="h-3.5 w-3.5" />,
};
const TYPE_COLOR = {
  video: "text-pioneer-orange-normal bg-pioneer-orange-light",
  pdf: "text-blue-500 bg-blue-50",
  default: "text-pioneer-teal-dark bg-pioneer-teal-light",
};

function LessonRow({ lesson, active, done, onSelect }) {
  const hasVideo = !!lesson.videoUrl;
  const type = hasVideo ? "video" : "default";
  return (
    <button
      type="button"
      onClick={() => onSelect?.(lesson)}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start transition-colors ${
        active ? "bg-pioneer-orange-light font-semibold text-pioneer-orange-normal" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] ${TYPE_COLOR[type]}`}>{TYPE_ICON[type]}</span>
      <span className="flex-1 truncate text-xs">{lesson.title}</span>
      {done ? <span className="h-2 w-2 shrink-0 rounded-full bg-green-400" /> : null}
    </button>
  );
}

function UnitBlock({ unit, activeId, doneSet, onSelect }) {
  const containsActive = unit.lessons?.some((l) => l.id === activeId) ?? false;
  const [open, setOpen] = useState(containsActive);

  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive, activeId, unit.id]);

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-start text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
      >
        <span className="flex-1 truncate">{unit.title}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-0.5 px-3 pb-3">
              {(unit.lessons || []).map((lesson) => (
                <LessonRow key={lesson.id} lesson={lesson} active={lesson.id === activeId} done={doneSet.has(lesson.id)} onSelect={onSelect} />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function CourseView() {
  const { t } = useTranslation();
  const { id: courseId } = useParams();

  const {
    data: units = [],
    isLoading: unitsLoading,
    isError: unitsError,
    refetch: refetchUnits,
  } = useCourseUnits(courseId);
  const { data: stats } = useCourseProgressStats(courseId || undefined);
  const { data: resume } = useCourseResume(courseId || undefined);
  const { data: completedIds = [], refetch: refetchCompleted } = useCompletedLessonIds(courseId || undefined);
  const doneSet = useMemo(() => new Set(completedIds), [completedIds]);

  const markComplete = useMarkLessonComplete();
  /** Only `mutate` is stable; the full mutation object changes every render and must not be a hook dependency. */
  const { mutate: trackLessonAccess } = useTrackLessonAccess();

  const flatLessons = useMemo(() => (units || []).flatMap((u) => (u.lessons || []).map((l) => ({ ...l, unitTitle: u.title }))), [units]);

  const [activeLesson, setActiveLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const lessonNav = useMemo(() => {
    if (!activeLesson?.id || flatLessons.length === 0) return { prev: null, next: null };
    const idx = flatLessons.findIndex((l) => l.id === activeLesson.id);
    if (idx < 0) return { prev: null, next: null };
    return {
      prev: idx > 0 ? flatLessons[idx - 1] : null,
      next: idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null,
    };
  }, [activeLesson?.id, flatLessons]);

  useEffect(() => {
    if (!courseId || flatLessons.length === 0) return;
    if (activeLesson && flatLessons.some((l) => l.id === activeLesson.id)) return;
    const rid = resume?.lessonId;
    const pick = rid ? flatLessons.find((l) => l.id === rid) : flatLessons[0];
    if (pick) setActiveLesson(pick);
  }, [courseId, flatLessons, resume, activeLesson]);

  useEffect(() => {
    if (!courseId || !activeLesson?.id) return;
    trackLessonAccess({ lessonId: activeLesson.id, courseId, watchPercentage: 5 });
  }, [courseId, activeLesson?.id, trackLessonAccess]);

  useEffect(() => {
    if (activeLesson?.id) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeLesson?.id]);

  const { data: resources = [] } = useLessonResources(activeLesson?.id);

  const pct = stats?.percentage != null ? Math.round(Number(stats.percentage)) : 0;
  const completedCount = stats?.completedLessons ?? doneSet.size;

  const handleMarkDone = async () => {
    if (!courseId || !activeLesson) return;
    try {
      await markComplete.mutateAsync({ lessonId: activeLesson.id, courseId });
      await refetchCompleted();
    } catch {
      /* toast optional */
    }
  };

  if (!courseId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("courseView.needCohort.title")}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("courseView.needCohort.body")}</p>
        <Link to="/my-classes" className="mt-6 inline-block rounded-xl bg-pioneer-orange-normal px-6 py-3 text-sm font-bold text-white hover:bg-pioneer-orange-hover">
          {t("courseView.needCohort.cta")}
        </Link>
      </div>
    );
  }

  if (unitsLoading) {
    return <div className="py-20 text-center text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</div>;
  }

  if (unitsError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("courseView.loadErrorTitle", { defaultValue: "Could not load this course" })}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("courseView.loadErrorBody", { defaultValue: "Check your connection and try again." })}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => void refetchUnits()}
            className="rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
          >
            {t("takeExam.retry", { defaultValue: "Retry" })}
          </button>
          <Link to="/my-classes" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-pioneer-orange-normal">
            {t("courseView.needCohort.cta")}
          </Link>
        </div>
      </div>
    );
  }

  if (!units.length) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("courseView.emptyCurriculumTitle", { defaultValue: "No lessons yet" })}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("courseView.emptyCurriculumBody", { defaultValue: "This course has no published curriculum, or you may need to refresh." })}</p>
        <Link to="/my-classes" className="mt-6 inline-block rounded-xl bg-pioneer-orange-normal px-6 py-3 text-sm font-bold text-white hover:bg-pioneer-orange-hover">
          {t("courseView.needCohort.cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link to="/my-classes" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-pioneer-orange-normal">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("courseView.backToClasses")}
          </Link>
          <button type="button" className="rounded-lg p-2 md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-1">
        <aside className="hidden w-72 shrink-0 border-e border-slate-200 bg-white md:block md:min-h-[calc(100vh-8rem)]">
          <div className="border-b border-slate-100 p-4">
            <h2 className="text-sm font-bold text-slate-900">{t("courseView.sidebarTitle")}</h2>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>
                  {completedCount} {t("courseView.lessonsCompleted")}
                </span>
                <span className="font-semibold text-pioneer-orange-normal">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-pioneer-orange-normal transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            </div>
          </div>
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
            {units.map((u) => (
              <UnitBlock key={u.id} unit={u} activeId={activeLesson?.id} doneSet={doneSet} onSelect={(l) => setActiveLesson(l)} />
            ))}
          </div>
        </aside>

        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <button type="button" className="absolute inset-0 bg-black/40" aria-label="close" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-50 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 p-3">
                <span className="text-sm font-bold">{t("courseView.sidebarTitle")}</span>
                <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {units.map((u) => (
                  <UnitBlock
                    key={u.id}
                    unit={u}
                    activeId={activeLesson?.id}
                    doneSet={doneSet}
                    onSelect={(l) => {
                      setActiveLesson(l);
                      setSidebarOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <main className="flex-1 px-4 py-6 md:px-8">
          {activeLesson ? (
            <motion.div key={activeLesson.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg" style={{ paddingTop: activeLesson.videoUrl ? "56.25%" : "auto" }}>
                {activeLesson.videoUrl ? (
                  <iframe
                    title={activeLesson.title}
                    src={activeLesson.videoUrl}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-16">
                    <Play className="h-10 w-10 text-slate-500" />
                    <p className="text-sm text-slate-400">{t("courseView.videoPlaceholder", { defaultValue: "No video for this lesson." })}</p>
                  </div>
                )}
              </div>
              <h1 className="mt-5 text-xl font-bold text-slate-900 md:text-2xl">{activeLesson.title}</h1>
              <p className="mt-1 text-xs text-slate-500">{activeLesson.unitTitle}</p>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                {lessonNav.prev ? (
                  <button
                    type="button"
                    onClick={() => setActiveLesson(lessonNav.prev)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  >
                    <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
                    {t("courseView.prev")}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={markComplete.isPending || doneSet.has(activeLesson.id)}
                  onClick={() => void handleMarkDone()}
                  className="rounded-xl bg-pioneer-orange-normal px-4 py-2 text-sm font-semibold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
                >
                  {doneSet.has(activeLesson.id) ? t("courseView.markedDone") : t("courseView.markComplete", { defaultValue: "Mark complete" })}
                </button>
                {lessonNav.next ? (
                  <button
                    type="button"
                    onClick={() => setActiveLesson(lessonNav.next)}
                    className="inline-flex items-center gap-1 rounded-xl border border-pioneer-orange-normal bg-pioneer-orange-light px-4 py-2 text-sm font-bold text-pioneer-orange-normal hover:bg-pioneer-orange-light/80"
                  >
                    {t("courseView.next")}
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
                  </button>
                ) : (
                  <p className="w-full text-sm text-slate-500 sm:w-auto">{t("courseView.lastLessonHint")}</p>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-900">{t("courseView.tabs.materials")}</h3>
                {resources.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">{t("courseView.noMaterials")}</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {resources.map((r) => (
                      <li key={r.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm shadow-sm">
                        <span className="font-medium text-slate-800">{r.title}</span>
                        <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-pioneer-orange-normal hover:underline">
                          {t("courseView.download")}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ) : (
            <p className="text-slate-500">{t("courseView.pickLesson")}</p>
          )}
        </main>
      </div>
    </div>
  );
}
