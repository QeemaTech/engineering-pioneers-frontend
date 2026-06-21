import { useMemo, useState } from "react";
import { 
  Lock, MessageSquare, Trash2, UserX, BookOpen, Calendar, Clock, DollarSign, 
  Award, GraduationCap, ChevronRight, CheckCircle2, AlertCircle, ShieldCheck, Mail, Phone,
  Activity, Inbox, ListChecks
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminStudentPerformance, useAdminUserById } from "../../features/admin/users/hooks";
import StatusBadge from "../../components/ui/StatusBadge";
import DataTable from "../../components/ui/DataTable";
import { getErrorMessage } from "../../api/error";
import { useAdminEnrollments } from "../../features/admin/enrollments/hooks";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StudentPerformanceUI from "../../components/features/student/StudentPerformanceUI";

const COLORS = ["#10B981", "#6366F1", "#EE7C11", "#8B5CF6", "#EF4444"];

function StudentDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: user, isLoading, isError, error, refetch } = useAdminUserById(id);
  const { data: enrollData } = useAdminEnrollments({ studentId: id, page: 1, limit: 50 });
  const enrolledRows = enrollData?.enrollments || [];

  const isStudent = useMemo(() => {
    const roleName = String(user?.role?.name || user?.role || "").toUpperCase();
    return roleName === "STUDENT";
  }, [user]);

  const perfQuery = useAdminStudentPerformance(id, {
    enabled: Boolean(id) && isStudent,
  });

  const student = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: user.fullName || "-",
      email: user.email || "-",
      phone: user.phone || "-",
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-",
      status: user.isActive ? "Active" : "Inactive",
      lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "-",
      avatar: user.avatar,
    };
  }, [user]);

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
          id: e.enrollmentId,
          title: e.courseTitle || "-",
          type: e.courseType || "-",
          progress: Math.round(Number(e.progressPercentage) || 0),
          status: e.isCompleted ? "COMPLETED" : "ONGOING",
          enrolledDate: joined ? new Date(joined).toLocaleDateString() : "-",
        };
      });
    }
    return enrolledRows.map((e) => ({
      id: e.id,
      title: e?.course?.title || "-",
      type: e?.course?.type || "-",
      progress: Math.round(Number(e?.progressPercentage) || 0),
      status: e?.isCompleted ? "COMPLETED" : "ONGOING",
      enrolledDate: e?.joinedAt ? new Date(e.joinedAt).toLocaleDateString() : "-",
    }));
  }, [overview, enrolledRows]);

  const sidebarStats = useMemo(() => {
    const coursesEnrolled = overview?.coursesEnrolled ?? enrolledRows.length;
    const completed = overview?.coursesCompleted ?? enrolledRows.filter((e) => e?.isCompleted).length;
    const totalSpent = overview?.totalSpent ?? 0;
    const examsTaken = overview?.examsTaken ?? 0;
    const avgExam =
      examsTaken > 0 && overview?.averageExamScorePercent != null
        ? `${overview.averageExamScorePercent}%`
        : "—";
    return { coursesEnrolled, completed, totalSpent, examsTaken, avgExam };
  }, [overview, enrolledRows]);

  // Map all exams from performance bundle
  const examRows = useMemo(() => {
    const subs = perfQuery.data?.examSubmissions || [];
    return subs.map((sub) => {
      const totalPoints = sub.exam?.totalPoints ?? 100;
      const score = sub.totalScore ?? 0;
      const pctScore = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
      
      let statusStr = "PENDING";
      if (sub.isPassed === true) statusStr = "PASSED";
      if (sub.isPassed === false) statusStr = "FAILED";
      
      return {
        id: sub.id,
        title: sub.exam?.title || "-",
        date: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "-",
        score: `${score} / ${totalPoints}`,
        percent: `${pctScore}%`,
        status: statusStr,
      };
    });
  }, [perfQuery.data]);

  // Map all homeworks from performance bundle
  const homeworkRows = useMemo(() => {
    const subs = perfQuery.data?.homeworkSubmissions || [];
    return subs.map((sub) => {
      const totalPoints = sub.homework?.totalPoints ?? 10;
      const score = sub.grade ?? 0;
      return {
        id: sub.id,
        title: sub.homework?.title || "-",
        course: sub.homework?.course?.title || "-",
        date: sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : "-",
        score: sub.status === "GRADED" || sub.grade != null ? `${score} / ${totalPoints}` : "—",
        status: sub.status || "PENDING",
        gradedDate: sub.gradedAt ? new Date(sub.gradedAt).toLocaleDateString() : "-",
      };
    });
  }, [perfQuery.data]);

  const pieData = useMemo(() => {
    const completed = enrolled.filter((e) => e.status === "COMPLETED").length;
    const active = enrolled.filter((e) => e.status !== "COMPLETED").length;
    return [
      { name: t("adminPages.studentDetail.completed", { defaultValue: "Completed" }), value: completed },
      { name: t("adminPages.studentDetail.perf.inProgress", { defaultValue: "In progress" }), value: active },
    ].filter(v => v.value > 0);
  }, [enrolled, t]);

  const barData = useMemo(() => {
    return enrolled.map((e) => ({
      course: String(e.title || "-").slice(0, 14),
      progress: Math.min(100, Math.max(0, e.progress || 0)),
    }));
  }, [enrolled]);

  const timeline = useMemo(() => {
    const list = [];
    
    // Enrollments
    enrolledRows.forEach((e) => {
      if (e.joinedAt) {
        list.push({
          date: new Date(e.joinedAt),
          text: t("adminPages.studentDetail.activityEnroll", {
            defaultValue: `Enrolled in course "${e?.course?.title || 'Course'}"`,
            course: e?.course?.title
          }),
          type: "enroll",
        });
      }
    });

    // Exams
    if (perfQuery.data?.examSubmissions) {
      perfQuery.data.examSubmissions.forEach((es) => {
        if (es.submittedAt) {
          list.push({
            date: new Date(es.submittedAt),
            text: t("adminPages.studentDetail.activityExam", {
              defaultValue: `Submitted exam "${es.exam?.title || 'Exam'}" (Score: ${es.totalScore ?? 0})`,
              exam: es.exam?.title,
              score: es.totalScore
            }),
            type: "exam",
          });
        }
      });
    }

    // Homeworks
    if (perfQuery.data?.homeworkSubmissions) {
      perfQuery.data.homeworkSubmissions.forEach((hs) => {
        if (hs.submittedAt) {
          list.push({
            date: new Date(hs.submittedAt),
            text: t("adminPages.studentDetail.activityHomework", {
              defaultValue: `Submitted homework "${hs.homework?.title || 'Homework'}"`,
              homework: hs.homework?.title
            }),
            type: "homework",
          });
        }
      });
    }

    return list
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);
  }, [enrolledRows, perfQuery.data, t]);

  const tabs = useMemo(() => {
    return [
      { id: "overview", label: t("adminPages.studentDetail.tabOverview", { defaultValue: "Overview" }), icon: Activity },
      ...(isStudent ? [
        { id: "performance", label: t("adminPages.studentDetail.tabPerformance", { defaultValue: "Academic Performance" }), icon: GraduationCap },
        { id: "exams", label: t("adminPages.studentDetail.tabExams", { defaultValue: "Exam Results" }), icon: Award },
        { id: "homework", label: t("adminPages.studentDetail.tabHomework", { defaultValue: "Homework Submissions" }), icon: ListChecks },
      ] : []),
    ];
  }, [isStudent, t]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EE7C11] border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("adminPages.studentDetail.loading", { defaultValue: "Loading student profile..." })}
          </p>
        </div>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/20">
          <UserX className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t("adminPages.studentDetail.loadError", { defaultValue: "Failed to load student details." })}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {getErrorMessage(error, t("adminPages.studentDetail.loadErrorDesc", { defaultValue: "The student profile details could not be retrieved." }))}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => refetch()} className="rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d9700e]">
            {t("takeExam.retry", { defaultValue: "Retry" })}
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6 antialiased">
      {/* Premium Header Profile Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="absolute right-0 top-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-gradient-to-tr from-[#EE7C11]/10 to-[#EE7C11]/20 blur-xl"></div>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-extrabold text-white shadow-md shadow-indigo-500/20">
              {student.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">{student.name}</h1>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                  student.status === "Active" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                }`}>
                  {student.status === "Active" ? t("adminPages.userDirectory.filters.active", { defaultValue: "Active" }) : t("adminPages.userDirectory.filters.suspended", { defaultValue: "Suspended" })}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  <span>{student.email}</span>
                </div>
                {student.phone && student.phone !== "-" && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{student.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>{t("adminPages.students.table.joined", { defaultValue: "Joined" })}: {student.joinDate}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>{t("adminPages.studentDetail.lastLogin", { defaultValue: "Last Login" })}: {student.lastLogin}</span>
            </div>
          </div>
        </div>

        {/* Modern Tabs Navigation */}
        <div className="mt-6 flex overflow-x-auto border-t border-slate-100 pt-4 dark:border-white/5">
          <nav className="flex gap-2">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                    isSelected
                      ? "bg-[#EE7C11] text-white shadow-sm shadow-[#EE7C11]/20"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                >
                  <TabIcon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Main Academic Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.studentDetail.coursesEnrolled", { defaultValue: "Enrolled Courses" })}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{sidebarStats.coursesEnrolled}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.studentDetail.completed", { defaultValue: "Completed" })}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{sidebarStats.completed}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.studentDetail.examsTaken", { defaultValue: "Exams Taken" })}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                  <GraduationCap className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{sidebarStats.examsTaken}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.studentDetail.avgExamScore", { defaultValue: "Avg Exam Score" })}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{sidebarStats.avgExam}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.studentDetail.totalSpent", { defaultValue: "Total Spent" })}
                </p>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                {sidebarStats.totalSpent.toLocaleString()} <span className="text-xs font-medium text-slate-500">EGP</span>
              </p>
            </div>
          </div>

          {/* Details & Interactive Grid */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left Content (Courses & Activities) */}
            <div className="space-y-6 lg:col-span-3">
              {/* Enrolled Courses Table */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.studentDetail.tabCourses", { defaultValue: "Enrolled Courses" })}
                </h3>
                {enrolled.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-500">
                    {t("adminPages.studentDetail.noCourses", { defaultValue: "Student is not enrolled in any courses." })}
                  </p>
                ) : (
                  <DataTable
                    columns={[
                      { key: "title", title: t("adminPages.studentDetail.course", { defaultValue: "Course" }) },
                      { 
                        key: "progress", 
                        title: t("adminPages.studentDetail.progress", { defaultValue: "Progress" }),
                        render: (v) => (
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-[#EE7C11] to-emerald-500 transition-all"
                                style={{ width: `${Math.min(100, Math.max(0, Number(v) || 0))}%` }}
                              />
                            </div>
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{v}%</span>
                          </div>
                        )
                      },
                      {
                        key: "status",
                        title: t("adminPages.studentDetail.status", { defaultValue: "Status" }),
                        render: (v) => (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            v === "COMPLETED" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
                          }`}>
                            {v}
                          </span>
                        ),
                      },
                      { key: "enrolledDate", title: t("adminPages.studentDetail.enrolledDate", { defaultValue: "Enrolled Date" }) },
                    ]}
                    rows={enrolled}
                  />
                )}
              </div>

              {/* Activity Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.studentDetail.activity", { defaultValue: "Activity Timeline" })}
                </h3>
                {timeline.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    {t("adminPages.studentDetail.noActivity", { defaultValue: "No recent activities recorded for this student." })}
                  </p>
                ) : (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {timeline.map((item, itemIdx) => {
                        return (
                          <li key={itemIdx}>
                            <div className="relative pb-8">
                              {itemIdx !== timeline.length - 1 ? (
                                <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-100 dark:bg-white/5" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-3 rtl:space-x-reverse">
                                <div>
                                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-8 ring-white dark:ring-[#1A1A22] ${
                                    item.type === "enroll" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" :
                                    item.type === "exam" ? "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" :
                                    "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400"
                                  }`}>
                                    {item.type === "enroll" ? <BookOpen className="h-5 w-5" /> :
                                     item.type === "exam" ? <GraduationCap className="h-5 w-5" /> :
                                     <CheckCircle2 className="h-5 w-5" />}
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                  <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{item.text}</p>
                                    <p className="mt-0.5 text-xs text-slate-400">{item.date.toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content (Charts & Quick Actions) */}
            <div className="space-y-6 lg:col-span-2">
              {/* charts block */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.studentDetail.chartCompleteVsActive", { defaultValue: "Completed vs In Progress" })}
                </h3>
                {pieData.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-500">
                    {t("adminPages.studentDetail.noCourses", { defaultValue: "No courses listed." })}
                  </p>
                ) : (
                  <div className="h-48" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={pieData} 
                          dataKey="value" 
                          nameKey="name" 
                          outerRadius={65} 
                          innerRadius={35}
                          paddingAngle={4}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          fontSize={10}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.studentDetail.chartProgressPerCourse", { defaultValue: "Progress per Course" })}
                </h3>
                {barData.length === 0 ? (
                  <p className="py-12 text-center text-sm text-slate-500">
                    {t("adminPages.studentDetail.noCourses", { defaultValue: "No courses listed." })}
                  </p>
                ) : (
                  <div className="h-48" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#CBD5E1" />
                        <XAxis dataKey="course" tick={{ fontSize: 10 }} stroke="#64748B" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#64748B" />
                        <Tooltip />
                        <Bar dataKey="progress" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Status Action Sidebar block */}
              <div className="space-y-2 rounded-2xl border border-[#EE7C11]/10 bg-slate-50/50 p-5 dark:border-white/5 dark:bg-white/5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.studentDetail.quickActions", { defaultValue: "Quick Actions" })}
                </h3>
                {[
                  [MessageSquare, t("adminPages.studentDetail.sendMessage"), "Message student"],
                  [Lock, t("adminPages.studentDetail.resetPassword"), "Reset security credentials"],
                  [UserX, t("adminPages.studentDetail.suspendAccount"), "Deactivate student access"],
                  [Trash2, t("adminPages.studentDetail.delete"), "Permanently delete student account"],
                ].map(([Icon, label, title]) => (
                  <button
                    key={label}
                    disabled
                    className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm font-bold opacity-60 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200"
                    title={title}
                  >
                    <Icon className="h-4.5 w-4.5 text-slate-500" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Academic Performance */}
      {activeTab === "performance" && isStudent && (
        <div className="space-y-6">
          {perfQuery.isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#EE7C11] border-t-transparent mx-auto"></div>
              <p className="mt-2 text-sm">{t("dashboard.common.loading")}</p>
            </div>
          ) : perfQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-[#EE7C11]/10 p-5 text-sm text-red-700 dark:border-red-500/30">
              {t("adminPages.studentDetail.perf.loadError")}
              <button onClick={() => perfQuery.refetch()} className="ms-3 rounded-lg bg-[#EE7C11] px-3 py-1 text-xs font-bold text-white">
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
      )}

      {/* Tab: Exam Results */}
      {activeTab === "exams" && isStudent && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            {t("adminPages.studentDetail.exams.title", { defaultValue: "Exam Submissions & Outcomes" })}
          </h3>
          {examRows.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <Inbox className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              {t("adminPages.studentDetail.exams.empty", { defaultValue: "No exam submissions found for this student." })}
            </div>
          ) : (
            <DataTable
              columns={[
                { key: "title", title: t("adminPages.studentDetail.exams.colTitle", { defaultValue: "Exam Title" }) },
                { key: "date", title: t("adminPages.studentDetail.exams.colSubmitted", { defaultValue: "Submitted Date" }) },
                { key: "score", title: t("adminPages.studentDetail.exams.colScore", { defaultValue: "Score" }) },
                { key: "percent", title: t("adminPages.studentDetail.exams.colPercent", { defaultValue: "Percentage" }) },
                { 
                  key: "status", 
                  title: t("adminPages.studentDetail.exams.colStatus", { defaultValue: "Outcome" }),
                  render: (v) => {
                    const colors = {
                      PASSED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
                      FAILED: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
                      PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
                    };
                    return (
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[v] || ""}`}>
                        {v === "PASSED" ? t("adminPages.studentDetail.exams.passed", { defaultValue: "Passed" }) :
                         v === "FAILED" ? t("adminPages.studentDetail.exams.failed", { defaultValue: "Failed" }) :
                         t("adminPages.studentDetail.exams.pending", { defaultValue: "Pending" })}
                      </span>
                    );
                  }
                },
              ]}
              rows={examRows}
            />
          )}
        </div>
      )}

      {/* Tab: Homework Submissions */}
      {activeTab === "homework" && isStudent && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
            {t("adminPages.studentDetail.homeworks.title", { defaultValue: "Homework Submissions" })}
          </h3>
          {homeworkRows.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              <Inbox className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              {t("adminPages.studentDetail.homeworks.empty", { defaultValue: "No homework submissions found." })}
            </div>
          ) : (
            <DataTable
              columns={[
                { key: "title", title: t("adminPages.studentDetail.homeworks.colTitle", { defaultValue: "Homework Title" }) },
                { key: "course", title: t("adminPages.studentDetail.homeworks.colCourse", { defaultValue: "Course" }) },
                { key: "date", title: t("adminPages.studentDetail.homeworks.colSubmitted", { defaultValue: "Submitted Date" }) },
                { key: "score", title: t("adminPages.studentDetail.homeworks.colGrade", { defaultValue: "Grade" }) },
                { 
                  key: "status", 
                  title: t("adminPages.studentDetail.homeworks.colStatus", { defaultValue: "Status" }),
                  render: (v) => {
                    const colors = {
                      GRADED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
                      PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
                      SUBMITTED: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
                    };
                    return (
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[v] || "bg-slate-100 text-slate-800 dark:bg-white/5 dark:text-slate-300"}`}>
                        {v}
                      </span>
                    );
                  }
                },
                { key: "gradedDate", title: t("adminPages.studentDetail.homeworks.colGraded", { defaultValue: "Graded Date" }) },
              ]}
              rows={homeworkRows}
            />
          )}
        </div>
      )}
    </section>
  );
}

export default StudentDetail;
