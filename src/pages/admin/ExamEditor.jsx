import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Clock, Edit3, Loader2, Plus, Save, Trash2, X,
  ClipboardList, Award, Hash, GripVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useAdminExamById, useUpdateAdminExam,
  useAddAdminExamQuestion, useUpdateAdminExamQuestion, useDeleteAdminExamQuestion,
} from "../../features/admin/exams/hooks";
import { getErrorMessage } from "../../api/error";

const QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"];

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

/* ─── Question Card ─── */
function QuestionCard({ question, examId, index }) {
  const updateMutation = useUpdateAdminExamQuestion();
  const deleteMutation = useDeleteAdminExamQuestion();

  const [text, setText] = useState(question.questionText || "");
  const [type, setType] = useState(question.type || "MULTIPLE_CHOICE");
  const [points, setPoints] = useState(question.points || 1);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer || "");
  const [options, setOptions] = useState(question.options || ["", "", "", ""]);
  const [dirty, setDirty] = useState(false);

  const markDirty = (setter) => (val) => { setter(val); setDirty(true); };

  const save = async () => {
    try {
      const body = { questionText: text, type, points: Number(points), correctAnswer };
      if (type === "MULTIPLE_CHOICE") body.options = options.filter((o) => o.trim());
      await updateMutation.mutateAsync({ examId, questionId: question.id, body });
      setDirty(false);
      toast.success(`Q${index + 1} saved`);
    } catch (err) { toast.error(getErrorMessage(err, "Failed to save")); }
  };

  const remove = async () => {
    if (!confirm(`Delete Question ${index + 1}?`)) return;
    try {
      await deleteMutation.mutateAsync({ examId, questionId: question.id });
      toast.success("Question deleted");
    } catch (err) { toast.error(getErrorMessage(err, "Failed to delete")); }
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    setDirty(true);
    if (newType === "MULTIPLE_CHOICE" && (!options || options.length < 2)) setOptions(["", "", "", ""]);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3 dark:border-white/5">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-300" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">Question {index + 1}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-white/10">{type}</span>
          <span className="text-[10px] text-slate-400">{points} pts</span>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button onClick={save} disabled={updateMutation.isPending} className="inline-flex items-center gap-1 rounded-lg bg-[#EE7C11] px-3 py-1 text-xs font-bold text-white hover:bg-[#d9700e] disabled:opacity-50">
              {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
            </button>
          )}
          <button onClick={remove} disabled={deleteMutation.isPending} className="rounded p-1 text-slate-400 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 p-5">
        <textarea value={text} onChange={(e) => markDirty(setText)(e.target.value)} rows={2} placeholder="Enter the question text..." className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#EE7C11]/50 focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</span>
            <select value={type} onChange={(e) => handleTypeChange(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white">
              {QUESTION_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Points</span>
            <input type="number" min={1} value={points} onChange={(e) => markDirty(setPoints)(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
          </label>
          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Correct Answer</span>
            <input value={correctAnswer} onChange={(e) => markDirty(setCorrectAnswer)(e.target.value)} placeholder={type === "TRUE_FALSE" ? "true / false" : "Exact answer"} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
          </label>
        </div>

        {type === "MULTIPLE_CHOICE" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Options</span>
              <button type="button" onClick={() => { setOptions([...options, ""]); setDirty(true); }} className="text-[10px] font-bold text-[#EE7C11] hover:underline">+ Add Option</button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((opt, i) => (
                <div key={i} className="relative flex items-center">
                  <input value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; markDirty(setOptions)(n); }} placeholder={`Option ${i + 1}`} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pe-8 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
                  {options.length > 2 && (
                    <button onClick={() => { markDirty(setOptions)(options.filter((_, j) => j !== i)); }} className="absolute end-2 text-slate-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN: ExamEditor
   ═══════════════════════════════════════ */
export default function ExamEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: exam, isLoading, isError } = useAdminExamById(id);
  const updateExamMutation = useUpdateAdminExam();
  const addQuestionMutation = useAddAdminExamQuestion();

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
        },
      });
      setEditingSettings(false);
      toast.success("Settings saved");
    } catch (err) { toast.error(getErrorMessage(err, "Failed to save")); }
  };

  /* ── Add Question ── */
  const handleAddQuestion = useCallback(async () => {
    const order = (exam?.questions?.length || 0) + 1;
    try {
      await addQuestionMutation.mutateAsync({
        examId: id,
        body: { questionText: `Question ${order}`, type: "MULTIPLE_CHOICE", points: 10, order, options: ["", "", "", ""], correctAnswer: "" },
      });
      toast.success("Question added");
    } catch (err) { toast.error(getErrorMessage(err, "Failed to add question")); }
  }, [addQuestionMutation, id, exam]);

  /* ── States ── */
  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" /></div>;
  if (isError || !exam) return <div className="mx-auto max-w-lg space-y-4 py-20 text-center"><p className="text-lg font-bold text-slate-900 dark:text-white">Exam not found</p><Link to="/admin/exams" className="text-sm text-[#EE7C11] hover:underline">← Back to exams</Link></div>;

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
          { label: "Questions", value: questions.length, icon: Hash, color: "text-blue-500" },
          { label: "Total Points", value: totalQuestionPoints + " / " + exam.totalPoints, icon: Award, color: totalQuestionPoints === exam.totalPoints ? "text-emerald-500" : "text-red-500" },
          { label: "Duration", value: exam.durationMinutes + " min", icon: Clock, color: "text-purple-500" },
          { label: "Pass Score", value: exam.passingScore, icon: CheckCircle2, color: "text-amber-500" },
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Exam Settings</h2>
          {!editingSettings ? (
            <button onClick={initSettings} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"><Edit3 className="h-3 w-3" /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditingSettings(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 dark:border-white/10">Cancel</button>
              <button onClick={saveSettings} disabled={updateExamMutation.isPending} className="inline-flex items-center gap-1 rounded-lg bg-[#EE7C11] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#d9700e] disabled:opacity-50">
                {updateExamMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
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

      {/* Question Bank */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Question Bank ({questions.length})</h2>
          <button onClick={handleAddQuestion} disabled={addQuestionMutation.isPending} className="inline-flex items-center gap-1.5 rounded-lg bg-[#EE7C11] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#d9700e] disabled:opacity-50">
            {addQuestionMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center dark:border-white/10">
            <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-bold text-slate-500">No questions yet</p>
            <p className="mt-1 text-xs text-slate-400">Click "Add Question" to start building your question bank.</p>
          </div>
        ) : (
          questions.map((q, i) => <QuestionCard key={q.id} question={q} examId={id} index={i} />)
        )}
      </div>
    </section>
  );
}
