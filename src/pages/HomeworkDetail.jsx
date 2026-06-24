import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Download, ExternalLink, Loader2, Send, Upload } from "lucide-react";
import PageHeader from "../components/dashboard/PageHeader";
import { useHomeworkAssignment, useSubmitHomework } from "../features/student/homework/hooks";
import { getErrorMessage } from "../api/error";
import {
  deriveHomeworkUiStatus,
  HOMEWORK_STATUS_BADGE,
  HOMEWORK_STATUS_LABEL,
  resolveUploadUrl,
} from "../utils/homeworkStatus";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function splitInstructions(description) {
  if (!description) return { instructions: "", requirements: null };
  const parts = description.split(/\n---\n/).map((s) => s.trim());
  if (parts.length >= 2) return { instructions: parts[0], requirements: parts.slice(1).join("\n\n") };
  return { instructions: description, requirements: null };
}

function attachmentsList(attachments) {
  if (!attachments) return [];
  if (Array.isArray(attachments)) return attachments.filter(Boolean).map(String);
  return [];
}

function requirementsList(hw, reqFromDesc, attachmentItems, type, t) {
  if (Array.isArray(hw?.requirements) && hw.requirements.length > 0) {
    return hw.requirements.map((r) => `• ${r}`).join("\n");
  }
  if (reqFromDesc) return reqFromDesc;
  if (attachmentItems.length) return attachmentItems.map((a) => `• ${a}`).join("\n");
  return t(`homeworkDetail.requirements.fallback.${String(type)}`, {
    defaultValue: t("homeworkDetail.requirements.fallbackDefault"),
  });
}

