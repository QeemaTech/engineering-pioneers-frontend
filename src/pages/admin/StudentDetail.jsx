import { useMemo, useState } from "react";
import { Lock, MessageSquare, Trash2, UserX } from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminStudentPerformance, useAdminUserById } from "../../features/admin/users/hooks";
import StatusBadge from "../../components/ui/StatusBadge";
import DataTable from "../../components/ui/DataTable";
import { getErrorMessage } from "../../api/error";
import { useAdminEnrollments } from "../../features/admin/enrollments/hooks";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StudentPerformanceUI from "../../components/features/student/StudentPerformanceUI";

function StudentDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: user, isLoading, isError, error, refetch } = useAdminUserById(id);
  const { data: enrollData } = useAdminEnrollments({ studentId: id, page: 1, limit: 50 });
  const enrolledRows = enrollData?.enrollments || [];

  const isStudent = String(user?.role || "").toUpperCase() === "STUDENT";
  const perfQuery = useAdminStudentPerformance(id, {
    enabled: Boolean(id) && isStudent && (activeTab === "overview" || activeTab === "performance"),
  });

  const student = user
    ? {
        name: user.fullName || "-",
        email: user.email || "-",
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-",
        status: user.isActive ? "Active" : "Inactive",
        lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-",
      }
    : null;

  const overview = perfQuery.data?.overview;

  const enrolled = useMemo(() => {
    const joinByCohort = {};
    for (const r of enrolledRows || []) {
      const cid = r.cohortId || r?.cohort?.id;
      if (cid && r.joinedAt) joinByCohort[cid] = r.joinedAt;
    }
    if (overview?.enrollments?.length) {
      return overview.enrollments.map((e) => {
        const joined = joinByCohort[e.cohortId];
        return {
          title: e.courseTitle || "-",
          progress: Math.round(Number(e.progressPercentage) || 0),
          status: e.isCompleted ? "COMPLETED" : e.cohortStatus || "ENROLLED",
          enrolledDate: joined ? new Date(joined).toLocaleDateString() : "-",
        };
      });
    }
    return enrolledRows.map((e) => ({
      title: e?.course?.title || "-",
      progress: Math.round(Number(e?.progressPercentage) || 0),
      status: e?.isCompleted ? "COMPLETED" : e?.cohort?.status || "ENROLLED",
      enrolledDate: e?.joinedAt ? new Date(e.joinedAt).toLocaleDateString() : "-",
    }));
  }, [overview, enrolledRows]);

  const sidebarStats = useMemo(() => {
    const coursesEnrolled = overview?.coursesEnrolled ?? enrolledRows.length;
    const completed = overview?.cohortsCompleted ?? enrolledRows.filter((e) => e?.isCompleted).length;
    const totalSpent = overview?.totalSpent ?? 0;
    const examsTaken = overview?.examsTaken ?? "—";
    const examCount = overview?.examsTaken;
    const avgExam =
      examCount != null && examCount > 0 && overview?.averageExamScorePercent != null
        ? `${overview.averageExamScorePercent}%`
        : "—";
    return { coursesEnrolled, completed, totalSpent, examsTaken, avgExam };
  }, [overview, enrolledRows]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
        Loading student...
      </div>
    );
  }
  if (isError || !student) {
    return (
      <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
        {getErrorMessage(error, "Failed to load student.")}
        <button
          type="button"
          onClick={() => refetch()}
          className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  const timeline = (enrolledRows || []).slice(0, 5).map((e) => `Enrolled in ${e?.course?.title || "course"}`);
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

  const tabs = [
    { id: "overview", label: t("adminPages.studentDetail.tabOverview") },
    ...(isStudent ? [{ id: "performance", label: t("adminPages.studentDetail.tabPerformance") }] : []),
  ];

  return (
    <section className="space-y-6">
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

      {activeTab === "performance" && isStudent ? (
        <div className="space-y-4">
          {perfQuery.isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22] dark:text-slate-400">
              {t("dashboard.common.loading")}
            </div>
          ) : perfQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
              {getErrorMessage(perfQuery.error, t("adminPages.studentDetail.perf.loadError"))}
              <button
                type="button"
                onClick={() => perfQuery.refetch()}
                className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white"
              >
                {t("dashboard.common.refresh")}
              </button>
            </div>
          ) : perfQuery.data ? (
            <StudentPerformanceUI
              data={{
                exams: perfQuery.data.exams,
                homework: perfQuery.data.homework,
                progress: perfQuery.data.progress,
                recentGrades: perfQuery.data.recentGrades,
              }}
            />
          ) : null}
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
                {timeline.map((a, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300"
                  >
                    {a}
                  </div>
                ))}
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
              {isStudent && perfQuery.isLoading ? (
                <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
              ) : (
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
                    <p className="text-slate-500">{t("adminPages.studentDetail.totalSpent")}</p>
                    <p className="font-bold text-slate-900 dark:text-white">${Number(sidebarStats.totalSpent).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{t("adminPages.studentDetail.lastLogin")}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{student.lastLogin}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{t("adminPages.studentDetail.examsTaken")}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{sidebarStats.examsTaken}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">{t("adminPages.studentDetail.avgExamScore")}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{sidebarStats.avgExam}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              {[
                [MessageSquare, t("adminPages.studentDetail.sendMessage")],
                [Lock, t("adminPages.studentDetail.resetPassword")],
                [UserX, t("adminPages.studentDetail.suspendAccount")],
                [Trash2, t("adminPages.studentDetail.delete")],
              ].map(([Icon, label]) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 opacity-60 dark:border-white/10 dark:text-slate-200"
                >
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}

export default StudentDetail;
