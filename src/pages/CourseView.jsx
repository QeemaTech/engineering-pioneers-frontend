import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Award, BookOpen, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, ClipboardList, Download, FileText, Loader2, Menu, Play, Video, X } from "lucide-react";
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
import LessonQna from "../components/student/LessonQna";
import CourseLiveSessionsPanel from "../components/student/CourseLiveSessionsPanel";
import CourseHomeworkPanel from "../components/student/CourseHomeworkPanel";
import { useMyCourses } from "../features/student/courses/hooks";
import { useClaimCertificate, useMyCertificates } from "../features/student/certificates/hooks";
import { getErrorMessage } from "../api/error";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

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

function UnitBlock({ unit, activeId, doneSet, onSelect, defaultOpen = false }) {
  const lessons = unit.lessons || [];
  const sections = (unit.sections || []).filter((s) => (s.lessons || []).length > 0);
  const hasSections = sections.length > 0;
  const containsActive = lessons.some((l) => l.id === activeId);
  const [open, setOpen] = useState(defaultOpen || containsActive);

  useEffect(() => {
    if (containsActive) setOpen(true);
  }, [containsActive, activeId, unit.id]);

  const renderLesson = (lesson) => (
    <LessonRow key={lesson.id} lesson={lesson} active={lesson.id === activeId} done={doneSet.has(lesson.id)} onSelect={onSelect} />
  );

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
              {hasSections
                ? sections.map((section) => (
                    <div key={section.id} className="pt-1">
                      {sections.length > 1 || section.title ? (
                        <p className="px-1 pb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{section.title}</p>
                      ) : null}
                      {(section.lessons || []).map((lesson) => renderLesson(lesson))}
                    </div>
                  ))
                : lessons.map((lesson) => renderLesson(lesson))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function CourseView() {
  const { t, i18n } = useTranslation();
  const { id: courseId } = useParams();
  const [mainTab, setMainTab] = useState("lessons");

  const { data: myCourses = [] } = useMyCourses();

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

  const flatLessons = useMemo(
    () =>
      (units || []).flatMap((u) =>
        (u.lessons || []).map((l) => ({
          ...l,
          unitTitle: u.title,
          sectionTitle: l.sectionTitle || null,
        }))
      ),
    [units]
  );

  const hasLessons = flatLessons.length > 0;
  const courseMeta = useMemo(() => myCourses.find((c) => (c.id ?? c.courseId) === courseId), [myCourses, courseId]);
  const showLiveTab = courseMeta?.type === "HYBRID";

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

  const { data: resourcesData } = useLessonResources(activeLesson?.id);
  const resources = Array.isArray(resourcesData) ? resourcesData : [];
  const { data: certificates = [] } = useMyCertificates();
  const claimCertificate = useClaimCertificate();
  const [certClaimErr, setCertClaimErr] = useState("");
  const [claimingCert, setClaimingCert] = useState(false);

  const pct = stats?.percentage != null ? Math.round(Number(stats.percentage)) : 0;
  const completedCount = stats?.completedLessons ?? doneSet.size;
  const isCourseComplete = Boolean(stats?.isCourseCompleted) || pct >= 100;
  const hasCertificate = certificates.some((c) => c.courseId === courseId);
  const existingCert = certificates.find((c) => c.courseId === courseId);

  const handleClaimCertificate = async () => {
    if (!courseId) return;
    setCertClaimErr("");
    setClaimingCert(true);
    try {
      const blob = await claimCertificate.mutateAsync(courseId);
      downloadBlob(blob, `certificate-${courseId}.pdf`);
    } catch (e) {
      setCertClaimErr(getErrorMessage(e, t("courseView.certificate.claimError", { defaultValue: "Could not claim certificate." })));
    } finally {
      setClaimingCert(false);
    }
  };

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
        <Link to="/student/classes" className="mt-6 inline-block rounded-xl bg-pioneer-orange-normal px-6 py-3 text-sm font-bold text-white hover:bg-pioneer-orange-hover">
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
          <Link to="/student/classes" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-pioneer-orange-normal">
            {t("courseView.needCohort.cta")}
          </Link>
        </div>
      </div>
    );
  }

  if (!units.length || !hasLessons) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">{t("courseView.emptyCurriculumTitle", { defaultValue: "No lessons yet" })}</h1>
        <p className="mt-2 text-sm text-slate-600">{t("courseView.emptyCurriculumBody", { defaultValue: "This course has no published curriculum, or you may need to refresh." })}</p>
        <Link to="/student/classes" className="mt-6 inline-block rounded-xl bg-pioneer-orange-normal px-6 py-3 text-sm font-bold text-white hover:bg-pioneer-orange-hover">
          {t("courseView.needCohort.cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Link to="/student/classes" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-pioneer-orange-normal">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("courseView.backToClasses")}
          </Link>
          <button type="button" className="rounded-lg p-2 md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-1 bg-white">
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
            {isCourseComplete ? (
              <div className="mt-4 rounded-xl border border-pioneer-orange-normal/30 bg-pioneer-orange-light/50 p-3">
                <div className="flex items-start gap-2">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-pioneer-orange-normal" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-pioneer-orange-normal">
                      {t("courseView.certificate.completeTitle", { defaultValue: "Course completed!" })}
                    </p>
                    {hasCertificate ? (
                      <p className="mt-1 text-[11px] text-slate-600">
                        {t("courseView.certificate.issued", { defaultValue: "Certificate issued" })}
                        {existingCert?.issuedAt ? ` · ${new Date(existingCert.issuedAt).toLocaleDateString()}` : ""}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-600">{t("courseView.certificate.ready", { defaultValue: "Claim your certificate of completion." })}</p>
                    )}
                    {certClaimErr ? <p className="mt-1 text-[11px] text-red-600">{certClaimErr}</p> : null}
                    {!hasCertificate ? (
                      <button
                        type="button"
                        disabled={claimingCert}
                        onClick={() => void handleClaimCertificate()}
                        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-pioneer-orange-normal px-3 py-2 text-xs font-bold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
                      >
                        {claimingCert ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        {t("courseView.certificate.claim", { defaultValue: "Claim certificate" })}
                      </button>
                    ) : (
                      <Link
                        to="/student/certificates"
                        className="mt-2 block text-center text-[11px] font-semibold text-pioneer-orange-normal hover:underline"
                      >
                        {t("courseView.certificate.viewAll", { defaultValue: "View all certificates" })}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
            {units.map((u, idx) => (
              <UnitBlock key={u.id} unit={u} activeId={activeLesson?.id} doneSet={doneSet} defaultOpen={idx === 0} onSelect={(l) => setActiveLesson(l)} />
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
                {units.map((u, idx) => (
                  <UnitBlock
                    key={u.id}
                    unit={u}
                    activeId={activeLesson?.id}
                    doneSet={doneSet}
                    defaultOpen={idx === 0}
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

        <main className="flex-1 bg-white px-4 py-6 md:px-8">
          <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setMainTab("lessons")}
              className={`flex min-w-[7rem] flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                mainTab === "lessons"
                  ? "bg-white text-pioneer-orange-normal shadow-sm"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              {t("courseView.tabs.lessons", { defaultValue: "Lessons" })}
            </button>
            {showLiveTab ? (
              <button
                type="button"
                onClick={() => setMainTab("live")}
                className={`flex min-w-[7rem] flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  mainTab === "live"
                    ? "bg-white text-pioneer-orange-normal shadow-sm"
                    : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
                }`}
              >
                <Video className="h-4 w-4" />
                {t("courseView.tabs.liveSessions", { defaultValue: "Live sessions" })}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setMainTab("homework")}
              className={`flex min-w-[7rem] flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                mainTab === "homework"
                  ? "bg-white text-pioneer-orange-normal shadow-sm"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              {t("courseView.tabs.homework", { defaultValue: "Homework" })}
            </button>
          </div>

          {mainTab === "homework" ? (
            <CourseHomeworkPanel courseId={courseId} />
          ) : mainTab === "live" && showLiveTab ? (
            <CourseLiveSessionsPanel courseId={courseId} locale={i18n.language} />
          ) : activeLesson ? (
            <motion.div key={activeLesson.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div
                className={`relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm ${
                  activeLesson.videoUrl ? "bg-slate-900" : ""
                }`}
                style={{ paddingTop: activeLesson.videoUrl ? "56.25%" : "auto" }}
              >
                {activeLesson.videoUrl ? (
                  <iframe
                    title={activeLesson.title}
                    src={activeLesson.videoUrl}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-50 to-white py-16">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pioneer-orange-light">
                      <Play className="h-7 w-7 text-pioneer-orange-normal" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">{t("courseView.videoPlaceholder", { defaultValue: "No video for this lesson." })}</p>
                  </div>
                )}
              </div>
              <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h1 className="text-xl font-bold text-slate-900 md:text-2xl">{activeLesson.title}</h1>
              <p className="mt-1 text-xs text-slate-500">
                {[activeLesson.unitTitle, activeLesson.sectionTitle].filter(Boolean).join(" · ")}
              </p>

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

              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <h3 className="text-sm font-bold text-slate-900">{t("courseView.tabs.materials")}</h3>
                {resources.length === 0 ? (
                  <p className="mt-2 text-sm text-slate-500">{t("courseView.noMaterials")}</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {resources.map((r) => (
                      <li key={r.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                        <span className="font-medium text-slate-800">{r.title}</span>
                        <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-pioneer-orange-normal hover:underline">
                          {t("courseView.download")}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              </div>

              {activeLesson?.id ? <LessonQna lessonId={activeLesson.id} /> : null}
            </motion.div>
          ) : mainTab === "live" || mainTab === "homework" ? null : (
            <p className="text-slate-500">{t("courseView.pickLesson")}</p>
          )}
        </main>
      </div>
    </div>
  );
}
