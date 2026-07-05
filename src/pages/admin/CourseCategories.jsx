import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  Folder,
  Layers,
  Laptop,
  Code2,
  Cpu,
  Globe,
  Database,
  BookOpen,
  Atom,
  Calculator,
  Wrench,
  Settings,
  Terminal,
  Network,
  HardDrive,
  Blocks,
  LineChart,
  Book,
  FileText,
  Video,
  Brain,
  PenTool,
  Server,
  Eye,
  Zap,
  Lightbulb,
  Radio,
  Binary,
  HardHat,
  Construction,
  Building,
  Ruler,
  Map,
  FlaskConical,
  Gauge,
  Activity,
  Wind,
  Plane,
  Droplets,
  Hammer
} from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { getErrorMessage } from "../../api/error";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from "../../features/admin/categories/hooks";

const ICON_LIST = [
  // General & Mechanical Engineering
  { name: "Wrench", Icon: Wrench, labelAr: "ميكانيكا وصيانة" },
  { name: "Settings", Icon: Settings, labelAr: "تشغيل وأنظمة" },
  { name: "Gauge", Icon: Gauge, labelAr: "أجهزة وقياسات" },
  { name: "Hammer", Icon: Hammer, labelAr: "تطبيقات عملية" },
  
  // Electrical & Electronics Engineering
  { name: "Zap", Icon: Zap, labelAr: "قوى وآلات كهربائية" },
  { name: "Lightbulb", Icon: Lightbulb, labelAr: "كهرباء عامة" },
  { name: "Radio", Icon: Radio, labelAr: "اتصالات وإشارات" },
  { name: "Cpu", Icon: Cpu, labelAr: "إلكترونيات ومعالجات" },
  
  // Civil & Architecture Engineering
  { name: "HardHat", Icon: HardHat, labelAr: "سلامة وموقع" },
  { name: "Construction", Icon: Construction, labelAr: "إنشاءات ومباني" },
  { name: "Building", Icon: Building, labelAr: "تخطيط وعمارة" },
  { name: "Ruler", Icon: Ruler, labelAr: "تصميم وقياس" },
  { name: "Map", Icon: Map, labelAr: "خرائط ومساحة" },

  // Software & Computer Engineering
  { name: "Code2", Icon: Code2, labelAr: "برمجة وأكواد" },
  { name: "Terminal", Icon: Terminal, labelAr: "هندسة البرمجيات" },
  { name: "Database", Icon: Database, labelAr: "قواعد البيانات" },
  { name: "Server", Icon: Server, labelAr: "سيرفرات وشبكات" },
  { name: "Network", Icon: Network, labelAr: "اتصالات شبكية" },
  { name: "Globe", Icon: Globe, labelAr: "هندسة ويب" },
  { name: "Laptop", Icon: Laptop, labelAr: "حاسبات ونظم" },
  { name: "Blocks", Icon: Blocks, labelAr: "بنية الكود" },

  // Chemical & Bio & Aero Engineering
  { name: "FlaskConical", Icon: FlaskConical, labelAr: "كيمياء ومواد" },
  { name: "Atom", Icon: Atom, labelAr: "هندسة فيزيائية ونووية" },
  { name: "Activity", Icon: Activity, labelAr: "هندسة طبية حيوية" },
  { name: "Wind", Icon: Wind, labelAr: "ديناميكا موائع ورياح" },
  { name: "Plane", Icon: Plane, labelAr: "طيران وفضاء" },
  { name: "Droplets", Icon: Droplets, labelAr: "هيدروليكا ومياه" },

  // Academic & Core Science
  { name: "Calculator", Icon: Calculator, labelAr: "رياضيات هندسية" },
  { name: "LineChart", Icon: LineChart, labelAr: "إحصاء هندسي" },
  { name: "BookOpen", Icon: BookOpen, labelAr: "مناهج هندسية" },
  { name: "Brain", Icon: Brain, labelAr: "ذكاء اصطناعي" },
  { name: "PenTool", Icon: PenTool, labelAr: "رسم هندسي وتصميم" },
];

