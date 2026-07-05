import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Clock, Edit3, Loader2, Plus, Save, Trash2, X,
  ClipboardList, Award, Hash, GripVertical,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  useAdminExamById, useUpdateAdminExam,
  useAddAdminExamQuestion, useUpdateAdminExamQuestion, useDeleteAdminExamQuestion,
} from "../../features/admin/exams/hooks";
import { getErrorMessage } from "../../api/error";
import { ExamQuestionBank } from "../../components/exams/ExamQuestionBank";

const LEVELS = [
  { value: "GENERAL", labelAr: "عام / عمومي", labelEn: "General / Public" },
  { value: "PREPARATORY", labelAr: "إعدادي هندسة", labelEn: "Preparatory Year" },
  { value: "FIRST_YEAR", labelAr: "الفرقة الأولى", labelEn: "First Year" },
  { value: "SECOND_YEAR", labelAr: "الفرقة الثانية", labelEn: "Second Year" },
  { value: "THIRD_YEAR", labelAr: "الفرقة الثالثة", labelEn: "Third Year" },
  { value: "FOURTH_YEAR", labelAr: "الفرقة الرابعة / التخرج", labelEn: "Fourth Year" },
  { value: "GRADUATE", labelAr: "خريج / محترف", labelEn: "Graduate / Professional" },
];

const listToText = (value) => {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") return item.title || item.text || item.label || "";
      return "";
    })
    .filter(Boolean)
    .join("\n");
};

const textToList = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const structureToText = (value) => {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return "";
      return [item.title, item.questionCount, item.points].filter((part) => part !== undefined && part !== null && part !== "").join(" | ");
    })
    .filter(Boolean)
    .join("\n");
};

const textToStructure = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, questionCount, points] = line.split("|").map((part) => part.trim());
      return {
        title,
        questionCount: Number(questionCount) || 0,
        points: Number(points) || 0,
      };
    });

/* ═══════════════════════════════════════
   MAIN: ExamEditor
   ═══════════════════════════════════════ */
