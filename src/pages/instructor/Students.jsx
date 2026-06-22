import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DataTable from "../../components/dashboard/DataTable";
import EmptyState from "../../components/dashboard/EmptyState";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { useClassStudents, useInstructorClassesForStudents } from "../../features/instructor/students/hooks";
import { getErrorMessage } from "../../api/error";
import { Loader2 } from "lucide-react";

function Students() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const [searchParams] = useSearchParams();
  const courseFromUrl = searchParams.get("course") || searchParams.get("cohort") || "";
  const [selectedClass, setSelectedClass] = useState(courseFromUrl);
  const [notice, setNotice] = useState(null);
  const { data: classes = [] } = useInstructorClassesForStudents({ page: 1, limit: 100 });
  const { data: students = [], error, isLoading } = useClassStudents(selectedClass);

  const classOptions = useMemo(() => classes.map((c) => ({ id: c.id, title: c.title })), [classes]);

  const rows = useMemo(
    () =>
      students.map((row) => ({
        id: row.student?.id || row.studentId,
        fullName: row.student?.fullName || "—",
        email: row.student?.email || "—",
        purchasedAt: row.purchasedAt ? new Date(row.purchasedAt).toLocaleDateString(dir === "rtl" ? "ar-EG" : "en-US") : "—",
        progress: `${Math.round(Number(row.progressPercentage) || 0)}%`,
        courseTitle: row.courseTitle || "—",
        progressPercentage: Number(row.progressPercentage) || 0,
      })),
    [students, dir]
  );

  const totalStudents = useMemo(() => {
    // Unique student count
    const studentIds = new Set(students.map((s) => s.student?.id || s.studentId).filter(Boolean));
    return studentIds.size;
  }, [students]);

  const avgProgress = useMemo(() => {
    if (students.length === 0) return 0;
    const sum = students.reduce((acc, curr) => acc + (Number(curr.progressPercentage) || 0), 0);
    return Math.round(sum / students.length);
  }, [students]);

  const certificatesIssued = useMemo(() => {
    return students.filter((s) => s.isCompleted || (Number(s.progressPercentage) >= 100)).length;
  }, [students]);

  const columns = useMemo(() => {
    const cols = [
      { key: "fullName", title: dir === "rtl" ? "اسم الطالب" : "Student Name" },
      { key: "email", title: dir === "rtl" ? "البريد الإلكتروني" : "Email" },
    ];
    if (!selectedClass) {
      cols.push({ key: "courseTitle", title: dir === "rtl" ? "الكورس" : "Course" });
    }
    cols.push(
      { key: "purchasedAt", title: dir === "rtl" ? "تاريخ الالتحاق" : "Joined" },
      {
        key: "progress",
        title: dir === "rtl" ? "نسبة التقدم" : "Progress",
        render: (_, row) => (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-[#EE7C11] h-full rounded-full shadow-[0_0_4px_#EE7C11]" 
                style={{ width: `${row.progressPercentage}%` }} 
              />
            </div>
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-350">{row.progress}</span>
          </div>
        ),
      },
      {
        key: "actions",
        title: dir === "rtl" ? "الإجراءات" : "Actions",
        render: (_, row) => (
          <Link
            to={`/instructor/students/${row.id}`}
            className="font-bold text-[#EE7C11] hover:text-[#d9700e] hover:underline"
          >
            {dir === "rtl" ? "عرض التقدم" : "View Progress"}
          </Link>
        ),
      }
    );
    return cols;
  }, [selectedClass, dir]);

  useEffect(() => {
    if (courseFromUrl) setSelectedClass(courseFromUrl);
  }, [courseFromUrl]);

  useEffect(() => {
    if (error) setNotice({ type: "error", message: getErrorMessage(error, "Failed to load students.") });
  }, [error]);

  return (
    <section className="space-y-6">
      <PageHeader
        title={dir === "rtl" ? "إدارة شؤون الطلاب" : t("dashboard.instructor.pages.students.title")}
        subtitle={dir === "rtl" ? "متابعة مستويات التقدم والتحصيل العلمي للملتحقين بالدورات." : t("dashboard.instructor.pages.students.subtitle")}
        actions={
          <select
            value={selectedClass}
            onChange={(e) => {
              setNotice(null);
              setSelectedClass(e.target.value);
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#1A1A22] dark:text-white outline-none focus:border-[#EE7C11] transition-all"
          >
            <option value="">{dir === "rtl" ? "كل الكورسات (تصفية)" : "All Courses (Filter)"}</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        }
      />

      <Notice type={notice?.type} message={notice?.message} />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Total Enrolled Minds */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A22] flex flex-col justify-between h-28 transition-all hover:shadow-md">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {dir === "rtl" ? "إجمالي العقول المسجلة" : "Total Enrolled Minds"}
          </div>
          <div className="text-3xl font-extrabold text-[#EE7C11] tracking-tight">
            {isLoading ? "..." : totalStudents}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">
            {dir === "rtl" ? "طلاب نشطين حالياً في المنصة" : "Active learners enrolled"}
          </div>
        </div>

        {/* Card 2: Average Progress */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A22] flex flex-col justify-between h-28 transition-all hover:shadow-md">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {dir === "rtl" ? "متوسط نسبة التقدم في المنهج" : "Average Progress Rate"}
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {isLoading ? "..." : `${avgProgress}%`}
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#EE7C11]/50 to-[#EE7C11] h-full rounded-full shadow-[0_0_8px_#EE7C11]" 
                style={{ width: `${avgProgress}%` }} 
              />
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">
            {dir === "rtl" ? "معدل الإنجاز العام للمحاضرات" : "Curriculum completion average"}
          </div>
        </div>

        {/* Card 3: Certificates Earned */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A22] flex flex-col justify-between h-28 transition-all hover:shadow-md">
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {dir === "rtl" ? "الشهادات المستحقة" : "Active Certificate Earners"}
          </div>
          <div className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400 tracking-tight">
            {isLoading ? "..." : certificatesIssued}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500">
            {dir === "rtl" ? "أتموا متطلبات الكورس كاملة" : "Completed all coursework"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#1A1A22] transition-all">
        {isLoading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-semibold font-cairo">
            <Loader2 className="h-5 w-5 animate-spin text-[#EE7C11]" />
            {dir === "rtl" ? "جاري تحميل قائمة الطلاب..." : "Loading student roster..."}
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            emptyNode={
              <EmptyState 
                title={dir === "rtl" ? "لا يوجد طلاب مسجلين" : t("dashboard.instructor.students.emptyTitle")} 
                message={dir === "rtl" ? "لم يسجل أي طالب في هذا الكورس بعد." : "No enrolled students found for the active selection."} 
              />
            }
          />
        )}
      </div>
    </section>
  );
}

export default Students;
