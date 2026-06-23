import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import EmptyState from "../../components/dashboard/EmptyState";
import { getErrorMessage } from "../../api/error";
import { useInstructorCourse } from "../../features/instructor/courses/hooks";
import { useInstructorClassesForStudents } from "../../features/instructor/students/hooks";
import {
  useCreateInstructorHomework,
  useDeleteInstructorHomework,
} from "../../features/instructor/homework/hooks";

const INPUT =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:[color-scheme:dark]";

const CARD = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]";

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export default function HomeworkAssignmentsTab() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";

  const { data: classes = [] } = useInstructorClassesForStudents({ page: 1, limit: 100 });
  const [courseId, setCourseId] = useState("");
  const activeCourseId = courseId || classes[0]?.id || "";

  const { data: course, isLoading: courseLoading, refetch } = useInstructorCourse(activeCourseId || undefined);

  const createMutation = useCreateInstructorHomework();
  const deleteMutation = useDeleteInstructorHomework();

  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [filename, setFilename] = useState("");
  const [requirements, setRequirements] = useState("");
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState(defaultDueDate);

  const lessons = useMemo(() => {
    const list = [];
    course?.units?.forEach((u) => {
      u.sections?.forEach((s) => {
        s.lessons?.forEach((l) => list.push({ id: l.id, title: l.title }));
      });
    });
    return list;
  }, [course]);

  const homeworks = course?.homeworks || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!activeCourseId || !selectedLessonId || !title.trim()) return;
    try {
      await createMutation.mutateAsync({
        courseId: activeCourseId,
        title: title.trim(),
        description: requirements.trim(),
        type: filename.trim() ? "FILE" : "TEXT",
        targetType: "LESSONS",
        attachments: filename.trim() ? [filename.trim()] : [],
        requirements: requirements.trim() ? [requirements.trim()] : [],
        dueDate: new Date(dueDate).toISOString(),
        totalPoints: Number(points),
        lessonIds: [selectedLessonId],
      });
      toast.success(isRtl ? "تم إنشاء الواجب" : "Homework created.");
      setTitle("");
      setFilename("");
      setRequirements("");
      void refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "تعذر إنشاء الواجب" : "Could not create homework."));
    }
  };

  const handleDelete = async (hwId) => {
    const msg = isRtl
      ? "حذف هذا الواجب؟ سيتم حذف التعيين نهائياً."
      : "Delete this homework assignment? This cannot be undone.";
    if (!window.confirm(msg)) return;
    try {
      await deleteMutation.mutateAsync(hwId);
      toast.success(isRtl ? "تم الحذف" : "Homework deleted.");
      void refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "تعذر الحذف" : "Delete failed."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {isRtl ? "الكورس" : "Course"}
          <select
            value={activeCourseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setSelectedLessonId("");
            }}
            className={`${INPUT} ms-2 min-w-[200px]`}
          >
            {classes.length === 0 ? (
              <option value="">{isRtl ? "لا توجد كورسات" : "No courses"}</option>
            ) : (
              classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))
            )}
          </select>
        </label>
      </div>

      {courseLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" />
        </div>
      ) : !activeCourseId ? (
        <EmptyState
          title={isRtl ? "اختر كورساً" : "Select a course"}
          message={isRtl ? "أنشئ أو اختر كورساً لإدارة الواجبات." : "Create or select a course to manage assignments."}
        />
      ) : lessons.length === 0 ? (
        <EmptyState
          title={isRtl ? "لا توجد دروس" : "No lessons yet"}
          message={
            isRtl
              ? "أضف دروساً من محرر الكورس أولاً."
              : "Add lessons from the course editor before creating homework."
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleCreate} className={`${CARD} space-y-4`}>
            <h3 className="font-bold text-slate-900 dark:text-white">
              {isRtl ? "واجب جديد" : "New assignment"}
            </h3>

            <label className="block space-y-1 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {isRtl ? "الدرس" : "Lesson"}
              </span>
              <select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} className={INPUT} required>
                <option value="">{isRtl ? "اختر درساً" : "Select lesson"}</option>
                {lessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {isRtl ? "العنوان" : "Title"}
              </span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} required />
            </label>

            <label className="block space-y-1 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {isRtl ? "المتطلبات" : "Requirements"}
              </span>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
                className={`${INPUT} min-h-[80px] resize-y py-2`}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {isRtl ? "الدرجات" : "Points"}
                </span>
                <input type="number" min={1} value={points} onChange={(e) => setPoints(Number(e.target.value))} className={INPUT} />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {isRtl ? "موعد التسليم" : "Due date"}
                </span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={INPUT} required />
              </label>
            </div>

            <label className="block space-y-1 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {isRtl ? "ملف مرفق (اختياري)" : "Attachment filename (optional)"}
              </span>
              <input value={filename} onChange={(e) => setFilename(e.target.value)} className={INPUT} placeholder="homework.pdf" />
            </label>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#EE7C11] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRtl ? "حفظ الواجب" : "Save assignment"}
            </button>
          </form>

          <div className={CARD}>
            <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
              {isRtl ? "الواجبات النشطة" : "Active assignments"}
              <span className="ms-2 text-sm font-normal text-slate-400">({homeworks.length})</span>
            </h3>
            {homeworks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isRtl ? "لا توجد واجبات لهذا الكورس." : "No assignments for this course yet."}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {homeworks.map((hw) => (
                  <li key={hw.id} className="flex items-start justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">{hw.title}</p>
                      <p className="text-xs text-slate-500">
                        {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : "—"} · {hw.totalPoints} pts
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={() => void handleDelete(hw.id)}
                      className="shrink-0 rounded-lg border border-rose-500/30 p-2 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                      title={t("dashboard.common.delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
