import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  buildQuestionPayload,
  defaultCorrectForType,
  defaultOptionsForType,
  normalizeOptions,
  QUESTION_TYPES,
} from "./examQuestionUtils";

const INPUT =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500";

const TEXTAREA = `${INPUT} min-h-[96px] resize-y py-2.5`;

function TypeBadge({ type, t }) {
  const colors = {
    MULTIPLE_CHOICE: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    TRUE_FALSE: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    SHORT_ANSWER: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    ESSAY: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colors[type] || "bg-slate-100 text-slate-600"}`}>
      {t(`dashboard.instructor.exams.questionTypes.${type}`)}
    </span>
  );
}

function QuestionTypeSelect({ value, onChange, t, className = INPUT }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      {QUESTION_TYPES.map((type) => (
        <option key={type} value={type}>
          {t(`dashboard.instructor.exams.questionTypes.${type}`)}
        </option>
      ))}
    </select>
  );
}

export function AddQuestionForm({ onSubmit, isPending }) {
  const { t } = useTranslation();
  const [questionText, setQuestionText] = useState("");
  const [type, setType] = useState("MULTIPLE_CHOICE");
  const [points, setPoints] = useState("5");
  const [options, setOptions] = useState(defaultOptionsForType("MULTIPLE_CHOICE"));
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [error, setError] = useState("");

  const handleTypeChange = (nextType) => {
    const nextOptions = defaultOptionsForType(nextType);
    setType(nextType);
    setOptions(nextOptions);
    setCorrectAnswer(defaultCorrectForType(nextType, nextOptions));
    setModelAnswer("");
  };

  const resetForm = () => {
    setQuestionText("");
    setType("MULTIPLE_CHOICE");
    setPoints("5");
    const nextOptions = defaultOptionsForType("MULTIPLE_CHOICE");
    setOptions(nextOptions);
    setCorrectAnswer(defaultCorrectForType("MULTIPLE_CHOICE", nextOptions));
    setModelAnswer("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = buildQuestionPayload({
        questionText,
        type,
        points,
        order: 0,
        options: type === "MULTIPLE_CHOICE" ? options : type === "TRUE_FALSE" ? ["True", "False"] : [],
        correctAnswer: type === "SHORT_ANSWER" || type === "ESSAY" ? modelAnswer : correctAnswer,
      });
      await onSubmit(payload);
      resetForm();
    } catch (err) {
      if (err.message === "MIN_OPTIONS") {
        setError(t("dashboard.instructor.exams.detailPage.minOptions"));
      } else if (err.message === "CORRECT_REQUIRED") {
        setError(t("dashboard.instructor.exams.detailPage.correctRequired"));
      } else {
        setError(t("dashboard.common.validation"));
      }
    }
  };

  const showOptions = type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("dashboard.instructor.exams.detailPage.questionText")} <span className="text-[#EE7C11]">*</span>
          </span>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={3}
            placeholder={t("dashboard.instructor.exams.detailPage.questionPlaceholder")}
            className={TEXTAREA}
            required
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("dashboard.instructor.exams.detailPage.questionType")}
          </span>
          <QuestionTypeSelect value={type} onChange={handleTypeChange} t={t} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("dashboard.instructor.exams.detailPage.points")}
          </span>
          <input
            type="number"
            min={1}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className={INPUT}
            required
          />
        </label>
      </div>

      {showOptions ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-[#12121a]/50">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t("dashboard.instructor.exams.detailPage.optionsTitle")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("dashboard.instructor.exams.detailPage.optionsHint")}
              </p>
            </div>
            {type === "MULTIPLE_CHOICE" ? (
              <button
                type="button"
                onClick={() => {
                  if (options.length >= 6) return;
                  setOptions((prev) => [...prev, ""]);
                }}
                disabled={options.length >= 6}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#EE7C11] disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("dashboard.instructor.exams.detailPage.addOption")}
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            {(type === "TRUE_FALSE" ? ["True", "False"] : options).map((opt, idx) => {
              const label = type === "TRUE_FALSE" ? opt : opt || `${String.fromCharCode(65 + idx)}`;
              const isCorrect = correctAnswer === (type === "TRUE_FALSE" ? opt : opt);
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all ${
                    isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10"
                      : "border-slate-200 bg-white dark:border-white/10 dark:bg-[#12121a]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(type === "TRUE_FALSE" ? opt : opt)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 dark:border-white/30"
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="h-3 w-3" /> : null}
                  </button>
                  {type === "MULTIPLE_CHOICE" ? (
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...options];
                        const old = next[idx];
                        next[idx] = e.target.value;
                        setOptions(next);
                        if (correctAnswer === old) setCorrectAnswer(e.target.value);
                      }}
                      placeholder={t("dashboard.instructor.exams.detailPage.optionPlaceholder", {
                        letter: String.fromCharCode(65 + idx),
                      })}
                      className={`${INPUT} h-9 flex-1`}
                      required
                    />
                  ) : (
                    <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{opt}</span>
                  )}
                  {type === "MULTIPLE_CHOICE" && options.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const removed = options[idx];
                        const next = options.filter((_, i) => i !== idx);
                        setOptions(next);
                        if (correctAnswer === removed) setCorrectAnswer(next[0] || "");
                      }}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {type === "ESSAY"
              ? t("dashboard.instructor.exams.detailPage.rubricHint")
              : t("dashboard.instructor.exams.detailPage.modelAnswer")}
          </span>
          <textarea
            value={modelAnswer}
            onChange={(e) => setModelAnswer(e.target.value)}
            rows={type === "ESSAY" ? 4 : 2}
            placeholder={
              type === "ESSAY"
                ? t("dashboard.instructor.exams.detailPage.essayPlaceholder")
                : t("dashboard.instructor.exams.detailPage.modelAnswerPlaceholder")
            }
            className={TEXTAREA}
          />
          <span className="text-[11px] text-slate-400">{t("dashboard.instructor.exams.detailPage.modelAnswerOptional")}</span>
        </label>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("dashboard.instructor.exams.detailPage.addQuestion")}
        </button>
      </div>
    </form>
  );
}

export function QuestionCard({ question, index, onUpdate, onDelete, isUpdating, isDeleting }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [questionText, setQuestionText] = useState(question.questionText || "");
  const [type, setType] = useState(question.type || "MULTIPLE_CHOICE");
  const [points, setPoints] = useState(String(question.points || 1));
  const [options, setOptions] = useState(() => normalizeOptions(question.options, question.type));
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer || "");
  const [modelAnswer, setModelAnswer] = useState(question.correctAnswer || "");
  const [error, setError] = useState("");

  useEffect(() => {
    setQuestionText(question.questionText || "");
    setType(question.type || "MULTIPLE_CHOICE");
    setPoints(String(question.points || 1));
    const normalized = normalizeOptions(question.options, question.type);
    setOptions(normalized);
    setCorrectAnswer(question.correctAnswer || defaultCorrectForType(question.type, normalized));
    setModelAnswer(question.correctAnswer || "");
  }, [question]);

  const handleTypeChange = (nextType) => {
    const nextOptions = defaultOptionsForType(nextType);
    setType(nextType);
    setOptions(nextOptions);
    setCorrectAnswer(defaultCorrectForType(nextType, nextOptions));
    setModelAnswer("");
  };

  const handleSave = async () => {
    setError("");
    try {
      const payload = buildQuestionPayload({
        questionText,
        type,
        points,
        order: question.order,
        options: type === "MULTIPLE_CHOICE" ? options : type === "TRUE_FALSE" ? ["True", "False"] : [],
        correctAnswer: type === "SHORT_ANSWER" || type === "ESSAY" ? modelAnswer : correctAnswer,
      });
      await onUpdate(question.id, payload);
      setEditing(false);
    } catch (err) {
      setError(t("dashboard.common.validation"));
    }
  };

  const displayOptions = normalizeOptions(question.options, question.type);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EE7C11] text-xs font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <TypeBadge type={question.type} t={t} />
              <span className="text-xs font-semibold text-slate-400">
                {question.points} {t("dashboard.instructor.exams.points")}
              </span>
            </div>
            {!editing ? (
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{question.questionText}</p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-bold text-[#EE7C11] hover:underline"
            >
              {t("dashboard.common.edit")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(question.id)}
            disabled={isDeleting}
            className="text-slate-400 hover:text-red-500 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!editing && displayOptions.length > 0 ? (
        <ul className="mt-3 space-y-1.5 ps-10">
          {displayOptions.map((opt, i) => {
            const isCorrect = question.correctAnswer === opt;
            return (
              <li
                key={i}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                  isCorrect ? "bg-emerald-500/10 font-semibold text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5 rounded-full border border-slate-300" />}
                {opt}
              </li>
            );
          })}
        </ul>
      ) : null}

      {!editing && (question.type === "SHORT_ANSWER" || question.type === "ESSAY") && question.correctAnswer ? (
        <p className="mt-3 ps-10 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold">{t("dashboard.instructor.exams.detailPage.modelAnswer")}: </span>
          {question.correctAnswer}
        </p>
      ) : null}

      {editing ? (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-white/10">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={2} className={TEXTAREA} />
          <div className="grid gap-3 sm:grid-cols-2">
            <QuestionTypeSelect value={type} onChange={handleTypeChange} t={t} />
            <input type="number" min={1} value={points} onChange={(e) => setPoints(e.target.value)} className={INPUT} />
          </div>
          {(type === "MULTIPLE_CHOICE" || type === "TRUE_FALSE") && (
            <div className="space-y-2">
              {(type === "TRUE_FALSE" ? ["True", "False"] : options).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCorrectAnswer(type === "TRUE_FALSE" ? opt : opt)}
                    className={`h-4 w-4 rounded-full border-2 ${correctAnswer === opt ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`}
                  />
                  {type === "MULTIPLE_CHOICE" ? (
                    <input
                      value={opt}
                      onChange={(e) => {
                        const next = [...options];
                        const old = next[idx];
                        next[idx] = e.target.value;
                        setOptions(next);
                        if (correctAnswer === old) setCorrectAnswer(e.target.value);
                      }}
                      className={`${INPUT} h-9`}
                    />
                  ) : (
                    <span className="text-sm">{opt}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          {(type === "SHORT_ANSWER" || type === "ESSAY") && (
            <textarea value={modelAnswer} onChange={(e) => setModelAnswer(e.target.value)} rows={2} className={TEXTAREA} />
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500">
              {t("dashboard.common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 rounded-lg bg-[#EE7C11] px-3 py-1.5 text-xs font-bold text-white"
            >
              {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
              {t("dashboard.common.save")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
