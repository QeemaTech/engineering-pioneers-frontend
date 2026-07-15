import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Calendar,
  MapPin,
  Video,
  Globe,
  Loader2,
  CheckCircle,
  HelpCircle,
  Link2,
  AlertCircle
} from "lucide-react";
import client from "../../api/client";
import endpoints from "../../api/endpoints";
import PageHeader from "../../components/ui/PageHeader";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { getErrorMessage } from "../../api/error";

const inputFieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#EE7C11]";

const textAreaClass =
  "w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-[#EE7C11]";

export default function AdminEvents() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Confirm delete states
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await client.get(endpoints.admin.events);
      setEvents(res.data?.data?.events || []);
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل تحميل الفعاليات" : "Failed to load events."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitleAr("");
    setTitleEn("");
    setDescriptionAr("");
    setDescriptionEn("");
    // Default event date to tomorrow same time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setEventDate(tomorrow.toISOString().slice(0, 16));
    setLocation("");
    setBannerUrl("");
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (ev) => {
    setEditingId(ev.id);
    setTitleAr(ev.titleAr);
    setTitleEn(ev.titleEn);
    setDescriptionAr(ev.descriptionAr);
    setDescriptionEn(ev.descriptionEn);
    // Convert date back to datetime-local format
    const localDate = new Date(ev.eventDate).toISOString().slice(0, 16);
    setEventDate(localDate);
    setLocation(ev.location);
    setBannerUrl(ev.bannerUrl || "");
    setIsActive(ev.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!titleAr.trim() || !titleEn.trim() || !descriptionAr.trim() || !descriptionEn.trim() || !location.trim() || !eventDate) {
      toast.error(isRtl ? "يرجى ملء كافة الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const payload = {
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim(),
      descriptionAr: descriptionAr.trim(),
      descriptionEn: descriptionEn.trim(),
      eventDate: new Date(eventDate).toISOString(),
      location: location.trim(),
      bannerUrl: bannerUrl.trim() || null,
      isActive
    };

    try {
      if (editingId) {
        await client.patch(endpoints.admin.eventDetail(editingId), payload);
        toast.success(isRtl ? "تم تعديل الفعالية بنجاح ✅" : "Event updated successfully ✅");
      } else {
        await client.post(endpoints.admin.events, payload);
        toast.success(isRtl ? "تمت إضافة الفعالية بنجاح ✅" : "Event added successfully ✅");
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل حفظ الفعالية" : "Failed to save event."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (ev) => {
    try {
      await client.patch(endpoints.admin.eventDetail(ev.id), { isActive: !ev.isActive });
      toast.success(isRtl ? "تم تحديث حالة الفعالية بنجاح" : "Event status toggled successfully.");
      fetchEvents();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل تحديث حالة الفعالية" : "Failed to toggle status."));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await client.delete(endpoints.admin.eventDetail(deleteTarget.id));
      toast.success(isRtl ? "تم حذف الفعالية بنجاح" : "Event deleted successfully.");
      setDeleteTarget(null);
      fetchEvents();
    } catch (err) {
      toast.error(getErrorMessage(err, isRtl ? "فشل حذف الفعالية" : "Failed to delete event."));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={isRtl ? "إدارة الفعاليات والأخبار" : "Events & News Dashboard"}
          subtitle={isRtl ? "إدارة وتعديل الفعاليات، الندوات الهندسية، وورش العمل المنشورة للطلاب." : "Schedule and configure engineering webinars, university sessions, and academic news."}
        />
        <button
          onClick={handleOpenCreate}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#EE7C11] px-5 text-sm font-bold text-white shadow-lg shadow-[#EE7C11]/20 hover:bg-orange-600 transition"
        >
          <Plus className="h-4 w-4" />
          {isRtl ? "إضافة فعالية جديدة" : "Add New Event"}
        </button>
      </div>

      {/* Grid List View */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center rounded-2xl bg-white dark:bg-[#1A1A22] border border-slate-200 dark:border-white/8">
          <HelpCircle className="h-12 w-12 text-slate-350" />
          <p className="font-semibold text-slate-500">{isRtl ? "لا توجد فعاليات مضافة حالياً." : "No events configured yet."}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start text-sm">
              <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 text-start">{isRtl ? "الفعالية" : "Event Title"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "الموعد" : "Event Date"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "الموقع" : "Location / URL"}</th>
                  <th className="px-6 py-4 text-start">{isRtl ? "نشط؟" : "Active?"}</th>
                  <th className="px-6 py-4 text-end">{isRtl ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {events.map((ev) => {
                  const isOnline = ev.location?.startsWith("http://") || ev.location?.startsWith("https://");
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/40 dark:hover:bg-white/1">
                      <td className="px-6 py-4 max-w-sm">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{ev.titleAr}</div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ev.titleEn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-650 dark:text-slate-350 text-xs">
                        <div className="font-semibold">
                          {new Date(ev.eventDate).toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                        </div>
                        <div className="text-[10px] text-slate-450 mt-0.5">
                          {new Date(ev.eventDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <span className="flex items-center gap-1 text-xs text-slate-650 dark:text-slate-350 line-clamp-1">
                          {isOnline ? <Video className="h-3.5 w-3.5 text-blue-500" /> : <MapPin className="h-3.5 w-3.5 text-amber-500" />}
                          <span className="truncate">{ev.location}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(ev)}
                          className="focus:outline-none"
                          title={isRtl ? "تغيير حالة النشاط" : "Toggle active status"}
                        >
                          {ev.isActive ? (
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
                            onClick={() => handleOpenEdit(ev)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-blue-600"
                            title={isRtl ? "تعديل" : "Edit"}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(ev)}
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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1A1A22]" style={{ maxHeight: "95vh", overflowY: "auto" }}>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingId 
                  ? (isRtl ? "تعديل بيانات الفعالية" : "Edit Event") 
                  : (isRtl ? "إضافة فعالية جديدة" : "Add New Event")}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Title Arabic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? "عنوان الفعالية (العربية)" : "Event Title (Arabic)"} *
                </label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className={inputFieldClass}
                  placeholder={isRtl ? "مثال: ندوة تصميم المنشآت الذكية" : "e.g. Smart Structures Seminar"}
                />
              </div>

              {/* Title English */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? "عنوان الفعالية (الإنجليزية)" : "Event Title (English)"} *
                </label>
                <input
                  type="text"
                  required
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  className={inputFieldClass}
                  placeholder="e.g. Smart Structures Seminar"
                />
              </div>

              {/* Description Arabic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? "التفاصيل والوصف (العربية)" : "Details & Description (Arabic)"} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  className={textAreaClass}
                  placeholder="اكتب تفاصيل الفعالية وجدول الأعمال هنا..."
                />
              </div>

              {/* Description English */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? "التفاصيل والوصف (الإنجليزية)" : "Details & Description (English)"} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  className={textAreaClass}
                  placeholder="Describe the event itinerary, webinar schedules..."
                />
              </div>

              {/* Date & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                    {isRtl ? "موعد الفعالية" : "Event Date & Time"} *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={inputFieldClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                    {isRtl ? "المكان (رقم القاعة أو رابط البث)" : "Location (Room / URL Link)"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputFieldClass}
                    placeholder={isRtl ? "مثال: مدرج 3 أو https://zoom.us/..." : "e.g. Room 402 or https://..."}
                  />
                </div>
              </div>

              {/* Banner URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                  {isRtl ? "رابط صورة الغلاف (اختياري)" : "Banner Cover Image URL (Optional)"}
                </label>
                <div className="relative">
                  <Link2 className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    className={`${inputFieldClass} ps-9`}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="ev-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-pioneer-orange-normal focus:ring-pioneer-orange-normal/30 h-4 w-4"
                />
                <label htmlFor="ev-active" className="text-sm font-semibold text-slate-750 dark:text-slate-350 cursor-pointer">
                  {isRtl ? "تفعيل ونشر الفعالية فوراً للطلاب" : "Publish event immediately to students"}
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isRtl ? "حفظ" : "Save Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDialog
          title={isRtl ? "حذف الفعالية" : "Delete Event"}
          description={isRtl 
            ? `هل أنت متأكد من حذف الفعالية: "${deleteTarget.titleAr}" نهائياً؟`
            : `Are you sure you want to delete event: "${deleteTarget.titleEn}" permanently?`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
