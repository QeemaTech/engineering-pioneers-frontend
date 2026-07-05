import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import { useAdminCategories } from "../../features/admin/categories/hooks";
import { useAdminInstructors } from "../../features/admin/instructors/hooks";
import { useCreateAdminCourse } from "../../features/admin/courses/hooks";
import { getErrorMessage } from "../../api/error";

function AddCourse() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const createCourseMutation = useCreateAdminCourse();
  const { data: categoryData } = useAdminCategories({ page: 1, limit: 100 });
  const { data: instructorData } = useAdminInstructors({ page: 1, limit: 100 });
  const categories = categoryData?.categories || [];
  const instructors = instructorData?.instructors || [];

  const [form, setForm] = useState({
    title: "",
    description: "",
    thumbnail: "",
    introVideoUrl: "",
    instructorId: "",
    categoryId: "",
    type: "RECORDED",
    price: "",
    isLifetimePurchasable: true,
    isActive: false,
  });
  const [selectedLevels, setSelectedLevels] = useState(["GENERAL"]);
  const [pricingTiers, setPricingTiers] = useState([]);
  const isRtl = i18n.language?.startsWith("ar");

  const LEVELS = [
    { value: "GENERAL", labelAr: "عام / عمومي", labelEn: "General / Public" },
    { value: "PREPARATORY", labelAr: "إعدادي هندسة", labelEn: "Preparatory Year" },
    { value: "FIRST_YEAR", labelAr: "الفرقة الأولى", labelEn: "First Year" },
    { value: "SECOND_YEAR", labelAr: "الفرقة الثانية", labelEn: "Second Year" },
    { value: "THIRD_YEAR", labelAr: "الفرقة الثالثة", labelEn: "Third Year" },
    { value: "FOURTH_YEAR", labelAr: "الفرقة الرابعة / التخرج", labelEn: "Fourth Year" },
    { value: "GRADUATE", labelAr: "خريج / محترف", labelEn: "Graduate / Professional" },
  ];

  const [submitError, setSubmitError] = useState("");
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleLevelToggle = (lvl) => {
    if (selectedLevels.includes(lvl)) {
      setSelectedLevels(selectedLevels.filter((l) => l !== lvl));
    } else {
      setSelectedLevels([...selectedLevels, lvl]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    try {
      if (!form.title.trim()) throw new Error(t("adminPages.addCourse.titleRequired"));
      if (!form.instructorId) throw new Error(t("adminPages.addCourse.instructorRequired"));

      const price = form.price === "" ? 0 : Number(form.price);
      if (Number.isNaN(price) || price < 0) {
        throw new Error(t("adminPages.addCourse.priceInvalid", { defaultValue: "Enter a valid price." }));
      }

      const course = await createCourseMutation.mutateAsync({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        thumbnail: form.thumbnail.trim() || undefined,
        introVideoUrl: form.introVideoUrl.trim() || undefined,
        instructorId: form.instructorId,
        categoryId: form.categoryId || undefined,
        type: form.type,
        price,
        isLifetimePurchasable: form.isLifetimePurchasable,
        isActive: form.isActive,
        targetLevels: selectedLevels.length > 0 ? selectedLevels : ["GENERAL"],
        pricingTiers,
      });
      if (!course?.id) throw new Error(t("adminPages.addCourse.missingId"));
      navigate(`/admin/courses/${course.id}/edit`);
    } catch (error) {
      setSubmitError(getErrorMessage(error, t("adminPages.addCourse.createFailed")));
    }
  };

  const inputClass =
    "h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#EE7C11]/50 focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";

  return (
    <section className="mx-auto max-w-2xl space-y-8 py-4">
      <PageHeader
        title={t("adminPages.addCourse.title", { defaultValue: "Create New Course" })}
        subtitle={t("adminPages.addCourse.subtitle", {
          defaultValue: "Set the basics, then build your full curriculum in the studio.",
        })}
      />

      <div className="flex items-start gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
            {t("adminPages.addCourse.quickStartTitle")}
          </p>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            {t("adminPages.addCourse.quickStartBody")}{" "}
            <strong>{t("adminPages.addCourse.courseStudio")}</strong>
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("adminPages.addCourse.titleField")} <span className="text-[#EE7C11]">*</span>
            </span>
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={t("adminPages.addCourse.titlePlaceholder")}
              className={inputClass}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("adminPages.addCourse.description")}</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={t("adminPages.addCourse.descriptionPlaceholder")}
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#EE7C11]/50 focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t("adminPages.addCourse.instructor")} <span className="text-[#EE7C11]">*</span>
              </span>
              <select
                required
                value={form.instructorId}
                onChange={(e) => set("instructorId", e.target.value)}
                className={inputClass}
              >
                <option value="">{t("dashboard.admin.courses.selectInstructor")}</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.fullName || i.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("adminPages.addCourse.category")}</span>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={inputClass}
              >
                <option value="">{t("adminPages.courseEditor.empty.noCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t("adminPages.addCourse.courseType", { defaultValue: "Course type" })}
              </span>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className={inputClass}
              >
                <option value="RECORDED">{t("adminPages.addCourse.typeRecorded", { defaultValue: "Recorded" })}</option>
                <option value="HYBRID">{t("adminPages.addCourse.typeHybrid", { defaultValue: "Hybrid (live + recorded)" })}</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t("adminPages.addCourse.price", { defaultValue: "Lifetime purchase price" })}
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex items-center gap-2 pt-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.isLifetimePurchasable}
                onChange={(e) => set("isLifetimePurchasable", e.target.checked)}
                className="rounded"
              />
              {t("adminPages.addCourse.lifetimePurchasable", { defaultValue: "Allow lifetime purchase" })}
            </label>
          </div>

          {/* Academic target levels */}
          <div className="space-y-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isRtl ? "السنوات الدراسية المستهدفة" : "Target Academic Levels"}
            </span>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-[#0F0F13] p-4 border border-slate-100 dark:border-white/5">
              {LEVELS.map((lvl) => (
                <label key={lvl.value} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(lvl.value)}
                    onChange={() => handleLevelToggle(lvl.value)}
                    className="rounded text-pioneer-orange-normal focus:ring-pioneer-orange-normal/30 h-4 w-4"
                  />
                  <span>{isRtl ? lvl.labelAr : lvl.labelEn}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pricing Tiers Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {isRtl ? "خيارات التسعير ومدد الاشتراك" : "Pricing Tiers & Subscription Durations"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const newTiers = [
                      ...pricingTiers,
                      { name: "6 Months", nameAr: "٦ أشهر", price: 0, durationDays: 180, isActive: true }
                    ];
                    setPricingTiers(newTiers);
                  }}
                  className="inline-flex items-center gap-1 rounded bg-[#EE7C11]/10 border border-[#EE7C11]/30 px-2 py-0.5 text-[10px] font-bold text-[#EE7C11] hover:bg-[#EE7C11]/20 transition"
                >
                  + ٦ أشهر
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newTiers = [
                      ...pricingTiers,
                      { name: "1 Year", nameAr: "سنة واحدة", price: 0, durationDays: 365, isActive: true }
                    ];
                    setPricingTiers(newTiers);
                  }}
                  className="inline-flex items-center gap-1 rounded bg-[#EE7C11]/10 border border-[#EE7C11]/30 px-2 py-0.5 text-[10px] font-bold text-[#EE7C11] hover:bg-[#EE7C11]/20 transition"
                >
                  + سنة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newTiers = [
                      ...pricingTiers,
                      { name: "Lifetime", nameAr: "مدى الحياة", price: 0, durationDays: null, isActive: true }
                    ];
                    setPricingTiers(newTiers);
                  }}
                  className="inline-flex items-center gap-1 rounded bg-[#EE7C11]/10 border border-[#EE7C11]/30 px-2 py-0.5 text-[10px] font-bold text-[#EE7C11] hover:bg-[#EE7C11]/20 transition"
                >
                  + مدى الحياة
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newTiers = [
                      ...pricingTiers,
                      { name: "Custom", nameAr: "فترة مخصصة", price: 0, durationDays: 120, isActive: true }
                    ];
                    setPricingTiers(newTiers);
                  }}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 text-[10px] font-bold transition dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  + تخصيص فترة
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {pricingTiers.map((tier, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 relative">
                  <label className="block space-y-1 md:col-span-1">
                    <span className="text-[9px] font-bold text-slate-400">{isRtl ? "الاسم (EN)" : "Name (EN)"}</span>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => {
                        const newTiers = [...pricingTiers];
                        newTiers[idx].name = e.target.value;
                        setPricingTiers(newTiers);
                      }}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    />
                  </label>
                  <label className="block space-y-1 md:col-span-1">
                    <span className="text-[9px] font-bold text-slate-400">{isRtl ? "الاسم (AR)" : "Name (AR)"}</span>
                    <input
                      type="text"
                      value={tier.nameAr}
                      onChange={(e) => {
                        const newTiers = [...pricingTiers];
                        newTiers[idx].nameAr = e.target.value;
                        setPricingTiers(newTiers);
                      }}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    />
                  </label>
                  <label className="block space-y-1 md:col-span-1">
                    <span className="text-[9px] font-bold text-slate-400">{isRtl ? "السعر (جنيه)" : "Price (EGP)"}</span>
                    <input
                      type="number"
                      min={0}
                      value={tier.price}
                      onChange={(e) => {
                        const newTiers = [...pricingTiers];
                        newTiers[idx].price = Number(e.target.value) || 0;
                        setPricingTiers(newTiers);
                      }}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    />
                  </label>
                  <label className="block space-y-1 md:col-span-1">
                    <span className="text-[9px] font-bold text-slate-400">{isRtl ? "المدة (أيام)" : "Duration (days)"}</span>
                    <input
                      type="number"
                      min={1}
                      value={tier.durationDays || ""}
                      placeholder="مثلاً 120"
                      onChange={(e) => {
                        const newTiers = [...pricingTiers];
                        newTiers[idx].durationDays = e.target.value ? Number(e.target.value) : null;
                        setPricingTiers(newTiers);
                      }}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    />
                  </label>
                  <div className="flex items-end justify-end pb-1 md:col-span-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newTiers = pricingTiers.filter((_, i) => i !== idx);
                        setPricingTiers(newTiers);
                      }}
                      className="rounded bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 text-[10px] font-bold transition"
                    >
                      {isRtl ? "حذف" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
              {pricingTiers.length === 0 && (
                <p className="text-[11px] italic text-slate-400 text-center py-2">
                  {isRtl
                    ? "لا يوجد خيارات تسعير إضافية محددة. سيتم اعتماد خيار الشراء مدى الحياة فقط كخيار افتراضي."
                    : "No additional pricing tiers defined. Lifetime purchase will be the default option."}
                </p>
              )}
            </div>
          </div>

          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("adminPages.courseEditor.fields.thumbnailUrl")}</span>
            <input
              value={form.thumbnail}
              onChange={(e) => set("thumbnail", e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              className={inputClass}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("dashboard.admin.courses.introVideoUrl")}</span>
            <input
              value={form.introVideoUrl}
              onChange={(e) => set("introVideoUrl", e.target.value)}
              placeholder="https://example.com/intro.mp4"
              className={inputClass}
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="rounded"
            />
            {t("adminPages.addCourse.publishNow", { defaultValue: "Publish immediately (active)" })}
          </label>
        </div>

        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
            {submitError}
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {t("adminPages.common.cancel")}
          </button>
          <button
            disabled={createCourseMutation.isPending}
            type="submit"
            className="inline-flex items-center gap-2.5 rounded-lg bg-[#EE7C11] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#d9700e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Layers className="h-4 w-4" />
            {createCourseMutation.isPending ? t("adminPages.addCourse.creating") : t("adminPages.addCourse.createAndOpen")}
            {!createCourseMutation.isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddCourse;
