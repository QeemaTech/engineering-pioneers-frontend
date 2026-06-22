import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  FileText,
  Layers,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../api/error";
import {
  useCreateInstructorExam,
  useInstructorCourseExamStructure,
} from "../../features/instructor/exams/hooks";

const INPUT =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]";

const TEXTAREA = `${INPUT} min-h-[88px] resize-y py-2.5`;

const textToList = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const textToStructure = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, questionCount, points] = line.split("|").map((part) => part.trim());
      return {
        title,
        questionCount: Number(questionCount) || 0,
        points: Number(points) || 0,
      };
    });

function ScopePill({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all ${
        active
          ? "border-[#EE7C11]/50 bg-[#EE7C11]/10 text-[#EE7C11] dark:bg-[#EE7C11]/15"
          : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function CreateExamModal({ courses, onClose, onCreated }) {
  const { t } = useTranslation();

  const [courseId, setCourseId] = useState(courses[0]?.id || "");
  const [scopeType, setScopeType] = useState("course");
  const [unitId, setUnitId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [totalPoints, setTotalPoints] = useState("100");
  const [passingScore, setPassingScore] = useState("60");
  const [scheduledAt, setScheduledAt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [coveredTopicsText, setCoveredTopicsText] = useState("");
  const [examStructureText, setExamStructureText] = useState("");
  const [importantInstructionsText, setImportantInstructionsText] = useState("");
  const [preparationTipsText, setPreparationTipsText] = useState("");
  const [readyMessage, setReadyMessage] = useState("");
  const [formError, setFormError] = useState("");

  const { data: structure, isLoading: structureLoading } = useInstructorCourseExamStructure(courseId);
  const createMutation = useCreateInstructorExam();

  const units = structure?.units || [];

  const allLessonsFlat = useMemo(() => {
    if (structure?.lessons?.length) return structure.lessons;
    const list = [];
    for (const u of units) {
      for (const s of u.sections || []) {
        for (const l of s.lessons || []) {
          list.push({
            ...l,
            unitId: u.id,
            unitTitle: u.title,
            sectionTitle: s.title,
          });
        }
      }
      for (const l of u.lessons || []) {
        list.push({ ...l, unitId: u.id, unitTitle: u.title });
      }
    }
    return list;
  }, [structure?.lessons, units]);

  const lessonsForUnit = useMemo(() => {
    if (!unitId) return allLessonsFlat;
    return allLessonsFlat.filter((l) => l.unitId === unitId);
  }, [allLessonsFlat, unitId]);

  const scopeSummary = useMemo(() => {
    if (!courseId) return "";
    const courseTitle = courses.find((c) => c.id === courseId)?.title || "";
    if (scopeType === "lesson" && lessonId) {
      const lesson = allLessonsFlat.find((l) => l.id === lessonId);
      return lesson ? `${courseTitle} · ${lesson.unitTitle} · ${lesson.title}` : courseTitle;
    }
    if (scopeType === "unit" && unitId) {
      const unit = units.find((u) => u.id === unitId);
      return unit ? `${courseTitle} · ${unit.title}` : courseTitle;
    }
    return `${courseTitle} · ${t("dashboard.instructor.exams.wholeCourse")}`;
  }, [courseId, scopeType, lessonId, unitId, courses, allLessonsFlat, units, t]);

  const onCourseChange = (id) => {
    setCourseId(id);
    setScopeType("course");
    setUnitId("");
    setLessonId("");
  };

  const onScopeTypeChange = (type) => {
    setScopeType(type);
    setUnitId("");
    setLessonId("");
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!courses.length) {
      setFormError(t("dashboard.instructor.exams.create.noCourses"));
      return;
    }
    if (!title.trim() || !courseId) {
      setFormError(t("dashboard.common.validation"));
      return;
    }
    if (scopeType === "unit" && !unitId) {
      setFormError(t("dashboard.instructor.exams.create.selectUnitRequired"));
      return;
    }
    if (scopeType === "lesson" && !lessonId) {
      setFormError(t("dashboard.instructor.exams.create.selectLessonRequired"));
      return;
    }

    const dm = Number(durationMinutes);
    const tp = Number(totalPoints);
    const ps = Number(passingScore);
    if (Number.isNaN(dm) || dm < 1 || Number.isNaN(tp) || tp < 1 || Number.isNaN(ps) || ps < 0 || ps > tp) {
      setFormError(t("dashboard.instructor.exams.create.scoreValidation"));
      return;
    }

    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        durationMinutes: dm,
        totalPoints: tp,
        passingScore: ps,
        courseId,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        coveredTopics: textToList(coveredTopicsText),
        examStructure: textToStructure(examStructureText),
        importantInstructions: textToList(importantInstructionsText),
        preparationTips: textToList(preparationTipsText),
        readyMessage: readyMessage.trim() || undefined,
      };
      if (scopeType === "unit") body.unitId = unitId;
      if (scopeType === "lesson") body.lessonId = lessonId;

      const exam = await createMutation.mutateAsync(body);
      onCreated?.(exam);
    } catch (err) {
      setFormError(getErrorMessage(err, t("dashboard.instructor.exams.create.error")));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={submitCreate}
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1A1A22]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-white/10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("dashboard.instructor.exams.create.title")}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("dashboard.instructor.exams.create.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex items-start gap-3 rounded-xl border border-blue-200/80 bg-blue-50/80 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-200">
              {t("dashboard.instructor.exams.create.quickStartDesc")}
            </p>
          </div>

          {formError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {formError}
            </div>
          ) : null}

          {!courses.length ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-white/10">
              <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("dashboard.instructor.exams.create.noCourses")}
              </p>
            </div>
          ) : (
            <>
              {/* Basics */}
              <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-[#12121a]/40">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("dashboard.instructor.exams.create.basicsTitle")}
                </p>

                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {t("dashboard.instructor.exams.create.titleLabel")} <span className="text-[#EE7C11]">*</span>
                  </span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("dashboard.instructor.exams.create.titlePlaceholder")}
                    className={INPUT}
                    required
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {t("dashboard.instructor.exams.create.courseLabel")} <span className="text-[#EE7C11]">*</span>
                  </span>
                  <select value={courseId} onChange={(e) => onCourseChange(e.target.value)} className={INPUT} required>
                    <option value="">{t("dashboard.instructor.exams.create.selectCourse")}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {t("dashboard.instructor.exams.create.descriptionLabel")}
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder={t("dashboard.instructor.exams.create.descriptionPlaceholder")}
                    className={TEXTAREA}
                  />
                </label>
              </section>

              {/* Scope */}
              {courseId ? (
                <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-[#12121a]/40">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t("dashboard.instructor.exams.create.scopeTitle")}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {t("dashboard.instructor.exams.create.scopeHint")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <ScopePill
                      active={scopeType === "course"}
                      icon={BookOpen}
                      label={t("dashboard.instructor.exams.create.scopeCourse")}
                      onClick={() => onScopeTypeChange("course")}
                    />
                    <ScopePill
                      active={scopeType === "unit"}
                      icon={Layers}
                      label={t("dashboard.instructor.exams.create.scopeUnit")}
                      onClick={() => onScopeTypeChange("unit")}
                    />
                    <ScopePill
                      active={scopeType === "lesson"}
                      icon={FileText}
                      label={t("dashboard.instructor.exams.create.scopeLesson")}
                      onClick={() => onScopeTypeChange("lesson")}
                    />
                  </div>

                  {structureLoading ? (
                    <p className="text-xs text-slate-500">{t("dashboard.common.loading")}</p>
                  ) : null}

                  {scopeType === "unit" ? (
                    <label className="block space-y-1.5">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {t("dashboard.instructor.exams.create.unitLabel")}
                      </span>
                      <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={INPUT} required>
                        <option value="">{t("dashboard.instructor.exams.create.selectUnit")}</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.title}
                          </option>
                        ))}
                      </select>
                      {!structureLoading && units.length === 0 ? (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {t("dashboard.instructor.exams.create.noUnits")}
                        </p>
                      ) : null}
                    </label>
                  ) : null}

                  {scopeType === "lesson" ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block space-y-1.5">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {t("dashboard.instructor.exams.create.unitLabel")}
                        </span>
                        <select
                          value={unitId}
                          onChange={(e) => {
                            setUnitId(e.target.value);
                            setLessonId("");
                          }}
                          className={INPUT}
                        >
                          <option value="">{t("dashboard.instructor.exams.create.allUnits")}</option>
                          {units.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block space-y-1.5">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          {t("dashboard.instructor.exams.create.lessonLabel")}
                        </span>
                        <select
                          value={lessonId}
                          onChange={(e) => setLessonId(e.target.value)}
                          className={INPUT}
                          required
                        >
                          <option value="">{t("dashboard.instructor.exams.create.selectLesson")}</option>
                          {lessonsForUnit.map((l) => (
                            <option key={l.id} value={l.id}>
                              {unitId ? l.title : `${l.unitTitle} · ${l.title}`}
                            </option>
                          ))}
                        </select>
                      </label>
                      {!structureLoading && allLessonsFlat.length === 0 ? (
                        <p className="sm:col-span-2 text-xs text-amber-600 dark:text-amber-400">
                          {t("dashboard.instructor.exams.create.noLessons")}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {scopeSummary ? (
                    <p className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600 dark:bg-[#12121a] dark:text-slate-300">
                      <span className="font-bold text-[#EE7C11]">{t("dashboard.instructor.exams.scope")}: </span>
                      {scopeSummary}
                    </p>
                  ) : null}
                </section>
              ) : null}

              {/* Rules */}
              <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-[#12121a]/40">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t("dashboard.instructor.exams.create.rulesTitle")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t("dashboard.instructor.exams.create.rulesHint")}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {t("dashboard.instructor.exams.create.durationLabel")}
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className={INPUT}
                      required
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {t("dashboard.instructor.exams.create.totalPointsLabel")}
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={totalPoints}
                      onChange={(e) => setTotalPoints(e.target.value)}
                      className={INPUT}
                      required
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {t("dashboard.instructor.exams.create.passingLabel")}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={Number(totalPoints) || undefined}
                      value={passingScore}
                      onChange={(e) => setPassingScore(e.target.value)}
                      className={INPUT}
                      required
                    />
                    <span className="text-[11px] text-slate-400">
                      {t("dashboard.instructor.exams.create.passingHint")}
                    </span>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {t("dashboard.instructor.exams.create.scheduleLabel")}
                    </span>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className={INPUT}
                    />
                  </label>
                </div>
              </section>

              {/* Advanced — collapsed */}
              <section className="rounded-xl border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {t("dashboard.instructor.exams.create.advancedTitle")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("dashboard.instructor.exams.create.advancedHint")}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                  />
                </button>

                {showAdvanced ? (
                  <div className="space-y-3 border-t border-slate-200 px-4 py-4 dark:border-white/10">
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t("dashboard.instructor.exams.create.coveredTopics")}
                      </span>
                      <textarea
                        value={coveredTopicsText}
                        onChange={(e) => setCoveredTopicsText(e.target.value)}
                        rows={3}
                        placeholder={t("dashboard.instructor.exams.create.coveredTopicsPh")}
                        className={TEXTAREA}
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t("dashboard.instructor.exams.create.examStructure")}
                      </span>
                      <textarea
                        value={examStructureText}
                        onChange={(e) => setExamStructureText(e.target.value)}
                        rows={3}
                        placeholder={t("dashboard.instructor.exams.create.examStructurePh")}
                        className={TEXTAREA}
                      />
                      <span className="text-[11px] text-slate-400">
                        {t("dashboard.instructor.exams.create.examStructureHint")}
                      </span>
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t("dashboard.instructor.exams.create.instructions")}
                      </span>
                      <textarea
                        value={importantInstructionsText}
                        onChange={(e) => setImportantInstructionsText(e.target.value)}
                        rows={3}
                        placeholder={t("dashboard.instructor.exams.create.instructionsPh")}
                        className={TEXTAREA}
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t("dashboard.instructor.exams.create.preparationTips")}
                      </span>
                      <textarea
                        value={preparationTipsText}
                        onChange={(e) => setPreparationTipsText(e.target.value)}
                        rows={3}
                        placeholder={t("dashboard.instructor.exams.create.preparationTipsPh")}
                        className={TEXTAREA}
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {t("dashboard.instructor.exams.create.readyMessage")}
                      </span>
                      <input
                        value={readyMessage}
                        onChange={(e) => setReadyMessage(e.target.value)}
                        placeholder={t("dashboard.instructor.exams.create.readyMessagePh")}
                        className={INPUT}
                      />
                    </label>
                  </div>
                ) : null}
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-white/15 dark:text-slate-200"
          >
            {t("dashboard.common.cancel")}
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || !courses.length}
            className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("dashboard.instructor.exams.create.creating")}
              </>
            ) : (
              <>
                <ClipboardList className="h-4 w-4" />
                {t("dashboard.instructor.exams.create.submit")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
