import { useMemo, useState, useEffect } from "react";
import { Loader2, MessageSquare, CheckCircle, HelpCircle, Check, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { getErrorMessage } from "../../api/error";
import { useMyQuestions, useCreateQuestionAnswer } from "../../features/student/qna/hooks";

function Qna() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const dir = isRtl ? "rtl" : "ltr";

  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState(null);

  const { data: questions = [], isLoading, error, refetch } = useMyQuestions();
  const replyMutation = useCreateQuestionAnswer();

  // Selected question resolver
  const activeQuestion = useMemo(() => {
    if (!selectedQuestionId) return questions[0] || null;
    return questions.find((q) => q.id === selectedQuestionId) || questions[0] || null;
  }, [questions, selectedQuestionId]);

  useEffect(() => {
    if (activeQuestion && activeQuestion.id !== selectedQuestionId) {
      setSelectedQuestionId(activeQuestion.id);
    }
  }, [activeQuestion, selectedQuestionId]);

  useEffect(() => {
    if (error) {
      setNotice({ type: "error", message: getErrorMessage(error, "Failed to load questions.") });
    }
  }, [error]);

  const onReplySubmit = async (e) => {
    e.preventDefault();
    if (!activeQuestion || !replyText.trim()) return;

    setNotice(null);
    try {
      await replyMutation.mutateAsync({
        questionId: activeQuestion.id,
        lessonId: activeQuestion.lessonId,
        body: { body: replyText.trim() },
      });
      setReplyText("");
      setNotice({
        type: "success",
        message: isRtl ? "تم إرسال ردك بنجاح!" : "Reply submitted successfully.",
      });
      void refetch();
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Failed to submit reply.") });
    }
  };

  return (
    <section className="space-y-6 antialiased font-sans">
      <PageHeader
        title={isRtl ? "استفساراتي وأسئلتي" : "My Questions & Inquiries"}
        subtitle={isRtl ? "تابع إجابات المحاضرين على أسئلتك المطروحة داخل الدروس والمحاضرات." : "Track instructor answers to your queries posted inside course lessons."}
      />

      <Notice type={notice?.type} message={notice?.message} />

      {/* Split Interface Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Left Side: Questions List (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col h-full bg-white dark:bg-[#1A1A22] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#1C1C26]">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#EE7C11]" />
              {isRtl ? "أسئلتي السابقة" : "My Inquiries"}
              <span className="ms-auto bg-[#EE7C11]/10 text-[#EE7C11] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {questions.length}
              </span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#EE7C11]" />
                <span className="text-xs font-bold">{isRtl ? "جاري تحميل استفساراتك..." : "Loading inquiries..."}</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-semibold text-xs space-y-2">
                <HelpCircle className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p>{isRtl ? "لم تقم بطرح أي سؤال بعد." : "You have not posted any questions yet."}</p>
              </div>
            ) : (
              questions.map((q) => {
                const isSelected = activeQuestion?.id === q.id;
                const snippet = q.body && q.body.length > 70 ? `${q.body.slice(0, 70)}...` : q.body;

                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`w-full text-start p-4 transition-all flex flex-col gap-1.5 focus:outline-none ${
                      isSelected
                        ? "bg-[#EE7C11]/5 dark:bg-[#EE7C11]/10 border-s-4 border-s-[#EE7C11]"
                        : "hover:bg-slate-50 dark:hover:bg-white/2"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 flex-1">
                        {q.title || (isRtl ? "استفسار" : "Question")}
                      </span>
                      <span className={`h-2 w-2 rounded-full shrink-0 ms-2 ${q.isResolved ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {snippet}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300 px-2 py-0.5 rounded">
                        {q.lesson?.section?.unit?.course?.title || (isRtl ? "معلومات الكورس" : "Course")}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-450 dark:text-slate-550">
                        {q.lesson?.title}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation / Detail Pane (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-white dark:bg-[#1A1A22] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
          {activeQuestion ? (
            <div className="flex flex-col h-full">
              {/* Question Header */}
              <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#1C1C26] flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold text-[#EE7C11] uppercase tracking-wider block">
                    {activeQuestion.lesson?.section?.unit?.course?.title} &middot; {activeQuestion.lesson?.title}
                  </span>
                  <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {activeQuestion.title}
                  </h2>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold ${
                    activeQuestion.isResolved
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400"
                  }`}
                >
                  <Check className="h-3 w-3" />
                  <span>{activeQuestion.isResolved ? (isRtl ? "محلول" : "Resolved") : (isRtl ? "قيد المراجعة" : "Pending")}</span>
                </div>
              </div>

              {/* Chat Thread / Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-[#15151C]/10">
                {/* The original student question */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#EE7C11]/15 text-[#EE7C11] flex items-center justify-center font-bold text-xs shrink-0">
                    S
                  </div>
                  <div className="bg-white dark:bg-[#1A1A22] p-3 rounded-2xl border border-slate-100 dark:border-white/5 shadow-xs max-w-[85%]">
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                      {activeQuestion.body}
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-1">
                      {new Date(activeQuestion.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Answers / Replies */}
                {(activeQuestion.answers || []).map((ans) => {
                  const isInstructor = ans.isInstructorReply || ans.user?.role === "INSTRUCTOR" || ans.user?.role === "ADMIN";
                  
                  return (
                    <div
                      key={ans.id}
                      className={`flex items-start gap-3 ${isInstructor ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isInstructor 
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" 
                            : "bg-[#EE7C11]/15 text-[#EE7C11]"
                        }`}
                      >
                        {isInstructor ? "T" : "S"}
                      </div>
                      <div
                        className={`p-3 rounded-2xl border shadow-xs max-w-[85%] ${
                          isInstructor
                            ? "bg-emerald-50/50 border-emerald-100 dark:bg-[#1B2D26]/30 dark:border-emerald-900/30 text-slate-800 dark:text-slate-100"
                            : "bg-white border-slate-100 dark:bg-[#1A1A22] dark:border-white/5 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <p className="text-xs leading-relaxed font-semibold">{ans.body}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-400">
                          <span>{ans.user?.fullName || (isInstructor ? "Instructor" : "Student")}</span>
                          <span>&middot;</span>
                          <span>{new Date(ans.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form Footer */}
              <form
                onSubmit={onReplySubmit}
                className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-[#1C1C26] flex items-center gap-3"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={isRtl ? "اكتب ردك أو استفسارك الإضافي هنا..." : "Type your follow-up reply here..."}
                  className="flex-1 h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs dark:border-white/10 dark:bg-[#12121A] dark:text-white outline-none focus:border-[#EE7C11] transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className="h-10 px-4 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white flex items-center gap-1.5 text-xs font-bold transition-all disabled:opacity-50"
                >
                  {replyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>{isRtl ? "إرسال" : "Reply"}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-2 p-8 text-center font-semibold text-xs">
              <MessageSquare className="h-12 w-12 text-slate-200 dark:text-slate-700" />
              <p>{isRtl ? "اختر سؤالاً من القائمة الجانبية لعرض المحادثة والردود." : "Select a question from the sidebar to view full thread."}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Qna;
