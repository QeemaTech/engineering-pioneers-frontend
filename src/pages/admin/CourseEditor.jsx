import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, ArrowRight, BookOpen, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, Edit3, FileText, GripVertical,
  Layers, Loader2, Play, Plus, Save, Trash2, Video, X, Settings, Info, Search, ExternalLink,
  PlusCircle, Layout, CheckCircle2, Clock, Hash
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useAdminCourse, useUpdateAdminCourse,
  useAddCourseStaff, useCourseStaff, useCreateAdminUnit, useRemoveCourseStaff, useUpdateAdminUnit, useDeleteAdminUnit,
  useCreateAdminLesson, useUpdateAdminLesson, useDeleteAdminLesson,
  useCourseSessions, useCreateCourseSession, useDeleteCourseSession,
} from "../../features/admin/courses/hooks";
import {
  useCreateAdminSection,
  useUpdateAdminSection,
  useDeleteAdminSection,
} from "../../features/admin/sections/hooks";
import { useAdminCategories } from "../../features/admin/categories/hooks";
import { useAdminInstructors } from "../../features/admin/instructors/hooks";
import { getErrorMessage } from "../../api/error";
import { 
  useAdminExams, useUpdateAdminExam, useCreateAdminExam, 
  useAdminExamById, useAddAdminExamQuestion, useUpdateAdminExamQuestion, useDeleteAdminExamQuestion 
} from "../../features/admin/exams/hooks";
import { useAdminUsers } from "../../features/admin/users/hooks";
import toast from "react-hot-toast";

