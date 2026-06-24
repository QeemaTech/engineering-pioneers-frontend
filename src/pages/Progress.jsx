import { useTranslation } from "react-i18next";
import { BookOpen, CheckCircle2, Star, TrendingUp, Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getErrorMessage } from "../api/error";
import { useMyCourses } from "../features/student/courses/hooks";
import { useMyHomework } from "../features/student/homework/hooks";
import { useNotifications } from "../features/student/notifications/hooks";
import { fetchCourseProgressStats } from "../features/student/progress/api";

function courseKey(course) {
  return course.courseId ?? course.id;
}

function CourseProgress({ course }) {
  const { t } = useTranslation();
  const done = course.progress === 100;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{course.name}</h3>
          <p className="mt-0.5 text-xs text-pioneer-orange-normal">{course.teacher}</p>
        </div>
        {done && (
          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600 dark:bg-green-500/15 dark:text-green-400">
            {t("progress.completed")}
          </span>
        )}
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{course.lessons}/{course.total} {t("progress.lessons")}</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{course.progress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
          <div
            className={`h-full rounded-full transition-all duration-700 ${course.colour}`}
            style={{ width: `${course.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function Progress() {
  const { t } = useTranslation();
  const { data: myCourses = [], isLoading, isError, error, refetch } = useMyCourses();
  const { data: homeworkItems = [] } = useMyHomework();
  const { data: notifications = [] } = useNotifications();

  const { data: progressStats = [] } = useQuery({
    queryKey: ["student", "progress", "courses", myCourses.map((c) => courseKey(c)).join(",")],
    enabled: myCourses.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        myCourses.map(async (course) => {
          const courseId = courseKey(course);
          if (!courseId) {
            return {
              courseId: "",
              completedLessons: 0,
              totalLessons: 0,
              percentage: 0,
              isCourseCompleted: false,
            };
          }
          try {
            const stat = await fetchCourseProgressStats(courseId);
            return {
              courseId,
              completedLessons: Number(stat?.completedLessons) || 0,
              totalLessons: Number(stat?.totalLessons) || 0,
              percentage: Number(stat?.percentage) || 0,
              isCourseCompleted: Boolean(stat?.isCourseCompleted),
            };
          } catch {
            return {
              courseId,
              completedLessons: Number(course.completedLessonsCount) || 0,
              totalLessons: 0,
              percentage: Number(course.progressPercentage) || 0,
              isCourseCompleted: Boolean(course.isCompleted),
            };
          }
        })
      );
      return results;
    },
    retry: false,
  });

  const courses = myCourses.map((course, idx) => {
    const id = courseKey(course);
    const stat = progressStats.find((s) => s.courseId === id) || {};
    const palette = ["bg-pioneer-orange-normal", "bg-pioneer-teal-normal", "bg-green-500", "bg-blue-500"];
    const pct = Math.round(Number(stat.percentage ?? course.progressPercentage ?? 0));
    const completed = Number(stat.completedLessons ?? course.completedLessonsCount ?? 0);
    const total = Number(stat.totalLessons) || Math.max(completed, 1);
    return {
      key: id ?? String(idx),
      courseId: id,
      name: course.title,
      teacher: course?.instructor?.fullName || "Instructor",
      progress: pct,
      lessons: completed,
      total,
      isCourseCompleted: Boolean(stat.isCourseCompleted ?? course.isCompleted),
      colour: palette[idx % palette.length],
    };
  });

  const avgScore = courses.length ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length) : 0;
  const completedCourses = courses.filter((c) => c.isCourseCompleted).length;
  const lessonsCompleted = courses.reduce((acc, c) => acc + c.lessons, 0);
  const homeworkDone = homeworkItems.filter((h) => h.submission?.status === "GRADED" || h.submission?.submittedAt).length;

  const statCards = [
    { key: "coursesEnrolled", value: myCourses.length, icon: BookOpen, color: "text-pioneer-orange-normal", bg: "bg-pioneer-orange-light" },
    { key: "lessonsCompleted", value: lessonsCompleted, icon: Video, color: "text-blue-600", bg: "bg-blue-50" },
    { key: "homeworkDone", value: homeworkDone, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { key: "avgScore", value: `${avgScore}%`, icon: Star, color: "text-pioneer-teal-dark", bg: "bg-pioneer-teal-light" },
  ];

  const activity = (Array.isArray(notifications) ? notifications : []).slice(0, 5).map((n) => ({
    key: n.id,
    type: String(n.type || "alert").toLowerCase(),
    text: n.message ? `${n.title} — ${n.message}` : n.title,
    date: n.createdAt ? new Date(n.createdAt).toLocaleString() : "—",
    colour: "bg-pioneer-orange-light text-pioneer-orange-normal",
  }));

  return (
    <div className="space-y-8">
        {isError ? (
          <div className="mx-auto mb-8 max-w-lg rounded-xl border border-red-100 bg-[#EE7C11]/10 px-4 py-3 text-center text-sm text-red-800 dark:border-red-500/30 dark:text-red-300">
            <p>{getErrorMessage(error, "Could not load your progress.")}</p>
            <button type="button" onClick={() => void refetch()} className="mt-2 font-semibold text-pioneer-orange-normal hover:underline">
              Retry
            </button>
          </div>
        ) : null}

        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl lg:text-5xl">
            {t("progress.titlePrefix")}{" "}
            <span className="text-pioneer-orange-normal">{t("progress.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-500 dark:text-slate-400">{t("progress.subtitle")}</p>
        </div>

        {!isError ? (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {statCards.map(({ key, value, icon: Icon, color, bg }) => (
                <div key={key} className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${bg} dark:bg-opacity-20`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t(`progress.stats.${key}`)}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("progress.myCourses")}{" "}
                  <TrendingUp className="ms-1 inline h-4 w-4 text-pioneer-orange-normal" />
                </h2>
                {isLoading ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 text-slate-500 dark:border-slate-700/40 dark:bg-[#1E293B] dark:text-slate-400">Loading...</div>
                ) : courses.length === 0 ? (
                  <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-500 dark:border-slate-700/40 dark:bg-[#1E293B] dark:text-slate-400">
                    {t("progress.noCourses", { defaultValue: "Enroll in a course to see progress here." })}
                  </div>
                ) : (
                  courses.map((c) => <CourseProgress key={c.key} course={c} />)
                )}
              </div>

              <div>
                <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">{t("progress.recentActivity")}</h2>
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
                  {activity.length ? (
                    activity.map((a, i) => (
                      <div key={a.key} className={`flex items-start gap-3 px-4 py-3.5 ${i < activity.length - 1 ? "border-b border-slate-100 dark:border-slate-700/50" : ""}`}>
                        <span className={`mt-0.5 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0 ${a.colour}`}>
                          {a.type}
                        </span>
                        <div>
                          <p className="text-xs font-medium text-slate-700 leading-snug dark:text-slate-200">{a.text}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">{a.date}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">{t("progress.noActivity", { defaultValue: "No recent activity yet." })}</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : null}
    </div>
  );
}
