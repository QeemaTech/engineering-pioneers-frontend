import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import DataTable from "../../components/dashboard/DataTable";
import EmptyState from "../../components/dashboard/EmptyState";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { getErrorMessage } from "../../api/error";
import { useInstructorClasses } from "../../features/instructor/classes/hooks";
import {
  useCourseSessions,
  useCreateCourseSession,
  useDeleteCourseSession,
  useUpdateCourseSession,
} from "../../features/instructor/sessions/hooks";

function toLocalInputValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SessionsPanel({ course, onClose }) {
  const { t } = useTranslation();
  const [notice, setNotice] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    meetingUrl: "",
    recordingUrl: "",
    status: "UPCOMING",
  });

  const { data: sessions = [], isLoading } = useCourseSessions(course.id);
  const createMutation = useCreateCourseSession(course.id);
  const updateMutation = useUpdateCourseSession(course.id);
  const deleteMutation = useDeleteCourseSession(course.id);

  const resetForm = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      meetingUrl: "",
      recordingUrl: "",
      status: "UPCOMING",
    });
  };

  const openEdit = (session) => {
    setEditing(session);
    setForm({
      title: session.title || "",
      description: session.description || "",
      startTime: toLocalInputValue(session.startTime),
      endTime: toLocalInputValue(session.endTime),
      meetingUrl: session.meetingUrl || "",
      recordingUrl: session.recordingUrl || "",
      status: session.status || "UPCOMING",
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setNotice(null);
    const payload = {
      title: form.title || undefined,
      description: form.description || undefined,
      startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
      endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
      meetingUrl: form.meetingUrl || undefined,
    };
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          sessionId: editing.id,
          ...payload,
          recordingUrl: form.recordingUrl || null,
          status: form.status,
        });
        setNotice({ type: "success", message: t("dashboard.instructor.courses.sessionUpdated") });
      } else {
        await createMutation.mutateAsync(payload);
        setNotice({ type: "success", message: t("dashboard.instructor.courses.sessionCreated") });
      }
      resetForm();
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, t("dashboard.instructor.courses.sessionError")) });
    }
  };

  const onDelete = async (sessionId) => {
    setNotice(null);
    try {
      await deleteMutation.mutateAsync(sessionId);
      setNotice({ type: "success", message: t("dashboard.instructor.courses.sessionDeleted") });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, t("dashboard.instructor.courses.sessionError")) });
    }
  };

  const pending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#1A1A22]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{course.title}</h2>
            <p className="text-sm text-slate-500">{t("dashboard.instructor.courses.sessionsSubtitle")}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <Notice type={notice?.type} message={notice?.message} />

        <form onSubmit={onSubmit} className="mb-6 space-y-3 rounded-xl border border-slate-200 p-4 dark:border-white/10">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {editing ? t("dashboard.instructor.courses.editSession") : t("dashboard.instructor.courses.addSession")}
          </p>
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder={t("dashboard.instructor.courses.sessionTitle")}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#12121a]"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              required
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#12121a]"
            />
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              required
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#12121a]"
            />
          </div>
          <input
            value={form.meetingUrl}
            onChange={(e) => setForm((p) => ({ ...p, meetingUrl: e.target.value }))}
            placeholder={t("dashboard.instructor.courses.meetingUrl")}
            className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#12121a]"
          />
          {editing ? (
            <>
              <input
                value={form.recordingUrl}
                onChange={(e) => setForm((p) => ({ ...p, recordingUrl: e.target.value }))}
                placeholder={t("dashboard.instructor.courses.recordingUrl")}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#12121a]"
              />
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#12121a]"
              >
                <option value="UPCOMING">{t("dashboard.instructor.courses.statusUpcoming")}</option>
                <option value="ONGOING">{t("dashboard.instructor.courses.statusOngoing")}</option>
                <option value="COMPLETED">{t("dashboard.instructor.courses.statusCompleted")}</option>
                <option value="MISSED">{t("dashboard.instructor.courses.statusMissed")}</option>
              </select>
            </>
          ) : null}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? t("dashboard.common.save") : t("dashboard.instructor.courses.addSession")}
            </button>
            {editing ? (
              <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">
                {t("dashboard.common.cancel")}
              </button>
            ) : null}
          </div>
        </form>

        {isLoading ? (
          <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-slate-500">{t("dashboard.instructor.courses.noSessions")}</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{s.title || t("dashboard.instructor.courses.untitledSession")}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(s.startTime).toLocaleString()} — {s.status}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => openEdit(s)} className="text-sm font-semibold text-pioneer-orange-normal">
                    {t("dashboard.common.edit")}
                  </button>
                  {s.status === "UPCOMING" ? (
                    <button type="button" onClick={() => onDelete(s.id)} className="text-sm font-semibold text-red-600">
                      {t("dashboard.common.delete")}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MyCourses() {
  const { t } = useTranslation();
  const [query] = useState({ page: 1, limit: 50 });
  const [sessionsCourse, setSessionsCourse] = useState(null);
  const { data, isLoading } = useInstructorClasses(query);

  const rows = (data?.classes || []).map((c) => ({
    ...c,
    activeLabel: c.isActive
      ? t("dashboard.instructor.courses.active")
      : t("dashboard.instructor.courses.inactive"),
    enrollmentsLabel: c.enrollmentCount ?? 0,
    sessionsLabel: c.upcomingSessions ?? 0,
  }));

  return (
    <section>
      <PageHeader
        title={t("dashboard.instructor.pages.courses.title")}
        subtitle={t("dashboard.instructor.pages.courses.subtitle")}
      />
      <DataTable
        columns={[
          { key: "title", title: t("dashboard.instructor.courses.titleCol") },
          { key: "type", title: t("dashboard.instructor.courses.type") },
          { key: "activeLabel", title: t("dashboard.instructor.courses.published") },
          { key: "enrollmentsLabel", title: t("dashboard.instructor.courses.enrollments") },
          { key: "sessionsLabel", title: t("dashboard.instructor.courses.upcomingSessions") },
          {
            key: "actions",
            title: t("dashboard.common.actions"),
            render: (_, row) => (
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/instructor/students?course=${row.id}`}
                  className="font-semibold text-pioneer-orange-normal hover:underline"
                >
                  {t("dashboard.instructor.courses.viewStudents")}
                </Link>
                {row.type === "HYBRID" ? (
                  <button
                    type="button"
                    onClick={() => setSessionsCourse(row)}
                    className="font-semibold text-pioneer-orange-normal hover:underline"
                  >
                    {t("dashboard.instructor.courses.manageSessions")}
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
        rows={rows}
        emptyNode={
          <EmptyState
            title={isLoading ? t("dashboard.common.loading") : t("dashboard.instructor.courses.emptyTitle")}
            message={t("dashboard.instructor.courses.emptyDescription")}
          />
        }
      />
      {sessionsCourse ? <SessionsPanel course={sessionsCourse} onClose={() => setSessionsCourse(null)} /> : null}
    </section>
  );
}

export default MyCourses;