export default function ExamEditor() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const label = (key, fallback, opts) => t(`adminPages.examEditor.${key}`, { defaultValue: fallback, ...opts });
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: exam, isLoading, isError } = useAdminExamById(id);
  const updateExamMutation = useUpdateAdminExam();
  const addQuestionMutation = useAddAdminExamQuestion();
  const updateQuestionMutation = useUpdateAdminExamQuestion();
  const deleteQuestionMutation = useDeleteAdminExamQuestion();
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  /* ── Settings State ── */
  const [editingSettings, setEditingSettings] = useState(false);
  const [settings, setSettings] = useState(null);

  const initSettings = () => {
    if (!exam) return;
    setSettings({
      title: exam.title || "",
      type: exam.type || "STANDALONE",
      status: exam.status || "UPCOMING",
      description: exam.description || "",
      durationMinutes: exam.durationMinutes || 60,
      totalPoints: exam.totalPoints || 100,
      passingScore: exam.passingScore || 60,
      coveredTopicsText: listToText(exam.coveredTopics),
      examStructureText: structureToText(exam.examStructure),
      importantInstructionsText: listToText(exam.importantInstructions),
      preparationTipsText: listToText(exam.preparationTips),
      readyMessage: exam.readyMessage || "",
      targetLevels: exam.targetLevels || [],
    });
    setEditingSettings(true);
  };

  const saveSettings = async () => {
    try {
      await updateExamMutation.mutateAsync({
        id,
        body: {
          title: settings.title,
          type: settings.type,
          status: settings.status,
          description: settings.description?.trim() || null,
          durationMinutes: Number(settings.durationMinutes),
          totalPoints: Number(settings.totalPoints),
          passingScore: Number(settings.passingScore),
          coveredTopics: textToList(settings.coveredTopicsText),
          examStructure: textToStructure(settings.examStructureText),
          importantInstructions: textToList(settings.importantInstructionsText),
          preparationTips: textToList(settings.preparationTipsText),
          readyMessage: settings.readyMessage?.trim() || null,
          targetLevels: settings.targetLevels,
        },
      });
      setEditingSettings(false);
      toast.success(label("settingsSaved", "Settings saved"));
    } catch (err) { toast.error(getErrorMessage(err, label("saveFailed", "Failed to save"))); }
  };

  const handleAddQuestion = useCallback(
    async (body) => {
      try {
        await addQuestionMutation.mutateAsync({ examId: id, body });
        toast.success(label("questionAdded", "Question added"));
      } catch (err) {
        toast.error(getErrorMessage(err, label("questionAddFailed", "Failed to add question")));
      }
    },
    [addQuestionMutation, id]
  );

  const handleSaveQuestion = useCallback(
    async (questionId, body) => {
      setSavingId(questionId);
      try {
        await updateQuestionMutation.mutateAsync({ examId: id, questionId, body });
        toast.success(label("questionSaved", "Question saved"));
      } catch (err) {
        toast.error(getErrorMessage(err, label("questionSaveFailed", "Failed to save")));
        throw err;
      } finally {
        setSavingId(null);
      }
    },
    [updateQuestionMutation, id]
  );

  const handleDeleteQuestion = useCallback(
    async (questionId) => {
      if (!window.confirm(label("deleteConfirm", "Delete this question?"))) return;
      setDeletingId(questionId);
      try {
        await deleteQuestionMutation.mutateAsync({ examId: id, questionId });
        toast.success(label("questionDeleted", "Question deleted"));
      } catch (err) {
        toast.error(getErrorMessage(err, label("questionDeleteFailed", "Failed to delete")));
      } finally {
        setDeletingId(null);
      }
    },
    [deleteQuestionMutation, id]
  );

  /* ── States ── */
  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" /></div>;
  if (isError || !exam) return (
    <div className="mx-auto max-w-lg space-y-4 py-20 text-center">
      <p className="text-lg font-bold text-slate-900 dark:text-white">{label("notFound", "Exam not found")}</p>
      <Link to="/admin/exams" className="text-sm text-[#EE7C11] hover:underline">{label("backToExams", "← Back to exams")}</Link>
    </div>
  );

  const questions = exam.questions || [];
  const totalQuestionPoints = questions.reduce((s, q) => s + (q.points || 0), 0);

  return (
    <section className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/admin/exams")} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{exam.title}</h1>
            <p className="text-xs text-slate-500">{exam.type} · {exam.status} · {exam.durationMinutes} min</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${exam.status === "AVAILABLE" || exam.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"}`}>{exam.status}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: label("stats.questions", "Questions"), value: questions.length, icon: Hash, color: "text-blue-500" },
          { label: label("stats.totalPoints", "Total Points"), value: totalQuestionPoints + " / " + exam.totalPoints, icon: Award, color: totalQuestionPoints === exam.totalPoints ? "text-emerald-500" : "text-red-500" },
          { label: label("stats.duration", "Duration"), value: exam.durationMinutes + " min", icon: Clock, color: "text-purple-500" },
          { label: label("stats.passScore", "Pass Score"), value: exam.passingScore, icon: CheckCircle2, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
            <div className="mb-1 flex items-center gap-1.5">
              <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
            </div>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Settings Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">{label("settingsTitle", "Exam Settings")}</h2>
          {!editingSettings ? (
            <button onClick={initSettings} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"><Edit3 className="h-3 w-3" /> {label("edit", "Edit")}</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditingSettings(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-white/10">{label("cancel", "Cancel")}</button>
              <button onClick={saveSettings} disabled={updateExamMutation.isPending} className="inline-flex items-center gap-1 rounded-lg bg-[#EE7C11] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#d9700e] disabled:opacity-50">
                {updateExamMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} {label("save", "Save")}
              </button>
            </div>
          )}
        </div>
        {editingSettings && settings ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block space-y-1 sm:col-span-3"><span className="text-xs font-bold text-slate-500">Title</span><input value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" /></label>
            <label className="block space-y-1 sm:col-span-3"><span className="text-xs font-bold text-slate-500">About this exam</span><textarea rows={3} value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })} placeholder="Short description shown in the mobile exam details screen." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" /></label>
            <label className="block space-y-1"><span className="text-xs font-bold text-slate-500">Type</span><select value={settings.type} onChange={(e) => setSettings({ ...settings, type: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white">{["STANDALONE","FINAL","UNIT","LESSON"].map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className="block space-y-1"><span className="text-xs font-bold text-slate-500">Status</span><select value={settings.status} onChange={(e) => setSettings({ ...settings, status: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white">{["UPCOMING","AVAILABLE","COMPLETED","EXPIRED"].map((t) => <option key={t}>{t}</option>)}</select></label>
            <label className="block space-y-1"><span className="text-xs font-bold text-slate-500">Duration (min)</span><input type="number" min={1} value={settings.durationMinutes} onChange={(e) => setSettings({ ...settings, durationMinutes: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" /></label>
            <label className="block space-y-1"><span className="text-xs font-bold text-slate-500">Total Points</span><input type="number" min={1} value={settings.totalPoints} onChange={(e) => setSettings({ ...settings, totalPoints: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" /></label>
            <label className="block space-y-1"><span className="text-xs font-bold text-slate-500">Passing Score</span><input type="number" min={1} value={settings.passingScore} onChange={(e) => setSettings({ ...settings, passingScore: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" /></label>
            
            {/* Target Academic Years/Levels */}
            <div className="sm:col-span-3">
              <span className="text-xs font-bold text-slate-500">
                {isRtl ? "السنوات الدراسية المستهدفة" : "Target Academic Levels"}
              </span>
              <div className="mt-1.5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-[#0F0F13] p-4 border border-slate-100 dark:border-white/5">
                {LEVELS.map((lvl) => (
                  <label key={lvl.value} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(settings.targetLevels || []).includes(lvl.value)}
                      onChange={() => {
                        const current = settings.targetLevels || [];
                        const updated = current.includes(lvl.value)
                          ? current.filter((v) => v !== lvl.value)
                          : [...current, lvl.value];
                        setSettings({ ...settings, targetLevels: updated });
                      }}
                      className="rounded text-pioneer-orange-normal focus:ring-pioneer-orange-normal/30 h-4 w-4"
                    />
                    <span>{isRtl ? lvl.labelAr : lvl.labelEn}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sm:col-span-3">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Mobile Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1"><span className="text-xs font-bold text-slate-500">Covered Topics</span><textarea rows={5} value={settings.coveredTopicsText} onChange={(e) => setSettings({ ...settings, coveredTopicsText: e.target.value })} placeholder="One topic per line" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" /></label>
                <label className="block space-y-1"><span className="text-xs font-bold text-slate-500">Exam Structure</span><textarea rows={5} value={settings.examStructureText} onChange={(e) => setSettings({ ...settings, examStructureText: e.target.value })} placeholder={"Listening | 20 | 30\nReading | 15 | 30"} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" /><span className="text-[11px] text-slate-400">Format: Section title | question count | points</span></label>
                <label className="block space-y-1"><span className="text-xs font-bold text-slate-500">Important Instructions</span><textarea rows={5} value={settings.importantInstructionsText} onChange={(e) => setSettings({ ...settings, importantInstructionsText: e.target.value })} placeholder="One instruction per line" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" /></label>
                <label className="block space-y-1"><span className="text-xs font-bold text-slate-500">Preparation Tips</span><textarea rows={5} value={settings.preparationTipsText} onChange={(e) => setSettings({ ...settings, preparationTipsText: e.target.value })} placeholder="One preparation tip per line" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" /></label>
                <label className="block space-y-1 sm:col-span-2"><span className="text-xs font-bold text-slate-500">Ready Message</span><input value={settings.readyMessage} onChange={(e) => setSettings({ ...settings, readyMessage: e.target.value })} placeholder="Make sure you have 90 minutes available and a stable internet connection." className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" /></label>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            <div><span className="text-slate-400">Title:</span> <span className="font-medium text-slate-900 dark:text-white">{exam.title}</span></div>
            <div className="sm:col-span-3"><span className="text-slate-400">About:</span> <span className="font-medium text-slate-900 dark:text-white">{exam.description || "—"}</span></div>
            <div><span className="text-slate-400">Type:</span> <span className="font-medium text-slate-900 dark:text-white">{exam.type}</span></div>
            <div><span className="text-slate-400">Status:</span> <span className="font-medium text-slate-900 dark:text-white">{exam.status}</span></div>
            <div><span className="text-slate-400">Duration:</span> <span className="font-medium text-slate-900 dark:text-white">{exam.durationMinutes} min</span></div>
            <div><span className="text-slate-400">Total Points:</span> <span className="font-medium text-slate-900 dark:text-white">{exam.totalPoints}</span></div>
            <div><span className="text-slate-400">Pass Score:</span> <span className="font-medium text-slate-900 dark:text-white">{exam.passingScore}</span></div>
            <div><span className="text-slate-400">Topics:</span> <span className="font-medium text-slate-900 dark:text-white">{exam.coveredTopics?.length || 0}</span></div>
            <div><span className="text-slate-400">Structure sections:</span> <span className="font-medium text-slate-900 dark:text-white">{exam.examStructure?.length || 0}</span></div>
            <div><span className="text-slate-400">Instructions:</span> <span className="font-medium text-slate-900 dark:text-white">{exam.importantInstructions?.length || 0}</span></div>
          </div>
        )}
      </div>

      <ExamQuestionBank
        exam={exam}
        onAddQuestion={handleAddQuestion}
        onSaveQuestion={handleSaveQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        isAdding={addQuestionMutation.isPending}
        savingId={savingId}
        deletingId={deletingId}
        showGrip
      />
    </section>
  );
}
