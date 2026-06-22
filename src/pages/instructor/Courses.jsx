import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Plus, Search, FileText, Clock, Users, Trash2, Edit3, Eye, AlertCircle, BookOpen, Loader2, Video
} from "lucide-react";
import { useInstructorCourses, useDeleteInstructorCourse, useInstructorCourse } from "../../features/instructor/courses/hooks";
import ContentStatusBadge from "../../components/ui/ContentStatusBadge";
import StudentPreviewModal from "./StudentPreviewModal";
import CourseSessionsPanel from "./CourseSessionsPanel";
import toast from "react-hot-toast";

const DARK_SURFACE = "dark:bg-[#1A1A22]";
const DARK_INPUT =
  "h-10 w-full rounded-xl border border-slate-200 bg-white ps-10 pe-4 text-xs text-slate-900 outline-none focus:border-[#EE7C11] transition-all dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:[color-scheme:dark]";

function Courses() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const navigate = useNavigate();

  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewCourseId, setPreviewCourseId] = useState(null);
  const [sessionsCourse, setSessionsCourse] = useState(null);

  // Fetch courses list
  const { data: coursesData, isLoading, refetch } = useInstructorCourses({
    page: 1,
    limit: 100,
    status: selectedFilter === "ALL" ? undefined : selectedFilter,
    search: searchQuery || undefined,
  });

  const coursesList = coursesData?.courses || [];

  // Fetch full details of the course for preview modal
  const { data: previewCourseDetails, isLoading: isPreviewLoading } = useInstructorCourse(previewCourseId);

  // Mutations
  const deleteCourseMutation = useDeleteInstructorCourse();

  const handleDeleteCourse = async (courseId, e) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      dir === "rtl" 
        ? "هل أنت متأكد من حذف هذا الكورس نهائياً؟ سيتم حذف جميع المنهج والبيانات المتعلقة به!" 
        : "Are you sure you want to delete this course permanently? This will delete all curriculum outlines and related data!"
    );
    if (!confirmed) return;

    try {
      await deleteCourseMutation.mutateAsync(courseId);
      toast.success(dir === "rtl" ? "تم حذف الكورس بنجاح!" : "Course deleted successfully!");
      refetch();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل حذف الكورس." : "Failed to delete course.");
    }
  };

  return (
    <div className="space-y-6 antialiased font-sans pb-20">
      {/* Header Control Layer */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-cairo">
            {dir === "rtl" ? "إدارة المحتوى والتعليم" : "Academic Matrix & Course Desk"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {dir === "rtl" 
              ? "صمم المحتوى الدراسي، أدر الواجبات والامتحانات لنماذج الهندسة الاحترافية." 
              : "Author curriculum trees, assign CAD tasks, and build quiz factory matrices."}
          </p>
        </div>

        <button
          onClick={() => navigate("/instructor/courses/new")}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-[#EE7C11]/15 transition-all self-start md:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>{dir === "rtl" ? "إضافة كورس جديد" : "Create New Course"}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: "ALL", labelAr: "الكل", labelEn: "All" },
            { id: "APPROVED", labelAr: "مقبول", labelEn: "Approved" },
            { id: "PENDING_REVIEW", labelAr: "قيد المراجعة", labelEn: "Pending Review" },
            { id: "DRAFT", labelAr: "مسودة", labelEn: "Drafts" },
            { id: "REJECTED", labelAr: "مرفوض", labelEn: "Rejected" }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition-all ${
                selectedFilter === f.id
                  ? "bg-[#EE7C11] text-white shadow-md shadow-[#EE7C11]/10"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-[#1A1A22] dark:text-slate-200 dark:hover:bg-white/5"
              }`}
            >
              {dir === "rtl" ? f.labelAr : f.labelEn}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dir === "rtl" ? "بحث عن كورس..." : "Search courses..."}
            className={DARK_INPUT}
          />
        </div>
      </div>

      {/* Grid View of Course Console */}
      {isLoading ? (
        <div className="flex py-20 items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-[#EE7C11]" />
        </div>
      ) : coursesList.length === 0 ? (
        <div className={`rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center bg-white ${DARK_SURFACE} dark:border-white/10`}>
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-650 mb-4" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {dir === "rtl" ? "لا توجد كورسات مطابقة" : "No courses matching filters"}
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            {dir === "rtl" 
              ? "ابدأ بإضافة كورس جديد وصمم المنهج الدراسي اليوم." 
              : "Create your first engineering course blueprint today."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coursesList.map(c => (
            <div
              key={c.id}
              className={`flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all dark:border-white/10 ${DARK_SURFACE}`}
            >
              {/* Top Row: Pipeline Status & Preview */}
              <div className="flex items-center justify-between mb-4">
                <ContentStatusBadge status={c.status} />

                <div className="flex items-center gap-2">
                  {c.status === "REJECTED" && (
                    <div 
                      title={c.rejectionReason || "Required changes"}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 cursor-pointer"
                    >
                      <AlertCircle className="h-4 w-4" />
                    </div>
                  )}

                  <button
                    onClick={() => setPreviewCourseId(c.id)}
                    title={dir === "rtl" ? "معاينة كطالب" : "Student Preview"}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={(e) => handleDeleteCourse(c.id, e)}
                    title={dir === "rtl" ? "حذف الكورس" : "Delete Course"}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 dark:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 leading-normal mb-1">
                  {c.title}
                </h3>
                <p className="text-[11px] font-semibold text-[#EE7C11] tracking-wider mb-2 uppercase">
                  {c.category?.name || "Structural Engineering"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {c.description || (dir === "rtl" ? "لا يوجد وصف." : "No description provided.")}
                </p>
              </div>

              {/* Quick Stats Bar */}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-white/5 pt-3 text-center">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {dir === "rtl" ? "الطلاب" : "Enrolled"}
                  </p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" /> {c.enrollmentCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    {dir === "rtl" ? "السعر" : "Price"}
                  </p>
                  <p className="text-xs font-bold text-[#EE7C11] flex items-center justify-center gap-1 mt-0.5">
                    {Number(c.price || 0).toLocaleString()} {dir === "rtl" ? "ج.م" : "EGP"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => navigate(`/instructor/courses/${c.id}/edit`)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold text-[#EE7C11] py-2.5 transition-all"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>{dir === "rtl" ? "إعداد المنهج الدراسي" : "Manage Curriculum Console"}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/instructor/students?course=${c.id}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <Users className="h-3.5 w-3.5" />
                    {dir === "rtl" ? "الطلاب" : "Students"}
                  </Link>

                  {c.type === "HYBRID" ? (
                    <button
                      type="button"
                      onClick={() => setSessionsCourse(c)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-[#EE7C11]/30 py-2 text-[10px] font-bold text-[#EE7C11] hover:bg-[#EE7C11]/5"
                    >
                      <Video className="h-3.5 w-3.5" />
                      {dir === "rtl" ? "الجلسات" : "Sessions"}
                    </button>
                  ) : (
                    <span className="flex items-center justify-center rounded-xl border border-transparent py-2 text-[10px] text-slate-400">
                      {dir === "rtl" ? "مسجل" : "Recorded"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {sessionsCourse ? (
        <CourseSessionsPanel course={sessionsCourse} onClose={() => setSessionsCourse(null)} />
      ) : null}

      {/* Student View Player Preview Loading Indicator */}
      {isPreviewLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-2 bg-slate-900 text-white p-6 rounded-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" />
            <p className="text-xs font-bold">{dir === "rtl" ? "جاري تحميل المعاينة..." : "Loading preview portal..."}</p>
          </div>
        </div>
      )}

      {/* Student View Player Preview Modal */}
      {!isPreviewLoading && previewCourseDetails && (
        <StudentPreviewModal 
          course={previewCourseDetails} 
          curriculumData={{
            units: previewCourseDetails.units || [],
            homeworks: previewCourseDetails.homeworks || [],
            exams: previewCourseDetails.exams || [],
          }}
          onClose={() => setPreviewCourseId(null)}
          dir={dir}
        />
      )}
    </div>
  );
}

export default Courses;
