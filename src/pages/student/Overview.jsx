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

function StatCard({ label, value, icon: Icon, href }) {
  const inner = (
    <article className="flex flex-col items-center justify-center text-center rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#EE7C11]/30 hover:shadow-md dark:border-slate-800 dark:bg-[#1E293B]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50/40 dark:bg-orange-500/10">
        <Icon className="h-6 w-6 text-[#EE7C11]" />
      </div>
      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
      <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
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

function getNotificationBadge(title, isAr) {
  const tLower = (title || "").toLowerCase();
  if (tLower.includes("graded") || tLower.includes("تصحيح")) {
    return {
      label: isAr ? "تم التصحيح" : "Graded",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-950/30"
    };
  }
  if (tLower.includes("assigned") || tLower.includes("واجب جديد")) {
    return {
      label: isAr ? "واجب جديد" : "New Homework",
      classes: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-950/30"
    };
  }
  if (tLower.includes("exam") || tLower.includes("اختبار")) {
    return {
      label: isAr ? "اختبار متاح" : "Exam Available",
      classes: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-950/30"
    };
  }
  if (tLower.includes("expiring") || tLower.includes("انتهاء") || tLower.includes("expire")) {
    return {
      label: isAr ? "تنبيه" : "Alert",
      classes: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-950/30"
    };
  }
  return {
    label: isAr ? "تنبيه" : "Alert",
    classes: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-800"
  };
}

export default function StudentOverview() {
  const { t, i18n } = useTranslation();
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
  const isAr = i18n.language?.startsWith("ar");

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
        />
        <StatCard
          label={t("student.overview.stats.homework", { defaultValue: "Pending homework" })}
          value={pendingHomework}
          icon={ClipboardList}
          href="/student/homework"
        />
        <StatCard
          label={t("student.overview.stats.exams", { defaultValue: "Upcoming exams" })}
          value={upcomingExams}
          icon={TrendingUp}
        />
        <StatCard
          label={t("student.overview.stats.live", { defaultValue: "Next live session" })}
          value={
            nextLive
              ? new Date(nextLive.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : "—"
          }
          icon={Video}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <div className="space-y-4">
              {continueCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/student/courses/${course.id}/learn`}
                  className="flex items-center gap-5 bg-white border border-slate-200 p-5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 hover:border-[#EE7C11] hover:shadow-sm dark:border-slate-800 dark:bg-[#1E293B]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50/50 dark:bg-orange-500/10">
                    <BookOpen className="h-6 w-6 text-[#EE7C11]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-slate-900 dark:text-white truncate">{course.title}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-[#EE7C11] transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="shrink-0 text-sm font-black text-[#EE7C11] min-w-[2.5rem] text-end">
                        {course.progress}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 lg:col-span-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("student.overview.notifications", { defaultValue: "Recent alerts" })}
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-[#1E293B] shadow-2xs">
            {recentNotifs.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">{t("student.overview.noNotifications", { defaultValue: "No new notifications." })}</p>
            ) : (
              recentNotifs.map((n) => {
                const badge = getNotificationBadge(n.title, isAr);
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    {/* Read/Unread Indicator */}
                    <div className="mt-1.5 flex shrink-0 items-center justify-center">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          n.isRead
                            ? "bg-slate-300 dark:bg-slate-600"
                            : "bg-[#EE7C11] animate-pulse"
                        }`}
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${badge.classes}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }) : ""}
                        </span>
                      </div>
                      <p className={`mt-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 ${n.isRead ? "text-slate-500 dark:text-slate-400 font-medium" : ""}`}>
                        {n.title}
                      </p>
                      {n.message ? (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {n.message}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {nextLive ? (
            <div className="rounded-2xl border border-[#EE7C11]/20 bg-orange-50/30 p-4 dark:bg-[#EE7C11]/5">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#EE7C11]">
                {t("student.overview.nextLive", { defaultValue: "Next live session" })}
              </p>
              <p className="mt-2 font-bold text-slate-900 dark:text-white">{nextLive.title}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {new Date(nextLive.scheduledAt).toLocaleString()}
              </p>
              {nextLive.meetingUrl ? (
                <a
                  href={nextLive.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#EE7C11] hover:underline"
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
