import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, ArrowRight, BookOpen, ChevronRight, ChevronDown, Plus, 
  Trash2, FileText, Settings, Award, Layers, Loader2, Save, X, Eye, 
  HelpCircle, CheckSquare, PlusCircle, Play, AlertCircle, FileCode, CheckCircle2 
} from "lucide-react";
import { useInstructorCourse, useUpdateInstructorCourse, useSubmitInstructorCourseForReview } from "../../features/instructor/courses/hooks";
import { useAdminCategories } from "../../features/admin/categories/hooks";
import { 
  useCreateAdminUnit, useUpdateAdminUnit, useDeleteAdminUnit,
  useCreateAdminLesson, useUpdateAdminLesson, useDeleteAdminLesson 
} from "../../features/admin/courses/hooks";
import { 
  useCreateAdminSection, useUpdateAdminSection, useDeleteAdminSection 
} from "../../features/admin/sections/hooks";
import { 
  useCreateInstructorExam, useUpdateInstructorExam, useDeleteInstructorExam,
  useAddInstructorExamQuestion, useUpdateInstructorExamQuestion, useDeleteInstructorExamQuestion 
} from "../../features/instructor/exams/hooks";
import ContentStatusBadge from "../../components/ui/ContentStatusBadge";
import StudentPreviewModal from "./StudentPreviewModal";
import { 
  useCreateInstructorHomework,
  useDeleteInstructorHomework,
} from "../../features/instructor/homework/hooks";
import toast from "react-hot-toast";

const DARK_FORM_LABEL =
  "block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-300";
const DARK_FORM_LABEL_LG =
  "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 dark:text-slate-300";
const DARK_FORM_INPUT_SM =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]";
const DARK_FORM_INPUT_LG =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]";
const DARK_FORM_TEXTAREA =
  "w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500";
const DARK_FORM_TEXTAREA_LG =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500";
const DARK_FORM_CARD =
  "rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]";
const DARK_PANEL_CARD =
  "rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]";