/* ─── Question Card (For Drawer) ─── */
function QuestionCard({ question, examId, index }) {
  const { t } = useTranslation();
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
      toast.success(t("adminPages.courseEditor.toasts.questionSaved", { n: index + 1, defaultValue: "Question {{n}} saved" }));
    } catch (err) { toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.saveFailed", { defaultValue: "Failed to save" }))); }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#0F0F13]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          {t("adminPages.courseEditor.exam.questionNumber", { n: index + 1, defaultValue: "Question {{n}}" })}
        </span>
        <div className="flex gap-2">
          {dirty && (
            <button onClick={save} disabled={updateMutation.isPending} className="text-[10px] font-bold text-[#EE7C11] hover:underline">
              {updateMutation.isPending
                ? t("adminPages.courseEditor.actions.saving", { defaultValue: "Saving..." })
                : t("adminPages.courseEditor.actions.saveChanges", { defaultValue: "Save changes" })}
            </button>
          )}
          <button 
            onClick={() => deleteMutation.mutate({ examId, questionId: question.id })} 
            className="text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <textarea 
        value={text} 
        onChange={(e) => markDirty(setText)(e.target.value)} 
        className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-[#EE7C11]/30 dark:border-white/5 dark:bg-[#1A1A22] dark:text-white"
        placeholder={t("adminPages.courseEditor.exam.questionTextPlaceholder", { defaultValue: "Question text..." })}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-3">
        <select value={type} onChange={(e) => markDirty(setType)(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-white/5 dark:bg-[#1A1A22] dark:text-white">
          <option value="MULTIPLE_CHOICE">MCQ</option>
          <option value="TRUE_FALSE">{t("adminPages.courseEditor.exam.trueFalse", { defaultValue: "True/False" })}</option>
          <option value="SHORT_ANSWER">{t("adminPages.courseEditor.exam.shortAnswer", { defaultValue: "Short answer" })}</option>
        </select>
        <input type="number" value={points} onChange={(e) => markDirty(setPoints)(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-white/5 dark:bg-[#1A1A22] dark:text-white" placeholder={t("adminPages.courseEditor.exam.points", { defaultValue: "Points" })} />
      </div>
    </div>
  );
}

/* ─── Exam Editor Drawer ─── */
function ExamEditorDrawer({ examId, onClose }) {
  const { t, i18n } = useTranslation();
  const { data: exam, isLoading } = useAdminExamById(examId);
  const addQuestionMutation = useAddAdminExamQuestion();

  const handleAdd = async () => {
    try {
      await addQuestionMutation.mutateAsync({
        examId,
        body: { questionText: "New Question", type: "MULTIPLE_CHOICE", points: 10, order: (exam?.questions?.length || 0) + 1, options: ["", "", "", ""], correctAnswer: "" }
      });
      toast.success(t("adminPages.courseEditor.toasts.questionAdded", { defaultValue: "Question added" }));
    } catch (err) { toast.error(t("adminPages.courseEditor.toasts.questionAddFailed", { defaultValue: "Failed to add question" })); }
  };

  if (!examId) return null;

  return (
    <div className={`fixed inset-y-0 z-[60] w-full max-w-md bg-white shadow-2xl transition-transform dark:bg-[#1A1A22] ${
      i18n.dir() === "rtl"
        ? "left-0 border-r border-slate-200 dark:border-white/8"
        : "right-0 border-l border-slate-200 dark:border-white/8"
    }`}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-white/5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {exam?.title || t("dashboard.common.loading", { defaultValue: "Loading..." })}
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              {t("adminPages.courseEditor.exam.questionBankEditor", { defaultValue: "Question bank editor" })}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-white/5">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="flex py-20 justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#EE7C11]" /></div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {t("adminPages.courseEditor.exam.questionsCount", {
                    count: exam.questions?.length || 0,
                    defaultValue: "Questions ({{count}})",
                  })}
                </span>
                <button onClick={handleAdd} className="text-[10px] font-bold text-[#EE7C11] hover:underline">
                  {t("adminPages.courseEditor.exam.addQuestion", { defaultValue: "+ Add question" })}
                </button>
              </div>
              {(exam.questions || []).map((q, i) => (
                <QuestionCard key={q.id} question={q} examId={examId} index={i} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useForm, useFieldArray } from "react-hook-form";

/* ─── In-Context Exam Builder Modal ─── */
function InContextExamBuilder({ targetId, targetType, onClose }) {
  const { t } = useTranslation();
  const { id: courseId } = useParams();
  const queryClient = useQueryClient();
  const createExamMutation = useCreateAdminExam();
  const addQuestionMutation = useAddAdminExamQuestion();
  const [step, setStep] = useState(1);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      type: targetType === 'course' ? 'FINAL' : targetType === 'unit' ? 'UNIT' : 'LESSON',
      durationMinutes: 60,
      passingScore: 60,
      questions: [{ questionText: "", type: "MULTIPLE_CHOICE", points: 10, options: ["", "", "", ""], correctAnswer: "0" }]
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "questions" });

  // Force options for T/F questions
  const watchedQuestions = watch("questions");
  useEffect(() => {
    watchedQuestions?.forEach((q, index) => {
      if (q.type === "TRUE_FALSE" && (q.options?.length !== 2 || q.options[0] !== "True")) {
        setValue(`questions.${index}.options`, ["True", "False"]);
      }
    });
  }, [watchedQuestions, setValue]);

  // Debugging validation errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.warn("Exam Builder Validation Errors:", errors);
    }
  }, [errors]);

  const onSubmit = async (data) => {
    try {
      // Step 1: Create the exam WITHOUT questions
      const examBody = {
        title: data.title,
        type: data.type,
        durationMinutes: Number(data.durationMinutes),
        passingScore: Number(data.passingScore),
        status: 'AVAILABLE',
        totalPoints: data.questions.reduce((sum, q) => sum + Number(q.points), 0),
      };
      if (targetType === 'course') examBody.courseId = targetId;
      if (targetType === 'unit') examBody.unitId = targetId;
      if (targetType === 'lesson') examBody.lessonId = targetId;

      const createdExam = await createExamMutation.mutateAsync(examBody);

      // Step 2: Add each question separately
      const examId = createdExam?.id;
      if (examId && data.questions.length > 0) {
        for (let i = 0; i < data.questions.length; i++) {
          const q = data.questions[i];
          await addQuestionMutation.mutateAsync({
            examId,
            body: {
              questionText: q.questionText,
              type: q.type,
              points: Number(q.points),
              order: i + 1,
              options: q.type === "MULTIPLE_CHOICE"
                ? q.options.filter(o => o.trim())
                : ["True", "False"],
              correctAnswer: q.type === "MULTIPLE_CHOICE"
                ? q.options[Number(q.correctAnswer)]
                : q.correctAnswer,
            }
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "exams"] });

      toast.success(t("adminPages.courseEditor.toasts.examCreated", { defaultValue: "Exam created and linked successfully!" }));
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.examCreateFailed", { defaultValue: "Failed to create exam" })));
    }
  };

  const isPending = createExamMutation.isPending || addQuestionMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm antialiased">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/8 dark:bg-[#1A1A22] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-white/5">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
              {t("adminPages.courseEditor.exam.buildExam", {
                target: t(`adminPages.courseEditor.node.${targetType}`, { defaultValue: targetType }),
                defaultValue: "Build {{target}} exam",
              })}
            </h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              {t("adminPages.courseEditor.exam.stepLabel", {
                step,
                total: 2,
                label: step === 1
                  ? t("adminPages.courseEditor.exam.settings", { defaultValue: "Exam settings" })
                  : t("adminPages.courseEditor.exam.questionBank", { defaultValue: "Question bank" }),
                defaultValue: "Step {{step}} of {{total}}: {{label}}",
              })}
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-white/5">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {step === 1 ? (
              <div className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("adminPages.courseEditor.exam.title", { defaultValue: "Exam title" })}
                  </span>
                  <input 
                    {...register("title", { required: t("adminPages.courseEditor.validation.titleRequired", { defaultValue: "Title is required" }) })}
                    placeholder={t("adminPages.courseEditor.exam.titlePlaceholder", { defaultValue: "e.g. Midterm assessment" })} 
                    className={`h-11 w-full rounded-xl border px-4 text-sm font-medium outline-none transition-all ${
                      errors.title ? "border-red-500 bg-[#EE7C11]/10" : "border-slate-200 bg-slate-50 focus:border-[#EE7C11]"
                    } dark:border-white/10 dark:bg-[#0F0F13] dark:text-white`}
                  />
                  {errors.title && <p className="text-[10px] font-bold text-red-500 uppercase">{errors.title.message}</p>}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t("adminPages.courseEditor.exam.duration", { defaultValue: "Duration (min)" })}
                    </span>
                    <input 
                      type="number"
                      {...register("durationMinutes", { required: true })}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" 
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t("adminPages.courseEditor.exam.passingScore", { defaultValue: "Passing score" })}
                    </span>
                    <input 
                      type="number"
                      {...register("passingScore", { required: true })}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" 
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {t("adminPages.courseEditor.exam.questionsBankCount", {
                      count: fields.length,
                      defaultValue: "Question bank ({{count}})",
                    })}
                  </span>
                  <button 
                    type="button"
                    onClick={() => append({ questionText: "", type: "MULTIPLE_CHOICE", points: 10, options: ["", "", "", ""], correctAnswer: "0" })}
                    className="text-[10px] font-bold text-[#EE7C11] hover:underline"
                  >
                    {t("adminPages.courseEditor.exam.addNewQuestion", { defaultValue: "+ Add new question" })}
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative rounded-2xl border border-slate-100 bg-slate-50/50 p-5 dark:border-white/5 dark:bg-white/2">
                      <button 
                        type="button" 
                        onClick={() => remove(index)}
                        className="absolute end-4 top-4 text-slate-300 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#EE7C11] text-[10px] font-bold text-white">{index + 1}</span>
                        <input 
                          {...register(`questions.${index}.questionText`, {
                            required: t("adminPages.courseEditor.validation.questionRequired", {
                              defaultValue: "Question text is required",
                            }),
                          })}
                          placeholder={t("adminPages.courseEditor.exam.questionPlaceholder", { defaultValue: "Write the question..." })}
                          className={`flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-slate-300 ${
                            errors.questions?.[index]?.questionText ? "text-red-500" : "text-slate-900 dark:text-white"
                          }`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <input 
                          type="number"
                          {...register(`questions.${index}.points`)}
                          placeholder={t("adminPages.courseEditor.exam.points", { defaultValue: "Points" })}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none dark:border-white/5 dark:bg-[#0F0F13] dark:text-white"
                        />
                        <select 
                          {...register(`questions.${index}.type`)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none dark:border-white/5 dark:bg-[#0F0F13] dark:text-white"
                        >
                          <option value="MULTIPLE_CHOICE">{t("adminPages.courseEditor.exam.multipleChoice", { defaultValue: "Multiple choice" })}</option>
                          <option value="TRUE_FALSE">{t("adminPages.courseEditor.exam.trueFalse", { defaultValue: "True/False" })}</option>
                        </select>
                      </div>
                      
                      {watch(`questions.${index}.type`) === "MULTIPLE_CHOICE" && (
                        <div className="grid grid-cols-2 gap-2">
                          {[0, 1, 2, 3].map(optIndex => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <input 
                                type="radio" 
                                value={String(optIndex)} 
                                {...register(`questions.${index}.correctAnswer`)}
                                className="accent-[#EE7C11]"
                              />
                              <input 
                                {...register(`questions.${index}.options.${optIndex}`, {
                                  required: t("adminPages.courseEditor.validation.optionRequired", {
                                    defaultValue: "Option is required",
                                  }),
                                })}
                                placeholder={t("adminPages.courseEditor.exam.optionNumber", {
                                  n: optIndex + 1,
                                  defaultValue: "Option {{n}}",
                                })}
                                className={`h-8 flex-1 rounded-lg border px-3 text-[11px] outline-none transition-all ${
                                  errors.questions?.[index]?.options?.[optIndex] ? "border-red-500 bg-[#EE7C11]/10" : "border-slate-200 bg-white dark:border-white/5 dark:bg-[#0F0F13] dark:text-white"
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {watch(`questions.${index}.type`) === "TRUE_FALSE" && (
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            t("adminPages.courseEditor.exam.true", { defaultValue: "True" }),
                            t("adminPages.courseEditor.exam.false", { defaultValue: "False" }),
                          ].map((label, optIndex) => (
                            <label 
                              key={label}
                              className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-3 transition-all ${
                                watch(`questions.${index}.correctAnswer`) === String(optIndex)
                                  ? "border-[#EE7C11] bg-[#EE7C11]/5 font-bold text-[#EE7C11]"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-white/10 dark:bg-[#0F0F13]"
                              }`}
                            >
                              <input 
                                type="radio"
                                value={String(optIndex)}
                                {...register(`questions.${index}.correctAnswer`)}
                                className="hidden"
                              />
                              <CheckCircle2 className={`h-4 w-4 ${watch(`questions.${index}.correctAnswer`) === String(optIndex) ? "opacity-100" : "opacity-0"}`} />
                              <span className="text-sm">{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-white/5 dark:bg-white/2">
            <div className="flex justify-between gap-3">
              {step === 2 && (
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="rounded-xl border border-slate-200 px-6 py-2.5 text-xs font-bold text-slate-500 hover:bg-white dark:border-white/10"
                >
                  {t("adminPages.courseEditor.exam.backToSettings", { defaultValue: "Back to settings" })}
                </button>
              )}
              <div className="flex flex-1 justify-end gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="rounded-xl px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  {t("adminPages.courseEditor.actions.cancel", { defaultValue: "Cancel" })}
                </button>
                {step === 1 ? (
                  <button 
                    type="button" 
                    onClick={() => setStep(2)} 
                    className="rounded-xl bg-[#EE7C11] px-8 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#EE7C11]/20 hover:bg-[#d9700e]"
                  >
                    {t("adminPages.courseEditor.exam.nextBuildQuestions", { defaultValue: "Next: build questions" })}
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-10 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#EE7C11]/20 hover:bg-[#d9700e] disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t("adminPages.courseEditor.exam.saveAndLink", { defaultValue: "Save & link exam" })}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Exam Manager Component ─── */
function ExamManager({ targetId, targetType, linkedExams, onRefresh }) {
  const { t } = useTranslation();
  const { id: courseId } = useParams();
  const queryClient = useQueryClient();
  const [showSearch, setShowSearch] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [examSearch, setExamSearch] = useState("");

  const { data: examsData } = useAdminExams({ page: 1, limit: 200 });
  const updateExamMutation = useUpdateAdminExam();
  
  const allExams = examsData?.exams || [];
  
  const filteredExams = useMemo(() => {
    return allExams.filter(e => {
      const isLinked = e.courseId || e.unitId || e.lessonId;
      if (isLinked) return false;
      if (!examSearch.trim()) return true;
      return e.title.toLowerCase().includes(examSearch.toLowerCase());
    });
  }, [allExams, examSearch]);

  const handleLink = async (examId) => {
    try {
      const body = {};
      if (targetType === 'course') body.courseId = targetId;
      if (targetType === 'unit') body.unitId = targetId;
      if (targetType === 'lesson') body.lessonId = targetId;
      await updateExamMutation.mutateAsync({ id: examId, body });
      
      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "exams"] });
      
      setShowSearch(false);
      toast.success(t("adminPages.courseEditor.toasts.examLinked", { defaultValue: "Exam linked" }));
    } catch (err) { toast.error(t("adminPages.courseEditor.toasts.examLinkFailed", { defaultValue: "Failed to link exam" })); }
  };

  const handleUnlink = async (examId) => {
    try {
      const body = {};
      if (targetType === 'course') body.courseId = null;
      if (targetType === 'unit') body.unitId = null;
      if (targetType === 'lesson') body.lessonId = null;
      await updateExamMutation.mutateAsync({ id: examId, body });
      
      queryClient.invalidateQueries({ queryKey: ["admin", "course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "exams"] });
      
      toast.success(t("adminPages.courseEditor.toasts.examUnlinked", { defaultValue: "Exam unlinked" }));
    } catch (err) { toast.error(t("adminPages.courseEditor.toasts.examUnlinkFailed", { defaultValue: "Failed to unlink exam" })); }
  };

  return (
    <div className="space-y-4 border-t border-slate-200 pt-6 dark:border-white/8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-purple-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t("adminPages.courseEditor.exam.assessment", { defaultValue: "Assessment" })}
          </span>
        </div>
      </div>

      {linkedExams.length > 0 ? (
        <div className="space-y-3">
          {linkedExams.map((exam) => (
            <div key={exam.id} className="group relative overflow-hidden rounded-xl border border-purple-200 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-md dark:border-purple-500/20 dark:bg-[#0F0F13]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10">
                  <Layout className="h-4 w-4" />
                </div>
                <button onClick={() => handleUnlink(exam.id)} className="rounded-lg p-1 text-slate-400 hover:bg-[#EE7C11]/10 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{exam.title}</h4>
              <div className="mt-2 flex items-center gap-3 text-[10px] font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />{" "}
                  {t("adminPages.courseEditor.exam.questionsShort", {
                    count: exam._count?.questions || 0,
                    defaultValue: "{{count}} Qs",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />{" "}
                  {t("adminPages.courseEditor.exam.minutesShort", {
                    count: exam.durationMinutes || 60,
                    defaultValue: "{{count}} min",
                  })}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => setEditingExamId(exam.id)}
                  className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-purple-700"
                >
                  {t("adminPages.courseEditor.exam.editQuestions", { defaultValue: "Edit questions" })}
                </button>
                <Link 
                  to={`/admin/exams/${exam.id}/submissions`}
                  className="flex items-center justify-center rounded-lg border border-slate-200 px-2 py-2 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-white/10">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-xs font-bold text-slate-500">
            {t("adminPages.courseEditor.exam.noExamAttached", { defaultValue: "No exam attached" })}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            {t("adminPages.courseEditor.exam.noExamHint", { defaultValue: "Assess students at this level." })}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button 
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#EE7C11] py-2 text-[11px] font-bold text-white hover:bg-[#d9700e]"
            >
              <PlusCircle className="h-3.5 w-3.5" /> {t("adminPages.courseEditor.exam.createNew", { defaultValue: "Create new" })}
            </button>
            <button 
              onClick={() => setShowSearch(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-white"
            >
              <Search className="h-3.5 w-3.5" /> {t("adminPages.courseEditor.exam.linkExisting", { defaultValue: "Link existing" })}
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <InContextExamBuilder 
          targetId={targetId} 
          targetType={targetType} 
          onClose={() => setShowCreate(false)} 
        />
      )}

      {showSearch && (
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <input 
              autoFocus
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
              placeholder={t("adminPages.courseEditor.exam.searchPlaceholder", { defaultValue: "Search standalone exams..." })}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-purple-500 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
            <button onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-100 bg-white shadow-lg dark:border-white/5 dark:bg-[#1A1A22]">
            {filteredExams.map(exam => (
              <button key={exam.id} onClick={() => handleLink(exam.id)} className="flex w-full items-center justify-between px-3 py-2 text-start text-[11px] hover:bg-slate-50 dark:hover:bg-white/5">
                <span className="font-medium text-slate-900 dark:text-white">{exam.title}</span>
                <Plus className="h-3 w-3 text-purple-500" />
              </button>
            ))}
            {filteredExams.length === 0 && (
              <p className="p-3 text-[10px] text-slate-400">
                {t("adminPages.courseEditor.exam.noAvailableExams", { defaultValue: "No available exams found." })}
              </p>
            )}
          </div>
        </div>
      )}

      <ExamEditorDrawer examId={editingExamId} onClose={() => setEditingExamId(null)} />
    </div>
  );
}

/* ─── Lesson Row ─── */
function LessonRow({ lesson, isSelected, onSelect, onDelete }) {
  const { t } = useTranslation();
  return (
    <div
      className={`group flex w-full items-center gap-2 rounded-lg transition-all ${
        isSelected
          ? "bg-[#EE7C11]/10 text-[#EE7C11] font-bold dark:bg-[#EE7C11]/20 dark:text-red-300"
          : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5"
      }`}
    >
      <button
        onClick={() => onSelect(lesson)}
        className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-start text-sm outline-none"
      >
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
        <FileText className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">{lesson.title}</span>
        {lesson.videoUrl && <Video className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(lesson.id); }}
        aria-label={t("adminPages.courseEditor.actions.deleteLesson", { defaultValue: "Delete lesson" })}
        className="me-2 shrink-0 rounded p-0.5 text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Unit Accordion (Unit → Section → Lesson) ─── */
function UnitAccordion({
  unit,
  isSelected,
  onSelect,
  selectedLessonId,
  onSelectLesson,
  onDeleteUnit,
  onDeleteLesson,
  onDeleteSection,
  onAddLesson,
  onAddSection,
  onRenameUnit,
  onRenameSection,
  isAddingLesson,
}) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(true);
  const ClosedChevron = i18n.dir() === "rtl" ? ChevronLeft : ChevronRight;
  const sections = unit.sections || [];
  const totalLessons = sections.reduce((sum, sec) => sum + (sec.lessons?.length || 0), 0);

  return (
    <div className={`rounded-xl border transition-all ${isSelected ? 'border-[#EE7C11]/30 bg-[#EE7C11]/5 ring-1 ring-[#EE7C11]/10' : 'border-slate-200 bg-white dark:border-white/8 dark:bg-[#1A1A22]'}`}>
      <div 
        onClick={() => onSelect(unit)}
        className="flex cursor-pointer items-center gap-2 p-3"
      >
        <button 
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }} 
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ClosedChevron className="h-4 w-4" />}
        </button>
        <Layers className={`h-4 w-4 shrink-0 ${isSelected ? 'text-[#EE7C11]' : 'text-slate-400'}`} />
        <InlineEdit
          value={unit.title}
          onSave={(v) => onRenameUnit(unit.id, v)}
          placeholder={t("adminPages.courseEditor.empty.untitledUnit", { defaultValue: "Untitled unit" })}
          className={`min-w-0 flex-1 text-sm font-bold ${isSelected ? 'text-[#EE7C11]' : 'text-slate-900 dark:text-white'}`}
        />
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
          {t("adminPages.courseEditor.stats.lessonsCount", {
            count: totalLessons,
            defaultValue: "{{count}} lessons",
          })}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteUnit(unit.id); }}
          aria-label={t("adminPages.courseEditor.actions.deleteUnit", { defaultValue: "Delete unit" })}
          className="shrink-0 rounded p-1 text-slate-400 hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-3 pb-3 pt-2 dark:border-white/5">
          {sections.length === 0 ? (
            <p className="py-2 text-xs text-slate-400">
              {t("adminPages.courseEditor.empty.noSections", { defaultValue: "No sections yet" })}
            </p>
          ) : (
            sections.map((section) => (
              <div key={section.id} className="mb-2 rounded-lg border border-slate-100 bg-slate-50/50 p-2 dark:border-white/5 dark:bg-white/[0.02]">
                <div className="mb-1 flex items-center gap-2">
                  <Layout className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <InlineEdit
                    value={section.title}
                    onSave={(v) => onRenameSection(section.id, v)}
                    placeholder={t("adminPages.courseEditor.empty.untitledSection", { defaultValue: "Untitled section" })}
                    className="min-w-0 flex-1 text-xs font-bold text-slate-700 dark:text-slate-200"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteSection(section.id); }}
                    aria-label={t("adminPages.courseEditor.actions.deleteSection", { defaultValue: "Delete section" })}
                    className="shrink-0 rounded p-0.5 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-0.5 ps-2">
                  {(section.lessons || []).map((lesson) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      isSelected={selectedLessonId === lesson.id}
                      onSelect={onSelectLesson}
                      onDelete={onDeleteLesson}
                    />
                  ))}
                </div>
                <button
                  disabled={isAddingLesson}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddLesson(section, (section.lessons?.length || 0) + 1);
                  }}
                  className="mt-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[#EE7C11] hover:bg-[#EE7C11]/10 disabled:opacity-50"
                >
                  {isAddingLesson ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  {t("adminPages.courseEditor.actions.addLesson", { defaultValue: "Add lesson" })}
                </button>
              </div>
            ))
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onAddSection(unit); }}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <Plus className="h-3 w-3" />
            {t("adminPages.courseEditor.actions.addSection", { defaultValue: "Add section" })}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Inline Editable Field ─── */
function InlineEdit({ value, onSave, placeholder, className = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  const commit = () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== value) onSave(draft.trim());
    else setDraft(value || "");
  };

  if (!editing) {
    return (
      <button onClick={(e) => { e.stopPropagation(); setDraft(value || ""); setEditing(true); }} className={`group inline-flex items-center gap-1.5 text-start ${className}`}>
        <span className={value ? "" : "italic text-slate-400"}>{value || placeholder}</span>
        <Edit3 className="h-3 w-3 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value || ""); setEditing(false); } }}
      className={`rounded border border-[#EE7C11]/40 bg-transparent px-2 py-0.5 outline-none ring-1 ring-[#EE7C11]/20 ${className}`}
    />
  );
}

/* ─── Detail Editor (Polymorphic) ─── */
function DetailEditor({ node, onClose }) {
  const { t } = useTranslation();
  const updateCourseMutation = useUpdateAdminCourse();
  const updateUnitMutation = useUpdateAdminUnit();
  const updateLessonMutation = useUpdateAdminLesson();
  const { data: staff = [] } = useCourseStaff(node?.type === "course" ? node?.id : null);
  const addStaffMutation = useAddCourseStaff();
  const removeStaffMutation = useRemoveCourseStaff();
  const { data: usersData } = useAdminUsers({ page: 1, limit: 200 });
  const { data: categoriesData } = useAdminCategories({ page: 1, limit: 100 });
  const { data: instructorsData } = useAdminInstructors({ page: 1, limit: 100 });
  const categories = categoriesData?.categories || [];
  const instructors = instructorsData?.instructors || [];
  const [staffUserId, setStaffUserId] = useState("");
  const [staffRole, setStaffRole] = useState("TEACHING_ASSISTANT");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnail: "",
    introVideoUrl: "",
    price: "",
    type: "RECORDED",
    isLifetimePurchasable: true,
    isActive: false,
    categoryId: "",
    instructorId: "",
  });
  const [isPending, setIsPending] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (node?.data) {
      setFormData({
        title: node.data.title || "",
        description: node.data.description || "",
        videoUrl: node.data.videoUrl || "",
        thumbnail: node.data.thumbnail || "",
        introVideoUrl: node.data.introVideoUrl || "",
        price: node.data.price != null ? String(node.data.price) : "",
        type: node.data.type || "RECORDED",
        isLifetimePurchasable: node.data.isLifetimePurchasable !== false,
        isActive: node.data.isActive === true,
        categoryId: node.data.categoryId || node.data.category?.id || "",
        instructorId: node.data.instructorId || node.data.instructor?.id || "",
      });
    }
    setSaved(false);
  }, [node?.id, node?.type]);

  const handleSave = async () => {
    if (!formData.title.trim()) return;
    setIsPending(true);
    try {
      if (node.type === "course") {
        const price = formData.price === "" ? undefined : Number(formData.price);
        await updateCourseMutation.mutateAsync({ 
          id: node.id, 
          body: { 
            title: formData.title, 
            description: formData.description || undefined, 
            thumbnail: formData.thumbnail.trim() || undefined,
            introVideoUrl: formData.introVideoUrl.trim() || null,
            price: price != null && !Number.isNaN(price) ? price : undefined,
            type: formData.type,
            isLifetimePurchasable: formData.isLifetimePurchasable,
            isActive: formData.isActive,
            categoryId: formData.categoryId === "" ? null : (formData.categoryId || undefined),
            instructorId: formData.instructorId === "" ? null : (formData.instructorId || undefined),
          } 
        });
      } else if (node.type === "unit") {
        await updateUnitMutation.mutateAsync({ 
          id: node.id, 
          body: { title: formData.title } 
        });
      } else if (node.type === "lesson") {
        await updateLessonMutation.mutateAsync({ 
          id: node.id, 
          body: { 
            title: formData.title, 
            videoUrl: formData.videoUrl.trim() || null 
          } 
        });
      }
      setSaved(true);
      toast.success(t("adminPages.courseEditor.toasts.nodeSaved", { defaultValue: "Changes saved successfully" }));
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.saveChangesFailed", { defaultValue: "Failed to save changes" })));
    } finally {
      setIsPending(false);
    }
  };

  const getIcon = () => {
    if (node.type === "course") return <Settings className="h-4 w-4" />;
    if (node.type === "unit") return <Layers className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const { data: examsData } = useAdminExams({ page: 1, limit: 200 });
  const allExams = examsData?.exams || [];
  const linkedExams = allExams.filter((e) => {
    if (node.type === "course") return e.courseId === node.id;
    if (node.type === "unit") return e.unitId === node.id;
    if (node.type === "lesson") return e.lessonId === node.id;
    return false;
  });

  return (
    <div className="flex h-full flex-col antialiased">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/8">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            node.type === "course" ? "bg-blue-100 text-blue-600" : 
            node.type === "unit" ? "bg-purple-100 text-purple-600" : 
            "bg-red-100 text-red-600"
          }`}>
            {getIcon()}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
              {t(`adminPages.courseEditor.node.${node.type}`, { defaultValue: node.type })}{" "}
              {t("adminPages.courseEditor.editor", { defaultValue: "Editor" })}
            </p>
            <p className="text-[11px] text-slate-500">
              {t("adminPages.courseEditor.editMetadata", { defaultValue: "Edit metadata and linked resources" })}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-5">
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t("adminPages.courseEditor.fields.title", { defaultValue: "Title" })}
            </span>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t("adminPages.courseEditor.placeholders.title", { defaultValue: "Enter title..." })}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
          </label>

          {node.type === "course" && (
            <>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.courseEditor.fields.description", { defaultValue: "Description" })}
                </span>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  placeholder={t("adminPages.courseEditor.placeholders.courseSummary", { defaultValue: "Course summary..." })}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("adminPages.courseEditor.fields.thumbnailUrl", { defaultValue: "Thumbnail URL" })}
                </span>
                <input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t("dashboard.admin.courses.introVideoUrl", { defaultValue: "Intro video URL" })}
                </span>
                <input
                  value={formData.introVideoUrl}
                  onChange={(e) => setFormData({ ...formData, introVideoUrl: e.target.value })}
                  placeholder="https://example.com/intro.mp4"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("adminPages.addCourse.courseType", { defaultValue: "Course type" })}
                  </span>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="RECORDED">{t("adminPages.addCourse.typeRecorded", { defaultValue: "Recorded" })}</option>
                    <option value="HYBRID">{t("adminPages.addCourse.typeHybrid", { defaultValue: "Hybrid (live + recorded)" })}</option>
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("adminPages.addCourse.price", { defaultValue: "Lifetime purchase price" })}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-2 pt-6 text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.isLifetimePurchasable}
                    onChange={(e) => setFormData({ ...formData, isLifetimePurchasable: e.target.checked })}
                  />
                  {t("adminPages.addCourse.lifetimePurchasable", { defaultValue: "Allow lifetime purchase" })}
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("adminPages.addCourse.instructor", { defaultValue: "Instructor" })}
                  </span>
                  <select
                    value={formData.instructorId}
                    onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="">{t("dashboard.admin.courses.selectInstructor")}</option>
                    {instructors.map((i) => (
                      <option key={i.id} value={i.id}>{i.fullName || i.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("adminPages.addCourse.category", { defaultValue: "Category" })}
                  </span>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="">{t("adminPages.courseEditor.empty.noCategory")}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                {t("adminPages.addCourse.publishNow", { defaultValue: "Published (active)" })}
              </label>

              <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t("adminPages.courseEditor.staff.title", { defaultValue: "Course staff" })}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <select
                    value={staffUserId}
                    onChange={(e) => setStaffUserId(e.target.value)}
                    className="h-10 min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="">{t("adminPages.courseEditor.staff.selectUser", { defaultValue: "Select user" })}</option>
                    {(usersData?.users || [])
                      .filter((u) => ["TEACHING_ASSISTANT", "CONTENT_REVIEWER"].includes(String(u?.role?.name || u?.role || "").toUpperCase()))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName || u.email}
                        </option>
                      ))}
                  </select>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="TEACHING_ASSISTANT">TEACHING_ASSISTANT</option>
                    <option value="CONTENT_REVIEWER">CONTENT_REVIEWER</option>
                  </select>
                  <button
                    type="button"
                    disabled={!staffUserId || addStaffMutation.isPending}
                    onClick={async () => {
                      try {
                        await addStaffMutation.mutateAsync({ courseId: node.id, userId: staffUserId, role: staffRole });
                        setStaffUserId("");
                        toast.success(t("adminPages.courseEditor.staff.added", { defaultValue: "Staff added" }));
                      } catch (err) {
                        toast.error(getErrorMessage(err, t("adminPages.courseEditor.staff.addFailed", { defaultValue: "Failed to add staff" })));
                      }
                    }}
                    className="rounded-lg bg-[#EE7C11] px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {t("adminPages.courseEditor.staff.add", { defaultValue: "Add" })}
                  </button>
                </div>
                <div className="mt-3 space-y-1">
                  {(staff || []).map((s) => (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-white/5">
                      <span>{s?.user?.fullName || s?.user?.email} · {s.role}</span>
                      <button
                        type="button"
                        disabled={removeStaffMutation.isPending}
                        onClick={async () => {
                          try {
                            await removeStaffMutation.mutateAsync({ courseId: node.id, staffId: s.id });
                            toast.success(t("adminPages.courseEditor.staff.removed", { defaultValue: "Staff removed" }));
                          } catch (err) {
                            toast.error(getErrorMessage(err, t("adminPages.courseEditor.staff.removeFailed", { defaultValue: "Failed to remove staff" })));
                          }
                        }}
                        className="text-red-600 hover:underline"
                      >
                        {t("common.remove", { defaultValue: "Remove" })}
                      </button>
                    </div>
                  ))}
                  {!staff?.length ? (
                    <p className="text-xs text-slate-500">{t("adminPages.courseEditor.staff.empty", { defaultValue: "No staff assigned" })}</p>
                  ) : null}
                </div>
              </div>
            </>
          )}

          {node.type === "lesson" && (
            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {t("adminPages.courseEditor.fields.videoUrl", { defaultValue: "Video URL" })}
              </span>
              <div className="relative">
                <Video className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white ps-10 pe-4 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>
            </label>
          )}
        </div>

        <ExamManager 
          targetId={node.id} 
          targetType={node.type} 
          linkedExams={linkedExams} 
        />
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 px-5 py-4 dark:border-white/8">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || !formData.title.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#EE7C11] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#d9700e] disabled:opacity-50"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved
            ? t("adminPages.courseEditor.actions.changesSaved", { defaultValue: "Changes saved" })
            : t("adminPages.courseEditor.actions.saveNode", {
                node: t(`adminPages.courseEditor.node.${node.type}`, { defaultValue: node.type }),
                defaultValue: "Save {{node}}",
              })}
        </button>
      </div>
    </div>
  );
}


/* ─── Live Sessions Tab ─── */
function CourseSessionsPanel({ course }) {
  const { t } = useTranslation();
  const { data: sessions = [], isLoading } = useCourseSessions(course?.id);
  const { data: instructorsData } = useAdminInstructors({ page: 1, limit: 100 });
  const instructors = instructorsData?.instructors || [];
  const createSession = useCreateCourseSession();
  const deleteSession = useDeleteCourseSession();
  const [form, setForm] = useState({
    title: "",
    instructorId: course?.instructorId || course?.instructor?.id || "",
    startTime: "",
    endTime: "",
    meetingUrl: "",
  });

  useEffect(() => {
    const defaultId = course?.instructorId || course?.instructor?.id || "";
    setForm((prev) => ({ ...prev, instructorId: defaultId }));
  }, [course?.instructorId, course?.instructor?.id]);

  const sortedInstructors = useMemo(() => {
    const ownerId = course?.instructorId || course?.instructor?.id;
    if (!ownerId || !instructors.length) return instructors;
    const owner = instructors.find((i) => i.id === ownerId);
    const others = instructors.filter((i) => i.id !== ownerId);
    return owner ? [owner, ...others] : others;
  }, [instructors, course?.instructorId, course?.instructor?.id]);

  if (course?.type !== "HYBRID") {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        {t("adminPages.courseEditor.sessions.hybridOnly", { defaultValue: "Live sessions are only available for HYBRID courses. Change the course type in settings." })}
      </div>
    );
  }

  const onCreate = async (e) => {
    e.preventDefault();
    if (!form.instructorId || !form.startTime || !form.endTime) {
      toast.error(t("adminPages.courseEditor.sessions.required", { defaultValue: "Instructor and times are required." }));
      return;
    }
    try {
      await createSession.mutateAsync({
        courseId: course.id,
        body: {
          title: form.title.trim() || undefined,
          instructorId: form.instructorId,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          meetingUrl: form.meetingUrl.trim() || undefined,
        },
      });
      setForm((prev) => ({ ...prev, title: "", startTime: "", endTime: "", meetingUrl: "" }));
      toast.success(t("adminPages.courseEditor.sessions.created", { defaultValue: "Session created" }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.courseEditor.sessions.createFailed", { defaultValue: "Failed to create session" })));
    }
  };

  return (
    <div className="space-y-6 p-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {t("adminPages.courseEditor.sessions.title", { defaultValue: "Live sessions" })}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {t("adminPages.courseEditor.sessions.subtitle", { defaultValue: "Schedule group live sessions for this hybrid course." })}
        </p>
      </div>

      <form onSubmit={(e) => void onCreate(e)} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-[#0F0F13]">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder={t("adminPages.courseEditor.sessions.titlePlaceholder", { defaultValue: "Session title" })}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#1A1A22] dark:text-white"
        />
        <select
          value={form.instructorId}
          onChange={(e) => setForm({ ...form, instructorId: e.target.value })}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#1A1A22] dark:text-white"
        >
          <option value="">{t("dashboard.admin.courses.selectInstructor", { defaultValue: "Select Instructor" })}</option>
          {sortedInstructors.map((i) => {
            const isOwner = i.id === (course?.instructorId || course?.instructor?.id);
            const label = isOwner
              ? `⭐ ${i.fullName || i.name} (${t("adminPages.courseEditor.sessions.courseOwner", { defaultValue: "Course Owner" })})`
              : i.fullName || i.name;
            return (
              <option key={i.id} value={i.id}>
                {label}
              </option>
            );
          })}
        </select>
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#1A1A22] dark:text-white" />
          <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#1A1A22] dark:text-white" />
        </div>
        <input
          value={form.meetingUrl}
          onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
          placeholder={t("adminPages.courseEditor.sessions.meetingUrl", { defaultValue: "Meeting URL (optional)" })}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#1A1A22] dark:text-white"
        />
        <button type="submit" disabled={createSession.isPending} className="rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white hover:bg-[#d9700e] disabled:opacity-50">
          {createSession.isPending ? t("adminPages.courseEditor.actions.saving") : t("adminPages.courseEditor.sessions.add", { defaultValue: "Add session" })}
        </button>
      </form>

      {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-[#EE7C11]" /> : null}
      <ul className="space-y-3">
        {sessions.map((session) => (
          <li key={session.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0F0F13]">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{session.title || t("adminPages.courseEditor.sessions.untitled", { defaultValue: "Live session" })}</p>
              <p className="mt-1 text-xs text-slate-500">
                {session.instructor?.fullName || session.instructorId} · {new Date(session.startTime).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">{session.status}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!confirm(t("adminPages.courseEditor.sessions.deleteConfirm", { defaultValue: "Delete this session?" }))) return;
                void deleteSession.mutateAsync({ courseId: course.id, sessionId: session.id });
              }}
              className="text-slate-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      {!isLoading && sessions.length === 0 ? (
        <p className="text-sm text-slate-500">{t("adminPages.courseEditor.sessions.empty", { defaultValue: "No sessions scheduled yet." })}</p>
      ) : null}
    </div>
  );
}


/* ═══════════════════════════════════════════════
   MAIN: CourseEditor (The Studio)
   ═══════════════════════════════════════════════ */
export default function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data: course, isLoading, isError } = useAdminCourse(id);

  const createUnitMutation = useCreateAdminUnit();
  const updateUnitMutation = useUpdateAdminUnit();
  const deleteUnitMutation = useDeleteAdminUnit();
  const createSectionMutation = useCreateAdminSection();
  const updateSectionMutation = useUpdateAdminSection();
  const deleteSectionMutation = useDeleteAdminSection();
  const createLessonMutation = useCreateAdminLesson();
  const deleteLessonMutation = useDeleteAdminLesson();

  const [selectedNode, setSelectedNode] = useState(null);
  const [editorTab, setEditorTab] = useState("curriculum");

  useEffect(() => {
    if (course && !selectedNode) {
      setSelectedNode({ type: 'course', id: course.id, data: course });
    }
  }, [course, selectedNode]);

  const units = course?.units || [];

  const handleAddUnit = useCallback(async () => {
    try {
      await createUnitMutation.mutateAsync({
        title: t("adminPages.courseEditor.defaults.unit", { n: units.length + 1, defaultValue: "Unit {{n}}" }),
        order: units.length + 1,
        courseId: id,
      });
      toast.success(t("adminPages.courseEditor.toasts.unitAdded", { defaultValue: "Unit added" }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.unitAddFailed", { defaultValue: "Failed to add unit" })));
    }
  }, [createUnitMutation, units.length, id, t]);

  const handleRenameUnit = useCallback(async (unitId, title) => {
    try {
      await updateUnitMutation.mutateAsync({ id: unitId, body: { title } });
    } catch (err) { toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.unitRenameFailed", { defaultValue: "Failed to rename unit" }))); }
  }, [updateUnitMutation, t]);

  const handleDeleteUnit = useCallback(async (unitId) => {
    if (!confirm(t("adminPages.courseEditor.confirm.deleteUnit", { defaultValue: "Delete this unit and all its lessons?" }))) return;
    try {
      if (selectedNode?.id === unitId) setSelectedNode({ type: 'course', id: course.id, data: course });
      await deleteUnitMutation.mutateAsync(unitId);
      toast.success(t("adminPages.courseEditor.toasts.unitDeleted", { defaultValue: "Unit deleted" }));
    } catch (err) { toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.unitDeleteFailed", { defaultValue: "Failed to delete unit" }))); }
  }, [deleteUnitMutation, selectedNode, course, t]);

  const handleAddSection = useCallback(async (unit) => {
    try {
      const sectionCount = unit?.sections?.length || 0;
      await createSectionMutation.mutateAsync({
        unitId: unit.id,
        title: t("adminPages.courseEditor.defaults.section", { n: sectionCount + 1, defaultValue: "Section {{n}}" }),
        order: sectionCount + 1,
      });
      toast.success(t("adminPages.courseEditor.toasts.sectionAdded", { defaultValue: "Section added" }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.sectionAddFailed", { defaultValue: "Failed to add section" })));
    }
  }, [createSectionMutation, t]);

  const handleRenameSection = useCallback(async (sectionId, title) => {
    try {
      await updateSectionMutation.mutateAsync({ id: sectionId, body: { title } });
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.sectionRenameFailed", { defaultValue: "Failed to rename section" })));
    }
  }, [updateSectionMutation, t]);

  const handleDeleteSection = useCallback(async (sectionId) => {
    if (!confirm(t("adminPages.courseEditor.confirm.deleteSection", { defaultValue: "Delete this section and all its lessons?" }))) return;
    try {
      await deleteSectionMutation.mutateAsync(sectionId);
      toast.success(t("adminPages.courseEditor.toasts.sectionDeleted", { defaultValue: "Section deleted" }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.sectionDeleteFailed", { defaultValue: "Failed to delete section" })));
    }
  }, [deleteSectionMutation, t]);

  const handleAddLesson = useCallback(async (section, order) => {
    try {
      if (!section?.id) throw new Error("No section available");
      await createLessonMutation.mutateAsync({
        title: t("adminPages.courseEditor.defaults.lesson", { n: order, defaultValue: "Lesson {{n}}" }),
        order,
        sectionId: section.id,
      });
      toast.success(t("adminPages.courseEditor.toasts.lessonAdded", { defaultValue: "Lesson added" }));
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.lessonAddFailed", { defaultValue: "Failed to add lesson" })));
    }
  }, [createLessonMutation, t]);

  const handleDeleteLesson = useCallback(async (lessonId) => {
    if (!confirm(t("adminPages.courseEditor.confirm.deleteLesson", { defaultValue: "Delete this lesson?" }))) return;
    try {
      if (selectedNode?.id === lessonId) setSelectedNode({ type: 'course', id: course.id, data: course });
      await deleteLessonMutation.mutateAsync(lessonId);
      toast.success(t("adminPages.courseEditor.toasts.lessonDeleted", { defaultValue: "Lesson deleted" }));
    } catch (err) { toast.error(getErrorMessage(err, t("adminPages.courseEditor.toasts.lessonDeleteFailed", { defaultValue: "Failed to delete lesson" }))); }
  }, [deleteLessonMutation, selectedNode, course, t]);

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#EE7C11]" /></div>;
  if (isError || !course) return (
    <div className="mx-auto max-w-lg space-y-4 py-20 text-center">
      <p className="text-lg font-bold text-slate-900 dark:text-white">
        {t("adminPages.courseEditor.notFound", { defaultValue: "Course not found" })}
      </p>
      <Link to="/admin/courses" className="text-sm text-[#EE7C11] hover:underline">
        {t("adminPages.courseEditor.actions.backToCourses", { defaultValue: "Back to courses" })}
      </Link>
    </div>
  );

  const totalLessons = units.reduce((sum, u) => sum + ((u.sections || []).reduce((s, sec) => s + (sec.lessons?.length || 0), 0)), 0);

  return (
    <section className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/courses")}
            aria-label={t("adminPages.courseEditor.actions.backToCourses", { defaultValue: "Back to courses" })}
            className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
          >
            {i18n.dir() === "rtl" ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{course.title}</h1>
            <p className="text-xs text-slate-500">
              {course.category?.name || t("adminPages.courseEditor.empty.noCategory", { defaultValue: "No category" })} ·{" "}
              {course.instructor?.fullName || t("adminPages.courseEditor.empty.noInstructor", { defaultValue: "No instructor" })}
            </p>
          </div>
        </div>
        <div className={`rounded-full px-3 py-1 text-[10px] font-bold ${course.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {course.isActive
            ? t("adminPages.courseEditor.status.published", { defaultValue: "Published" })
            : t("adminPages.courseEditor.status.draft", { defaultValue: "Draft" })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t("adminPages.courseEditor.stats.units", { defaultValue: "Units" }), value: units.length, color: "text-blue-500" },
          { label: t("adminPages.courseEditor.stats.lessons", { defaultValue: "Lessons" }), value: totalLessons, color: "text-emerald-500" },
          { label: t("adminPages.courseEditor.stats.videos", { defaultValue: "Videos" }), value: units.reduce((s, u) => s + ((u.sections || []).reduce((secSum, sec) => secSum + ((sec.lessons || []).filter((l) => l.videoUrl).length), 0)), 0), color: "text-purple-500" },
          { label: t("adminPages.courseEditor.stats.finalExam", { defaultValue: "Final exam" }), value: course.exams?.filter(e => e.courseId === course.id).length || 0, color: "text-amber-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/8 dark:bg-[#1A1A22]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
            <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditorTab("curriculum")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${editorTab === "curriculum" ? "bg-[#EE7C11] text-white" : "border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-300"}`}
        >
          {t("adminPages.courseEditor.curriculum", { defaultValue: "Curriculum" })}
        </button>
        <button
          type="button"
          onClick={() => setEditorTab("sessions")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${editorTab === "sessions" ? "bg-[#EE7C11] text-white" : "border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-300"}`}
        >
          {t("adminPages.courseEditor.sessions.title", { defaultValue: "Live sessions" })}
        </button>
      </div>

      {editorTab === "sessions" ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <CourseSessionsPanel course={course} />
        </div>
      ) : (
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Left: Curriculum Tree */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              {t("adminPages.courseEditor.curriculum", { defaultValue: "Curriculum" })}
            </h2>
            <button onClick={handleAddUnit} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#EE7C11] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#d9700e]">
              <Plus className="h-3 w-3 shrink-0" />
              {t("adminPages.courseEditor.actions.addUnit", { defaultValue: "Add unit" })}
            </button>
          </div>

          {/* Course Root Node */}
          <button 
            onClick={() => setSelectedNode({ type: 'course', id: course.id, data: course })}
            className={`flex w-full items-center gap-3 rounded-xl border p-4 text-start transition-all ${selectedNode?.type === 'course' ? 'border-[#EE7C11] bg-[#EE7C11]/5 ring-1 ring-[#EE7C11]/10' : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-white/8 dark:bg-[#1A1A22]'}`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${selectedNode?.type === 'course' ? 'bg-[#EE7C11] text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/10'}`}><Info className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className={`text-sm font-bold ${selectedNode?.type === 'course' ? 'text-[#EE7C11]' : 'text-slate-900 dark:text-white'}`}>
                {t("adminPages.courseEditor.courseSettings", { defaultValue: "Course settings" })}
              </p>
              <p className="text-[11px] text-slate-500">
                {t("adminPages.courseEditor.courseSettingsHint", { defaultValue: "Metadata & final exam" })}
              </p>
            </div>
          </button>

          {units.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-white/10">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-bold text-slate-500">
                {t("adminPages.courseEditor.empty.noUnits", { defaultValue: "No units yet" })}
              </p>
            </div>
          ) : (
            units.map((unit) => (
              <UnitAccordion
                key={unit.id}
                unit={unit}
                isSelected={selectedNode?.type === 'unit' && selectedNode?.id === unit.id}
                onSelect={(u) => setSelectedNode({ type: 'unit', id: u.id, data: u })}
                selectedLessonId={selectedNode?.type === 'lesson' ? selectedNode.id : null}
                onSelectLesson={(l) => setSelectedNode({ type: 'lesson', id: l.id, data: l })}
                onDeleteUnit={handleDeleteUnit}
                onDeleteLesson={handleDeleteLesson}
                onDeleteSection={handleDeleteSection}
                onAddLesson={handleAddLesson}
                onAddSection={handleAddSection}
                onRenameUnit={handleRenameUnit}
                onRenameSection={handleRenameSection}
                isAddingLesson={createLessonMutation.isPending}
              />
            ))
          )}
        </div>

        {/* Right: Detail Editor */}
        <div className="min-h-[500px] rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          {selectedNode ? (
            <DetailEditor
              key={selectedNode.type + selectedNode.id}
              node={selectedNode}
              onClose={() => setSelectedNode({ type: 'course', id: course.id, data: course })}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-slate-400">
              <BookOpen className="mb-2 h-10 w-10" />
              <p>{t("adminPages.courseEditor.empty.selectItem", { defaultValue: "Select an item to edit" })}</p>
            </div>
          )}
        </div>
      </div>
      )}
    </section>
  );
}