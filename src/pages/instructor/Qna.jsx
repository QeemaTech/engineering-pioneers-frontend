import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { getErrorMessage } from "../../api/error";
import { useQuestionsByLesson, useReplyToQuestion, useToggleResolveQuestion } from "../../features/instructor/qna/hooks";

function Qna() {
  const { t } = useTranslation();
  const [lessonId, setLessonId] = useState("");
  const [drafts, setDrafts] = useState({});
  const [notice, setNotice] = useState(null);
  const { data: questions = [] } = useQuestionsByLesson(lessonId);
  const replyMutation = useReplyToQuestion();
  const resolveMutation = useToggleResolveQuestion();

  const onReply = async (questionId) => {
    setNotice(null);
    try {
      await replyMutation.mutateAsync({ questionId, body: drafts[questionId] || "" });
      setDrafts((p) => ({ ...p, [questionId]: "" }));
      setNotice({ type: "success", message: "Reply added successfully." });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Failed to submit reply.") });
    }
  };

  const onResolve = async (questionId) => {
    setNotice(null);
    try {
      await resolveMutation.mutateAsync(questionId);
      setNotice({ type: "success", message: "Question resolve status updated." });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Failed to update resolve status.") });
    }
  };

  return (
    <section>
      <PageHeader
        title={t("dashboard.instructor.pages.qna.title")}
        subtitle={t("dashboard.instructor.pages.qna.subtitle")}
        actions={
          <input
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            placeholder={t("dashboard.instructor.qna.lessonIdPlaceholder")}
            className="h-10 rounded-xl border border-slate-200 px-3 text-sm"
          />
        }
      />
      <Notice type={notice?.type} message={notice?.message} />

      <div className="space-y-3">
        {questions.map((q) => (
          <article key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900">{q.title}</h3>
              <button onClick={() => onResolve(q.id)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${q.isResolved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {q.isResolved ? "Resolved" : "Mark Resolve"}
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">{q.body}</p>
            <div className="mt-3 space-y-1">
              {(q.answers || []).map((a) => (
                <div key={a.id} className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                  <span className="font-semibold">{a?.user?.fullName || "User"}:</span> {a.body}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={drafts[q.id] || ""}
                onChange={(e) => setDrafts((p) => ({ ...p, [q.id]: e.target.value }))}
                placeholder={t("dashboard.instructor.qna.replyPlaceholder")}
                className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-sm"
              />
              <button onClick={() => onReply(q.id)} disabled={replyMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 text-sm font-semibold text-white">
                {replyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} {t("dashboard.common.reply")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Qna;
