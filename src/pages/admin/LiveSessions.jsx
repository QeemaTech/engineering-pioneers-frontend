import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, Edit2, Plus, Search, Trash2, Video } from "lucide-react";
import toast from "react-hot-toast";
import client from "../../api/client";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import { getErrorMessage } from "../../api/error";
import { deriveLiveAccessModel, payloadFromAccessModel } from "../../utils/liveAccessModel";

const LEVELS = [
  { value: "GENERAL", labelAr: "عام / عمومي", labelEn: "General / Public" },
  { value: "PREPARATORY", labelAr: "إعدادي هندسة", labelEn: "Preparatory Year" },
  { value: "FIRST_YEAR", labelAr: "الفرقة الأولى", labelEn: "First Year" },
  { value: "SECOND_YEAR", labelAr: "الفرقة الثانية", labelEn: "Second Year" },
  { value: "THIRD_YEAR", labelAr: "الفرقة الثالثة", labelEn: "Third Year" },
  { value: "FOURTH_YEAR", labelAr: "الفرقة الرابعة / التخرج", labelEn: "Fourth Year" },
  { value: "GRADUATE", labelAr: "خريج / محترف", labelEn: "Graduate / Professional" },
];

export default function LiveSessions() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  const [sessions, setSessions] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [isFreeForAll, setIsFreeForAll] = useState(false);
  const [price, setPrice] = useState("0");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [accessModel, setAccessModel] = useState("PUBLIC_FREE");

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessRes, instRes, courseRes] = await Promise.all([
        client.get("/admin/live-sessions"),
        client.get("/admin/instructors?limit=100"),
        client.get("/admin/courses?limit=100"),
      ]);
      setSessions(sessRes.data?.data || []);
      setInstructors(instRes.data?.data?.instructors || instRes.data?.data || []);
      setCourses(courseRes.data?.data?.courses || courseRes.data?.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load dashboard data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingSession(null);
    setTitle("");
    setDescription("");
    setInstructorId(instructors[0]?.id || "");
    setCourseId("");
    setStartTime("");
    setEndTime("");
    setMeetingUrl("");
    setIsFreeForAll(true);
    setPrice("0");
    setSelectedLevels([]);
    setAccessModel("PUBLIC_FREE");
    setModalOpen(true);
  };

  const openEditModal = (sess) => {
    setEditingSession(sess);
    setTitle(sess.title || "");
    setDescription(sess.description || "");
    setInstructorId(sess.instructorId || "");
    setCourseId(sess.courseId || "");
    setStartTime(sess.startTime ? new Date(sess.startTime).toISOString().slice(0, 16) : "");
    setEndTime(sess.endTime ? new Date(sess.endTime).toISOString().slice(0, 16) : "");
    setMeetingUrl(sess.meetingUrl || "");
    setIsFreeForAll(sess.isFreeForAll);
    setPrice(String(sess.price || 0));
    setSelectedLevels(sess.targetLevels || []);
    setAccessModel(deriveLiveAccessModel(sess));
    setModalOpen(true);
  };

  const handleLevelToggle = (lvl) => {
    if (selectedLevels.includes(lvl)) {
      setSelectedLevels(selectedLevels.filter((l) => l !== lvl));
    } else {
      setSelectedLevels([...selectedLevels, lvl]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !startTime || !endTime || !instructorId) {
      toast.error(isRtl ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const payload = {
      title,
      description,
      instructorId,
      courseId: courseId || null,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      meetingUrl: meetingUrl || null,
      ...payloadFromAccessModel(accessModel, { price, selectedLevels }),
    };

    try {
      if (editingSession) {
        await client.patch(`/admin/live-sessions/${editingSession.id}`, payload);
        toast.success(isRtl ? "تم تعديل الحصة بنجاح" : "Live session updated successfully.");
      } else {
        await client.post("/admin/live-sessions", payload);
        toast.success(isRtl ? "تمت إضافة الحصة بنجاح" : "Live session scheduled successfully.");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save session."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmText = isRtl
      ? "هل أنت متأكد من حذف هذه الجلسة المباشرة؟"
      : "Are you sure you want to delete this live session?";
    if (!window.confirm(confirmText)) return;

    try {
      await client.delete(`/admin/live-sessions/${id}`);
      toast.success(isRtl ? "تم حذف الحصة بنجاح" : "Live session deleted successfully.");
      loadData();
    } catch (err) {
      toast.error(getErrorMessage(err, "Delete failed."));
    }
  };

  const filtered = sessions.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.title?.toLowerCase().includes(q) ||
      s.instructor?.fullName?.toLowerCase().includes(q) ||
      s.course?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={isRtl ? "إدارة الحصص المباشرة" : "Live Sessions"}
        subtitle={isRtl ? "جدولة وإدارة البث المباشر المجاني والمدفوع للطلبة." : "Schedule and manage standalone or course-linked live sessions."}
        action={
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-bold text-white transition hover:bg-opacity-95 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {isRtl ? "جدولة بث مباشر جديد" : "Schedule Live Session"}
          </button>
        }
      />

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white ps-9 pe-3 text-sm outline-none focus:border-pioneer-orange-normal dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            placeholder={isRtl ? "بحث باسم الحصة، المحاضر، أو المادة..." : "Search sessions, instructors, or courses..."}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center rounded-xl bg-white dark:bg-[#1A1A22] border border-slate-200 dark:border-white/8">
          <Video className="h-12 w-12 text-slate-300" />
          <p className="font-semibold text-slate-500">{isRtl ? "لا توجد حصص مباشرة مجدولة." : "No scheduled live sessions found."}</p>
        </div>
      ) : (
        <DataTable
          columns={[
            {
              key: "title",
              title: isRtl ? "تفاصيل البث" : "Live Session Info",
              render: (_, r) => (
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">{r.title}</span>
                  {r.course && (
                    <span className="text-xs text-slate-400">
                      {isRtl ? "تابع لكورس: " : "Linked Course: "} {r.course.title}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "instructor",
              title: isRtl ? "المحاضر" : "Instructor",
              render: (_, r) => <span className="text-sm text-slate-700 dark:text-slate-300">{r.instructor?.fullName || "—"}</span>,
            },
            {
              key: "timing",
              title: isRtl ? "الوقت والمدة" : "Timing & Schedule",
              render: (_, r) => {
                const start = new Date(r.startTime);
                const end = new Date(r.endTime);
                const duration = Math.round((end.getTime() - start.getTime()) / 60000);
                return (
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {start.toLocaleDateString(isRtl ? "ar-EG" : "en-US")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({duration}m)
                    </span>
                  </div>
                );
              },
            },
            {
              key: "targetLevels",
              title: isRtl ? "الفئة المستهدفة" : "Target Levels",
              render: (_, r) => (
                <div className="flex flex-wrap gap-1 max-w-[180px]">
                  {r.targetLevels && Array.isArray(r.targetLevels) ? (
                    r.targetLevels.map((lvl) => (
                      <span key={lvl} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        {LEVELS.find((l) => l.value === lvl)?.[isRtl ? "labelAr" : "labelEn"] || lvl}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
              ),
            },
            {
              key: "price",
              title: isRtl ? "نوع الوصول" : "Access Mode",
              render: (_, r) => {
                if (r.isFreeForAll) {
                  return <StatusBadge label={isRtl ? "مجاني" : "FREE"} tone="success" />;
                }
                return (
                  <span className="text-sm font-bold text-pioneer-orange-normal">
                    {Math.round(r.price || 0)} EGP
                  </span>
                );
              },
            },
            {
              key: "actions",
              title: isRtl ? "إجراءات" : "Actions",
              render: (_, r) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(r)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-blue-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={filtered}
        />
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1A1A22] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingSession 
                ? (isRtl ? "تعديل الجلسة المباشرة" : "Edit Live Session") 
                : (isRtl ? "جدولة جلسة مباشرة جديدة" : "Schedule New Live Session")}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "العنوان" : "Title"} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-pioneer-orange-normal dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "الوصف" : "Description"}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-pioneer-orange-normal dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? "المحاضر المسؤول" : "Instructor"} *
                  </label>
                  <select
                    required
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    {instructors.map((inst) => (
                      <option key={inst.id} value={inst.id}>{inst.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? "ربط بكورس (اختياري)" : "Linked Course (Optional)"}
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="">{isRtl ? "حصة مستقلة بذاتها" : "Standalone Session"}</option>
                    {courses.filter(c => c.type === 'HYBRID').map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? "وقت البدء" : "Start Time"} *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? "وقت الانتهاء" : "End Time"} *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "رابط البث (Zoom / Google Meet)" : "Meeting Stream URL"}
                </label>
                <input
                  type="url"
                  placeholder="https://"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-pioneer-orange-normal dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              {/* Access model */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {isRtl ? "نموذج الوصول" : "Access model"}
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { id: "PUBLIC_FREE", ar: "مجاني للجميع", en: "Public free" },
                    { id: "TARGETED_FREE", ar: "مجاني لسنة دراسية", en: "Targeted free" },
                    { id: "PAID", ar: "مدفوع", en: "Paid" },
                  ].map((opt) => (
                    <label key={opt.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-white/10">
                      <input
                        type="radio"
                        name="adminAccessModel"
                        checked={accessModel === opt.id}
                        onChange={() => {
                          setAccessModel(opt.id);
                          setIsFreeForAll(opt.id === "PUBLIC_FREE");
                          if (opt.id !== "PAID") setPrice("0");
                        }}
                      />
                      <span>{isRtl ? opt.ar : opt.en}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Target Academic Levels */}
              {accessModel !== "PUBLIC_FREE" ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {isRtl ? "السنوات الدراسية المستهدفة" : "Target Academic Levels"}
                </label>
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
              ) : null}

              {accessModel === "PAID" ? (
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">
                    {isRtl ? "السعر (EGP)" : "Price"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-40 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-pioneer-orange-normal dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
              </div>
              ) : null}

              {/* Footer buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-bold text-white transition hover:bg-opacity-95 disabled:opacity-50"
                >
                  {submitting ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ" : "Save Session")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
