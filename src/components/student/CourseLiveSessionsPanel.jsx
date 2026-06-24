import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import LiveSessionCard from "./LiveSessionCard";
import { useStudentClasses } from "../../features/student/classes/hooks";

export default function CourseLiveSessionsPanel({ courseId, locale }) {
  const { t } = useTranslation();
  const { data: allSessions = [], isLoading } = useStudentClasses(!!courseId);

  const sessions = useMemo(
    () =>
      allSessions
        .filter((s) => s.courseId === courseId && s.type === "GROUP")
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [allSessions, courseId]
  );

  if (isLoading) {
    return <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <Video className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-600">
          {t("courseView.liveSessions.empty", { defaultValue: "No live sessions scheduled for this course yet." })}
        </p>
        <Link to="/student/live-sessions" className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
          {t("courseView.liveSessions.viewAll", { defaultValue: "View all live sessions" })}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        {t("courseView.liveSessions.hint", { defaultValue: "Join from here when the countdown reaches zero." })}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {sessions.map((session) => (
          <LiveSessionCard key={session.id} session={session} locale={locale} showCourse={false} compact />
        ))}
      </div>
    </div>
  );
}
