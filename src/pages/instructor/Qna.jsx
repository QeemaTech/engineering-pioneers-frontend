import { useMemo, useState, useEffect } from "react";
import { Loader2, MessageSquare, CheckCircle, HelpCircle, Check, CornerDownLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { getErrorMessage } from "../../api/error";
import { useInstructorClassesForStudents } from "../../features/instructor/students/hooks";
import { useInstructorQuestions, useReplyToQuestion, useToggleResolveQuestion } from "../../features/instructor/qna/hooks";

function Qna() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const [courseId, setCourseId] = useState("");
  const [statusFilter, setStatusFilter] = useState("unanswered"); // 'unanswered' | 'answered' | 'all'
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState(null);

  const { data: classes = [] } = useInstructorClassesForStudents({ page: 1, limit: 100 });
  
  // Maps statusFilter to query parameter 'resolved'
  const resolvedParam = useMemo(() => {
    if (statusFilter === "all") return undefined;
    return statusFilter === "answered" ? "true" : "false";
  }, [statusFilter]);

  const { data: questions = [], isLoading, error } = useInstructorQuestions({
    courseId: courseId || undefined,
    resolved: resolvedParam,
    limit: 100, // Load a reasonable stream length
  });

  const replyMutation = useReplyToQuestion();
  const resolveMutation = useToggleResolveQuestion();

  const courseOptions = useMemo(() => classes.map((c) => ({ id: c.id, title: c.title })), [classes]);

  // Sync selected question if the list changes or empty
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
      await replyMutation.mutateAsync({ questionId: activeQuestion.id, body: replyText.trim() });
      setReplyText("");
      setNotice({ 
        type: "success", 
        message: dir === "rtl" ? "تم إرسال ردك بنجاح!" : "Reply submitted successfully." 
      });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Failed to submit reply.") });
    }
  };

  const onResolveToggle = async (questionId) => {
    setNotice(null);
    try {
      await resolveMutation.mutateAsync(questionId);
      setNotice({ 
        type: "success", 
        message: dir === "rtl" ? "تم تحديث حالة السؤال!" : "Question status updated successfully." 
      });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Failed to update question status.") });
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title={dir === "rtl" ? "مركز حلول الأسئلة والاستفسارات" : "Q&A Resolution Center"}
        subtitle={dir === "rtl" ? "تفاعل مع استفسارات الطلاب وأسئلتهم المطروحة داخل المحاضرات." : t("dashboard.instructor.pages.qna.subtitle")}
        actions={
          <select
            value={courseId}
            onChange={(e) => {
              setCourseId(e.target.value);
              setSelectedQuestionId(null); // Reset detail view on filter change
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#1A1A22] dark:text-white outline-none focus:border-[#EE7C11] transition-all"
          >
            <option value="">{dir === "rtl" ? "كل الكورسات (تصفية)" : "All Courses (Filter)"}</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        }
      />

      {/* Filter Tabs Row */}
      <div className="flex bg-slate-100 dark:bg-[#16161F] p-1 rounded-xl w-fit border border-slate-200/50 dark:border-white/5">
        <button
          onClick={() => {
            setStatusFilter("unanswered");
            setSelectedQuestionId(null);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "unanswered"
              ? "bg-[#EE7C11] text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {dir === "rtl" ? "لم يتم الرد عليها" : "Unanswered"}
        </button>
        <button
          onClick={() => {
            setStatusFilter("answered");
            setSelectedQuestionId(null);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "answered"
              ? "bg-[#EE7C11] text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {dir === "rtl" ? "تم الرد عليها" : "Answered"}
        </button>
        <button
          onClick={() => {
            setStatusFilter("all");
            setSelectedQuestionId(null);
          }}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            statusFilter === "all"
              ? "bg-[#EE7C11] text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {dir === "rtl" ? "الكل" : "All"}
        </button>
      </div>

      <Notice type={notice?.type} message={notice?.message} />

      {/* Split Interface Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
        {/* Left Side: Questions List (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col h-full bg-white dark:bg-[#1A1A22] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#1C1C26]">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#EE7C11]" />
              {dir === "rtl" ? "الأسئلة والطلبات الواردة" : "Open Inquiries"}
              <span className="ms-auto bg-[#EE7C11]/10 text-[#EE7C11] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {questions.length}
              </span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-[#EE7C11]" />
                <span className="text-xs font-bold">{dir === "rtl" ? "جاري جلب الأسئلة..." : "Streaming questions..."}</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="py-20 text-center text-slate-400 dark:text-slate-500 font-semibold text-xs space-y-2">
                <HelpCircle className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p>{dir === "rtl" ? "لا توجد أسئلة تطابق هذا الفلتر." : "No questions found matching your filter."}</p>
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
                        {q.title || "استفسار"}
                      </span>
                      <span className={`h-2 w-2 rounded-full shrink-0 ms-2 ${q.isResolved ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {snippet}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {/* Course badge */}
                      <span className="text-[9px] font-extrabold bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300 px-2 py-0.5 rounded">
                        {q.lesson?.section?.unit?.course?.title || "Course Info"}
                      </span>
                      {/* Student name */}
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">
                        {q.student?.fullName || "Student"}
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

                <button
                  onClick={() => onResolveToggle(activeQuestion.id)}
                  disabled={resolveMutation.isPending}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all shrink-0 ${
                    activeQuestion.isResolved
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400"
                      : "bg-[#EE7C11]/10 text-[#EE7C11] border border-[#EE7C11]/20 hover:bg-[#EE7C11]/20"
                  }`}
                >
                  {resolveMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : activeQuestion.isResolved ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      {dir === "rtl" ? "تم حل السؤال" : "Resolved"}
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      {dir === "rtl" ? "تحديد كمحلول" : "Mark Resolved"}
                    </>
                  )}
                </button>
              </div>

              {/* Chat Thread Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* The Original Student Question Card */}
                <div className="flex gap-3">
                  {/* Student Avatar */}
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#EE7C11] to-amber-400 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm uppercase">
                    {(activeQuestion.student?.fullName || "S").slice(0, 2)}
                  </div>
                  <div className="flex flex-col max-w-[85%] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl rounded-ss-none p-3.5">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                        {activeQuestion.student?.fullName || "Student"}
                      </span>
                      <span className="text-[8px] text-slate-400 dark:text-slate-500">
                        {activeQuestion.createdAt ? new Date(activeQuestion.createdAt).toLocaleString(dir === "rtl" ? "ar-EG" : "en-US") : ""}
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {activeQuestion.body}
                    </p>
                  </div>
                </div>

                {/* Answers / Replies list */}
                {(activeQuestion.answers || []).map((a) => {
                  const isInstructor = a.isInstructorReply || a.user?.role?.name === "INSTRUCTOR";
                  
                  return (
                    <div key={a.id} className={`flex gap-3 ${isInstructor ? "flex-row-reverse" : ""}`}>
                      {/* Avatar */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm uppercase ${
                        isInstructor 
                          ? "bg-slate-800 dark:bg-slate-700" 
                          : "bg-[#EE7C11]"
                      }`}>
                        {(a.user?.fullName || "U").slice(0, 2)}
                      </div>
                      
                      <div className={`flex flex-col max-w-[85%] p-3.5 rounded-2xl ${
                        isInstructor 
                          ? "bg-[#EE7C11]/10 border border-[#EE7C11]/20 rounded-se-none" 
                          : "bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-ss-none"
                      }`}>
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                            {a.user?.fullName || "User"}
                            {isInstructor && (
                              <span className="ms-1.5 text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-[#EE7C11] text-white">
                                {dir === "rtl" ? "معلم" : "Instructor"}
                              </span>
                            )}
                          </span>
                          <span className="text-[8px] text-slate-400 dark:text-slate-500">
                            {a.createdAt ? new Date(a.createdAt).toLocaleString(dir === "rtl" ? "ar-EG" : "en-US") : ""}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                          {a.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Formulation Box */}
              <form onSubmit={onReplySubmit} className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#1C1C26] flex gap-2 items-end">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={dir === "rtl" ? "اكتب ردك وملاحظاتك الفنية هنا..." : t("dashboard.instructor.qna.replyPlaceholder")}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:placeholder:text-slate-500 resize-none"
                  required
                />
                
                <button
                  type="submit"
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className="h-10 px-4 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white text-xs font-bold shadow-md shadow-[#EE7C11]/15 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CornerDownLeft className="h-4 w-4" />
                      {dir === "rtl" ? "إرسال" : t("dashboard.common.reply")}
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 font-semibold text-xs space-y-3 p-8 text-center">
              <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-700" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-350">
                  {dir === "rtl" ? "مركز الحلول مستعد" : "Resolution Desk Standby"}
                </p>
                <p className="max-w-[280px] mx-auto text-[11px] text-slate-400">
                  {dir === "rtl" ? "اختر سؤالاً من القائمة الجانبية لبدء استعراض تفاصيل النقاش وإرسال الرد للطلاب." : "Select a student question from the inbox list to write answers and resolve topics."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Qna;
