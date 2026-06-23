import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowRight, ArrowLeft, Info, HelpCircle, Layers, CheckCircle2, ChevronRight, Sparkles 
} from "lucide-react";
import { useAdminCategories } from "../../features/admin/categories/hooks";
import { useCreateInstructorCourse, useSubmitInstructorCourseForReview } from "../../features/instructor/courses/hooks";
import toast from "react-hot-toast";

function CreateCourse() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const navigate = useNavigate();

  const { data: categoryData } = useAdminCategories({ page: 1, limit: 100 });
  const createCourseMutation = useCreateInstructorCourse();
  const submitForReviewMutation = useSubmitInstructorCourseForReview();

  const categories = categoryData?.categories || [];

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    introVideoUrl: "",
    categoryId: "",
    type: "RECORDED",
    price: 199,
    isLifetimePurchasable: true,
  });

  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 1) {
      if (!form.title.trim()) {
        errs.title = dir === "rtl" ? "عنوان الكورس مطلوب" : "Course title is required";
      } else if (form.title.trim().length < 3) {
        errs.title = dir === "rtl" ? "يجب أن يكون العنوان 3 أحرف على الأقل" : "Title must be at least 3 characters";
      }
      if (!form.categoryId) {
        errs.categoryId = dir === "rtl" ? "يرجى اختيار تصنيف" : "Please select a category";
      }
    }
    if (s === 2) {
      if (form.price === "" || form.price < 0) {
        errs.price = dir === "rtl" ? "السعر يجب أن يكون رقماً غير سالب" : "Price must be a non-negative number";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = async (submitImmediatelyForReview) => {
    if (!validateStep(1) || !validateStep(2)) {
      setStep(1);
      return;
    }

    try {
      const course = await createCourseMutation.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        thumbnail: form.thumbnail.trim() || undefined,
        introVideoUrl: form.introVideoUrl.trim() || undefined,
        categoryId: form.categoryId || undefined,
        type: form.type,
        price: Number(form.price),
        isLifetimePurchasable: form.isLifetimePurchasable,
      });

      if (!course?.id) throw new Error("Missing created course ID");

      if (submitImmediatelyForReview) {
        await submitForReviewMutation.mutateAsync(course.id);
        toast.success(
          dir === "rtl" 
            ? "تم إنشاء الكورس وتقديمه للمراجعة بنجاح!" 
            : "Course created and submitted for review successfully!"
        );
      } else {
        toast.success(
          dir === "rtl" 
            ? "تم إنشاء مسودة الكورس بنجاح!" 
            : "Course draft created successfully!"
        );
      }

      navigate(`/instructor/courses/${course.id}/edit?tab=curriculum`);
    } catch (err) {
      console.error(err);
      toast.error(
        dir === "rtl" 
          ? "فشل إنشاء الكورس. يرجى التحقق من المدخلات." 
          : "Failed to create course. Please review fields."
      );
    }
  };

  const inputClass = (hasError) => 
    `h-12 w-full rounded-xl border px-4 text-xs font-semibold outline-none transition-all ${
      hasError 
        ? "border-red-500 bg-red-500/5 focus:border-red-500 dark:border-red-500/30" 
        : "border-slate-200 bg-white focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F172A] dark:text-white"
    }`;

  const labelClass = "block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2";

  return (
    <div className="max-w-2xl mx-auto space-y-8 antialiased font-sans pb-20 pt-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-cairo">
          {dir === "rtl" ? "إضافة كورس جديد" : "Create New Course Blueprint"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {dir === "rtl" 
            ? "خطط لمحتوى كورس احترافي، حدد السعر والنوع ثم ابدأ بصياغة المنهج." 
            : "Set basic parameters, configure price details, and build your curriculum tree."}
        </p>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="flex items-center justify-between border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E293B] p-4 rounded-2xl shadow-xs">
        {[
          { number: 1, titleAr: "معلومات الكورس", titleEn: "Course Info" },
          { number: 2, titleAr: "التسعير والنوع", titleEn: "Pricing & Type" },
          { number: 3, titleAr: "المراجعة والنشر", titleEn: "Review & Save" }
        ].map((s, idx) => (
          <div key={s.number} className="flex items-center flex-1 last:flex-initial">
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                step >= s.number 
                  ? "bg-[#EE7C11] text-white shadow-md shadow-[#EE7C11]/15" 
                  : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500"
              }`}>
                {s.number}
              </div>
              <span className={`text-xs font-bold font-cairo shrink-0 ${
                step === s.number 
                  ? "text-[#EE7C11]" 
                  : "text-slate-400 dark:text-slate-500"
              }`}>
                {dir === "rtl" ? s.titleAr : s.titleEn}
              </span>
            </div>
            {idx < 2 && (
              <div className={`h-[2px] mx-4 flex-1 transition-all ${
                step > s.number ? "bg-[#EE7C11]" : "bg-slate-200 dark:bg-white/5"
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Course Info */}
      {step === 1 && (
        <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1E293B]">
          <label className="block">
            <span className={labelClass}>
              {dir === "rtl" ? "عنوان الكورس" : "Course Title"} <span className="text-red-500">*</span>
            </span>
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={dir === "rtl" ? "مثال: تصميم المنشآت الخرسانية المتقدم" : "e.g., Advanced Concrete Design"}
              className={inputClass(errors.title)}
            />
            {errors.title && (
              <p className="text-[10px] font-bold text-red-500 mt-1.5">{errors.title}</p>
            )}
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>
                {dir === "rtl" ? "تصنيف الكورس" : "Category"} <span className="text-red-500">*</span>
              </span>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={inputClass(errors.categoryId)}
              >
                <option value="">{dir === "rtl" ? "-- اختر التصنيف --" : "-- Select Category --"}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-[10px] font-bold text-red-500 mt-1.5">{errors.categoryId}</p>
              )}
            </label>

            <label className="block">
              <span className={labelClass}>
                {dir === "rtl" ? "رابط الصورة المصغرة" : "Thumbnail URL"}
              </span>
              <input
                value={form.thumbnail}
                onChange={(e) => set("thumbnail", e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className={inputClass(errors.thumbnail)}
              />
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>{dir === "rtl" ? "الوصف" : "Course Description"}</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={dir === "rtl" ? "أدخل ملخص وأهداف المنهج الدراسي..." : "Detail the course goals and learning outcomes..."}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition-all focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F172A] dark:text-white"
            />
          </label>

          <label className="block">
            <span className={labelClass}>{dir === "rtl" ? "فيديو مقدمة الكورس (URL)" : "Intro Video URL"}</span>
            <input
              value={form.introVideoUrl}
              onChange={(e) => set("introVideoUrl", e.target.value)}
              placeholder="https://example.com/intro.mp4"
              className={inputClass(errors.introVideoUrl)}
            />
          </label>
        </div>
      )}

      {/* Step 2: Format & Pricing */}
      {step === 2 && (
        <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1E293B]">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <span className={labelClass}>
                {dir === "rtl" ? "نوع الكورس" : "Course Type"}
              </span>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => set("type", "RECORDED")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    form.type === "RECORDED"
                      ? "border-[#EE7C11] bg-[#EE7C11]/5 text-[#EE7C11]"
                      : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold font-cairo">
                    {dir === "rtl" ? "مسجل" : "Recorded"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {dir === "rtl" ? "محاضرات فيديو مسجلة" : "Self-paced video modules"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => set("type", "HYBRID")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    form.type === "HYBRID"
                      ? "border-[#EE7C11] bg-[#EE7C11]/5 text-[#EE7C11]"
                      : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold font-cairo">
                    {dir === "rtl" ? "هجين / مباشر" : "Hybrid / Live"}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {dir === "rtl" ? "دروس مباشرة ومسجلة" : "Live sessions & videos"}
                  </span>
                </button>
              </div>
            </div>

            <label className="block">
              <span className={labelClass}>
                {dir === "rtl" ? "سعر الشراء المباشر ($)" : "Direct Purchase Price ($)"}
              </span>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set("price", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="199"
                className={inputClass(errors.price)}
              />
              {errors.price && (
                <p className="text-[10px] font-bold text-red-500 mt-1.5">{errors.price}</p>
              )}
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
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-cairo">
                  {dir === "rtl" ? "إتاحة الشراء مدى الحياة" : "Enable lifetime purchase"}
                </span>
                <p className="text-[10px] text-slate-400">
                  {dir === "rtl" 
                    ? "السماح للطلاب بشراء الكورس بشكل مستقل للاحتفاظ بالمحتوى مدى الحياة." 
                    : "Allow students to bypass subscriptions and own the course syllabus permanently."}
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Review & Publish */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Information Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1E293B] space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {dir === "rtl" ? "مراجعة تفاصيل المخطط" : "Review course parameters"}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">{dir === "rtl" ? "العنوان" : "Title"}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{form.title}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{dir === "rtl" ? "التصنيف" : "Category"}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {categories.find((c) => c.id === form.categoryId)?.name || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{dir === "rtl" ? "النوع" : "Type"}</span>
                <span className="font-bold text-[#EE7C11]">
                  {form.type === "HYBRID" ? (dir === "rtl" ? "هجين" : "HYBRID") : (dir === "rtl" ? "مسجل" : "RECORDED")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">{dir === "rtl" ? "السعر" : "Price"}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">${form.price}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block font-semibold">{dir === "rtl" ? "الوصف" : "Description"}</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  {form.description || (dir === "rtl" ? "لا يوجد وصف حالياً." : "No description provided.")}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Notice Alert */}
          <div className="flex items-start gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900 dark:text-blue-200 font-cairo">
                {dir === "rtl" ? "ما هي الخطوة التالية؟" : "What is next?"}
              </p>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                {dir === "rtl" 
                  ? "بعد حفظ الكورس، سيتم توجيهك إلى لوحة إدارة الكورس لإضافة الوحدات، الدروس، الواجبات والامتحانات." 
                  : "After creating the course, you will be taken to the Curriculum Console to construct units, sections, lessons, homework, and quiz assessment parameters."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white px-5 py-2.5 text-xs font-bold transition-all"
          >
            {dir === "rtl" ? (
              <>
                <ChevronRight className="h-4 w-4" />
                <span>السابق</span>
              </>
            ) : (
              <>
                <ArrowLeft className="h-4 w-4" />
                <span>Previous</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/instructor/courses")}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white px-5 py-2.5 text-xs font-bold transition-all"
          >
            {dir === "rtl" ? "إلغاء" : "Cancel"}
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white px-6 py-2.5 text-xs font-bold shadow-lg shadow-[#EE7C11]/15 transition-all"
          >
            <span>{dir === "rtl" ? "التالي" : "Next Step"}</span>
            {dir === "rtl" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              disabled={createCourseMutation.isPending}
              onClick={() => onSubmit(false)}
              className="rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white px-5 py-2.5 text-xs font-bold"
            >
              {createCourseMutation.isPending 
                ? (dir === "rtl" ? "جاري الحفظ..." : "Saving...") 
                : (dir === "rtl" ? "حفظ كمسودة" : "Save as Draft")}
            </button>
            <button
              type="button"
              disabled={createCourseMutation.isPending || submitForReviewMutation.isPending}
              onClick={() => onSubmit(true)}
              className="flex items-center gap-2 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white px-6 py-2.5 text-xs font-bold shadow-lg shadow-[#EE7C11]/15"
            >
              <Layers className="h-4 w-4" />
              <span>
                {createCourseMutation.isPending || submitForReviewMutation.isPending
                  ? (dir === "rtl" ? "جاري التقديم..." : "Submitting...")
                  : (dir === "rtl" ? "إنشاء وتقديم للمراجعة" : "Create & Submit for Review")}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateCourse;
