import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  Star,
  CheckCircle,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ListOrdered
} from "lucide-react";
import client from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { getErrorMessage } from "../../api/error";

const CATEGORIES = [
  { value: "INSTRUCTOR", labelAr: "تقييم المحاضر", labelEn: "Instructor Evaluation" },
  { value: "CONTENT", labelAr: "مستوى الشرح والمحتوى", labelEn: "Content Quality" },
  { value: "PLATFORM", labelAr: "التقييم العام للمنصة", labelEn: "Platform Experience" },
  { value: "INSTRUCTOR_SELF", labelAr: "التقييم الذاتي للمحاضر", labelEn: "Instructor Self-Evaluation" }
];

const TYPES = [
  { value: "RATING", labelAr: "تقييم بالنجوم (1-5)", labelEn: "Star Rating (1-5)" },
  { value: "TEXT", labelAr: "إجابة نصية", labelEn: "Text Answer" }
];

export default function AdminSurveys() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [textAr, setTextAr] = useState("");
  const [textEn, setTextEn] = useState("");
  const [type, setType] = useState("RATING");
  const [category, setCategory] = useState("INSTRUCTOR");
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(0);

  // Confirm delete states
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await client.get("/admin/surveys/questions");
      setQuestions(res.data?.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل تحميل الأسئلة" : "Failed to load questions."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: questions.length,
      active: questions.filter((q) => q.isActive).length,
      ratingType: questions.filter((q) => q.type === "RATING").length,
      textType: questions.filter((q) => q.type === "TEXT").length
    };
  }, [questions]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTextAr("");
    setTextEn("");
    setType("RATING");
    setCategory("INSTRUCTOR");
    setIsActive(true);
    setOrder(0);
    setModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingId(q.id);
    setTextAr(q.textAr);
    setTextEn(q.textEn);
    setType(q.type);
    setCategory(q.category);
    setIsActive(q.isActive);
    setOrder(q.order || 0);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!textAr.trim() || !textEn.trim()) {
      toast.error(isRtl ? "يرجى ملء الحقول المطلوبة باللغتين" : "Please fill in all translation fields.");
      return;
    }

    setSubmitting(true);
    const payload = {
      textAr: textAr.trim(),
      textEn: textEn.trim(),
      type,
      category,
      isActive,
      order: Number(order) || 0
    };

    try {
      if (editingId) {
        await client.patch(`/admin/surveys/questions/${editingId}`, payload);
        toast.success(isRtl ? "تم تعديل السؤال بنجاح" : "Survey question updated successfully.");
      } else {
        await client.post("/admin/surveys/questions", payload);
        toast.success(isRtl ? "تمت إضافة السؤال بنجاح" : "Survey question added successfully.");
      }
      setModalOpen(false);
      fetchQuestions();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل حفظ السؤال" : "Failed to save question."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (q) => {
    try {
      await client.patch(`/admin/surveys/questions/${q.id}`, { isActive: !q.isActive });
      toast.success(isRtl ? "تم تحديث حالة السؤال بنجاح" : "Question status toggled successfully.");
      fetchQuestions();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل تحديث حالة السؤال" : "Failed to toggle status."));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await client.delete(`/admin/surveys/questions/${deleteTarget.id}`);
      toast.success(isRtl ? "تم حذف السؤال بنجاح" : "Question deleted successfully.");
      setDeleteTarget(null);
      fetchQuestions();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل حذف السؤال (ربما يحتوي على ردود)" : "Failed to delete question (it may have answers)."));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={isRtl ? "إدارة أسئلة الاستبيانات" : "Survey Questions Pool"}
          subtitle={isRtl ? "إدارة أسئلة استمارات التقييم بعد الجلسات للطلاب والمحاضرين." : "Manage global survey questions for post-session evaluations."}
        />
        <button
          onClick={handleOpenCreate}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#EE7C11] px-5 text-sm font-bold text-white shadow-lg shadow-[#EE7C11]/20 hover:bg-orange-600 transition"
        >
          <Plus className="h-4 w-4" />
          {isRtl ? "إضافة سؤال جديد" : "Add Question"}
        </button>
      </div>

      {/* Stats Board */}
      <div className="grid gap-5 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <p className="text-xs font-bold text-slate-400 uppercase">{isRtl ? "إجمالي الأسئلة" : "Total Questions"}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <p className="text-xs font-bold text-slate-400 uppercase">{isRtl ? "الأسئلة النشطة" : "Active Questions"}</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <p className="text-xs font-bold text-slate-400 uppercase">{isRtl ? "تقييم بالنجوم" : "Star Ratings"}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{stats.ratingType}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/8 dark:bg-[#1A1A22]">
          <p className="text-xs font-bold text-slate-400 uppercase">{isRtl ? "أسئلة نصية" : "Text Answers"}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{stats.textType}</p>
        </div>
      </div>

      {/* Table/List View */}
      {loading ? (
        <div className="flex justify-center py-12">
          <p className="text-sm text-slate-500">{isRtl ? "جاري تحميل الأسئلة..." : "Loading questions..."}</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center rounded-2xl bg-white dark:bg-[#1A1A22] border border-slate-200 dark:border-white/8">
          <HelpCircle className="h-12 w-12 text-slate-300" />
          <p className="font-semibold text-slate-500">{isRtl ? "لا توجد أسئلة استبيان مضافة حالياً." : "No survey questions configured yet."}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 text-start">{isRtl ? "السؤال" : "Question Translation"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "القسم" : "Category"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "النوع" : "Type"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "الترتيب" : "Order"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "نشط؟" : "Status"}</th>
                  <th className="px-6 py-4 text-end">{isRtl ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {questions.map((q) => {
                  const catObj = CATEGORIES.find((c) => c.value === q.category);
                  const typeObj = TYPES.find((t) => t.value === q.type);
                  return (
                    <tr key={q.id} className="hover:bg-slate-50/40 dark:hover:bg-white/1">
                      <td className="px-6 py-4 max-w-sm">
                        <div className="font-semibold text-slate-900 dark:text-white">{q.textAr}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{q.textEn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                          {catObj ? (isRtl ? catObj.labelAr : catObj.labelEn) : q.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-xs">
                          {q.type === "RATING" ? <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> : <FileText className="h-3.5 w-3.5" />}
                          {typeObj ? (isRtl ? typeObj.labelAr : typeObj.labelEn) : q.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {q.order || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(q)}
                          className="focus:outline-none"
                          title={isRtl ? "تغيير الحالة النشطة" : "Toggle active status"}
                        >
                          {q.isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle className="h-3 w-3" />
                              {isRtl ? "نشط" : "Active"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-500">
                              {isRtl ? "معطل" : "Inactive"}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-end text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(q)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-blue-600"
                            title={isRtl ? "تعديل" : "Edit"}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(q)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-red-500"
                            title={isRtl ? "حذف" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1A1A22]">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId 
                  ? (isRtl ? "تعديل سؤال التقييم" : "Edit Survey Question") 
                  : (isRtl ? "إضافة سؤال جديد" : "Add Survey Question")}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? "نص السؤال (العربية)" : "Question text (Arabic)"} *
                </label>
                <input
                  type="text"
                  required
                  value={textAr}
                  onChange={(e) => setTextAr(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-pioneer-orange-normal dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  placeholder="مثال: كيف تقيم التزام المحاضر بالوقت؟"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? "نص السؤال (الإنجليزية)" : "Question text (English)"} *
                </label>
                <input
                  type="text"
                  required
                  value={textEn}
                  onChange={(e) => setTextEn(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-pioneer-orange-normal dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  placeholder="e.g. How do you rate the instructor's punctuality?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                    {isRtl ? "القسم" : "Category"} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{isRtl ? c.labelAr : c.labelEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                    {isRtl ? "نوع السؤال" : "Question Type"} *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{isRtl ? t.labelAr : t.labelEn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-center border-t border-slate-100 pt-3 dark:border-white/5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                    {isRtl ? "رقم الترتيب" : "Sort Order"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-pioneer-orange-normal dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <input
                    id="edit-active"
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-pioneer-orange-normal focus:ring-pioneer-orange-normal/30 h-4 w-4"
                  />
                  <label htmlFor="edit-active" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    {isRtl ? "تفعيل السؤال" : "Make Question Active"}
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isRtl ? "حفظ" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title={isRtl ? "حذف سؤال استبيان" : "Delete Survey Question"}
          description={isRtl 
            ? `هل أنت متأكد من حذف سؤال: "${deleteTarget.textAr}"؟ لا يمكن حذف الأسئلة التي تحتوي على ردود سابقة من الطلاب.`
            : `Are you sure you want to delete question: "${deleteTarget.textEn}"? You cannot delete questions that have existing responses.`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
