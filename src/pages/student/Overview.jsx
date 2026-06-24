import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  ExternalLink,
  TrendingUp,
  Video,
} from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useMyCourses } from "../../features/student/courses/hooks";
import { useMyHomework } from "../../features/student/homework/hooks";
import { useStudentExams } from "../../features/student/exams/hooks";
import { useStudentClasses } from "../../features/student/classes/hooks";
import { useNotifications } from "../../features/student/notifications/hooks";

function courseKey(course) {
  return course.courseId ?? course.id;
}

function StatCard({ label, value, icon: Icon, accent, href }) {
  const inner = (
    <article className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition hover:border-pioneer-orange-normal/40 dark:border-slate-700/40 dark:bg-[#1E293B]">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    </article>
  );
  if (href) {
    return (
      <Link to={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

function deriveHomeworkPending(hw) {
  const sub = hw.submission;
  if (sub?.status === "GRADED" || sub?.submittedAt) return false;
  if (sub?.status === "SUBMITTED") return false;
  return true;
}

export default function StudentOverview() {
  const { t } = useTranslation();
  const { data: courses = [], isLoading: coursesLoading } = useMyCourses();
  const { data: homework = [] } = useMyHomework();
  const { data: exams = [] } = useStudentExams();
  const { data: liveSessions = [] } = useStudentClasses(true);
  const { data: notifications = [] } = useNotifications();

  const pendingHomework = useMemo(() => homework.filter(deriveHomeworkPending).length, [homework]);
  const upcomingExams = useMemo(
    () =>
      exams.filter((e) => {
        if (e.mySubmission?.submittedAt) return false;
        return e.status === "AVAILABLE" || e.status === "UPCOMING";
      }).length,
    [exams]
  );

  const nextLive = useMemo(() => {
    const now = Date.now();
    return liveSessions
      .filter((s) => s.scheduledAt && new Date(s.scheduledAt).getTime() > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  }, [liveSessions]);

  const continueCourses = useMemo(
    () =>
      courses
        .map((course) => ({
          ...course,
          id: courseKey(course),
          progress: Math.round(Number(course.progressPercentage) || 0),
        }))
        .filter((course) => course.id && course.progress < 100)
        .slice(0, 3),
    [courses]
  );

  const recentNotifs = Array.isArray(notifications) ? notifications.slice(0, 5) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title={t("student.overview.title", { defaultValue: "Overview" })}
        subtitle={t("student.overview.subtitle", { defaultValue: "Your learning dashboard at a glance." })}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("student.overview.stats.courses", { defaultValue: "Enrolled courses" })}
          value={coursesLoading ? "—" : courses.length}
          icon={BookOpen}
          accent="bg-gradient-to-br from-pioneer-orange-normal to-pioneer-orange-dark"
        />
        <StatCard
          label={t("student.overview.stats.homework", { defaultValue: "Pending homework" })}
          value={pendingHomework}
          icon={ClipboardList}
          accent="bg-gradient-to-br from-purple-500 to-purple-700"
          href="/student/homework"
        />
        <StatCard
          label={t("student.overview.stats.exams", { defaultValue: "Upcoming exams" })}
          value={upcomingExams}
          icon={TrendingUp}
          accent="bg-gradient-to-br from-teal-500 to-teal-700"
        />
        <StatCard
          label={t("student.overview.stats.live", { defaultValue: "Next live session" })}
          value={
            nextLive
              ? new Date(nextLive.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : "—"
          }
          icon={Video}
          accent="bg-gradient-to-br from-blue-500 to-blue-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("student.overview.continueLearning", { defaultValue: "Continue learning" })}
            </h2>
            <Link to="/student/classes" className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
              {t("student.overview.viewAll", { defaultValue: "View all" })}
            </Link>
          </div>
          {continueCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
              <p className="text-sm text-slate-500">{t("student.overview.noCourses", { defaultValue: "Enroll in a course to start learning." })}</p>
              <Link to="/explore" className="mt-4 inline-flex rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-bold text-white hover:bg-pioneer-orange-hover">
                {t("student.overview.exploreCta", { defaultValue: "Explore courses" })}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {continueCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/student/courses/${course.id}/learn`}
                  className="flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 transition hover:border-pioneer-orange-normal dark:border-slate-700/40 dark:bg-[#1E293B]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pioneer-orange-light">
                    <BookOpen className="h-5 w-5 text-pioneer-orange-normal" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900 dark:text-white">{course.title}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-pioneer-orange-normal" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-pioneer-orange-normal">{course.progress}%</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("student.overview.notifications", { defaultValue: "Recent alerts" })}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white dark:border-slate-700/40 dark:bg-[#1E293B]">
            {recentNotifs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">{t("student.overview.noNotifications", { defaultValue: "No new notifications." })}</p>
            ) : (
              recentNotifs.map((n, i) => (
                <div key={n.id} className={`px-4 py-3.5 ${i < recentNotifs.length - 1 ? "border-b border-slate-100 dark:border-slate-700" : ""}`}>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                  {n.message ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{n.message}</p> : null}
                  <p className="mt-0.5 text-xs text-slate-400">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </p>
                </div>
              ))
            )}
          </div>

          {nextLive ? (
            <div className="rounded-2xl border border-pioneer-orange-normal/30 bg-pioneer-orange-light/50 p-4 dark:bg-pioneer-orange-normal/10">
              <p className="text-xs font-bold uppercase tracking-wide text-pioneer-orange-normal">
                {t("student.overview.nextLive", { defaultValue: "Next live session" })}
              </p>
              <p className="mt-1 font-bold text-slate-900 dark:text-white">{nextLive.title}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(nextLive.scheduledAt).toLocaleString()}
              </p>
              {nextLive.meetingUrl ? (
                <a
                  href={nextLive.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-pioneer-orange-normal hover:underline"
                >
                  {t("recordings.joinLive")} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
