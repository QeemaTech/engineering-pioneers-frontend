import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, MessageSquare, Send } from "lucide-react";
import {
  useCreateLessonQuestion,
  useCreateQuestionAnswer,
  useLessonQuestions,
} from "../../features/student/qna/hooks";
import { getErrorMessage } from "../../api/error";

export default function LessonQna({ lessonId }) {
  const { t } = useTranslation();
  const { data: questions = [], isLoading } = useLessonQuestions(lessonId);
  const createQuestion = useCreateLessonQuestion();
  const createAnswer = useCreateQuestionAnswer();
  const [questionText, setQuestionText] = useState("");
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [err, setErr] = useState("");

  const handleAsk = async () => {
    const body = questionText.trim();
    if (!body || !lessonId) return;
    setErr("");
    try {
      await createQuestion.mutateAsync({ lessonId, body: { title: body.slice(0, 80), body } });
      setQuestionText("");
    } catch (e) {
      setErr(getErrorMessage(e, t("student.qna.askError", { defaultValue: "Could not post question." })));
    }
  };

  const handleAnswer = async (questionId) => {
    const body = (answerDrafts[questionId] || "").trim();
    if (!body) return;
    try {
      await createAnswer.mutateAsync({ questionId, lessonId, body: { body } });
      setAnswerDrafts((prev) => ({ ...prev, [questionId]: "" }));
    } catch (e) {
      setErr(getErrorMessage(e, t("student.qna.answerError", { defaultValue: "Could not post answer." })));
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <MessageSquare className="h-4 w-4 text-pioneer-orange-normal" />
        {t("student.qna.title", { defaultValue: "Lesson Q&A" })}
      </h3>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder={t("student.qna.askPlaceholder", { defaultValue: "Ask a question about this lesson…" })}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        />
        <button
          type="button"
          disabled={createQuestion.isPending || !questionText.trim()}
          onClick={() => void handleAsk()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2.5 text-sm font-bold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
        >
          {createQuestion.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {t("student.qna.ask", { defaultValue: "Ask" })}
        </button>
      </div>
      {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}

      {isLoading ? <p className="mt-4 text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}

      <ul className="mt-4 space-y-4">
        {questions.length === 0 && !isLoading ? (
          <li className="text-sm text-slate-500">{t("student.qna.empty", { defaultValue: "No questions yet. Be the first to ask!" })}</li>
        ) : null}
        {questions.map((q) => (
          <li key={q.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{q.body || q.question}</p>
            <p className="mt-1 text-[11px] text-slate-400">
              {q.student?.fullName || t("student.qna.anonymous", { defaultValue: "Student" })}
            </p>
            {(q.answers || []).map((a) => (
              <div key={a.id} className="ms-4 mt-3 border-s border-slate-200 ps-3">
                <p className="text-sm text-slate-700">{a.body}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{a.author?.fullName || "—"}</p>
              </div>
            ))}
            <div className="mt-3 flex gap-2">
              <input
                value={answerDrafts[q.id] || ""}
                onChange={(e) => setAnswerDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))}
                placeholder={t("student.qna.answerPlaceholder", { defaultValue: "Write an answer…" })}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
              />
              <button
                type="button"
                onClick={() => void handleAnswer(q.id)}
                className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                {t("student.qna.reply", { defaultValue: "Reply" })}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