function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const queryClient = useQueryClient();

  // Load course details
  const { data: course, isLoading, refetch } = useInstructorCourse(id);
  const { data: categoryData } = useAdminCategories({ page: 1, limit: 100 });
  const categories = categoryData?.categories || [];

  // Mutations
  const updateCourseMutation = useUpdateInstructorCourse();
  const submitForReviewMutation = useSubmitInstructorCourseForReview();

  const createUnitMutation = useCreateAdminUnit();
  const updateUnitMutation = useUpdateAdminUnit();
  const deleteUnitMutation = useDeleteAdminUnit();

  const createSectionMutation = useCreateAdminSection();
  const updateSectionMutation = useUpdateAdminSection();
  const deleteSectionMutation = useDeleteAdminSection();

  const createLessonMutation = useCreateAdminLesson();
  const updateLessonMutation = useUpdateAdminLesson();
  const deleteLessonMutation = useDeleteAdminLesson();

  const createExamMutation = useCreateInstructorExam();
  const updateExamMutation = useUpdateInstructorExam();
  const deleteExamMutation = useDeleteInstructorExam();

  const [activeTab, setActiveTab] = useState("details"); // details, curriculum, homework, exams
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);

  // Sync queries local helper to refresh page state
  const syncCourseCache = () => {
    queryClient.invalidateQueries({ queryKey: ["instructor", "course", id] });
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#EE7C11]" />
          <p className="text-xs font-bold text-slate-400">
            {dir === "rtl" ? "جاري تحميل تفاصيل الكورس..." : "Loading course blueprint..."}
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-white/5">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {dir === "rtl" ? "الكورس غير موجود" : "Course Not Found"}
        </h3>
        <p className="text-xs text-slate-500 mt-2">
          {dir === "rtl" ? "عذراً، لم نتمكن من العثور على الكورس المطلوب أو لا تملك صلاحية الوصول إليه." : "We couldn't locate this course blueprint, or you do not have permission to manage it."}
        </p>
        <Link to="/instructor/courses" className="mt-4 inline-block text-xs font-bold text-[#EE7C11] hover:underline">
          {dir === "rtl" ? "← العودة إلى كورساتي" : "← Back to My Courses"}
        </Link>
      </div>
    );
  }

  const handleSubmitReview = async () => {
    try {
      await submitForReviewMutation.mutateAsync(course.id);
      toast.success(dir === "rtl" ? "تم تقديم الكورس للمراجعة!" : "Course submitted for editorial review!");
      syncCourseCache();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل تقديم الكورس للمراجعة." : "Failed to submit course for review.");
    }
  };

  return (
    <div className="space-y-6 antialiased font-sans pb-20">
      {/* Top Header Console */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link to="/instructor/courses" className="text-slate-400 hover:text-[#EE7C11] transition-colors">
              {dir === "rtl" ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-cairo">
              {course.title}
            </h1>
            <ContentStatusBadge status={course.status} />
          </div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider ps-7">
            {course.category?.name || "Structural Engineering"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 ps-7 sm:ps-0">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white px-4 py-2 text-xs font-bold transition-all"
          >
            <Eye className="h-4 w-4" />
            <span>{dir === "rtl" ? "معاينة كطالب" : "Student Preview"}</span>
          </button>

          {(course.status === "DRAFT" || course.status === "REJECTED") && (
            <button
              onClick={handleSubmitReview}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white px-4 py-2 text-xs font-bold shadow-md shadow-[#EE7C11]/15 transition-all"
            >
              <Layers className="h-4 w-4" />
              <span>{dir === "rtl" ? "تقديم للمراجعة" : "Submit for Review"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Rejection Alert */}
      {course.status === "REJECTED" && (
        <div className="flex items-start gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/20 dark:bg-rose-500/10">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-rose-900 dark:text-rose-200 font-cairo">
              {dir === "rtl" ? "تم رفض هذا الكورس من قبل المراجعين" : "Course rejected by platform reviewer"}
            </p>
            <p className="mt-1 text-xs text-rose-700 dark:text-rose-300 leading-relaxed font-semibold italic">
              "{course.rejectionReason || "No rejection notes provided."}"
            </p>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-white/10">
        {[
          { id: "details", labelAr: "تفاصيل الكورس", labelEn: "Course Details" },
          { id: "curriculum", labelAr: "هيكل المنهج", labelEn: "Curriculum Tree" },
          { id: "homework", labelAr: "الواجبات الهندسية", labelEn: "Assignments Desk" },
          { id: "exams", labelAr: "بنك الاختبارات", labelEn: "Exam Factory" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3.5 px-5 text-xs font-bold relative transition-all border-b-2 font-cairo ${
              activeTab === tab.id
                ? "border-[#EE7C11] text-[#EE7C11]"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {dir === "rtl" ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Active Tab Screen */}
      <div className="space-y-6">
        {activeTab === "details" && (
          <DetailsTab 
            course={course} 
            categories={categories} 
            updateMutation={updateCourseMutation} 
            sync={syncCourseCache} 
            dir={dir} 
          />
        )}
        {activeTab === "curriculum" && (
          <CurriculumTab 
            course={course}
            createUnit={createUnitMutation}
            updateUnit={updateUnitMutation}
            deleteUnit={deleteUnitMutation}
            createSection={createSectionMutation}
            updateSection={updateSectionMutation}
            deleteSection={deleteSectionMutation}
            createLesson={createLessonMutation}
            updateLesson={updateLessonMutation}
            deleteLesson={deleteLessonMutation}
            createExam={createExamMutation}
            deleteExam={deleteExamMutation}
            onEditExam={(examId) => {
              setActiveTab("exams");
              setEditingExamId(examId);
            }}
            sync={syncCourseCache}
            dir={dir}
          />
        )}
        {activeTab === "homework" && (
          <HomeworkTab 
            course={course} 
            sync={syncCourseCache} 
            dir={dir} 
          />
        )}
        {activeTab === "exams" && (
          <ExamsTab 
            course={course}
            createExam={createExamMutation}
            updateExam={updateExamMutation}
            deleteExam={deleteExamMutation}
            editingExamId={editingExamId}
            setEditingExamId={setEditingExamId}
            sync={syncCourseCache}
            dir={dir}
          />
        )}
      </div>

      {/* Student View Player Preview Modal */}
      {isPreviewOpen && (
        <StudentPreviewModal 
          course={course} 
          curriculumData={{
            units: course.units || [],
            homeworks: course.homeworks || [],
            exams: course.exams || [],
          }}
          onClose={() => setIsPreviewOpen(false)}
          dir={dir}
        />
      )}
    </div>
  );
}

// ─── Tab 1: Course Details ───
function DetailsTab({ course, categories, updateMutation, sync, dir }) {
  const [form, setForm] = useState({
    title: course.title || "",
    description: course.description || "",
    thumbnail: course.thumbnail || "",
    introVideoUrl: course.introVideoUrl || "",
    categoryId: course.categoryId || "",
    type: course.type || "RECORDED",
    price: course.price || 0,
    isLifetimePurchasable: course.isLifetimePurchasable !== false,
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: course.id,
        body: {
          title: form.title,
          description: form.description,
          thumbnail: form.thumbnail,
          introVideoUrl: form.introVideoUrl,
          categoryId: form.categoryId || null,
          type: form.type,
          price: Number(form.price),
          isLifetimePurchasable: form.isLifetimePurchasable,
        }
      });
      toast.success(dir === "rtl" ? "تم تحديث تفاصيل الكورس!" : "Course details updated!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل التحديث. يرجى مراجعة الحقول." : "Failed to update course details.");
    }
  };

  const inputClass = DARK_FORM_INPUT_LG;
  const labelClass = DARK_FORM_LABEL_LG;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
        <label className="block">
          <span className={labelClass}>{dir === "rtl" ? "عنوان الكورس" : "Course Title"}</span>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>{dir === "rtl" ? "الوصف" : "Description"}</span>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={4}
            className={DARK_FORM_TEXTAREA_LG}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>{dir === "rtl" ? "التصنيف" : "Category"}</span>
            <select
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              className={inputClass}
            >
              <option value="">{dir === "rtl" ? "بلا تصنيف" : "No Category"}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>{dir === "rtl" ? "رابط الصورة المصغرة" : "Thumbnail URL"}</span>
            <input
              value={form.thumbnail}
              onChange={(e) => set("thumbnail", e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>{dir === "rtl" ? "نوع الكورس" : "Course Type"}</span>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className={inputClass}
            >
              <option value="RECORDED">{dir === "rtl" ? "مسجل" : "RECORDED"}</option>
              <option value="HYBRID">{dir === "rtl" ? "هجين" : "HYBRID"}</option>
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>{dir === "rtl" ? "السعر ($)" : "Price ($)"}</span>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => set("price", Number(e.target.value))}
              className={inputClass}
            />
          </label>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isLifetimePurchasable}
              onChange={(e) => set("isLifetimePurchasable", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#EE7C11] focus:ring-[#EE7C11]"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-cairo">
              {dir === "rtl" ? "إتاحة الشراء مدى الحياة" : "Enable lifetime purchase"}
            </span>
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>{dir === "rtl" ? "فيديو مقدمة الكورس (URL)" : "Intro Video URL"}</span>
          <input
            value={form.introVideoUrl}
            onChange={(e) => set("introVideoUrl", e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={updateMutation.isPending}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white py-3 text-xs font-bold shadow-md shadow-[#EE7C11]/15 transition-all"
      >
        <Save className="h-4 w-4" />
        <span>
          {updateMutation.isPending
            ? (dir === "rtl" ? "جاري حفظ التغييرات..." : "Saving changes...")
            : (dir === "rtl" ? "حفظ التغييرات" : "Save Changes")}
        </span>
      </button>
    </form>
  );
}

// ─── Tab 2: Curriculum Tree ───
function CurriculumTab({ 
  course, 
  createUnit, updateUnit, deleteUnit,
  createSection, updateSection, deleteSection,
  createLesson, updateLesson, deleteLesson,
  createExam, deleteExam, onEditExam,
  sync, dir 
}) {
  const [expandedUnits, setExpandedUnits] = useState({});

  const handleAddUnitExam = async (unitId) => {
    try {
      const newExam = {
        title: dir === "rtl" ? "اختبار قصير للوحدة" : "New Unit Assessment",
        description: "Standard unit quiz evaluation.",
        durationMinutes: 30,
        totalPoints: 100,
        passingScore: 60,
        attempts: 2,
        courseId: course.id,
        unitId: unitId,
        status: "AVAILABLE"
      };
      await createExam.mutateAsync(newExam);
      toast.success(dir === "rtl" ? "تم إنشاء اختبار جديد للوحدة!" : "New unit quiz initialized!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل إنشاء الاختبار." : "Failed to build unit exam.");
    }
  };

  const handleAddLessonExam = async (lessonId) => {
    try {
      const newExam = {
        title: dir === "rtl" ? "كويز سريع للدرس" : "New Lesson Quiz",
        description: "Quick concept evaluation.",
        durationMinutes: 15,
        totalPoints: 100,
        passingScore: 60,
        attempts: 2,
        courseId: course.id,
        lessonId: lessonId,
        status: "AVAILABLE"
      };
      await createExam.mutateAsync(newExam);
      toast.success(dir === "rtl" ? "تم إنشاء كويز جديد للدرس!" : "New lesson quiz initialized!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل إنشاء الكويز." : "Failed to build lesson quiz.");
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm(dir === "rtl" ? "هل أنت متأكد من حذف هذا الاختبار؟" : "Are you sure you want to delete this exam?")) return;
    try {
      await deleteExam.mutateAsync(examId);
      toast.success(dir === "rtl" ? "تم حذف الاختبار!" : "Exam deleted!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل الحذف." : "Delete failed.");
    }
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const handleAddUnit = async () => {
    try {
      const order = (course.units?.length || 0) + 1;
      const title = dir === "rtl" ? `الوحدة ${order}: عنوان الوحدة الجديدة` : `Unit ${order}: New Unit Blueprint`;
      await createUnit.mutateAsync({ title, order, courseId: course.id });
      toast.success(dir === "rtl" ? "تمت إضافة الوحدة!" : "Unit added successfully!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل إضافة الوحدة." : "Failed to add unit.");
    }
  };

  const handleUpdateUnitTitle = async (unitId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await updateUnit.mutateAsync({ id: unitId, body: { title: newTitle.trim() } });
      sync();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm(dir === "rtl" ? "هل أنت متأكد من حذف هذه الوحدة؟ سيتم حذف جميع الأقسام والدروس المرتبطة بها!" : "Are you sure you want to delete this unit? This will delete all associated sections and lessons!")) return;
    try {
      await deleteUnit.mutateAsync(unitId);
      toast.success(dir === "rtl" ? "تم حذف الوحدة!" : "Unit deleted!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل الحذف." : "Delete failed.");
    }
  };

  // Section Handlers
  const handleAddSection = async (unitId, sectionsCount) => {
    try {
      const order = sectionsCount + 1;
      const title = dir === "rtl" ? `القسم ${order}: عنوان القسم الجديد` : `Section ${order}: New Section`;
      await createSection.mutateAsync({ title, order, unitId });
      toast.success(dir === "rtl" ? "تمت إضافة القسم!" : "Section added successfully!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل إضافة القسم." : "Failed to add section.");
    }
  };

  const handleUpdateSectionTitle = async (secId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await updateSection.mutateAsync({ id: secId, body: { title: newTitle.trim() } });
      sync();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSection = async (secId) => {
    if (!window.confirm(dir === "rtl" ? "هل أنت متأكد من حذف هذا القسم؟" : "Are you sure you want to delete this section?")) return;
    try {
      await deleteSection.mutateAsync(secId);
      toast.success(dir === "rtl" ? "تم حذف القسم!" : "Section deleted!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل الحذف." : "Delete failed.");
    }
  };

  // Lesson Handlers
  const handleAddLesson = async (secId, lessonsCount) => {
    try {
      const order = lessonsCount + 1;
      const title = dir === "rtl" ? `الدرس ${order}: عنوان الدرس الجديد` : `Lesson ${order}: New Lesson`;
      await createLesson.mutateAsync({ title, order, sectionId: secId, durationSeconds: 1800 });
      toast.success(dir === "rtl" ? "تمت إضافة الدرس!" : "Lesson added successfully!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل إضافة الدرس." : "Failed to add lesson.");
    }
  };

  const handleUpdateLessonTitle = async (lesId, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await updateLesson.mutateAsync({ id: lesId, body: { title: newTitle.trim() } });
      sync();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLessonSpecs = async (lesId, specs) => {
    try {
      await updateLesson.mutateAsync({ id: lesId, body: specs });
      toast.success(dir === "rtl" ? "تم تحديث تفاصيل الدرس!" : "Lesson details updated!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل تحديث تفاصيل الدرس." : "Failed to update lesson details.");
    }
  };

  const handleDeleteLesson = async (lesId) => {
    if (!window.confirm(dir === "rtl" ? "هل أنت متأكد من حذف هذا الدرس؟" : "Are you sure you want to delete this lesson?")) return;
    try {
      await deleteLesson.mutateAsync(lesId);
      toast.success(dir === "rtl" ? "تم حذف الدرس!" : "Lesson deleted!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل الحذف." : "Delete failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 font-cairo">
          {dir === "rtl" ? "هيكل وتفاصيل المنهج الدراسي" : "Curriculum Construction Tree"}
        </h3>
        <button
          onClick={handleAddUnit}
          className="flex items-center gap-1.5 rounded-lg bg-[#EE7C11]/10 hover:bg-[#EE7C11]/20 text-[#EE7C11] px-3.5 py-2 text-xs font-bold transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{dir === "rtl" ? "إضافة وحدة جديدة" : "Add Unit Module"}</span>
        </button>
      </div>

      {!course.units || course.units.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 p-12 text-center bg-white dark:bg-[#1E293B]">
          <Layers className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-xs text-slate-400 font-semibold">
            {dir === "rtl" ? "لا توجد وحدات دراسية حالياً. اضغط على زر الإضافة بالأعلى للبدء." : "No curriculum units created yet. Click Add Unit Module to begin building."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {course.units.map((unit) => {
            const isExpanded = expandedUnits[unit.id] ?? true;
            return (
              <div key={unit.id} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#1E293B]/40 overflow-hidden shadow-xs">
                {/* Unit Header */}
                <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 p-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button onClick={() => toggleUnit(unit.id)} className="text-slate-400 hover:text-slate-600 shrink-0">
                      {isExpanded ? <ChevronDown className="h-4.5 w-4.5" /> : <ChevronRight className="h-4.5 w-4.5" />}
                    </button>
                    <input
                      type="text"
                      defaultValue={unit.title}
                      onBlur={(e) => handleUpdateUnitTitle(unit.id, e.target.value)}
                      className="bg-transparent font-bold text-sm text-slate-800 dark:text-slate-200 w-full outline-none focus:bg-slate-100/50 dark:focus:bg-slate-800 px-2 py-0.5 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddSection(unit.id, unit.sections?.length || 0)}
                      title={dir === "rtl" ? "إضافة قسم" : "Add Section"}
                      className="p-1.5 text-[#EE7C11] hover:bg-[#EE7C11]/10 rounded-lg shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleAddUnitExam(unit.id)}
                      title={dir === "rtl" ? "إضافة اختبار للوحدة" : "Add Unit Exam"}
                      className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-lg shrink-0"
                    >
                      <Award className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUnit(unit.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Sections & Lessons Content */}
                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {!unit.sections || unit.sections.length === 0 ? (
                      <p className="text-[11px] text-slate-400 ps-6 italic">
                        {dir === "rtl" ? "لا توجد أقسام في هذه الوحدة بعد." : "No sections inside this module yet."}
                      </p>
                    ) : (
                      unit.sections.map((sec) => (
                        <div key={sec.id} className="border-l-2 border-slate-200 dark:border-white/10 ps-4 space-y-3">
                          {/* Section Title */}
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              defaultValue={sec.title}
                              onBlur={(e) => handleUpdateSectionTitle(sec.id, e.target.value)}
                              className="bg-transparent font-semibold text-xs text-slate-700 dark:text-slate-300 w-full outline-none focus:bg-slate-100/50 dark:focus:bg-slate-800 px-2 py-0.5 rounded"
                            />
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleAddLesson(sec.id, sec.lessons?.length || 0)}
                                title={dir === "rtl" ? "إضافة درس" : "Add Lesson"}
                                className="p-1.5 text-[#EE7C11] hover:bg-[#EE7C11]/10 rounded-lg shrink-0"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSection(sec.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Lessons list */}
                          <div className="space-y-2 ps-2">
                            {!sec.lessons || sec.lessons.length === 0 ? (
                              <p className="text-[10px] text-slate-400 italic">
                                {dir === "rtl" ? "لا توجد دروس في هذا القسم بعد." : "No lessons in this section yet."}
                              </p>
                            ) : (
                              sec.lessons.map((les) => (
                                <LessonRow 
                                  key={les.id} 
                                  lesson={les} 
                                  lessonExams={course.exams?.filter(ex => ex.lessonId === les.id) || []}
                                  onAddQuiz={() => handleAddLessonExam(les.id)}
                                  onEditExam={onEditExam}
                                  onDeleteExam={handleDeleteExam}
                                  onBlurTitle={(title) => handleUpdateLessonTitle(les.id, title)}
                                  onUpdateSpecs={(specs) => handleUpdateLessonSpecs(les.id, specs)}
                                  onDelete={() => handleDeleteLesson(les.id)}
                                  dir={dir}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Unit Exams */}
                    {course.exams?.filter(ex => ex.unitId === unit.id && !ex.lessonId).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider ps-4">
                          {dir === "rtl" ? "اختبارات وتقييمات الوحدة" : "Unit Exams & Assessments"}
                        </p>
                        <div className="space-y-2 ps-4">
                          {course.exams.filter(ex => ex.unitId === unit.id && !ex.lessonId).map(ex => (
                            <div key={ex.id} className="flex items-center justify-between bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 px-3.5 py-2 rounded-xl">
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-[#EE7C11]" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{ex.title}</span>
                                <span className="text-[9px] text-slate-400">({ex.questions?.length || 0} Qs)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => onEditExam(ex.id)}
                                  className="text-[10px] font-extrabold text-[#EE7C11] hover:underline"
                                >
                                  {dir === "rtl" ? "تعديل الأسئلة" : "Edit Qs"}
                                </button>
                                <span className="text-slate-200 dark:text-slate-800 text-[10px]">|</span>
                                <button
                                  onClick={() => handleDeleteExam(ex.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1 rounded"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Lesson Row helper ───
function LessonRow({ lesson, lessonExams, onAddQuiz, onEditExam, onDeleteExam, onBlurTitle, onUpdateSpecs, onDelete, dir }) {
  const [showEditPanel, setShowEditPanel] = useState(false);
  
  // Local state for specs editing
  const [localIsLive, setLocalIsLive] = useState(lesson.isLive === true);
  const [localVideoUrl, setLocalVideoUrl] = useState(lesson.videoUrl || "");
  const [localMeetingUrl, setLocalMeetingUrl] = useState(lesson.meetingUrl || "");
  const [localDurationMins, setLocalDurationMins] = useState(
    lesson.durationSeconds ? Math.round(lesson.durationSeconds / 60) : 30
  );
  
  // Format incoming availableAt
  const formatDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const pad = (num) => String(num).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch (e) {
      return "";
    }
  };
  const [localAvailableAt, setLocalAvailableAt] = useState(formatDateTimeLocal(lesson.availableAt));

  // Sync state if lesson changes
  useEffect(() => {
    setLocalIsLive(lesson.isLive === true);
    setLocalVideoUrl(lesson.videoUrl || "");
    setLocalMeetingUrl(lesson.meetingUrl || "");
    setLocalDurationMins(lesson.durationSeconds ? Math.round(lesson.durationSeconds / 60) : 30);
    setLocalAvailableAt(formatDateTimeLocal(lesson.availableAt));
  }, [lesson]);

  const handleSave = () => {
    const specs = {
      isLive: localIsLive,
      videoUrl: localIsLive ? null : (localVideoUrl || null),
      meetingUrl: localIsLive ? (localMeetingUrl || null) : null,
      availableAt: localIsLive && localAvailableAt ? new Date(localAvailableAt).toISOString() : null,
      durationSeconds: Number(localDurationMins) * 60,
    };
    onUpdateSpecs(specs);
    setShowEditPanel(false);
  };

  // Determine badge look
  const isSetup = localIsLive ? !!lesson.meetingUrl : !!lesson.videoUrl;
  const badgeText = localIsLive 
    ? (isSetup ? (dir === "rtl" ? "جلسة لايف مجهزة" : "Live Ready") : (dir === "rtl" ? "+ جلسة لايف" : "+ Live Session"))
    : (isSetup ? (dir === "rtl" ? "فيديو مسجل" : "Pre-recorded") : (dir === "rtl" ? "+ فيديو" : "+ Video"));

  return (
    <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/40 px-3.5 py-2.5 rounded-xl border border-slate-100 dark:border-white/5 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            defaultValue={lesson.title}
            onBlur={(e) => onBlurTitle(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-600 dark:text-slate-300 w-full outline-none focus:bg-slate-200/50 dark:focus:bg-slate-800 px-2 rounded py-0.5"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setShowEditPanel((open) => !open)}
            className={`px-2 py-1 rounded-lg text-[9px] font-extrabold border transition-colors ${
              isSetup
                ? "bg-[#EE7C11]/10 text-[#EE7C11] border-[#EE7C11]/20"
                : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/5 dark:border-white/10"
            }`}
          >
            {badgeText}
          </button>
          <button
            type="button"
            onClick={onAddQuiz}
            title={dir === "rtl" ? "إضافة اختبار" : "Add quiz"}
            className="p-1.5 text-[#EE7C11] hover:bg-[#EE7C11]/10 rounded-lg"
          >
            <Award className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowEditPanel((open) => !open)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {lessonExams.length > 0 && (
        <div className="space-y-1.5">
          {lessonExams.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 dark:border-amber-500/20 px-2.5 py-1.5 rounded-lg text-[10px]">
              <div className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="font-bold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{ex.title}</span>
                <span className="text-[8px] text-slate-400">({ex.questions?.length || 0} Qs)</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onEditExam(ex.id)}
                  className="font-extrabold text-[#EE7C11] hover:underline"
                >
                  {dir === "rtl" ? "تعديل الأسئلة" : "Edit Qs"}
                </button>
                <span className="text-slate-200 dark:text-slate-800">|</span>
                <button
                  onClick={() => onDeleteExam(ex.id)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditPanel && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Type Selector Toggle */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              {dir === "rtl" ? "نوع الدرس" : "Lesson Type"}
            </span>
            <div className="flex bg-slate-100 dark:bg-slate-950 rounded-lg p-0.5 border border-slate-200/50 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLocalIsLive(false)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                  !localIsLive
                    ? "bg-[#EE7C11] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {dir === "rtl" ? "مسجل" : "Recorded"}
              </button>
              <button
                type="button"
                onClick={() => setLocalIsLive(true)}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                  localIsLive
                    ? "bg-[#EE7C11] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {dir === "rtl" ? "بث مباشر" : "Live Session"}
              </button>
            </div>
          </div>

          {!localIsLive ? (
            /* Recorded Video Settings */
            <div className="grid gap-2">
              <div>
                <label className={DARK_FORM_LABEL}>
                  {dir === "rtl" ? "رابط الفيديو" : "Video URL"}
                </label>
                <input
                  type="url"
                  value={localVideoUrl}
                  onChange={(e) => setLocalVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-1">
                  {dir === "rtl" ? "مدة الفيديو (بالدقائق)" : "Video Duration (Minutes)"}
                </label>
                <input
                  type="number"
                  value={localDurationMins}
                  onChange={(e) => setLocalDurationMins(e.target.value)}
                  placeholder="30"
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
                />
              </div>
            </div>
          ) : (
            /* Live Session Settings */
            <div className="grid gap-2">
              <div>
                <label className={DARK_FORM_LABEL}>
                  {dir === "rtl" ? "رابط الاجتماع (Zoom / Meet)" : "Meeting Link (Zoom / Meet)"}
                </label>
                <input
                  type="url"
                  value={localMeetingUrl}
                  onChange={(e) => setLocalMeetingUrl(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={DARK_FORM_LABEL}>
                    {dir === "rtl" ? "موعد البث" : "Start Time"}
                  </label>
                  <input
                    type="datetime-local"
                    value={localAvailableAt}
                    onChange={(e) => setLocalAvailableAt(e.target.value)}
                    className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px] dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className={DARK_FORM_LABEL}>
                    {dir === "rtl" ? "المدة (بالدقائق)" : "Duration (Mins)"}
                  </label>
                  <input
                    type="number"
                    value={localDurationMins}
                    onChange={(e) => setLocalDurationMins(e.target.value)}
                    placeholder="60"
                    className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setShowEditPanel(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] font-bold text-slate-550 dark:text-slate-350"
            >
              {dir === "rtl" ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-[#EE7C11] hover:bg-[#d9700e] text-white text-[10px] font-bold"
            >
              {dir === "rtl" ? "حفظ التفاصيل" : "Save Details"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Assignments Desk ───
function HomeworkTab({ course, sync, dir }) {
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [filename, setFilename] = useState("");
  const [requirements, setRequirements] = useState("");
  const [points, setPoints] = useState(100);
  const [dueDate, setDueDate] = useState("2026-07-31");

  const createHomeworkMutation = useCreateInstructorHomework();
  const deleteHomeworkMutation = useDeleteInstructorHomework();
  const isPending = createHomeworkMutation.isPending || deleteHomeworkMutation.isPending;

  // Flatten lessons list
  const lessons = useMemo(() => {
    const list = [];
    course.units?.forEach((u) => {
      u.sections?.forEach((s) => {
        s.lessons?.forEach((l) => {
          list.push({ id: l.id, title: l.title });
        });
      });
    });
    return list;
  }, [course]);

  const handleAddHomework = async (e) => {
    e.preventDefault();
    if (!selectedLessonId || !title.trim()) return;

    try {
      const body = {
        courseId: course.id,
        title: title.trim(),
        description: requirements.trim(),
        type: filename.trim() ? "FILE" : "TEXT",
        targetType: "LESSONS",
        attachments: filename.trim() ? [filename.trim()] : [],
        requirements: requirements.trim() ? [requirements.trim()] : [],
        dueDate: new Date(dueDate).toISOString(),
        totalPoints: Number(points),
        lessonIds: [selectedLessonId],
      };

      await createHomeworkMutation.mutateAsync(body);
      toast.success(dir === "rtl" ? "تم إسناد الواجب!" : "Homework assigned!");
      setTitle("");
      setFilename("");
      setRequirements("");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل إسناد الواجب." : "Failed to assign homework.");
    }
  };

  const handleDeleteHomework = async (hwId) => {
    if (!window.confirm(dir === "rtl" ? "هل أنت متأكد من حذف هذا الواجب؟" : "Are you sure you want to delete this homework assignment?")) return;
    try {
      await deleteHomeworkMutation.mutateAsync(hwId);
      toast.success(dir === "rtl" ? "تم حذف الواجب!" : "Homework assignment deleted!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل الحذف." : "Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 font-cairo">
          {dir === "rtl" ? "إدارة الواجبات الهندسية" : "Engineering Assignments Desk"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {dir === "rtl" ? "أرفق ملفات المخططات (CAD) والتعليمات الفنية مباشرة بالدروس." : "Configure homework sheets and CAD blueprints directly linked to curriculum nodes."}
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className={`${DARK_PANEL_CARD} p-6 text-center`}>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {dir === "rtl" ? "يرجى إنشاء بعض الدروس أولاً لتتمكن من ربط واجبات بها." : "Create lessons in the curriculum tree before attaching assignments."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Form */}
          <form onSubmit={handleAddHomework} className={`space-y-4 ${DARK_FORM_CARD}`}>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-cairo">
              {dir === "rtl" ? "إرفاق واجب جديد" : "New Homework Specification"}
            </h4>

            <div>
              <label className={DARK_FORM_LABEL}>
                {dir === "rtl" ? "اختر الدرس" : "Select Lesson"}
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className={DARK_FORM_INPUT_SM}
                required
              >
                <option value="">{dir === "rtl" ? "-- اختر الدرس --" : "-- Select Lesson --"}</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={DARK_FORM_LABEL}>
                {dir === "rtl" ? "عنوان الواجب" : "Assignment Title"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Column Reinforcement Layout"
                className={DARK_FORM_INPUT_SM}
                required
              />
            </div>

            <div>
              <label className={DARK_FORM_LABEL}>
                {dir === "rtl" ? "اسم ملف المخطط المرفق (DWG/PDF)" : "Attachment Name (e.g. CAD dwg)"}
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g., Column_detailing.dwg"
                className={DARK_FORM_INPUT_SM}
              />
            </div>

            <div>
              <label className={DARK_FORM_LABEL}>
                {dir === "rtl" ? "التعليمات والمتطلبات" : "Instructions & Specs"}
              </label>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe detailing requirements..."
                className={DARK_FORM_TEXTAREA}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={DARK_FORM_LABEL}>
                  {dir === "rtl" ? "النقاط القصوى" : "Max Points"}
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className={DARK_FORM_INPUT_SM}
                />
              </div>

              <div>
                <label className={DARK_FORM_LABEL}>
                  {dir === "rtl" ? "تاريخ الاستحقاق" : "Due Date"}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={DARK_FORM_INPUT_SM}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white py-2.5 text-xs font-bold shadow-md shadow-[#EE7C11]/15"
            >
              {isPending ? (dir === "rtl" ? "جاري الإضافة..." : "Adding...") : (dir === "rtl" ? "إضافة الواجب" : "Save Homework specs")}
            </button>
          </form>

          {/* List panel */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider font-cairo">
              {dir === "rtl" ? "قائمة الواجبات الحالية" : "Active Homework Backlog"}
            </h4>

            {!course.homeworks || course.homeworks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {dir === "rtl" ? "لم يتم تعريف واجبات بعد." : "No assignments bound to this course outline."}
              </p>
            ) : (
              course.homeworks.map(hw => {
                // Find associated lesson
                const hwLessonLink = hw.lessons?.[0]?.lesson;
                const associatedLessonTitle = hwLessonLink?.title || lessons.find(l => l.id === hw.lessonId)?.title || "Lesson Node";

                return (
                  <div key={hw.id} className={`${DARK_PANEL_CARD} relative group`}>
                    <button
                      onClick={() => handleDeleteHomework(hw.id)}
                      className="absolute top-4 end-4 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {hw.title}
                    </h5>
                    <p className="text-[10px] text-[#EE7C11] mt-0.5">
                      {associatedLessonTitle}
                    </p>
                    
                    {hw.attachments && Array.isArray(hw.attachments) && hw.attachments.length > 0 && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <FileCode className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{hw.attachments[0]}</span>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {hw.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Max: {hw.totalPoints} pts</span>
                      <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 4: Exam Factory Matrix ───
function ExamsTab({ course, createExam, updateExam, deleteExam, editingExamId, setEditingExamId, sync, dir }) {
  const editingExam = course.exams?.find(ex => ex.id === editingExamId) || null;

  const handleCreateExam = async () => {
    try {
      const newExam = {
        title: dir === "rtl" ? "اختبار جديد" : "New Midterm Assessment",
        description: "Standard quiz evaluation.",
        durationMinutes: 60,
        totalPoints: 100,
        passingScore: 60,
        attempts: 2,
        courseId: course.id,
        status: "AVAILABLE"
      };
      await createExam.mutateAsync(newExam);
      toast.success(dir === "rtl" ? "تم إنشاء نموذج اختبار فارغ!" : "New exam blueprint initialized!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل إنشاء الاختبار." : "Failed to build exam.");
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm(dir === "rtl" ? "هل أنت متأكد من حذف هذا الاختبار؟" : "Are you sure you want to delete this exam?")) return;
    try {
      await deleteExam.mutateAsync(examId);
      toast.success(dir === "rtl" ? "تم حذف الاختبار!" : "Exam deleted!");
      if (editingExamId === examId) setEditingExamId(null);
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل الحذف." : "Delete failed.");
    }
  };

  const handleSaveExamSpecs = async (examId, specs) => {
    try {
      await updateExam.mutateAsync({
        examId,
        body: specs
      });
      sync();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 font-cairo">
            {dir === "rtl" ? "مصنع الاختبارات والتقييم" : "Exam Factory Matrix"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {dir === "rtl" ? "قم بصياغة اختبارات ونماذج تقييم متعددة المحاولات." : "Author multi-attempt quiz banks and bind structural parameters."}
          </p>
        </div>

        {!editingExam && (
          <button
            onClick={handleCreateExam}
            className="flex items-center gap-1.5 rounded-lg bg-[#EE7C11] hover:bg-[#d9700e] text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-[#EE7C11]/15 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{dir === "rtl" ? "إنشاء اختبار" : "Build Exam"}</span>
          </button>
        )}
      </div>

      {!editingExam ? (
        <div className="space-y-3">
          {!course.exams || course.exams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center bg-white dark:bg-[#1E293B]">
              <p className="text-xs text-slate-400 font-semibold">
                {dir === "rtl" ? "لا توجد اختبارات مضافة بعد لهذه الدورة." : "No assessments linked to this course syllabus."}
              </p>
            </div>
          ) : (
            course.exams.map(ex => (
              <div 
                key={ex.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-[#1E293B]/20"
              >
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {ex.title}
                  </h4>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                    <span>{ex.durationMinutes} mins</span>
                    <span>•</span>
                    <span>{ex.questions?.length || 0} questions</span>
                    <span>•</span>
                    <span>Passing: {ex.passingScore} / {ex.totalPoints}</span>
                    <span>•</span>
                    <span>Attempts: {ex.attempts || 2}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => setEditingExamId(ex.id)}
                    className="rounded-lg bg-[#EE7C11]/10 hover:bg-[#EE7C11]/20 text-[#EE7C11] px-3.5 py-1.5 text-xs font-bold"
                  >
                    {dir === "rtl" ? "تعديل بنك الأسئلة" : "Edit Question Bank"}
                  </button>
                  <button
                    onClick={() => handleDeleteExam(ex.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Question Matrix Authoring Editor */
        <QuestionMatrixEditor 
          exam={editingExam} 
          onBack={() => setEditingExamId(null)} 
          onSaveSpecs={handleSaveExamSpecs} 
          sync={sync} 
          dir={dir} 
        />
      )}
    </div>
  );
}

// ─── Question matrix editor console ───
function QuestionMatrixEditor({ exam, onBack, onSaveSpecs, sync, dir }) {
  const addQuestionMutation = useAddInstructorExamQuestion(exam.id);
  const updateQuestionMutation = useUpdateInstructorExamQuestion(exam.id);
  const deleteQuestionMutation = useDeleteInstructorExamQuestion(exam.id);

  // Local state to prevent losing input focus during keystroke sync refetching
  const [localTitle, setLocalTitle] = useState(exam.title || "");
  const [localDuration, setLocalDuration] = useState(exam.durationMinutes || 60);
  const [localTotalPoints, setLocalTotalPoints] = useState(exam.totalPoints || 100);
  const [localPassing, setLocalPassing] = useState(exam.passingScore || 60);
  const [localAttempts, setLocalAttempts] = useState(exam.attempts || 2);
  const [isSavingSpecs, setIsSavingSpecs] = useState(false);

  // Sync with exam prop if changed from backend
  useEffect(() => {
    setLocalTitle(exam.title || "");
    setLocalDuration(exam.durationMinutes || 60);
    setLocalTotalPoints(exam.totalPoints || 100);
    setLocalPassing(exam.passingScore || 60);
    setLocalAttempts(exam.attempts || 2);
  }, [exam]);

  const handleSaveSpecs = async () => {
    setIsSavingSpecs(true);
    try {
      await onSaveSpecs(exam.id, {
        title: localTitle,
        durationMinutes: Number(localDuration) || 0,
        totalPoints: Number(localTotalPoints) || 0,
        passingScore: Number(localPassing) || 0,
        attempts: Number(localAttempts) || 2,
        description: exam.description,
      });
      toast.success(dir === "rtl" ? "تم حفظ معايير الاختبار بنجاح!" : "Exam blueprint updated successfully!");
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل حفظ معايير الاختبار." : "Failed to update exam blueprint.");
    } finally {
      setIsSavingSpecs(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      await addQuestionMutation.mutateAsync({
        questionText: "Write question parameter here...",
        type: "MULTIPLE_CHOICE",
        points: 10,
        order: (exam.questions?.length || 0) + 1,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A"
      });
      toast.success(dir === "rtl" ? "تمت إضافة السؤال!" : "Question added!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل إضافة السؤال." : "Failed to add question.");
    }
  };

  const handleUpdateQuestion = async (qId, fields) => {
    try {
      await updateQuestionMutation.mutateAsync({
        questionId: qId,
        body: fields
      });
      sync();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm(dir === "rtl" ? "هل أنت متأكد من حذف هذا السؤال؟" : "Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestionMutation.mutateAsync({ questionId: qId });
      toast.success(dir === "rtl" ? "تم حذف السؤال!" : "Question deleted!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل حذف السؤال." : "Delete failed.");
    }
  };

  return (
    <div className="space-y-6 border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-slate-50/30 dark:bg-[#1A1A22] relative animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="absolute top-4 end-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold font-cairo"
      >
        {dir === "rtl" ? "← العودة للاختبارات" : "← Back to list"}
      </button>

      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider font-cairo">
          {dir === "rtl" ? "تعديل معايير التقييم" : "Edit Assessment Blueprint"}
        </h4>

        <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
          <div>
            <label className={DARK_FORM_LABEL}>
              {dir === "rtl" ? "عنوان الاختبار" : "Exam Title"}
            </label>
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className={DARK_FORM_LABEL}>
                {dir === "rtl" ? "المدة (دقائق)" : "Duration"}
              </label>
              <input
                type="number"
                value={localDuration}
                onChange={(e) => setLocalDuration(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className={DARK_FORM_LABEL}>
                {dir === "rtl" ? "الدرجة الكلية" : "Total Points"}
              </label>
              <input
                type="number"
                value={localTotalPoints}
                onChange={(e) => setLocalTotalPoints(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className={DARK_FORM_LABEL}>
                {dir === "rtl" ? "نسبة النجاح" : "Passing"}
              </label>
              <input
                type="number"
                value={localPassing}
                onChange={(e) => setLocalPassing(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className={DARK_FORM_LABEL}>
                {dir === "rtl" ? "المحاولات" : "Attempts"}
              </label>
              <input
                type="number"
                value={localAttempts}
                onChange={(e) => setLocalAttempts(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Save Blueprint Specs Button */}
        <div className="flex justify-end max-w-xl">
          <button
            type="button"
            disabled={isSavingSpecs}
            onClick={handleSaveSpecs}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white px-4 py-2 text-xs font-bold transition-all shadow-md shadow-[#EE7C11]/15 disabled:opacity-50"
          >
            {isSavingSpecs ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{dir === "rtl" ? "حفظ معايير التقييم" : "Save Blueprint Specs"}</span>
          </button>
        </div>
      </div>

      {/* Questions list */}
      <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-cairo">
            {dir === "rtl" ? "أسئلة الاختبار" : "Question Bank"}
          </h4>
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-1.5 rounded-lg bg-[#EE7C11]/10 hover:bg-[#EE7C11]/20 text-[#EE7C11] px-3 py-1.5 text-[11px] font-bold transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{dir === "rtl" ? "إضافة سؤال" : "Add Question"}</span>
          </button>
        </div>

        {!exam.questions || exam.questions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            {dir === "rtl" ? "لم يتم إضافة أسئلة بعد." : "No questions in this test bank."}
          </p>
        ) : (
          <div className="space-y-4 max-w-xl">
            {exam.questions.map((q, idx) => (
              <QuestionRow 
                key={q.id} 
                question={q} 
                index={idx}
                onUpdate={(fields) => handleUpdateQuestion(q.id, fields)}
                onDelete={() => handleDeleteQuestion(q.id)}
                dir={dir}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Question Row editor ───
function QuestionRow({ question, index, onUpdate, onDelete, dir }) {
  // Ensure options exists
  const getInitialOptions = (q) => {
    return q.options && Array.isArray(q.options)
      ? q.options
      : q.type === "TRUE_FALSE" ? ["True", "False"] : ["Option A", "Option B", "Option C", "Option D"];
  };

  const [localQuestionText, setLocalQuestionText] = useState(question.questionText || "");
  const [localType, setLocalType] = useState(question.type || "MULTIPLE_CHOICE");
  const [localPoints, setLocalPoints] = useState(question.points || 0);
  const [localCorrectAnswer, setLocalCorrectAnswer] = useState(question.correctAnswer || "");
  const [localOptions, setLocalOptions] = useState(() => getInitialOptions(question));
  const [isSaving, setIsSaving] = useState(false);

  // Sync state if options change from backend sync refetches
  useEffect(() => {
    setLocalQuestionText(question.questionText || "");
    setLocalType(question.type || "MULTIPLE_CHOICE");
    setLocalPoints(question.points || 0);
    setLocalCorrectAnswer(question.correctAnswer || "");
    setLocalOptions(getInitialOptions(question));
  }, [question]);

  const handleTypeChange = (newType) => {
    setLocalType(newType);
    let newOptions = localOptions;
    let newCorrect = localCorrectAnswer;

    if (newType === "TRUE_FALSE") {
      newOptions = ["True", "False"];
      newCorrect = "True";
    } else if (newType === "MULTIPLE_CHOICE") {
      newOptions = ["Option A", "Option B", "Option C", "Option D"];
      newCorrect = "Option A";
    }

    setLocalOptions(newOptions);
    setLocalCorrectAnswer(newCorrect);
  };

  const handleOptionLocalChange = (optIdx, newText) => {
    const oldText = localOptions[optIdx];
    const isCorrect = localCorrectAnswer === oldText;

    setLocalOptions(prev => {
      const next = [...prev];
      next[optIdx] = newText;
      return next;
    });

    if (isCorrect) {
      setLocalCorrectAnswer(newText);
    }
  };

  const handleSetCorrectAnswer = (correctText) => {
    setLocalCorrectAnswer(correctText);
  };

  const handleAddOptionField = () => {
    if (localOptions.length >= 6) {
      toast.error(dir === "rtl" ? "الحد الأقصى هو 6 خيارات" : "Maximum is 6 options");
      return;
    }
    const nextLabel = String.fromCharCode(65 + localOptions.length); // E, F, etc.
    const updatedOptions = [...localOptions, `Option ${nextLabel}`];
    setLocalOptions(updatedOptions);
  };

  const handleRemoveOptionField = (optIdx) => {
    if (localOptions.length <= 2) {
      toast.error(dir === "rtl" ? "الحد الأدنى هو خيارين" : "Minimum is 2 options");
      return;
    }
    const removedText = localOptions[optIdx];
    const updatedOptions = localOptions.filter((_, i) => i !== optIdx);
    setLocalOptions(updatedOptions);
    
    // If we removed the correct answer, set correct answer to the first remaining option
    if (localCorrectAnswer === removedText) {
      setLocalCorrectAnswer(updatedOptions[0]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        questionText: localQuestionText,
        type: localType,
        points: Number(localPoints) || 0,
        options: localOptions,
        correctAnswer: localCorrectAnswer
      });
      toast.success(dir === "rtl" ? "تم حفظ السؤال بنجاح!" : "Question saved successfully!");
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل حفظ السؤال." : "Failed to save question.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${DARK_PANEL_CARD} relative shadow-sm space-y-4`}>
      <button
        onClick={onDelete}
        className="absolute top-4 end-4 text-slate-400 hover:text-rose-500 transition-colors"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Question Header & Input */}
      <div className="flex gap-2.5 items-start">
        <span className="bg-[#EE7C11] text-white text-[10px] font-bold px-2 py-0.5 rounded mt-1 shrink-0 font-sans">
          {index + 1}
        </span>
        <div className="w-full">
          <label className={DARK_FORM_LABEL}>
            {dir === "rtl" ? "صيغة السؤال" : "Question Text"}
          </label>
          <textarea
            rows={2}
            value={localQuestionText}
            onChange={(e) => setLocalQuestionText(e.target.value)}
            className={`${DARK_FORM_TEXTAREA} font-bold resize-none`}
            placeholder={dir === "rtl" ? "اكتب السؤال هنا..." : "Enter the question prompt..."}
          />
        </div>
      </div>

      {/* Question Properties */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={DARK_FORM_LABEL}>
            {dir === "rtl" ? "نوع السؤال" : "Question Type"}
          </label>
          <select
            value={localType}
            onChange={(e) => handleTypeChange(e.target.value)}
            className={`${DARK_FORM_INPUT_SM} h-9 text-[10px] font-bold`}
          >
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="TRUE_FALSE">True/False</option>
          </select>
        </div>

        <div>
          <label className={DARK_FORM_LABEL}>
            {dir === "rtl" ? "النقاط" : "Points"}
          </label>
          <input
            type="number"
            value={localPoints}
            onChange={(e) => setLocalPoints(e.target.value)}
            className={`${DARK_FORM_INPUT_SM} h-9 text-[10px] font-bold`}
            placeholder="Points"
          />
        </div>
      </div>

      {/* Question Choices Options Section */}
      <div className="border-t border-slate-100 dark:border-white/5 pt-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
            {dir === "rtl" ? "الخيارات والإجابة الصحيحة" : "Options & Correct Answer"}
            <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 block normal-case mt-0.5">
              {dir === "rtl" ? "(اضغط على الدائرة بجانب الخيار لتحديده كإجابة صحيحة)" : "(Click the circle next to an option to set it as correct)"}
            </span>
          </span>
          {localType === "MULTIPLE_CHOICE" && (
            <button
              type="button"
              onClick={handleAddOptionField}
              className="text-[9px] font-bold text-[#EE7C11] hover:underline"
            >
              {dir === "rtl" ? "+ إضافة خيار" : "+ Add Option"}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {localOptions.map((opt, optIdx) => {
            const isCorrect = localCorrectAnswer === opt;
            return (
              <div 
                key={optIdx} 
                className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                  isCorrect 
                    ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10" 
                    : "border-slate-200 bg-slate-50/50 dark:border-white/15 dark:bg-[#12121a]"
                }`}
              >
                {/* Radio button indication */}
                <button
                  type="button"
                  onClick={() => handleSetCorrectAnswer(opt)}
                  className={`h-5.5 w-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isCorrect 
                      ? "border-emerald-500 bg-emerald-500 text-white" 
                      : "border-slate-300 dark:border-white/30 hover:border-slate-400 dark:hover:border-white/50 bg-slate-50 dark:bg-slate-950"
                  }`}
                >
                  {isCorrect && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </button>

                {/* Input value */}
                <input
                  type="text"
                  value={opt}
                  disabled={localType === "TRUE_FALSE"}
                  onChange={(e) => handleOptionLocalChange(optIdx, e.target.value)}
                  className="flex-1 bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none border-none p-0 focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />

                {/* Remove button (only for MCQs with > 2 options) */}
                {localType === "MULTIPLE_CHOICE" && localOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOptionField(optIdx)}
                    className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-white/5">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white px-4 py-2 text-xs font-bold transition-all shadow-md shadow-[#EE7C11]/15 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{dir === "rtl" ? "حفظ السؤال" : "Save Question"}</span>
        </button>
      </div>
    </div>
  );
}

export default EditCourse;
