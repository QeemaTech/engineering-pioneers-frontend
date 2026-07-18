import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Award,
  ChevronDown,
  ClipboardList,
  Lock,
  Play,
  Video,
  X,
} from "lucide-react";

function formatDuration(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  if (total < 60) return `${total}s`;
  const mins = Math.floor(total / 60);
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  if (hrs > 0) return `${hrs}h ${rem}m`;
  return `${mins}m`;
}

function OutlineRow({ icon: Icon, iconClass, title, meta, locked, onClick, isPreview }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-start gap-3 rounded-lg px-2 py-2.5 transition-all ${
        onClick ? "cursor-pointer bg-slate-50 hover:bg-pioneer-orange-light/20 dark:bg-slate-800/40 dark:hover:bg-slate-800/80" : ""
      }`}
    >
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{title}</p>
          {isPreview && (
            <span className="shrink-0 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-650 dark:text-emerald-400 font-cairo">
              معاينة مجانية / Preview
            </span>
          )}
        </div>
        {meta ? <p className="mt-0.5 text-xs text-slate-500">{meta}</p> : null}
      </div>
      {locked ? (
        <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-650" aria-hidden />
      ) : isPreview ? (
        <Play className="mt-1 h-3.5 w-3.5 shrink-0 text-[#EE7C11] fill-[#EE7C11]" aria-hidden />
      ) : null}
    </div>
  );
}

function UnitBlock({ unit, exams, homeworks, defaultOpen, t, onPreviewLesson }) {
  const sections = (unit.sections || []).filter((s) => (s.lessons || []).length > 0);
  const [open, setOpen] = useState(defaultOpen);

  const unitExams = exams.filter((ex) => ex.unitId === unit.id && !ex.lessonId);
  const unitHomeworks = homeworks.filter(
    (hw) => hw.unitId === unit.id && (!hw.lessonIds || hw.lessonIds.length === 0)
  );

  const lessonCount = sections.reduce((sum, sec) => sum + (sec.lessons?.length || 0), 0);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start transition hover:bg-slate-50"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{unit.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {lessonCount} {t("courseDetails.curriculum.lessons")}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="space-y-1 border-t border-slate-200 bg-white px-2 py-2">
          {sections.map((section) => (
            <div key={section.id} className="space-y-0.5">
              {sections.length > 1 || section.title ? (
                <p className="px-2 pt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">{section.title}</p>
              ) : null}
              {(section.lessons || []).map((lesson) => {
                const lessonExams = exams.filter((ex) => ex.lessonId === lesson.id);
                const lessonHomeworks = homeworks.filter((hw) => hw.lessonIds?.includes(lesson.id));
                const meta = lesson.isLive
                  ? t("courseDetails.curriculum.liveLesson")
                  : lesson.durationSeconds
                    ? formatDuration(lesson.durationSeconds)
                    : null;

                return (
                  <div key={lesson.id} className="space-y-0.5">
                    <OutlineRow
                      icon={lesson.isLive ? Video : Play}
                      iconClass={
                        lesson.isLive
                          ? "bg-rose-50 text-rose-500"
                          : "bg-pioneer-orange-light text-pioneer-orange-normal"
                      }
                      title={lesson.title}
                      meta={meta}
                      locked={!lesson.isPreview}
                      isPreview={lesson.isPreview}
                      onClick={lesson.isPreview && lesson.videoUrl ? () => onPreviewLesson(lesson.videoUrl) : undefined}
                    />
                    {lessonHomeworks.map((hw) => (
                      <div key={hw.id} className="ps-9">
                        <OutlineRow
                          icon={ClipboardList}
                          iconClass="bg-blue-50 text-blue-600"
                          title={hw.title}
                          meta={t("courseDetails.curriculum.homework")}
                          locked
                        />
                      </div>
                    ))}
                    {lessonExams.map((exam) => (
                      <div key={exam.id} className="ps-9">
                        <OutlineRow
                          icon={Award}
                          iconClass="bg-amber-50 text-amber-600"
                          title={exam.title}
                          meta={t("courseDetails.curriculum.exam")}
                          locked
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}

          {unitHomeworks.map((hw) => (
            <OutlineRow
              key={hw.id}
              icon={ClipboardList}
              iconClass="bg-blue-50 text-blue-600"
              title={hw.title}
              meta={t("courseDetails.curriculum.homework")}
              locked
            />
          ))}

          {unitExams.map((exam) => (
            <OutlineRow
              key={exam.id}
              icon={Award}
              iconClass="bg-amber-50 text-amber-600"
              title={exam.title}
              meta={t("courseDetails.curriculum.exam")}
              locked
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PublicCourseCurriculum({ units = [], homeworks = [], exams = [] }) {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);

  const stats = useMemo(() => {
    let lessons = 0;
    for (const unit of units) {
      for (const section of unit.sections || []) {
        lessons += section.lessons?.length || 0;
      }
    }
    return {
      modules: units.length,
      lessons,
      homeworks: homeworks.length,
      exams: exams.length,
    };
  }, [units, homeworks, exams]);

  const courseHomeworks = useMemo(
    () => homeworks.filter((hw) => !hw.unitId && (!hw.lessonIds || hw.lessonIds.length === 0)),
    [homeworks]
  );
  const courseExams = useMemo(
    () => exams.filter((ex) => !ex.unitId && !ex.lessonId),
    [exams]
  );

  const visibleUnits = showAll ? units : units.slice(0, 4);
  const hiddenCount = Math.max(0, units.length - visibleUnits.length);

  if (!units.length && !homeworks.length && !exams.length) {
    return (
      <p className="text-sm text-slate-500">
        {t("courseDetails.curriculum.empty", { defaultValue: "Curriculum outline will be published soon." })}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
        {stats.modules > 0 ? (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {stats.modules} {t("courseDetails.curriculum.modules")}
          </span>
        ) : null}
        {stats.lessons > 0 ? (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {stats.lessons} {t("courseDetails.curriculum.lessons")}
          </span>
        ) : null}
        {stats.homeworks > 0 ? (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {stats.homeworks} {t("courseDetails.curriculum.homeworkCount", { defaultValue: "assignments" })}
          </span>
        ) : null}
        {stats.exams > 0 ? (
          <span className="rounded-full bg-slate-100 px-3 py-1">
            {stats.exams} {t("courseDetails.curriculum.examCount", { defaultValue: "exams" })}
          </span>
        ) : null}
      </div>

      {units.length > 0 ? (
        <div className="space-y-3">
          {visibleUnits.map((unit, index) => (
            <UnitBlock
              key={unit.id}
              unit={unit}
              exams={exams}
              homeworks={homeworks}
              defaultOpen={index === 0}
              t={t}
              onPreviewLesson={setPreviewVideoUrl}
            />
          ))}
          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="w-full rounded-xl border border-dashed border-slate-200 py-2.5 text-sm font-semibold text-pioneer-orange-normal transition hover:border-pioneer-orange-normal hover:bg-pioneer-orange-light/30"
            >
              {showAll
                ? t("courseDetails.curriculum.showLess")
                : t("courseDetails.curriculum.showAll", { n: hiddenCount })}
            </button>
          ) : null}
        </div>
      ) : null}

      {courseHomeworks.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("courseDetails.curriculum.homeworkSection", { defaultValue: "Course assignments" })}
          </h3>
          {courseHomeworks.map((hw) => (
            <OutlineRow
              key={hw.id}
              icon={ClipboardList}
              iconClass="bg-blue-50 text-blue-600"
              title={hw.title}
              meta={t("courseDetails.curriculum.homework")}
              locked
            />
          ))}
        </div>
      ) : null}

      {courseExams.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {t("courseDetails.curriculum.examSection", { defaultValue: "Course assessments" })}
          </h3>
          {courseExams.map((exam) => (
            <OutlineRow
              key={exam.id}
              icon={Award}
              iconClass="bg-amber-50 text-amber-600"
              title={exam.title}
              meta={t("courseDetails.curriculum.exam")}
              locked
            />
          ))}
        </div>
      ) : null}

      <p className="text-xs leading-relaxed text-slate-500">
        {t("courseDetails.curriculum.enrollHint", {
          defaultValue: "Lesson videos, files, and assessments unlock after you enroll.",
        })}
      </p>
      
      <VideoPlayerModal
        url={previewVideoUrl}
        isOpen={!!previewVideoUrl}
        onClose={() => setPreviewVideoUrl(null)}
      />
    </div>
  );
}

function VideoPlayerModal({ url, onClose, isOpen }) {
  if (!isOpen || !url) return null;

  // Check if YouTube
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");
  // Check if Vimeo
  const isVimeo = url.includes("vimeo.com");

  let embedUrl = url;
  if (isYouTube) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      embedUrl = `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
  } else if (isVimeo) {
    const regExp = /vimeo\.com\/([0-9]+)/;
    const match = url.match(regExp);
    if (match) {
      embedUrl = `https://player.vimeo.com/video/${match[1]}?autoplay=1`;
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#0F0F13] border border-white/10 p-1 overflow-hidden shadow-2xl flex flex-col aspect-video animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-[210] rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition"
        >
          <X className="h-5 w-5" />
        </button>
        {isYouTube || isVimeo ? (
          <iframe
            src={embedUrl}
            title="Lesson Preview"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-xl"
          ></iframe>
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="w-full h-full rounded-xl object-contain bg-black"
          ></video>
        )}
      </div>
    </div>
  );
}
