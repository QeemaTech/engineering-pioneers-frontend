import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  X, Check, ChevronRight, ChevronLeft, Search, 
  BookOpen, Layers, DollarSign, Percent, Sparkles, Folder,
  Upload, ImageIcon
} from "lucide-react";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import { useAdminCategories } from "../../features/admin/categories/hooks";
import client from "../../api/client";

function PackageStepperModal({ open, packageData, onClose, onSave, isSaving }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Step 2 Course Selection
  const [selectionMode, setSelectionMode] = useState("manual"); // manual | category
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  // Step 3 Pricing Tiers
  const [pricingTiers, setPricingTiers] = useState([
    { name: "Semi-Annual Access", nameAr: "اشتراك نصف سنوي", price: 0, durationDays: 180, isActive: true },
    { name: "Annual Access", nameAr: "اشتراك سنوي", price: 0, durationDays: 365, isActive: true },
    { name: "Lifetime Access", nameAr: "اشتراك مدى الحياة", price: 0, durationDays: null, isActive: true }
  ]);

  // Load Queries
  const { data: coursesPayload } = useAdminCourses({ page: 1, limit: 300 });
  const { data: categoriesPayload } = useAdminCategories({ page: 1, limit: 100 });
  
  const courses = coursesPayload?.courses || [];
  const categories = categoriesPayload?.categories || [];

  // Initialize form when editing
  useEffect(() => {
    if (open) {
      setStep(1);
      if (packageData) {
        setTitle(packageData.title || "");
        setTitleAr(packageData.titleAr || "");
        setDescription(packageData.description || "");
        setDescriptionAr(packageData.descriptionAr || "");
        setPrice(packageData.price || 0);
        setImage(packageData.image || "");
        setIsActive(packageData.isActive !== false);
        
        // Populate selected course IDs
        const courseIds = (packageData.courses || []).map((item) => item.courseId || item.course?.id).filter(Boolean);
        setSelectedCourseIds(courseIds);
        
        // Populate pricing tiers
        if (packageData.pricingTiers && packageData.pricingTiers.length > 0) {
          setPricingTiers(packageData.pricingTiers.map(t => ({
            id: t.id,
            name: t.name,
            nameAr: t.nameAr,
            price: t.price,
            durationDays: t.durationDays,
            isActive: t.isActive !== false
          })));
        } else {
          setPricingTiers([
            { name: "Semi-Annual Access", nameAr: "اشتراك نصف سنوي", price: packageData.price ? Math.round(packageData.price * 0.6) : 0, durationDays: 180, isActive: true },
            { name: "Annual Access", nameAr: "اشتراك سنوي", price: packageData.price ? Math.round(packageData.price * 0.8) : 0, durationDays: 365, isActive: true },
            { name: "Lifetime Access", nameAr: "اشتراك مدى الحياة", price: packageData.price || 0, durationDays: null, isActive: true }
          ]);
        }
      } else {
        // Reset to default
        setTitle("");
        setTitleAr("");
        setDescription("");
        setDescriptionAr("");
        setPrice(0);
        setImage("");
        setIsActive(true);
        setSelectedCourseIds([]);
        setPricingTiers([
          { name: "Semi-Annual Access", nameAr: "اشتراك نصف سنوي", price: 0, durationDays: 180, isActive: true },
          { name: "Annual Access", nameAr: "اشتراك سنوي", price: 0, durationDays: 365, isActive: true },
          { name: "Lifetime Access", nameAr: "اشتراك مدى الحياة", price: 0, durationDays: null, isActive: true }
        ]);
      }
    }
  }, [open, packageData]);

  // Handle Category Auto-Selection
  useEffect(() => {
    if (selectionMode === "category" && selectedCategory) {
      const matchIds = courses
        .filter((c) => c.categoryId === selectedCategory || c.category?.id === selectedCategory)
        .map((c) => c.id);
      setSelectedCourseIds(matchIds);
    }
  }, [selectionMode, selectedCategory, courses]);

  // Filtered Courses List for Manual Selection
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const query = searchQuery.toLowerCase().trim();
      return (
        c.title?.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    });
  }, [courses, searchQuery]);

  // Calculate Real Combined Value of selected courses
  const combinedCoursesValue = useMemo(() => {
    return courses
      .filter((c) => selectedCourseIds.includes(c.id))
      .reduce((sum, c) => sum + Number(c.price || 0), 0);
  }, [courses, selectedCourseIds]);

  const handleToggleCourse = (courseId) => {
    if (selectedCourseIds.includes(courseId)) {
      setSelectedCourseIds(selectedCourseIds.filter((id) => id !== courseId));
    } else {
      setSelectedCourseIds([...selectedCourseIds, courseId]);
    }
  };

  const handleSaveClick = () => {
    // Base Price is set to Lifetime variety price
    const lifetimeTier = pricingTiers.find(t => t.durationDays === null);
    const basePrice = lifetimeTier ? lifetimeTier.price : price;

    onSave({
      title,
      titleAr,
      description,
      descriptionAr,
      price: Number(basePrice),
      image,
      isActive,
      courseIds: selectedCourseIds,
      pricingTiers: pricingTiers.map(t => ({
        id: t.id,
        name: t.name,
        nameAr: t.nameAr,
        price: Number(t.price),
        durationDays: t.durationDays,
        isActive: t.isActive
      }))
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    try {
      const response = await client.post("/admin/financials/packages/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const url = response.data?.data?.imageUrl;
      if (url) {
        setImage(url);
      }
    } catch (err) {
      console.error("Image upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl dark:bg-[#1A1A22] border border-slate-200/60 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 p-6 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#EE7C11]" />
              {packageData ? "تعديل الباقة / Edit Package" : "إنشاء باقة جديدة / Create Package"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRtl ? "قم بإعداد تفاصيل الباقة وتحديد فترات الاشتراك للطلاب" : "Configure package details, manually choose courses, and set varieties"}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Stepper Progress bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center gap-4 shrink-0">
          {[
            { step: 1, label: isRtl ? "المعلومات الأساسية" : "Identity & Description" },
            { step: 2, label: isRtl ? "اختيار المساقات" : "Course Selection" },
            { step: 3, label: isRtl ? "فترات الاشتراك والتسعير" : "Varieties & Pricing" }
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center gap-2 flex-1 last:flex-initial">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${step >= item.step ? "bg-[#EE7C11] text-white" : "bg-slate-200 text-slate-500 dark:bg-slate-800"}`}>
                {step > item.step ? <Check className="h-4 w-4" /> : item.step}
              </div>
              <span className={`text-xs font-bold ${step >= item.step ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>
                {item.label}
              </span>
              {idx < 2 && <div className="h-0.5 flex-1 bg-slate-200 dark:bg-slate-800 ml-2" />}
            </div>
          ))}
        </div>

        {/* Form Body - Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    اسم الباقة بالإنجليزية / Package Name (EN)
                  </span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Web Development Professional Bundle"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[#EE7C11] outline-none"
                  />
                </label>
                
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    اسم الباقة بالعربية / Package Name (AR)
                  </span>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: باقة تطوير الويب المتكاملة"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[#EE7C11] outline-none text-right"
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  الوصف بالإنجليزية / Description (EN)
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide details about what this package includes..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[#EE7C11] outline-none"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  الوصف بالعربية / Description (AR)
                </span>
                <textarea
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  rows={4}
                  placeholder="تفاصيل ما تحتويه الباقة باللغة العربية..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[#EE7C11] outline-none text-right"
                />
              </label>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActivePkg"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 accent-[#EE7C11]"
                />
                <label htmlFor="isActivePkg" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {isRtl ? "الباقة نشطة وتظهر للطلاب" : "Package is active and visible to students"}
                </label>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {isRtl ? "صورة غلاف الباقة / Package Cover Image" : "Package Cover Image"}
                </span>
                
                {image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 max-w-md">
                    <img 
                      src={image.startsWith("http") ? image : `${import.meta.env.VITE_API_URL || ""}${image}`} 
                      alt="Cover Preview" 
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-white/15 rounded-2xl p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition max-w-md">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#EE7C11] border-t-transparent" />
                        <span className="text-xs text-slate-500">{isRtl ? "جاري الرفع..." : "Uploading..."}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {isRtl ? "اضغط لرفع صورة الغلاف" : "Click to upload cover image"}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                          PNG, JPG, WEBP (Max 5MB)
                        </span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Course Selection */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Selector Mode Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectionMode("manual")}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${selectionMode === "manual" ? "bg-[#EE7C11] text-white" : "border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"}`}
                  >
                    {isRtl ? "اختيار يدوي (كورس كورس)" : "Manual selection (Course by Course)"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionMode("category")}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition ${selectionMode === "category" ? "bg-[#EE7C11] text-white" : "border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"}`}
                  >
                    {isRtl ? "اختيار تلقائي بالتصنيف" : "Auto-selection by Category"}
                  </button>
                </div>
                
                <div className="text-xs font-black text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#EE7C11]" />
                  <span>{isRtl ? `إجمالي الكورسات المحددة: ${selectedCourseIds.length}` : `Selected: ${selectedCourseIds.length} courses`}</span>
                  <span className="mx-1">|</span>
                  <span>{isRtl ? `القيمة الحقيقية: $${combinedCoursesValue}` : `Real value: $${combinedCoursesValue}`}</span>
                </div>
              </div>

              {/* Selection Panels */}
              {selectionMode === "category" ? (
                <div className="max-w-md mx-auto space-y-4 py-6">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Folder className="h-4 w-4 text-[#EE7C11]" />
                      اختر التصنيف لإدراج كورساته بالكامل
                    </span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[#EE7C11] outline-none"
                    >
                      <option value="">{isRtl ? "-- اختر تصنيف --" : "-- Select a Category --"}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{isRtl ? (cat.nameAr || cat.name) : cat.name}</option>
                      ))}
                    </select>
                  </label>
                  <p className="text-xs text-slate-400 text-center">
                    {isRtl 
                      ? "سيقوم النظام تلقائياً بتضمين كافة الكورسات النشطة التابعة للتصنيف المختار ومزامنتها." 
                      : "Selecting a category automatically enrolls all current active courses belonging to it."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                    </span>
                    <input
                      type="text"
                      placeholder={isRtl ? "ابحث عن كورسات لتضمينها..." : "Search courses..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white outline-none focus:ring-1 focus:ring-[#EE7C11]"
                    />
                  </div>

                  {/* Course Cards Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredCourses.map((c) => {
                      const isSelected = selectedCourseIds.includes(c.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleToggleCourse(c.id)}
                          className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition ${isSelected ? "border-[#EE7C11] bg-[#EE7C11]/5" : "border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5"}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by div click
                            className="h-4 w-4 accent-[#EE7C11]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{c.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {c.type === "HYBRID" ? "Hybrid" : "Recorded"} · ${c.price || 0}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {filteredCourses.length === 0 && (
                      <p className="text-sm text-slate-400 italic py-6 text-center col-span-2">
                        {isRtl ? "لا توجد كورسات تطابق البحث" : "No courses match your query."}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Pricing Varieties */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-500/20 max-w-2xl mx-auto text-xs text-amber-800 dark:text-amber-300">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  {isRtl ? "ملاحظة التسعير التلقائي للخصومات" : "Automatic Discount Tracking"}
                </p>
                <p className="mt-1 leading-relaxed">
                  {isRtl
                    ? `إجمالي القيمة الحقيقية للكورسات في الباقة هي $${combinedCoursesValue}. سيقوم النظام بمقارنة السعر المعين لكل فترة مع القيمة الإجمالية ويعرض نسبة التوفير المئوية للطلاب مباشرة.`
                    : `The combined value of individual courses in this package is $${combinedCoursesValue}. The system will calculate and display savings tags for each duration tier automatically.`}
                </p>
              </div>

              <div className="space-y-4 max-w-2xl mx-auto">
                {pricingTiers.map((tier, idx) => {
                  const discountPercent = combinedCoursesValue > 0
                    ? Math.max(0, Math.round(((combinedCoursesValue - tier.price) / combinedCoursesValue) * 100))
                    : 0;

                  return (
                    <div key={idx} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                      
                      {/* Name Ar/En */}
                      <div className="flex-1 min-w-[200px] space-y-1">
                        <p className="text-sm font-black text-slate-950 dark:text-white">
                          {isRtl ? tier.nameAr : tier.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {tier.durationDays ? `Duration: ${tier.durationDays} days` : "Lifetime / Open access"}
                        </p>
                      </div>

                      {/* Price input */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-500">$</span>
                        <input
                          type="number"
                          min={0}
                          value={tier.price}
                          onChange={(e) => {
                            const newTiers = [...pricingTiers];
                            newTiers[idx].price = Number(e.target.value) || 0;
                            setPricingTiers(newTiers);
                          }}
                          className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[#EE7C11] outline-none"
                        />
                      </div>

                      {/* Discount Badge */}
                      <div className="w-24 flex justify-end shrink-0">
                        {discountPercent > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-orange-100 dark:bg-orange-500/10 px-2 py-1 text-xs font-black text-orange-700 dark:text-orange-400">
                            <Percent className="h-3 w-3" />
                            {isRtl ? `وفر ${discountPercent}%` : `Save ${discountPercent}%`}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No discount</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 p-6 bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 text-slate-700 px-4 h-10 text-xs font-bold dark:border-white/10 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                {isRtl ? "السابق" : "Back"}
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 text-slate-700 px-4 h-10 text-xs font-bold dark:border-white/10 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-white/5 transition"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#EE7C11] text-white px-5 h-10 text-xs font-bold hover:bg-[#d9700e] transition"
              >
                {isRtl ? "التالي" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveClick}
                disabled={isSaving || selectedCourseIds.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#EE7C11] text-white px-6 h-10 text-xs font-bold hover:bg-[#d9700e] disabled:opacity-50 transition"
              >
                {isSaving ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ الباقة" : "Save Package")}
              </button>
            )}
          </div>
        </footer>

      </div>
    </div>
  );
}

export default PackageStepperModal;
