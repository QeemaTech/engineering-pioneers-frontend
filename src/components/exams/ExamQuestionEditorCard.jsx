import { useEffect, useState } from "react";
import { CheckCircle2, GripVertical, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  buildQuestionPayload,
  defaultCorrectForType,
  defaultOptionsForType,
  normalizeOptions,
  QUESTION_TYPES,
} from "./examQuestionUtils";

const INPUT =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500";

const TEXTAREA = `${INPUT} min-h-[80px] resize-y py-2.5`;

function useLabels() {
  const { t } = useTranslation();
  return (key, fallback) => t(`examQuestionEditor.${key}`, { defaultValue: fallback });
}

function TypeBadge({ type, label }) {
  const colors = {
    MULTIPLE_CHOICE: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    TRUE_FALSE: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    SHORT_ANSWER: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    ESSAY: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colors[type] || "bg-slate-100 text-slate-600"}`}
    >
      {label(`types.${type}`, type)}
    </span>
  );
}

function OptionsEditor({ type, options, correctAnswer, onOptionsChange, onCorrectChange, compact }) {
  const label = useLabels();

  if (type === "SHORT_ANSWER" || type === "ESSAY") {
    return (
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {type === "ESSAY" ? label("rubric", "Grading rubric") : label("modelAnswer", "Model answer")}
        </p>
        <textarea
          value={correctAnswer}
          onChange={(e) => onCorrectChange(e.target.value)}
          rows={type === "ESSAY" ? 3 : 2}
          placeholder={
            type === "ESSAY"
              ? label("essayPlaceholder", "Key points for grading…")
              : label("modelAnswerPlaceholder", "Expected answer for reference…")
          }
          className={TEXTAREA}
        />
        <p className="text-[10px] text-slate-400">{label("modelAnswerOptional", "Optional — instructor grading reference.")}</p>
      </div>
    );
  }

  const rows = type === "TRUE_FALSE" ? ["True", "False"] : options;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label("optionsTitle", "Answer options")}</p>
          <p className="text-[10px] text-slate-400">{label("optionsHint", "Click the circle to mark the correct answer.")}</p>
        </div>
        {type === "MULTIPLE_CHOICE" ? (
          <button
            type="button"
            disabled={options.length >= 6}
            onClick={() => onOptionsChange([...options, ""])}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#EE7C11] disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
            {label("addOption", "Add option")}
          </button>
        ) : null}
      </div>

      <div className={`space-y-2 ${compact ? "" : "sm:grid sm:grid-cols-1"}`}>
        {rows.map((opt, idx) => {
          const value = type === "TRUE_FALSE" ? opt : opt;
          const isCorrect = correctAnswer === value;
          const letter = String.fromCharCode(65 + idx);

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 rounded-xl border p-2 transition-all ${
                isCorrect
                  ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10"
                  : "border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-[#12121a]/60"
              }`}
            >
              <button
                type="button"
                onClick={() => onCorrectChange(value)}
                title={label("markCorrect", "Mark as correct")}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isCorrect
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 hover:border-slate-400 dark:border-white/25"
                }`}
              >
                {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
              </button>

              {type === "MULTIPLE_CHOICE" ? (
                <>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#EE7C11]/10 text-[10px] font-bold text-[#EE7C11]">
                    {letter}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const next = [...options];
                      const old = next[idx];
                      next[idx] = e.target.value;
                      onOptionsChange(next);
                      if (correctAnswer === old) onCorrectChange(e.target.value);
                    }}
                    placeholder={label("optionPlaceholder", `Option ${letter}`, { letter })}
                    className={`${INPUT} h-9 flex-1`}
                  />
                  {options.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const removed = options[idx];
                        const next = options.filter((_, i) => i !== idx);
                        onOptionsChange(next);
                        if (correctAnswer === removed) onCorrectChange(next[0] || "");
                      }}
                      className="shrink-0 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onCorrectChange(opt)}
                  className={`flex-1 rounded-lg px-3 py-2 text-start text-sm font-semibold transition-all ${
                    isCorrect
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {opt === "True" ? label("trueLabel", "True") : label("falseLabel", "False")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ExamQuestionEditorCard({
  question,
  index,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
  compact = false,
  showGrip = false,
}) {
  const label = useLabels();

  const [questionText, setQuestionText] = useState(question.questionText || "");
  const [type, setType] = useState(question.type || "MULTIPLE_CHOICE");
  const [points, setPoints] = useState(String(question.points || 5));
  const [options, setOptions] = useState(() => normalizeOptions(question.options, question.type));
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer || "");
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setQuestionText(question.questionText || "");
    setType(question.type || "MULTIPLE_CHOICE");
    setPoints(String(question.points || 5));
    const normalized = normalizeOptions(question.options, question.type);
    setOptions(normalized);
    setCorrectAnswer(question.correctAnswer || defaultCorrectForType(question.type, normalized));
    setDirty(false);
    setError("");
  }, [question]);

  const mark = (fn) => (value) => {
    fn(value);
    setDirty(true);
    setError("");
  };

  const handleTypeChange = (nextType) => {
    const nextOptions = defaultOptionsForType(nextType);
    setType(nextType);
    setOptions(nextOptions);
    setCorrectAnswer(defaultCorrectForType(nextType, nextOptions));
    setDirty(true);
    setError("");
  };

  const handleSave = async () => {
    setError("");
    try {
      const body = buildQuestionPayload({
        questionText,
        type,
        points,
        order: question.order,
        options: type === "MULTIPLE_CHOICE" ? options : type === "TRUE_FALSE" ? ["True", "False"] : [],
        correctAnswer: type === "SHORT_ANSWER" || type === "ESSAY" ? correctAnswer : correctAnswer,
      });
      await onSave(question.id, body);
      setDirty(false);
    } catch (err) {
      const map = {
        MIN_OPTIONS: label("minOptions", "Add at least two options."),
        CORRECT_REQUIRED: label("correctRequired", "Select the correct answer."),
        TEXT_REQUIRED: label("textRequired", "Question text is required."),
        POINTS_INVALID: label("pointsInvalid", "Points must be at least 1."),
      };
      setError(map[err.message] || label("validation", "Please check all fields."));
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all dark:bg-[#1A1A22] ${
        dirty ? "border-[#EE7C11]/40 ring-1 ring-[#EE7C11]/20" : "border-slate-200 dark:border-white/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/5">
        <div className="flex min-w-0 items-center gap-2">
          {showGrip ? <GripVertical className="h-4 w-4 shrink-0 text-slate-300" /> : null}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EE7C11] text-xs font-bold text-white">
            {index + 1}
          </span>
          <TypeBadge type={type} label={label} />
          <span className="text-[10px] font-semibold text-slate-400">
            {points} {label("pointsShort", "pts")}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {dirty ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1 rounded-lg bg-[#EE7C11] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-[#d9700e] disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              {label("save", "Save")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(question.id)}
            disabled={isDeleting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={`space-y-4 ${compact ? "p-3" : "p-4"}`}>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label("questionText", "Question text")}
          </label>
          <textarea
            value={questionText}
            onChange={(e) => mark(setQuestionText)(e.target.value)}
            rows={compact ? 2 : 3}
            placeholder={label("questionPlaceholder", "Write the question prompt…")}
            className={TEXTAREA}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {label("questionType", "Question type")}
            </label>
            <select value={type} onChange={(e) => handleTypeChange(e.target.value)} className={INPUT}>
              {QUESTION_TYPES.map((qt) => (
                <option key={qt} value={qt}>
                  {label(`types.${qt}`, qt)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {label("points", "Points")}
            </label>
            <input
              type="number"
              min={1}
              value={points}
              onChange={(e) => mark(setPoints)(e.target.value)}
              className={INPUT}
            />
          </div>
        </div>

        <OptionsEditor
          type={type}
          options={options}
          correctAnswer={correctAnswer}
          onOptionsChange={(next) => mark(setOptions)(next)}
          onCorrectChange={(v) => mark(setCorrectAnswer)(v)}
          compact={compact}
        />
      </div>
    </div>
  );
}
