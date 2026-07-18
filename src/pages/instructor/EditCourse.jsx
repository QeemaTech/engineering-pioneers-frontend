import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, ArrowRight, BookOpen, ChevronRight, ChevronDown, Plus, 
  Trash2, FileText, Settings, Award, Layers, Loader2, Save, X, Eye, 
  HelpCircle, CheckSquare, PlusCircle, Play, AlertCircle, FileCode, ExternalLink
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
  useDeleteInstructorExam,
} from "../../features/instructor/exams/hooks";
import CreateExamModal from "./CreateExamModal";
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

  const deleteExamMutation = useDeleteInstructorExam();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return ["details", "curriculum", "homework", "exams"].includes(tab) ? tab : "details";
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [createExamScope, setCreateExamScope] = useState(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["details", "curriculum", "homework", "exams"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const setTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  const openCreateExam = (scope = {}) => setCreateExamScope(scope);
  const goToExam = (examId) => navigate(`/instructor/exams/${examId}`);

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
          { id: "curriculum", labelAr: "هيكل المنهج", labelEn: "Curriculum" },
          { id: "homework", labelAr: "الواجبات", labelEn: "Homework" },
          { id: "exams", labelAr: "التقييمات", labelEn: "Assessments" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
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
            deleteExam={deleteExamMutation}
            onEditExam={goToExam}
            onOpenCreateExam={openCreateExam}
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
            deleteExam={deleteExamMutation}
            sync={syncCourseCache}
            dir={dir}
            onOpenCreateExam={openCreateExam}
          />
        )}
      </div>

      {createExamScope !== null ? (
        <CreateExamModal
          courses={[course]}
          defaultCourseId={course.id}
          lockCourse
          initialScope={createExamScope.scopeType ? createExamScope : undefined}
          onClose={() => setCreateExamScope(null)}
          onCreated={(exam) => {
            setCreateExamScope(null);
            syncCourseCache();
            if (exam?.id) navigate(`/instructor/exams/${exam.id}`);
          }}
        />
      ) : null}

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

// ������ Tab 1: Course Details ������
const LEVELS = [
  { value: "GENERAL", labelAr: "عام / عمومي", labelEn: "General / Public" },
  { value: "PREPARATORY", labelAr: "إعدادي هندسة", labelEn: "Preparatory Year" },
  { value: "FIRST_YEAR", labelAr: "الفرقة الأولى", labelEn: "First Year" },
  { value: "SECOND_YEAR", labelAr: "الفرقة الثانية", labelEn: "Second Year" },
  { value: "THIRD_YEAR", labelAr: "الفرقة الثالثة", labelEn: "Third Year" },
  { value: "FOURTH_YEAR", labelAr: "الفرقة الرابعة / التخرج", labelEn: "Fourth Year" },
  { value: "GRADUATE", labelAr: "خريج / محترف", labelEn: "Graduate / Professional" },
];

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
    targetLevels: course.targetLevels || [],
    pricingTiers: course.pricingTiers || [],
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
          targetLevels: form.targetLevels,
          pricingTiers: form.pricingTiers,
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
              <option value="">{dir === "rtl" ? "بدون تصنيف" : "No Category"}</option>
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

        {/* Target Academic Years/Levels */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-2 font-cairo">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            {dir === "rtl" ? "السنوات الدراسية المستهدفة" : "Target Academic Levels"}
          </span>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-[#0F0F13] p-4 border border-slate-100 dark:border-white/5">
            {LEVELS.map((lvl) => (
              <label key={lvl.value} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(form.targetLevels || []).includes(lvl.value)}
                  onChange={() => {
                    const current = form.targetLevels || [];
                    const updated = current.includes(lvl.value)
                      ? current.filter((v) => v !== lvl.value)
                      : [...current, lvl.value];
                    set("targetLevels", updated);
                  }}
                  className="rounded text-pioneer-orange-normal focus:ring-pioneer-orange-normal/30 h-4 w-4"
                />
                <span>{dir === "rtl" ? lvl.labelAr : lvl.labelEn}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pricing Tiers Section */}
        <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-4 font-cairo">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {dir === "rtl" ? "خيارات التسعير ومدد الاشتراك" : "Pricing Tiers & Subscription Durations"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const newTiers = [
                    ...(form.pricingTiers || []),
                    { name: "6 Months", nameAr: "٦ أشهر", price: 0, durationDays: 180, isActive: true }
                  ];
                  set("pricingTiers", newTiers);
                }}
                className="inline-flex items-center gap-1 rounded bg-[#EE7C11]/10 border border-[#EE7C11]/30 px-2 py-0.5 text-[10px] font-bold text-[#EE7C11] hover:bg-[#EE7C11]/20 transition"
              >
                + ٦ أشهر
              </button>
              <button
                type="button"
                onClick={() => {
                  const newTiers = [
                    ...(form.pricingTiers || []),
                    { name: "1 Year", nameAr: "سنة واحدة", price: 0, durationDays: 365, isActive: true }
                  ];
                  set("pricingTiers", newTiers);
                }}
                className="inline-flex items-center gap-1 rounded bg-[#EE7C11]/10 border border-[#EE7C11]/30 px-2 py-0.5 text-[10px] font-bold text-[#EE7C11] hover:bg-[#EE7C11]/20 transition"
              >
                + سنة
              </button>
              <button
                type="button"
                onClick={() => {
                  const newTiers = [
                    ...(form.pricingTiers || []),
                    { name: "Lifetime", nameAr: "مدى الحياة", price: 0, durationDays: null, isActive: true }
                  ];
                  set("pricingTiers", newTiers);
                }}
                className="inline-flex items-center gap-1 rounded bg-[#EE7C11]/10 border border-[#EE7C11]/30 px-2 py-0.5 text-[10px] font-bold text-[#EE7C11] hover:bg-[#EE7C11]/20 transition"
              >
                + مدى الحياة
              </button>
              <button
                type="button"
                onClick={() => {
                  const newTiers = [
                    ...(form.pricingTiers || []),
                    { name: "Custom", nameAr: "فترة مخصصة", price: 0, durationDays: 120, isActive: true }
                  ];
                  set("pricingTiers", newTiers);
                }}
                className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 text-[10px] font-bold transition dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              >
                + تخصيص فترة
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {(form.pricingTiers || []).map((tier, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 relative">
                <label className="block space-y-1 md:col-span-1">
                  <span className="text-[9px] font-bold text-slate-400">{dir === "rtl" ? "الاسم (EN)" : "Name (EN)"}</span>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => {
                      const newTiers = [...form.pricingTiers];
                      newTiers[idx].name = e.target.value;
                      set("pricingTiers", newTiers);
                    }}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </label>
                <label className="block space-y-1 md:col-span-1">
                  <span className="text-[9px] font-bold text-slate-400">{dir === "rtl" ? "الاسم (AR)" : "Name (AR)"}</span>
                  <input
                    type="text"
                    value={tier.nameAr}
                    onChange={(e) => {
                      const newTiers = [...form.pricingTiers];
                      newTiers[idx].nameAr = e.target.value;
                      set("pricingTiers", newTiers);
                    }}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </label>
                <label className="block space-y-1 md:col-span-1">
                  <span className="text-[9px] font-bold text-slate-400">{dir === "rtl" ? "السعر (جنيه)" : "Price (EGP)"}</span>
                  <input
                    type="number"
                    min={0}
                    value={tier.price}
                    onChange={(e) => {
                      const newTiers = [...form.pricingTiers];
                      newTiers[idx].price = Number(e.target.value) || 0;
                      set("pricingTiers", newTiers);
                    }}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </label>
                <label className="block space-y-1 md:col-span-1">
                  <span className="text-[9px] font-bold text-slate-400">{dir === "rtl" ? "المدة (أيام)" : "Duration (days)"}</span>
                  <input
                    type="number"
                    min={1}
                    value={tier.durationDays || ""}
                    placeholder="مثلاً 120"
                    onChange={(e) => {
                      const newTiers = [...form.pricingTiers];
                      newTiers[idx].durationDays = e.target.value ? Number(e.target.value) : null;
                      set("pricingTiers", newTiers);
                    }}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </label>
                <div className="flex items-end justify-end pb-1 md:col-span-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newTiers = (form.pricingTiers || []).filter((_, i) => i !== idx);
                      set("pricingTiers", newTiers);
                    }}
                    className="rounded bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 text-[10px] font-bold transition"
                  >
                    {dir === "rtl" ? "حذف" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
            {(form.pricingTiers || []).length === 0 && (
              <p className="text-[11px] italic text-slate-400 text-center py-2">
                {dir === "rtl"
                  ? "لا يوجد خيارات تسعير إضافية محددة. سيتم اعتماد خيار الشراء مدى الحياة فقط كخيار افتراضي."
                  : "No additional pricing tiers defined. Lifetime purchase will be the default option."}
              </p>
            )}
          </div>
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

// ������ Tab 2: Curriculum Tree ������
function CurriculumTab({ 
  course, 
  createUnit, updateUnit, deleteUnit,
  createSection, updateSection, deleteSection,
  createLesson, updateLesson, deleteLesson,
  deleteExam, onEditExam, onOpenCreateExam,
  sync, dir 
}) {
  const [expandedUnits, setExpandedUnits] = useState({});

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
      toast.success(dir === "rtl" ? "Lesson details updated!" : "Lesson details updated!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "Failed to update lesson details." : "Failed to update lesson details.");
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
          {dir === "rtl" ? "Curriculum Construction Tree" : "Curriculum Construction Tree"}
        </h3>
        <button
          onClick={handleAddUnit}
          className="flex items-center gap-1.5 rounded-lg bg-[#EE7C11]/10 hover:bg-[#EE7C11]/20 text-[#EE7C11] px-3.5 py-2 text-xs font-bold transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{dir === "rtl" ? "Add Unit Module" : "Add Unit Module"}</span>
        </button>
      </div>

      {!course.units || course.units.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 p-12 text-center bg-white dark:bg-[#1E293B]">
          <Layers className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-xs text-slate-400 font-semibold">
            {dir === "rtl" ? "No curriculum units created yet. Click Add Unit Module to begin building." : "No curriculum units created yet. Click Add Unit Module to begin building."}
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
                      title={dir === "rtl" ? "Add Section" : "Add Section"}
                      className="p-1.5 text-[#EE7C11] hover:bg-[#EE7C11]/10 rounded-lg shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onOpenCreateExam({ scopeType: "unit", unitId: unit.id })}
                      title={dir === "rtl" ? "Add Unit Exam" : "Add Unit Exam"}
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
                        {dir === "rtl" ? "No sections inside this module yet." : "No sections inside this module yet."}
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
                                {dir === "rtl" ? "No lessons in this section yet." : "No lessons in this section yet."}
                              </p>
                            ) : (
                              sec.lessons.map((les) => (
                                <LessonRow 
                                  key={les.id} 
                                  lesson={les} 
                                  lessonExams={course.exams?.filter(ex => ex.lessonId === les.id) || []}
                                  onAddQuiz={() => onOpenCreateExam({ scopeType: "lesson", lessonId: les.id })}
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
                          {dir === "rtl" ? "Unit Exams & Assessments" : "Unit Exams & Assessments"}
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

// ������ Lesson Row helper ������
function LessonRow({ lesson, lessonExams, onAddQuiz, onEditExam, onDeleteExam, onBlurTitle, onUpdateSpecs, onDelete, dir }) {
  const [showEditPanel, setShowEditPanel] = useState(false);
  
  // Local state for specs editing
  const [localIsLive, setLocalIsLive] = useState(lesson.isLive === true);
  const [localIsPreview, setLocalIsPreview] = useState(lesson.isPreview === true);
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
    setLocalIsPreview(lesson.isPreview === true);
    setLocalVideoUrl(lesson.videoUrl || "");
    setLocalMeetingUrl(lesson.meetingUrl || "");
    setLocalDurationMins(lesson.durationSeconds ? Math.round(lesson.durationSeconds / 60) : 30);
    setLocalAvailableAt(formatDateTimeLocal(lesson.availableAt));
  }, [lesson]);

  const handleSave = () => {
    const specs = {
      isLive: localIsLive,
      isPreview: localIsPreview,
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
    ? (isSetup ? (dir === "rtl" ? "Live Ready" : "Live Ready") : (dir === "rtl" ? "+ Live Session" : "+ Live Session"))
    : (isSetup ? (dir === "rtl" ? "Pre-recorded" : "Pre-recorded") : (dir === "rtl" ? "+ Video" : "+ Video"));

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
          {lesson.isPreview && (
            <span className="shrink-0 rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
              {dir === "rtl" ? "معاينة مجانية" : "Free Preview"}
            </span>
          )}
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
              {dir === "rtl" ? "Lesson Type" : "Lesson Type"}
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
                {dir === "rtl" ? "Recorded" : "Recorded"}
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
                {dir === "rtl" ? "Live Session" : "Live Session"}
              </button>
            </div>
          </div>

          {/* Free Preview Toggle */}
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 dark:border-white/5 pt-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider font-cairo">
              {dir === "rtl" ? "إتاحة كمعاينة مجانية" : "Free Preview Access"}
            </span>
            <label className="flex items-center gap-2 cursor-pointer font-cairo">
              <input
                type="checkbox"
                checked={localIsPreview}
                onChange={(e) => setLocalIsPreview(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 text-[#EE7C11] focus:ring-[#EE7C11]"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {dir === "rtl" ? "تفعيل المعاينة المجانية للدرس" : "Allow students to view without enrolling"}
              </span>
            </label>
          </div>

          {!localIsLive ? (
            /* Recorded Video Settings */
            <div className="grid gap-2">
              <div>
                <label className={DARK_FORM_LABEL}>
                  {dir === "rtl" ? "Video URL" : "Video URL"}
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
                  {dir === "rtl" ? "Video Duration (Minutes)" : "Video Duration (Minutes)"}
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
                  {dir === "rtl" ? "Meeting Link (Zoom / Meet)" : "Meeting Link (Zoom / Meet)"}
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
                    {dir === "rtl" ? "Start Time" : "Start Time"}
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
                    {dir === "rtl" ? "Duration (Mins)" : "Duration (Mins)"}
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
              {dir === "rtl" ? "Cancel" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg bg-[#EE7C11] hover:bg-[#d9700e] text-white text-[10px] font-bold"
            >
              {dir === "rtl" ? "Save Details" : "Save Details"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ������ Tab 3: Assignments Desk ������
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
    if (!window.confirm(dir === "rtl" ? "Are you sure you want to delete this homework assignment?" : "Are you sure you want to delete this homework assignment?")) return;
    try {
      await deleteHomeworkMutation.mutateAsync(hwId);
      toast.success(dir === "rtl" ? "Homework assignment deleted!" : "Homework assignment deleted!");
      sync();
    } catch (err) {
      toast.error(dir === "rtl" ? "فشل الحذف." : "Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-xs text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
        {dir === "rtl"
          ? "إنشاء الواجبات من هنا. لتصحيح تسليمات الطلاب، افتح «تصحيح الواجبات» من القائمة الجانبية."
          : "Create homework here. To grade student submissions, use Homework Grading in the sidebar."}
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 font-cairo">
          {dir === "rtl" ? "الواجبات" : "Homework"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {dir === "rtl"
            ? "اربط واجبات بالدروس — نص أو ملف مرفق."
            : "Link assignments to lessons — text or file attachment."}
        </p>
      </div>

      {lessons.length === 0 ? (
        <div className={`${DARK_PANEL_CARD} p-6 text-center`}>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {dir === "rtl"
              ? "أنشئ دروساً في تاب المنهج أولاً لربط الواجبات بها."
              : "Create lessons in the Curriculum tab before attaching assignments."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Form */}
          <form onSubmit={handleAddHomework} className={`space-y-4 ${DARK_FORM_CARD}`}>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-cairo">
              {dir === "rtl" ? "New Homework Specification" : "New Homework Specification"}
            </h4>

            <div>
              <label className={DARK_FORM_LABEL}>
                {dir === "rtl" ? "Select Lesson" : "Select Lesson"}
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className={DARK_FORM_INPUT_SM}
                required
              >
                <option value="">{dir === "rtl" ? "-- Select Lesson --" : "-- Select Lesson --"}</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={DARK_FORM_LABEL}>
                {dir === "rtl" ? "Assignment Title" : "Assignment Title"}
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
                {dir === "rtl" ? "Attachment Name (e.g. CAD dwg)" : "Attachment Name (e.g. CAD dwg)"}
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
                {dir === "rtl" ? "Instructions & Specs" : "Instructions & Specs"}
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
                  {dir === "rtl" ? "Max Points" : "Max Points"}
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
                  {dir === "rtl" ? "Due Date" : "Due Date"}
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
              {isPending ? (dir === "rtl" ? "Adding..." : "Adding...") : (dir === "rtl" ? "Save Homework specs" : "Save Homework specs")}
            </button>
          </form>

          {/* List panel */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider font-cairo">
              {dir === "rtl" ? "Active Homework Backlog" : "Active Homework Backlog"}
            </h4>

            {!course.homeworks || course.homeworks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                {dir === "rtl" ? "No assignments bound to this course outline." : "No assignments bound to this course outline."}
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


// --- Tab 4: Assessments ---
function ExamsTab({ course, deleteExam, sync, dir, onOpenCreateExam }) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 font-cairo">
            {dir === "rtl" ? "التقييمات والاختبارات" : "Course Assessments"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {dir === "rtl"
              ? "أنشئ اختبارات وعدّل الأسئلة من صفحة الاختبار الموحدة (أسئلة + تسليمات)."
              : "Create exams and manage questions on the unified exam page (questions + submissions)."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenCreateExam({})}
          className="flex items-center gap-1.5 rounded-lg bg-[#EE7C11] hover:bg-[#d9700e] text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-[#EE7C11]/15 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>{dir === "rtl" ? "إنشاء اختبار" : "Create exam"}</span>
        </button>
      </div>

      {!course.exams?.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center bg-white dark:bg-[#1A1A22]">
          <Award className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-xs text-slate-500 font-semibold">
            {dir === "rtl" ? "لا توجد تقييمات مرتبطة بهذا الكورس بعد." : "No assessments linked to this course yet."}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            {dir === "rtl" ? "اضغط «إنشاء اختبار» لبدء بنك الأسئلة." : "Click Create exam to start building your question bank."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {course.exams.map((ex) => (
            <div
              key={ex.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-[#1A1A22]"
            >
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{ex.title}</h4>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                  <span>{ex.durationMinutes} {dir === "rtl" ? "د" : "min"}</span>
                  <span>"</span>
                  <span>{ex.questions?.length || 0} {dir === "rtl" ? "أسئلة" : "questions"}</span>
                  <span>"</span>
                  <span>{dir === "rtl" ? "النجاح" : "Pass"}: {ex.passingScore}/{ex.totalPoints}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  to={`/instructor/exams/${ex.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#EE7C11]/10 hover:bg-[#EE7C11]/20 text-[#EE7C11] px-3.5 py-1.5 text-xs font-bold"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {dir === "rtl" ? "فتح الاختبار" : "Open exam"}
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteExam(ex.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EditCourse;
