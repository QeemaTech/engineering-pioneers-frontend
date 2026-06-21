import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import DataTable from "../../components/dashboard/DataTable";
import EmptyState from "../../components/dashboard/EmptyState";
import PageHeader from "../../components/dashboard/PageHeader";
import { getErrorMessage } from "../../api/error";
import { useInstructorClasses } from "../../features/instructor/classes/hooks";
import {
  useCreateInstructorExam,
  useInstructorCourseExamStructure,
  useInstructorExams,
} from "../../features/instructor/exams/hooks";

function scopeLabel(exam, t) {
  if (exam.lesson?.title) {
    const u = exam.unit?.title ? `${exam.unit.title} · ` : "";
    return `${u}${exam.lesson.title}`;
  }
  if (exam.unit?.title) return exam.unit.title;
  if (exam.course?.title)
    return `${t("dashboard.instructor.exams.wholeCourse")} · ${exam.course.title}`;
  return "—";
}

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

function Exams() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState({ search: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const { data, isLoading, isError, error, refetch } = useInstructorExams({
    search: query.search || undefined,
  });
  const { data: classesData } = useInstructorClasses({ page: 1, limit: 200 });

  const courses = useMemo(() => {
    return (classesData?.classes || []).map((c) => ({ id: c.id, title: c.title }));
  }, [classesData]);

  const [courseId, setCourseId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [totalPoints, setTotalPoints] = useState("100");
  const [passingScore, setPassingScore] = useState("60");
  const [scheduledAt, setScheduledAt] = useState("");
  const [coveredTopicsText, setCoveredTopicsText] = useState("");
  const [examStructureText, setExamStructureText] = useState("");
  const [importantInstructionsText, setImportantInstructionsText] = useState("");
  const [preparationTipsText, setPreparationTipsText] = useState("");
  const [readyMessage, setReadyMessage] = useState("");
  const [formError, setFormError] = useState("");

  const { data: structure } = useInstructorCourseExamStructure(courseId);
  const createMutation = useCreateInstructorExam();

  const units = structure?.units || [];
  const lessonsForUnit = useMemo(() => {
    if (!unitId) return [];
    const u = units.find((x) => x.id === unitId);
    return u?.lessons || [];
  }, [units, unitId]);

  const allLessonsFlat = useMemo(() => {
    const list = [];
    for (const u of units) {
      for (const l of u.lessons || []) {
        list.push({ ...l, unitTitle: u.title, unitId: u.id });
      }
    }
    return list;
  }, [units]);

  const openCreate = () => {
    setFormError("");
    setCreateOpen(true);
    setCourseId(courses[0]?.id || "");
    setUnitId("");
    setLessonId("");
    setTitle("");
    setDescription("");
    setDurationMinutes("60");
    setTotalPoints("100");
    setPassingScore("60");
    setScheduledAt("");
    setCoveredTopicsText("");
    setExamStructureText("");
    setImportantInstructionsText("");
    setPreparationTipsText("");
    setReadyMessage("");
  };

  const onCourseChange = (id) => {
    setCourseId(id);
    setUnitId("");
    setLessonId("");
  };

  const onUnitChange = (id) => {
    setUnitId(id);
    setLessonId("");
  };

  const onLessonChange = (id) => {
    setLessonId(id);
    if (id) {
      const row = allLessonsFlat.find((l) => l.id === id);
      if (row) setUnitId(row.unitId);
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    const dm = Number(durationMinutes);
    const tp = Number(totalPoints);
    const ps = Number(passingScore);
    if (!title.trim() || !courseId) {
      setFormError(t("dashboard.common.validation"));
      return;
    }
    if (Number.isNaN(dm) || dm < 1 || Number.isNaN(tp) || tp < 1 || Number.isNaN(ps) || ps < 0 || ps > tp) {
      setFormError(t("dashboard.common.validation"));
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
        unitId: lessonId ? undefined : unitId || undefined,
        lessonId: lessonId || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        coveredTopics: textToList(coveredTopicsText),
        examStructure: textToStructure(examStructureText),
        importantInstructions: textToList(importantInstructionsText),
        preparationTips: textToList(preparationTipsText),
        readyMessage: readyMessage.trim() || undefined,
      };
      const exam = await createMutation.mutateAsync(body);
      setCreateOpen(false);
      if (exam?.id) navigate(`/instructor/exams/${exam.id}`);
    } catch (err) {
      setFormError(getErrorMessage(err, t("dashboard.instructor.exams.create.error")));
    }
  };

  const exams = data?.exams || [];

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("dashboard.instructor.pages.exams.title")}
        subtitle={t("dashboard.instructor.pages.exams.subtitle")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query.search}
              onChange={(e) => setQuery({ search: e.target.value })}
              placeholder={t("dashboard.common.search")}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-pioneer-orange-normal dark:border-white/10 dark:bg-[#1A1A22] dark:text-white"
            />
            <button
              type="button"
              onClick={openCreate}
              className="h-10 rounded-xl bg-pioneer-orange-normal px-4 text-sm font-semibold text-white"
            >
              {t("dashboard.instructor.exams.createExam")}
            </button>
          </div>
        }
      />

      {isError && (
        <p className="text-sm text-red-600">
          {getErrorMessage(error, "Failed to load exams.")}{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            {t("dashboard.common.retry")}
          </button>
        </p>
      )}

      <DataTable
        columns={[
          { key: "title", title: t("dashboard.instructor.exams.titleCol") },
          {
            key: "scope",
            title: t("dashboard.instructor.exams.scope"),
            render: (_, row) => scopeLabel(row, t),
          },
          {
            key: "durationMinutes",
            title: t("dashboard.instructor.exams.duration"),
            render: (v) => `${v} ${t("dashboard.instructor.exams.minutesShort")}`,
          },
          { key: "totalPoints", title: t("dashboard.instructor.exams.points") },
          { key: "status", title: t("dashboard.instructor.exams.status") },
          {
            key: "_count",
            title: t("dashboard.instructor.exams.submissionsCount"),
            render: (c) => c?.submissions ?? 0,
          },
          {
            key: "id",
            title: t("dashboard.common.actions"),
            render: (_, row) => (
              <Link
                to={`/instructor/exams/${row.id}`}
                className="font-semibold text-pioneer-orange-normal hover:underline"
              >
                {t("dashboard.instructor.exams.details")}
              </Link>
            ),
          },
        ]}
        rows={exams}
        emptyNode={
          <EmptyState
            title={isLoading ? t("dashboard.common.loading") : t("dashboard.instructor.exams.emptyTitle")}
            message={t("dashboard.instructor.exams.emptyDescription")}
          />
        }
      />

      {createOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={submitCreate}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1A1A22]"
          >
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
              {t("dashboard.instructor.exams.create.title")}
            </h3>
            {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("dashboard.instructor.exams.create.titleLabel")}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                required
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("dashboard.instructor.exams.create.courseLabel")}
              <select
                value={courseId}
                onChange={(e) => onCourseChange(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                required
              >
                <option value="">{t("dashboard.instructor.exams.create.selectCourse")}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
            {courseId && (
              <>
                <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("dashboard.instructor.exams.create.unitLabel")}
                  <select
                    value={unitId}
                    onChange={(e) => onUnitChange(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="">—</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("dashboard.instructor.exams.create.lessonLabel")}
                  <select
                    value={lessonId}
                    onChange={(e) => onLessonChange(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="">—</option>
                    {(unitId ? lessonsForUnit : allLessonsFlat).map((l) => (
                      <option key={l.id} value={l.id}>
                        {unitId ? l.title : `${l.unitTitle} · ${l.title}`}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-pioneer-orange-normal underline"
                  onClick={() => {
                    setUnitId("");
                    setLessonId("");
                  }}
                >
                  {t("dashboard.instructor.exams.create.clearScope")}
                </button>
              </>
            )}
            <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("dashboard.instructor.exams.create.descriptionLabel")}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </label>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Mobile Exam Details</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                These fields feed the student exam details screen. Leave empty to use automatic defaults.
              </p>
              <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Covered Topics
                <textarea
                  value={coveredTopicsText}
                  onChange={(e) => setCoveredTopicsText(e.target.value)}
                  rows={4}
                  placeholder="One topic per line"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Exam Structure
                <textarea
                  value={examStructureText}
                  onChange={(e) => setExamStructureText(e.target.value)}
                  rows={4}
                  placeholder={"Listening | 20 | 30\nReading | 15 | 30"}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
                <span className="text-[11px] text-slate-400">Format: Section title | question count | points</span>
              </label>
              <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Important Instructions
                <textarea
                  value={importantInstructionsText}
                  onChange={(e) => setImportantInstructionsText(e.target.value)}
                  rows={4}
                  placeholder="One instruction per line"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Preparation Tips
                <textarea
                  value={preparationTipsText}
                  onChange={(e) => setPreparationTipsText(e.target.value)}
                  rows={4}
                  placeholder="One tip per line"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>
              <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Ready Message
                <input
                  value={readyMessage}
                  onChange={(e) => setReadyMessage(e.target.value)}
                  placeholder="Make sure you have enough time and a stable internet connection."
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("dashboard.instructor.exams.create.durationLabel")}
                <input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("dashboard.instructor.exams.create.totalPointsLabel")}
                <input
                  type="number"
                  min={1}
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  required
                />
              </label>
            </div>
            <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("dashboard.instructor.exams.create.passingLabel")}
              <input
                type="number"
                min={0}
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                required
              />
            </label>
            <label className="mt-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t("dashboard.instructor.exams.create.scheduleLabel")}
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10 dark:text-slate-200"
              >
                {t("dashboard.common.cancel")}
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2 text-sm font-semibold text-white"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("dashboard.instructor.exams.create.submit")}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Exams;
