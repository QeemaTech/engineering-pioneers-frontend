import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import StudentPerformanceUI from "../../components/features/student/StudentPerformanceUI";
import { getErrorMessage } from "../../api/error";
import { useInstructorStudentPerformance } from "../../features/instructor/students/hooks";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function InstructorStudentDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const perfQuery = useInstructorStudentPerformance(id, { enabled: Boolean(id) });

  const overview = perfQuery.data?.overview;
  const apiStudent = perfQuery.data?.student;

  const student = apiStudent
    ? {
        name: apiStudent.fullName || "-",
        email: apiStudent.email || "-",
        joinDate: apiStudent.createdAt ? new Date(apiStudent.createdAt).toLocaleDateString() : "-",
        status: apiStudent.isActive ? "Active" : "Inactive",
        lastLogin: apiStudent.lastLoginAt ? new Date(apiStudent.lastLoginAt).toLocaleString() : "-",
      }
    : null;

  const enrolled = useMemo(() => {
    if (!overview?.enrollments?.length) return [];
    return overview.enrollments.map((e) => ({
      id: e.enrollmentId,
      title: e.courseTitle || "-",
      progress: Math.round(Number(e.progressPercentage) || 0),
      status: e.isCompleted ? "COMPLETED" : e.cohortStatus || "ENROLLED",
      enrolledDate: "-",
    }));
  }, [overview]);

  const sidebarStats = useMemo(() => {
    const coursesEnrolled = overview?.coursesEnrolled ?? 0;
    const completed = overview?.cohortsCompleted ?? 0;
    const examsTaken = overview?.examsTaken ?? "—";
    const examCount = overview?.examsTaken;
    const avgExam =
      examCount != null && examCount > 0 && overview?.averageExamScorePercent != null
        ? `${overview.averageExamScorePercent}%`
        : "—";
    return { coursesEnrolled, completed, examsTaken, avgExam };
  }, [overview]);

  if (!id) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
        Invalid student.
      </div>
    );
  }

  if (perfQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
        {t("dashboard.common.loading")}
      </div>
    );
  }

  if (perfQuery.isError || !student || !perfQuery.data) {
    const msg = getErrorMessage(
      perfQuery.error,
      t("dashboard.instructor.pages.studentDetail.loadError")
    );
    const isForbidden = perfQuery.error?.response?.status === 403;
    return (
      <div className="space-y-4">
        <Link
          to="/instructor/students"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#EE7C11] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("dashboard.instructor.pages.studentDetail.backLink")}
        </Link>
        <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
          {isForbidden ? t("dashboard.instructor.pages.studentDetail.forbidden") : msg}
          <button
            type="button"
            onClick={() => perfQuery.refetch()}
            className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white"
          >
            {t("dashboard.common.refresh")}
          </button>
        </div>
      </div>
    );
  }

  const timeline = (overview?.enrollments || []).slice(0, 5).map((e) => `Enrolled in ${e.courseTitle || "course"}`);
  const pieData = [
    { name: t("adminPages.studentDetail.completed"), value: enrolled.filter((e) => e.status === "COMPLETED").length },
    {
      name: t("adminPages.studentDetail.perf.inProgress"),
      value: enrolled.filter((e) => e.status !== "COMPLETED").length,
    },
  ];
  const barData = enrolled.map((e) => ({
    course: String(e.title || "-").slice(0, 14),
    progress: Math.min(100, Math.max(0, e.progress || 0)),
  }));

  const perfPayload = {
    exams: perfQuery.data.exams,
    homework: perfQuery.data.homework,
    progress: perfQuery.data.progress,
    recentGrades: perfQuery.data.recentGrades,
  };

  const tabs = [
    { id: "overview", label: t("adminPages.studentDetail.tabOverview") },
    { id: "performance", label: t("adminPages.studentDetail.tabPerformance") },
  ];

  return (
    <section className="space-y-6">
      <Link
        to="/instructor/students"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#EE7C11] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("dashboard.instructor.pages.studentDetail.backLink")}
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold dark:bg-white/10 dark:text-white">
            {student.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{student.name}</h2>
            <p className="text-sm text-slate-500">{student.email}</p>
            <p className="text-xs text-slate-500">{student.joinDate}</p>
          </div>
          <StatusBadge label={student.status} tone={student.status === "Active" ? "success" : "warning"} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                activeTab === tab.id
                  ? "bg-[#EE7C11] text-white"
                  : "border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "performance" ? (
        <div className="space-y-4">
          <StudentPerformanceUI data={perfPayload} />
        </div>
      ) : null}

      {activeTab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <DataTable
              columns={[
                { key: "title", title: t("adminPages.studentDetail.course") },
                {
                  key: "progress",
                  title: t("adminPages.studentDetail.progress"),
                  render: (v) => (
                    <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all"
                        style={{ width: `${Math.min(100, Math.max(0, Number(v) || 0))}%` }}
                      />
                    </div>
                  ),
                },
                {
                  key: "status",
                  title: t("adminPages.studentDetail.status"),
                  render: (v) => (
                    <StatusBadge
                      label={v}
                      tone={v === "COMPLETED" ? "success" : v === "ONGOING" ? "warning" : "neutral"}
                    />
                  ),
                },
                { key: "enrolledDate", title: t("adminPages.studentDetail.enrolledDate") },
              ]}
              rows={enrolled}
            />
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <h3 className="mb-3 font-bold text-slate-900 dark:text-white">{t("adminPages.studentDetail.activity")}</h3>
              <div className="space-y-2">
                {timeline.length ? (
                  timeline.map((a, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300"
                    >
                      {a}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">{t("dashboard.instructor.pages.studentDetail.noActivity")}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
                <h4 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  {t("adminPages.studentDetail.chartCompleteVsActive")}
                </h4>
                <div className="h-48" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} fill="#EE7C11">
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={i === 0 ? "#10B981" : "#6366F1"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
                <h4 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  {t("adminPages.studentDetail.chartProgressPerCourse")}
                </h4>
                <div className="h-48" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-white/10" />
                      <XAxis dataKey="course" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="progress" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
          <aside className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">{t("adminPages.studentDetail.coursesEnrolled")}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{sidebarStats.coursesEnrolled}</p>
                </div>
                <div>
                  <p className="text-slate-500">{t("adminPages.studentDetail.completed")}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{sidebarStats.completed}</p>
                </div>
                <div>
                  <p className="text-slate-500">{t("adminPages.studentDetail.lastLogin")}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{student.lastLogin}</p>
                </div>
                <div>
                  <p className="text-slate-500">{t("adminPages.studentDetail.examsTaken")}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{sidebarStats.examsTaken}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500">{t("adminPages.studentDetail.avgExamScore")}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{sidebarStats.avgExam}</p>
                </div>
              </div>
              <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-white/10">
                {t("dashboard.instructor.pages.studentDetail.scopedNote")}
              </p>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

export default InstructorStudentDetail;
