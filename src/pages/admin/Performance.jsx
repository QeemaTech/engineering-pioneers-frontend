import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../../components/ui/PageHeader";
import { useAdminUsers } from "../../features/admin/users/hooks";
import { useAdminInstructors } from "../../features/admin/instructors/hooks";
import { useAdminEnrollments } from "../../features/admin/enrollments/hooks";
import { useAdminCourses } from "../../features/admin/courses/hooks";

function Performance() {
  const { t } = useTranslation();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const { data: studentsData } = useAdminUsers({ role: "STUDENT", page: 1, limit: 200 });
  const { data: instructorsData } = useAdminInstructors({ page: 1, limit: 200 });
  const { data: enrollmentsData } = useAdminEnrollments({ page: 1, limit: 200 });
  const { data: coursesData } = useAdminCourses({ page: 1, limit: 200 });
  const students = studentsData?.users || [];
  const instructors = instructorsData?.instructors || [];
  const courses = coursesData?.courses || [];
  const allEnrollments = enrollmentsData?.enrollments || [];
  const enrollments = useMemo(
    () =>
      allEnrollments.filter((e) => {
        const d = new Date(e.enrolledAt || e.joinedAt || Date.now()).getTime();
        const after = !fromDate || d >= new Date(fromDate).getTime();
        const before = !toDate || d <= new Date(toDate).getTime() + 86399999;
        const byCourse = !courseId || e.courseId === courseId || e?.course?.id === courseId;
        const matchedCourse = courses.find((c) => c.id === (e.courseId || e?.course?.id));
        const byInstructor = !instructorId || matchedCourse?.instructor?.id === instructorId;
        return after && before && byCourse && byInstructor;
      }),
    [allEnrollments, fromDate, toDate, courseId, instructorId, courses]
  );

  const studentStatus = useMemo(
    () => [
      { name: "Active", value: students.filter((s) => s.isActive).length },
      { name: "Inactive", value: students.filter((s) => !s.isActive).length },
    ],
    [students]
  );

  const instructorStatus = useMemo(
    () => [
      { name: "Active", value: instructors.filter((s) => s.isActive).length },
      { name: "Inactive", value: instructors.filter((s) => !s.isActive).length },
    ],
    [instructors]
  );

  const monthlyEnrollments = useMemo(() => {
    const map = {};
    enrollments.forEach((e) => {
      const key = new Date(e.enrolledAt || e.joinedAt || Date.now()).toLocaleString("en", { month: "short" });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([month, count]) => ({ month, count }));
  }, [enrollments]);

  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.overview.title")} subtitle ={t("adminPages.overview.subtitle")} />
      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22] lg:grid-cols-4">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"><option value="">All courses</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"><option value="">All instructors</option>{instructors.map((i) => <option key={i.id} value={i.id}>{i.fullName}</option>)}</select>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">{t("adminPages.overview.studentStatus")}</h3>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={studentStatus} dataKey="value" nameKey="name" outerRadius={90} fill="#EE7C11" label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">{t("adminPages.overview.instructorStatus")}</h3>
          <div className="h-64" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={instructorStatus} dataKey="value" nameKey="name" outerRadius={90} fill="#1D4ED8" label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
        <h3 className="mb-3 text-sm font-bold text-slate-700 dark:text-slate-300">{t("adminPages.overview.enrollmentGrowth")}</h3>
        <div className="h-72" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyEnrollments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#EE7C11" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export default Performance;