export default function HomeworkDetail() {
  const { t } = useTranslation();
  const { homeworkId } = useParams();
  const { data: hw, isLoading, isError, refetch } = useHomeworkAssignment(homeworkId);
  const submit = useSubmitHomework();

  const [text, setText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePastedUrl, setFilePastedUrl] = useState("");
  const [err, setErr] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const type = hw?.type || "TEXT";
  const { instructions, requirements: reqFromDesc } = useMemo(() => splitInstructions(hw?.description || ""), [hw?.description]);
  const attachmentItems = useMemo(() => attachmentsList(hw?.attachments), [hw?.attachments]);
  const tips = useMemo(
    () =>
      Array.isArray(hw?.submissionTips) && hw.submissionTips.length > 0
        ? hw.submissionTips
        : ["tip1", "tip2", "tip3", "tip4"].map((k) => t(`homeworkDetail.sidebar.${k}`)),
    [hw?.submissionTips, t]
  );

  const backTo = hw?.courseId ? `/student/homework/course/${hw.courseId}` : "/student/homework";
  const coursePlayerLink = hw ? `/student/courses/${hw.courseId}/learn` : "/student/homework";

  const isGraded = hw?.submission?.status === "GRADED";
  const hasSubmission = Boolean(hw?.submission?.submittedAt);
  const canEdit = !isGraded;

  useEffect(() => {
    if (!hw?.submission) return;
    const sub = hw.submission;
    if (type === "TEXT" || type === "LINK") {
      setText(sub.content || "");
      setLinkUrl(type === "LINK" ? sub.content || "" : "");
    }
    if (type === "FILE" && sub.fileUrl && !sub.fileUrl.startsWith("/uploads/")) {
      setFilePastedUrl(sub.fileUrl);
    }
  }, [hw?.submission, type]);

  const onSubmit = async () => {
    if (!hw) return;
    setErr("");
    try {
      if (type === "TEXT") {
        const content = text.trim() || null;
        if (!content) {
          setErr(t("homeworkDetail.validation.text", { defaultValue: "Please enter your answer." }));
          return;
        }
        await submit.mutateAsync({ homeworkId: hw.id, courseId: hw.courseId, body: { content, fileUrl: null } });
        setSelectedFile(null);
        return;
      }
      if (type === "LINK") {
        const content = linkUrl.trim() || null;
        if (!content) {
          setErr(t("homeworkDetail.validation.link", { defaultValue: "Please enter a valid URL." }));
          return;
        }
        await submit.mutateAsync({ homeworkId: hw.id, courseId: hw.courseId, body: { content, fileUrl: null } });
        return;
      }
      if (type === "FILE") {
        if (selectedFile) {
          const fd = new FormData();
          fd.append("file", selectedFile);
          await submit.mutateAsync({ homeworkId: hw.id, courseId: hw.courseId, body: fd });
          setSelectedFile(null);
          return;
        }
        const pasted = filePastedUrl.trim();
        if (!pasted) {
          setErr(t("homeworkDetail.validation.file"));
          return;
        }
        await submit.mutateAsync({
          homeworkId: hw.id,
          courseId: hw.courseId,
          body: { content: null, fileUrl: pasted },
        });
      }
    } catch (e) {
      setErr(getErrorMessage(e, t("homeworkDetail.submitError")));
    }
  };

  const onFile = useCallback(
    (f) => {
      if (!f) return;
      if (f.size > MAX_FILE_BYTES) {
        setErr(t("homeworkDetail.fileTooBig", { defaultValue: "File is too large (max 10MB)." }));
        return;
      }
      setErr("");
      setSelectedFile(f);
      setFilePastedUrl("");
    },
    [t]
  );

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500">{t("dashboard.common.loading")}</div>;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-red-600">{t("homeworkDetail.listError", { defaultValue: "Could not load assignments." })}</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 font-semibold text-pioneer-orange-normal hover:underline">
          {t("takeExam.retry", { defaultValue: "Retry" })}
        </button>
        <div className="mt-4">
          <Link to="/student/homework" className="text-sm text-slate-600 hover:underline dark:text-slate-400">
            {t("homeworkDetail.back")}
          </Link>
        </div>
      </div>
    );
  }

  if (!hw) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-slate-600 dark:text-slate-400">{t("homeworkDetail.notFound", { defaultValue: "Assignment not found." })}</p>
        <Link to="/student/homework" className="mt-4 inline-block text-pioneer-orange-normal hover:underline">
          {t("homeworkDetail.back")}
        </Link>
      </div>
    );
  }

  const st = deriveHomeworkUiStatus(hw);
  const badge = HOMEWORK_STATUS_BADGE[st.key] || HOMEWORK_STATUS_BADGE.pending;
  const requirementsBody = requirementsList(hw, reqFromDesc, attachmentItems, type, t);
  const submittedFileUrl = resolveUploadUrl(hw.submission?.fileUrl);

  return (
    <div className="space-y-8">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-pioneer-orange-normal dark:text-slate-400">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("homeworkDetail.back")}
      </Link>

      <PageHeader
        title={hw.title}
        subtitle={hw.courseTitle || ""}
        actions={
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>{t(HOMEWORK_STATUS_LABEL[st.key])}</span>
        }
      />

      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span className={st.key === "late" || st.key === "pending" ? "font-medium text-orange-700 dark:text-orange-400" : ""}>
          {t("homeworkDetail.due")}{" "}
          {new Date(hw.dueDate).toLocaleDateString(undefined, { dateStyle: "long" })}
          {st.key === "pending" && st.daysLeft != null
            ? ` ${t("homework.daysLeft", { n: st.daysLeft, defaultValue: "({{n}} days left)" })}`
            : ""}
        </span>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <span>{t(`homework.type.${String(type).toUpperCase()}`)}</span>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("homeworkDetail.instructions.title")}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{instructions || "—"}</p>
          </section>

          <section className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t("homeworkDetail.requirements.title")}</h2>
            <div className="mt-3 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{requirementsBody}</div>
          </section>

          {hasSubmission ? (
            <section className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-500/30 dark:bg-green-500/10">
              <h2 className="text-sm font-bold text-green-900 dark:text-green-300">
                {isGraded ? t("homeworkDetail.gradedTitle", { defaultValue: "Graded submission" }) : t("homeworkDetail.successTitle")}
              </h2>
              <p className="mt-1 text-sm text-green-800 dark:text-green-400">
                {t("homework.submitted")}{" "}
                {hw.submission?.submittedAt ? new Date(hw.submission.submittedAt).toLocaleString() : ""}
              </p>
              {type === "TEXT" && hw.submission?.content ? (
                <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/80 p-4 text-sm text-slate-800 dark:bg-slate-900/50 dark:text-slate-200">
                  {hw.submission.content}
                </p>
              ) : null}
              {type === "LINK" && hw.submission?.content ? (
                <a
                  href={hw.submission.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-pioneer-orange-normal hover:underline"
                >
                  {hw.submission.content} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
              {type === "FILE" && submittedFileUrl ? (
                <a
                  href={submittedFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-pioneer-orange-normal shadow-sm hover:bg-green-50 dark:bg-slate-900/50"
                >
                  <Download className="h-4 w-4" />
                  {t("homeworkDetail.downloadSubmission", { defaultValue: "Download submitted file" })}
                </a>
              ) : null}
              {isGraded && hw.submission?.grade != null ? (
                <p className="mt-3 text-sm font-semibold text-green-900 dark:text-green-300">
                  {t("homework.grade")} {hw.submission.grade}/{hw.totalPoints || 100}
                  {" · "}
                  {t("homework.gradePct", {
                    pct: Math.round((Number(hw.submission.grade) / (Number(hw.totalPoints) || 100)) * 100),
                  })}
                </p>
              ) : null}
              {hw.submission?.feedback ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-green-900/90 dark:text-green-200">{hw.submission.feedback}</p>
              ) : null}
            </section>
          ) : null}

          {canEdit ? (
            <section className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {hasSubmission
                  ? t("homeworkDetail.resubmitTitle", { defaultValue: "Update your submission" })
                  : t("homeworkDetail.submitCard.title")}
              </h2>

              {type === "TEXT" ? (
                <div className="mt-4">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="hw-answer">
                    {t("homeworkDetail.submitCard.answerLabel")}
                  </label>
                  <textarea
                    id="hw-answer"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
                    placeholder={hw.submissionConfig?.answerPlaceholder || t("homeworkDetail.submitCard.answerPlaceholder")}
                  />
                </div>
              ) : null}

              {type === "LINK" ? (
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
                  placeholder="https://..."
                />
              ) : null}

              {type === "FILE" ? (
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t("homeworkDetail.submitCard.uploadLabel")}</p>
                  <div
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      onFile(e.dataTransfer.files?.[0]);
                    }}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 transition-colors ${
                      dragOver
                        ? "border-pioneer-orange-normal bg-pioneer-orange-light/30"
                        : "border-slate-200 bg-slate-50/80 dark:border-slate-600 dark:bg-slate-800/50"
                    }`}
                  >
                    <Upload className="h-8 w-8 text-pioneer-orange-normal" />
                    <p className="mt-2 text-center text-sm font-medium text-slate-700 dark:text-slate-300">{t("homeworkDetail.upload.cta")}</p>
                    <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
                      {hw.submissionConfig?.fileUploadHint || t("homeworkDetail.upload.hint")}
                    </p>
                    <input type="file" onChange={(e) => onFile(e.target.files?.[0])} className="mt-4 block text-xs" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t("homeworkDetail.fileOrUrlHint")}</p>
                  <input
                    type="url"
                    value={filePastedUrl}
                    onChange={(e) => {
                      setFilePastedUrl(e.target.value);
                      if (e.target.value.trim()) setSelectedFile(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
                    placeholder={t("homeworkDetail.fileUrlPlaceholder")}
                  />
                  {selectedFile ? (
                    <p className="text-xs text-green-700 dark:text-green-400">
                      {t("homeworkDetail.fileReady")}: {selectedFile.name}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}

              <button
                type="button"
                disabled={submit.isPending}
                onClick={() => void onSubmit()}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-6 py-3 text-sm font-bold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
              >
                {submit.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {hasSubmission
                  ? t("homeworkDetail.resubmitBtn", { defaultValue: "Update submission" })
                  : t("homeworkDetail.submitCard.submitBtn")}
              </button>
            </section>
          ) : null}
        </div>

        <aside className="mt-8 space-y-6 lg:mt-0">
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("homeworkDetail.sidebar.relatedTitle")}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{hw.courseTitle}</p>
            <Link
              to={coursePlayerLink}
              className="mt-4 block w-full rounded-xl bg-pioneer-orange-light py-2.5 text-center text-sm font-bold text-pioneer-orange-normal hover:bg-pioneer-orange-light/80 dark:bg-pioneer-orange-normal/15"
            >
              {t("homeworkDetail.sidebar.viewClassBtn")}
            </Link>
            {hw.courseId ? (
              <Link
                to={`/student/homework/course/${hw.courseId}`}
                className="mt-2 block w-full rounded-xl border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-600 hover:border-pioneer-orange-normal dark:border-slate-600 dark:text-slate-300"
              >
                {t("homework.viewCourse", { defaultValue: "All course homework" })}
              </Link>
            ) : null}
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("homeworkDetail.sidebar.tipsTitle")}</h3>
            <ul className="mt-3 list-disc space-y-2 ps-4 text-sm text-slate-600 dark:text-slate-300">
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
