import { Loader2, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import ExamQuestionEditorCard from "./ExamQuestionEditorCard";
import { defaultNewQuestion } from "./examQuestionUtils";

function PointsBar({ questions, totalPoints, label }) {
  const used = (questions || []).reduce((sum, q) => sum + (Number(q.points) || 0), 0);
  const pct = totalPoints ? Math.min(100, Math.round((used / totalPoints) * 100)) : 0;
  const ok = used === totalPoints;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-[#12121a]/50">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-300">{label("pointsAllocated", "Points allocated")}</span>
        <span className={`font-bold ${ok ? "text-emerald-600" : used > totalPoints ? "text-red-500" : "text-[#EE7C11]"}`}>
          {used} / {totalPoints ?? "—"}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${ok ? "bg-emerald-500" : used > totalPoints ? "bg-red-500" : "bg-[#EE7C11]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ExamQuestionBank({
  exam,
  isLoading,
  onAddQuestion,
  onSaveQuestion,
  onDeleteQuestion,
  isAdding,
  savingId,
  deletingId,
  compact = false,
  showGrip = false,
  headerExtra,
}) {
  const { t } = useTranslation();
  const label = (key, fallback, opts) => t(`examQuestionEditor.${key}`, { defaultValue: fallback, ...opts });
  const questions = exam?.questions || [];

  const handleAdd = () => {
    onAddQuestion(
      defaultNewQuestion(
        questions.length + 1,
        label("newQuestionDraft", "Write your question here...")
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-[#EE7C11]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {label("bankTitle", "Question bank")}
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {label("questionsCount", "{{count}} questions", { count: questions.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#EE7C11] px-4 py-2 text-xs font-bold text-white hover:bg-[#d9700e] disabled:opacity-60"
        >
          {isAdding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          {label("addQuestion", "Add question")}
        </button>
      </div>

      {exam?.totalPoints != null ? <PointsBar questions={questions} totalPoints={exam.totalPoints} label={label} /> : null}

      {headerExtra}

      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center dark:border-white/10">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label("emptyTitle", "No questions yet")}</p>
          <p className="mt-1 text-xs text-slate-400">{label("emptyHint", "Click “Add question” to start building your exam.")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <ExamQuestionEditorCard
              key={q.id}
              question={q}
              index={i}
              onSave={onSaveQuestion}
              onDelete={onDeleteQuestion}
              isSaving={savingId === q.id}
              isDeleting={deletingId === q.id}
              compact={compact}
              showGrip={showGrip}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ExamQuestionBankDrawer({
  exam,
  examId,
  isLoading,
  onClose,
  onAddQuestion,
  onSaveQuestion,
  onDeleteQuestion,
  isAdding,
  savingId,
  deletingId,
}) {
  const { t, i18n } = useTranslation();
  const label = (key, fallback) => t(`examQuestionEditor.${key}`, { defaultValue: fallback });
  const isRtl = i18n.dir() === "rtl";

  if (!examId) return null;

  return (
    <>
      <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        className={`fixed inset-y-0 z-[60] flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-[#1A1A22] ${
          isRtl ? "left-0 border-r border-slate-200 dark:border-white/10" : "right-0 border-l border-slate-200 dark:border-white/10"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/5">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
              {exam?.title || t("dashboard.common.loading")}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {label("drawerSubtitle", "Question bank editor")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <ExamQuestionBank
            exam={exam}
            isLoading={isLoading}
            onAddQuestion={onAddQuestion}
            onSaveQuestion={onSaveQuestion}
            onDeleteQuestion={onDeleteQuestion}
            isAdding={isAdding}
            savingId={savingId}
            deletingId={deletingId}
            compact
          />
        </div>
      </div>
    </>
  );
}
