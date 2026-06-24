import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Users, Clock, CheckCircle, XCircle, Loader2, Calendar, UserCheck, UserX } from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "../../components/dashboard/EmptyState";
import { useAttendanceSessions, useMarkSessionAttendance, useSessionAttendance } from "../../features/instructor/attendance/hooks";
import { useInstructorClassesForStudents } from "../../features/instructor/students/hooks";
import { getErrorMessage } from "../../api/error";
import { useAttendanceSocket } from "../../hooks/useAttendanceSocket";

const DARK_INPUT =
  "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:[color-scheme:dark]";

const CARD =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]";

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return "—";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function Attendance() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const { data: classes = [] } = useInstructorClassesForStudents({ page: 1, limit: 100 });

  const sessionParams = useMemo(
    () => ({
      page: 1,
      limit: 50,
      ...(courseFilter ? { courseId: courseFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    }),
    [courseFilter, statusFilter]
  );

  const { data: sessionsData, isLoading: sessionsLoading } = useAttendanceSessions(sessionParams);
  const sessions = sessionsData?.sessions || [];

  const activeSessionId = selectedSessionId || sessions[0]?.id || "";
  const { data: detail, isLoading: detailLoading } = useSessionAttendance(activeSessionId, {
    enabled: Boolean(activeSessionId),
  });
  const markMutation = useMarkSessionAttendance();

  useAttendanceSocket({ sessionId: activeSessionId, enabled: Boolean(activeSessionId) });

  const summary = detail?.summary;
  const roster = detail?.roster || [];
  const session = detail?.session;

  const handleMark = async (studentId, present) => {
    if (!activeSessionId) return;
    try {
      await markMutation.mutateAsync({ sessionId: activeSessionId, studentId, present });
      toast.success(
        dir === "rtl"
          ? present
            ? "تم تسجيل الحضور"
            : "تم تسجيل الغياب"
          : present
            ? "Marked present"
            : "Marked absent"
      );
    } catch (e) {
      toast.error(getErrorMessage(e, dir === "rtl" ? "تعذر تحديث الحضور" : "Could not update attendance"));
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("sidebarNav.items.attendance")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {dir === "rtl"
              ? "عرض حضور الجلسات المباشرة المسجلة لكورساتك الهجينة."
              : "Review live session attendance for your hybrid courses."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={courseFilter}
            onChange={(e) => {
              setCourseFilter(e.target.value);
              setSelectedSessionId("");
            }}
            className={DARK_INPUT}
          >
            <option value="">{dir === "rtl" ? "كل الكورسات" : "All courses"}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSelectedSessionId("");
            }}
            className={DARK_INPUT}
          >
            <option value="">{dir === "rtl" ? "كل الحالات" : "All statuses"}</option>
            <option value="UPCOMING">{dir === "rtl" ? "قادمة" : "Upcoming"}</option>
            <option value="ONGOING">{dir === "rtl" ? "جارية" : "Ongoing"}</option>
            <option value="COMPLETED">{dir === "rtl" ? "مكتملة" : "Completed"}</option>
            <option value="MISSED">{dir === "rtl" ? "فائتة" : "Missed"}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${CARD} lg:col-span-1`}>
          <h3 className="mb-4 font-bold text-slate-900 dark:text-white">
            {dir === "rtl" ? "الجلسات" : "Sessions"}
          </h3>

          {sessionsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#EE7C11]" />
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              title={dir === "rtl" ? "لا توجد جلسات" : "No sessions"}
              message={
                dir === "rtl"
                  ? "أضف جلسات مباشرة من صفحة الكورسات للكورسات الهجينة."
                  : "Add live sessions from the courses page for hybrid courses."
              }
            />
          ) : (
            <div className="max-h-[28rem] space-y-2 overflow-y-auto">
              {sessions.map((s) => {
                const active = s.id === activeSessionId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`w-full rounded-xl border p-3 text-start transition-all ${
                      active
                        ? "border-[#EE7C11]/40 bg-[#EE7C11]/10 dark:bg-[#EE7C11]/15"
                        : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {s.title || s.courseTitle}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.courseTitle}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(s.startTime).toLocaleString()}
                      </span>
                      <span>{s.status}</span>
                      <span>
                        {s.presentCount}/{s.enrolledCount} {dir === "rtl" ? "حاضر" : "present"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-2">
          {!activeSessionId ? (
            <div className={CARD}>
              <EmptyState
                title={dir === "rtl" ? "اختر جلسة" : "Select a session"}
                message={
                  dir === "rtl"
                    ? "اختر جلسة من القائمة لعرض سجل الحضور."
                    : "Pick a session from the list to view its attendance roster."
                }
              />
            </div>
          ) : detailLoading ? (
            <div className={`${CARD} flex justify-center py-16`}>
              <Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className={CARD}>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {dir === "rtl" ? "الحاضرون" : "Present"}
                    </span>
                    <Users className="h-5 w-5 text-[#EE7C11]" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {summary?.presentCount ?? 0}
                    <span className="ms-1 text-xs font-normal text-slate-400">
                      / {summary?.enrolledCount ?? 0}
                    </span>
                  </p>
                </div>

                <div className={CARD}>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {dir === "rtl" ? "الغائبون" : "Absent"}
                    </span>
                    <XCircle className="h-5 w-5 text-rose-400" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {summary?.absentCount ?? 0}
                  </p>
                </div>

                <div className={CARD}>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {dir === "rtl" ? "نسبة الحضور" : "Attendance rate"}
                    </span>
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {summary?.attendanceRate ?? 0}%
                  </p>
                </div>

                <div className={CARD}>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {dir === "rtl" ? "متوسط المدة" : "Avg duration"}
                    </span>
                    <Clock className="h-5 w-5 text-[#EE7C11]" />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {formatDuration(summary?.avgDurationMinutes)}
                  </p>
                </div>
              </div>

              <div className={`${CARD} overflow-hidden p-0`}>
                <div className="border-b border-slate-200 p-5 dark:border-white/10">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {session?.title || session?.courseTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {session?.startTime ? new Date(session.startTime).toLocaleString() : ""}
                    {session?.status ? ` · ${session.status}` : ""}
                  </p>
                </div>

                {roster.length === 0 ? (
                  <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    {dir === "rtl"
                      ? "لا يوجد طلاب مسجّلون في هذا الكورس بعد."
                      : "No students are enrolled in this course yet."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-start text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 dark:border-white/10">
                          <th className="p-4 text-start font-semibold">
                            {dir === "rtl" ? "الطالب" : "Student"}
                          </th>
                          <th className="p-4 text-start font-semibold">
                            {dir === "rtl" ? "وقت الدخول" : "Joined"}
                          </th>
                          <th className="p-4 text-start font-semibold">
                            {dir === "rtl" ? "وقت الخروج" : "Left"}
                          </th>
                          <th className="p-4 text-start font-semibold">
                            {dir === "rtl" ? "المدة" : "Duration"}
                          </th>
                          <th className="p-4 text-start font-semibold">
                            {dir === "rtl" ? "الحالة" : "Status"}
                          </th>
                          <th className="p-4 text-start font-semibold">
                            {dir === "rtl" ? "تسجيل" : "Mark"}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {roster.map((row) => {
                          const isPresent = row.status === "PRESENT" || row.status === "LEFT";
                          const busy =
                            markMutation.isPending &&
                            markMutation.variables?.studentId === row.studentId;
                          return (
                          <tr key={row.studentId} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                            <td className="p-4">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {row.student?.fullName || "—"}
                              </p>
                              <p className="text-xs text-slate-500">{row.student?.email}</p>
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-400">
                              {row.joinedAt ? new Date(row.joinedAt).toLocaleString() : "—"}
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-400">
                              {row.leftAt ? new Date(row.leftAt).toLocaleString() : "—"}
                            </td>
                            <td className="p-4 text-slate-500 dark:text-slate-400">
                              {formatDuration(row.durationMinutes)}
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  row.status === "PRESENT" || row.status === "LEFT"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : row.status === "ABSENT"
                                      ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                                      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={busy || isPresent}
                                  onClick={() => void handleMark(row.studentId, true)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-700 disabled:opacity-40 dark:text-emerald-400"
                                >
                                  <UserCheck className="h-3.5 w-3.5" />
                                  {dir === "rtl" ? "حاضر" : "Present"}
                                </button>
                                <button
                                  type="button"
                                  disabled={busy || !isPresent}
                                  onClick={() => void handleMark(row.studentId, false)}
                                  className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-700 disabled:opacity-40 dark:text-rose-400"
                                >
                                  <UserX className="h-3.5 w-3.5" />
                                  {dir === "rtl" ? "غائب" : "Absent"}
                                </button>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Attendance;
