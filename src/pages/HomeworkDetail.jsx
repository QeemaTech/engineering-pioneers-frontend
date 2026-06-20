import { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Calendar, Loader2, Send, Upload } from "lucide-react";
import { useHomeworkAssignment, useSubmitHomework } from "../features/student/homework/hooks";
import { getErrorMessage } from "../api/error";

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

function detailStatus(hw) {
  const now = Date.now();
  const due = new Date(hw.dueDate).getTime();
  const sub = hw.submission;
  if (sub?.status === "GRADED") return { key: "completed", className: "bg-green-100 text-green-800", labelKey: "homework.status.completed" };
  if (sub?.submittedAt) {
    if (sub.status === "PENDING") return { key: "underReview", className: "bg-purple-100 text-purple-800", labelKey: "homework.status.underReview" };
    return { key: "submitted", className: "bg-teal-100 text-teal-800", labelKey: "homework.status.submitted" };
  }
  if (due < now) return { key: "late", className: "bg-red-100 text-red-700", labelKey: "homework.status.late" };
  const daysLeft = Math.max(0, Math.ceil((due - now) / 86400000));
  return { key: "pending", className: "bg-orange-100 text-orange-800", labelKey: "homework.status.pending", daysLeft };
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function HomeworkDetail() {
  const { t } = useTranslation();
  const { cohortId, homeworkId } = useParams();
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

  const backTo = cohortId ? `/homework/${cohortId}` : "/homework";
  const coursePlayerLink = hw ? `/course/${hw.courseId}?cohortId=${encodeURIComponent(hw.cohortId)}` : "/homework";

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
        await submit.mutateAsync({ homeworkId: hw.id, cohortId: hw.cohortId, body: { content, fileUrl: null } });
        return;
      }
      if (type === "LINK") {
        const content = linkUrl.trim() || null;
        if (!content) {
          setErr(t("homeworkDetail.validation.link", { defaultValue: "Please enter a valid URL." }));
          return;
        }
        await submit.mutateAsync({ homeworkId: hw.id, cohortId: hw.cohortId, body: { content, fileUrl: null } });
        return;
      }
      if (type === "FILE") {
        const pasted = filePastedUrl.trim();
        if (selectedFile) {
          const fd = new FormData();
          fd.append("file", selectedFile);
          await submit.mutateAsync({ homeworkId: hw.id, cohortId: hw.cohortId, body: fd });
          return;
        }
        if (!pasted) {
          setErr(t("homeworkDetail.validation.file"));
          return;
        }
        await submit.mutateAsync({
          homeworkId: hw.id,
          cohortId: hw.cohortId,
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

  const onFileInput = (e) => {
    const f = e.target.files?.[0];
    onFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    onFile(f);
  };

  if (isLoading) {
    return <div className="py-20 text-center">{t("dashboard.common.loading")}</div>;
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-red-600">{t("homeworkDetail.listError", { defaultValue: "Could not load assignments." })}</p>
        <button type="button" onClick={() => void refetch()} className="mt-4 font-semibold text-pioneer-orange-normal hover:underline">
          {t("takeExam.retry", { defaultValue: "Retry" })}
        </button>
        <div className="mt-4">
          <Link to={backTo} className="text-sm text-slate-600 hover:underline">
            {t("homeworkDetail.back")}
          </Link>
        </div>
      </div>
    );
  }

  if (!hw) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-slate-600">{t("homeworkDetail.notFound", { defaultValue: "Assignment not found." })}</p>
        <Link to={backTo} className="mt-4 inline-block text-pioneer-orange-normal hover:underline">
          {t("homeworkDetail.back")}
        </Link>
      </div>
    );
  }

  const done = hw.submission?.submittedAt;
  const st = detailStatus(hw);
  const ctxSubtitle = t("homeworkDetail.contextSubtitle", {
    courseTitle: hw.courseTitle,
    cohortName: hw.cohortName,
    defaultValue: "{{courseTitle}} · {{cohortName}}",
  });

  const requirementsBody =
    reqFromDesc ||
    (attachmentItems.length
      ? attachmentItems.map((a) => `• ${a}`).join("\n")
      : t(`homeworkDetail.requirements.fallback.${String(type)}`, {
          defaultValue: t("homeworkDetail.requirements.fallbackDefault"),
        }));

  const tips = ["tip1", "tip2", "tip3", "tip4"].map((k) => t(`homeworkDetail.sidebar.${k}`));

  return (
    <div className="min-h-screen bg-slate-50 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <Link to={backTo} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-pioneer-orange-normal">
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("homeworkDetail.back")}
        </Link>

        <div className="mt-6 lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{hw.title}</h1>
                <p className="mt-1 text-sm text-slate-600">{ctxSubtitle}</p>
              </div>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${st.className}`}>{t(st.labelKey)}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className={st.key === "late" || st.key === "pending" ? "font-medium text-orange-700" : "text-slate-600"}>
                {t("homeworkDetail.due")}{" "}
                {new Date(hw.dueDate).toLocaleDateString(undefined, { dateStyle: "long" })}
                {st.key === "pending" && st.daysLeft != null
                  ? ` ${t("homework.daysLeft", { n: st.daysLeft, defaultValue: "({{n}} days left)" })}`
                  : ""}
              </span>
            </div>

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">{t("homeworkDetail.instructions.title")}</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{instructions || "—"}</p>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">{t("homeworkDetail.requirements.title")}</h2>
              <div className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{requirementsBody}</div>
            </section>

            {done ? (
              <div className="mt-6 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
                <p className="font-semibold">{t("homeworkDetail.successTitle")}</p>
                <p className="mt-1">
                  {t("homework.submitted")} {hw.submission?.submittedAt ? new Date(hw.submission.submittedAt).toLocaleString() : ""}
                </p>
                {hw.submission?.status === "GRADED" && hw.submission?.grade != null ? (
                  <p className="mt-2">
                    {t("homework.gradePct", {
                      pct: Math.round((Number(hw.submission.grade) / (Number(hw.totalPoints) || 100)) * 100),
                      defaultValue: "Grade: {{pct}}%",
                    })}
                  </p>
                ) : null}
                {hw.submission?.feedback ? (
                  <p className="mt-2 whitespace-pre-wrap text-green-900/90">{hw.submission.feedback}</p>
                ) : null}
              </div>
            ) : (
              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900">{t("homeworkDetail.submitCard.title")}</h2>

                {type === "TEXT" ? (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-slate-700" htmlFor="hw-answer">
                      {t("homeworkDetail.submitCard.answerLabel")}
                    </label>
                    <textarea
                      id="hw-answer"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={8}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light"
                      placeholder={t("homeworkDetail.submitCard.answerPlaceholder")}
                    />
                  </div>
                ) : null}

                {type === "LINK" ? (
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light"
                    placeholder="https://..."
                  />
                ) : null}

                {type === "FILE" ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-700">{t("homeworkDetail.submitCard.uploadLabel")}</p>
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
                      onDrop={onDrop}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") e.currentTarget.querySelector('input[type="file"]')?.click();
                      }}
                      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 transition-colors ${
                        dragOver ? "border-pioneer-orange-normal bg-pioneer-orange-light/30" : "border-slate-200 bg-slate-50/80"
                      }`}
                    >
                      <Upload className="h-8 w-8 text-pioneer-orange-normal" />
                      <p className="mt-2 text-center text-sm font-medium text-slate-700">{t("homeworkDetail.upload.cta")}</p>
                      <p className="mt-1 text-center text-xs text-slate-500">{t("homeworkDetail.upload.hint")}</p>
                      <input type="file" onChange={onFileInput} className="mt-4 block text-xs" />
                    </div>
                    <p className="text-xs text-slate-500">{t("homeworkDetail.fileOrUrlHint")}</p>
                    <input
                      type="url"
                      value={filePastedUrl}
                      onChange={(e) => {
                        setFilePastedUrl(e.target.value);
                        if (e.target.value.trim()) setSelectedFile(null);
                      }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pioneer-orange-normal focus:ring-2 focus:ring-pioneer-orange-light"
                      placeholder={t("homeworkDetail.fileUrlPlaceholder")}
                    />
                    {selectedFile ? (
                      <p className="text-xs text-green-700">
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
                  {t("homeworkDetail.submitCard.submitBtn")}
                </button>
              </section>
            )}
          </div>

          <aside className="mt-10 space-y-6 lg:mt-0">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">{t("homeworkDetail.sidebar.relatedTitle")}</h3>
              <p className="mt-2 text-sm text-slate-600">{ctxSubtitle}</p>
              <Link
                to={coursePlayerLink}
                className="mt-4 block w-full rounded-xl bg-pioneer-orange-light py-2.5 text-center text-sm font-bold text-pioneer-orange-normal hover:bg-pioneer-orange-light/80"
              >
                {t("homeworkDetail.sidebar.viewClassBtn")}
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">{t("homeworkDetail.sidebar.tipsTitle")}</h3>
              <ul className="mt-3 list-disc space-y-2 ps-4 text-sm text-slate-600">
                {tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