function CategoryIcon({ name, className = "h-5 w-5" }) {
  const match = ICON_LIST.find((i) => i.name === name);
  const IconComponent = match ? match.Icon : Folder;
  return <IconComponent className={className} />;
}

function StatCard({ icon, value, label, bgColor, iconColor }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bgColor} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
        <p className="text-xs font-bold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

const generateSlug = (val) => {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
};

function CourseCategories() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [icon, setIcon] = useState("Folder");

  const { data, isLoading, isError, error, refetch } = useAdminCategories({ page: 1, limit: 100 });
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();
  
  const categories = data?.categories || [];

  // Filter possible parent categories (only top-level categories that aren't the current category itself)
  const topLevelCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId && c.id !== editingId);
  }, [categories, editingId]);

  const stats = useMemo(() => {
    const subCount = categories.filter((c) => !!c.parentId).length;
    const coursesCount = categories.reduce((sum, c) => sum + (c._count?.courses || 0), 0);
    return {
      total: categories.length,
      subcategories: subCount,
      coursesCount,
    };
  }, [categories]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setParentId("");
    setIcon("Folder");
    setModalOpen(true);
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const onSave = async () => {
    if (!name.trim() || !slug.trim()) {
      toast.error(isRtl ? "يرجى ملء الحقول المطلوبة" : "Name and Slug are required.");
      return;
    }

    const body = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      parentId: parentId || null,
      icon: icon || null,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, body });
        toast.success(isRtl ? "تم تعديل التصنيف بنجاح" : "Category updated.");
      } else {
        await createMutation.mutateAsync(body);
        toast.success(isRtl ? "تم إضافة التصنيف بنجاح" : "Category created.");
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل حفظ التصنيف" : "Failed to save category."));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(isRtl ? "تم حذف التصنيف بنجاح" : "Category deleted.");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل حذف التصنيف" : "Failed to delete category."));
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={t("adminPages.categories.title")}
          subtitle={t("adminPages.categories.subtitle")}
        />
        <button
          onClick={handleOpenCreate}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#EE7C11] px-5 text-sm font-bold text-white shadow-lg shadow-[#EE7C11]/25 hover:bg-[#d9700e] transition"
        >
          <Plus className="h-4 w-4" />
          {isRtl ? "إضافة تصنيف" : "Add Category"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard
          icon={<Layers className="h-6 w-6" />}
          value={stats.total}
          label={isRtl ? "إجمالي التصنيفات" : "Total Categories"}
          bgColor="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={<Folder className="h-6 w-6" />}
          value={stats.subcategories}
          label={isRtl ? "التصنيفات الفرعية" : "Subcategories"}
          bgColor="bg-amber-50 dark:bg-amber-500/10"
          iconColor="text-[#EE7C11] dark:text-[#EE7C11]"
        />
        <StatCard
          icon={<BookOpen className="h-6 w-6" />}
          value={stats.coursesCount}
          label={isRtl ? "إجمالي كورسات المنصة" : "Active Courses"}
          bgColor="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Categories Grid List */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && <div className="text-sm text-slate-500 col-span-full">Loading categories...</div>}
        {isError && (
          <div className="text-sm text-red-500 col-span-full">
            {getErrorMessage(error, "Failed to load categories.")} 
            <button onClick={() => refetch()} className="underline ml-2">Retry</button>
          </div>
        )}
        
        {categories.map((c) => (
          <div key={c.id} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#1A1A22]">
            <div className="absolute inset-x-0 top-0 h-1 bg-[#EE7C11]" />
            
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#EE7C11] dark:bg-[#EE7C11]/10">
                <CategoryIcon name={c.icon} className="h-6 w-6" />
              </div>
              
              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setName(c.name || "");
                    setSlug(c.slug || "");
                    setDescription(c.description || "");
                    setParentId(c.parentId || "");
                    setIcon(c.icon || "Folder");
                    setModalOpen(true);
                  }}
                  className="rounded-xl bg-slate-50 hover:bg-slate-100 p-2 text-slate-500 transition dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                  title="تعديل"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(c)}
                  className="rounded-xl bg-[#EE7C11]/10 hover:bg-[#EE7C11]/20 p-2 text-red-600 transition"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{c.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">slug: {c.slug}</p>
              
              {c.parent ? (
                <span className="inline-flex items-center gap-1 mt-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                  {isRtl ? `تصنيف فرعي من: ${c.parent.name}` : `Subcategory of: ${c.parent.name}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  {isRtl ? "تصنيف رئيسي" : "Top-level category"}
                </span>
              )}

              <div className="mt-4 border-t border-slate-100 dark:border-white/5 pt-3 flex justify-between text-xs text-slate-500">
                <span>{isRtl ? "الكورسات المتاحة:" : "Active Courses:"}</span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {c._count?.courses || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Styled Centered Category Creation/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
          <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#1A1A22] border border-slate-200/60 dark:border-white/10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <header className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 p-6">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingId ? (isRtl ? "تعديل تصنيف" : "Edit Category") : (isRtl ? "إضافة تصنيف جديد" : "Add New Category")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isRtl ? "اسم التصنيف" : "Category Name"}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Web Development"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[#EE7C11] outline-none"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isRtl ? "الرابط اللطيف (Slug)" : "Slug (Auto-generated)"}
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. web-development"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[#EE7C11] outline-none"
                />
              </label>

              {/* Subcategory relation */}
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isRtl ? "التصنيف الأب (لجعله تصنيف فرعي)" : "Parent Category (to nested as subcategory)"}
                </span>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[#EE7C11] outline-none"
                >
                  <option value="">{isRtl ? "-- تصنيف رئيسي (بدون أب) --" : "-- Top-Level Category (No parent) --"}</option>
                  {topLevelCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>

              {/* Visual Icon Grid Picker */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isRtl ? "اختر الأيقونة البصرية" : "Select Category Icon"}
                </span>
                <div className="grid grid-cols-6 gap-2 p-3 rounded-xl border border-slate-200 dark:border-white/10 max-h-[140px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40">
                  {ICON_LIST.map((item) => {
                    const IconComp = item.Icon;
                    const isSelected = icon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setIcon(item.name)}
                        className={`flex h-10 items-center justify-center rounded-lg border transition ${isSelected ? "border-[#EE7C11] bg-[#EE7C11]/10 text-[#EE7C11]" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500 dark:border-white/5 dark:bg-[#0F0F13] dark:hover:bg-white/5"}`}
                        title={item.name}
                      >
                        <IconComp className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isRtl ? "الوصف" : "Description (Optional)"}
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white focus:border-[#EE7C11] outline-none"
                  placeholder="Details about study materials in this path..."
                />
              </label>

            </div>

            {/* Modal Footer */}
            <footer className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-white/5 p-6 shrink-0 bg-slate-50/50 dark:bg-slate-900/45">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 text-slate-700 px-4 h-10 text-xs font-bold dark:border-white/10 dark:text-slate-300 hover:bg-slate-150 dark:hover:bg-white/5 transition"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#EE7C11] text-white px-5 h-10 text-xs font-bold hover:bg-[#d9700e] transition"
              >
                {editingId ? (isRtl ? "حفظ التغييرات" : "Save Changes") : (isRtl ? "إضافة تصنيف" : "Add Category")}
              </button>
            </footer>

          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={isRtl ? "تأكيد حذف التصنيف" : "Delete Category"}
        message={isRtl ? "هل أنت متأكد من حذف هذا التصنيف نهائياً؟ قد يؤدي هذا لإلغاء تصنيف بعض الكورسات." : "Are you sure you want to delete this category?"}
        confirmLabel={isRtl ? "نعم، احذف" : "Delete"}
        cancelLabel={isRtl ? "إلغاء" : "Cancel"}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

    </section>
  );
}

export default CourseCategories;
