import { useEffect, useState } from "react";
import { Loader2, Pencil, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../api/error";
import { useUpdateInstructorExam } from "../../features/instructor/exams/hooks";

const INPUT =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 dark:[color-scheme:dark]";

const STATUSES = ["UPCOMING", "AVAILABLE", "COMPLETED", "EXPIRED"];

function toLocalDatetimeValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const LEVELS = [
  { value: "GENERAL", labelAr: "عام / عمومي", labelEn: "General / Public" },
  { value: "PREPARATORY", labelAr: "إعدادي هندسة", labelEn: "Preparatory Year" },
  { value: "FIRST_YEAR", labelAr: "الفرقة الأولى", labelEn: "First Year" },
  { value: "SECOND_YEAR", labelAr: "الفرقة الثانية", labelEn: "Second Year" },
  { value: "THIRD_YEAR", labelAr: "الفرقة الثالثة", labelEn: "Third Year" },
  { value: "FOURTH_YEAR", labelAr: "الفرقة الرابعة / التخرج", labelEn: "Fourth Year" },
  { value: "GRADUATE", labelAr: "خريج / محترف", labelEn: "Graduate / Professional" },
];

export default function EditExamModal({ exam, onClose, onSaved }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const updateMutation = useUpdateInstructorExam();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [totalPoints, setTotalPoints] = useState("100");
  const [passingScore, setPassingScore] = useState("60");
  const [scheduledAt, setScheduledAt] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!exam) return;
    setTitle(exam.title || "");
    setDescription(exam.description || "");
    setDurationMinutes(String(exam.durationMinutes ?? 60));
    setTotalPoints(String(exam.totalPoints ?? 100));
    setPassingScore(String(exam.passingScore ?? 60));
    setScheduledAt(toLocalDatetimeValue(exam.scheduledAt));
    setStatus(exam.status || "AVAILABLE");
    setSelectedLevels(exam.targetLevels || []);
  }, [exam]);

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    const dm = Number(durationMinutes);
    const tp = Number(totalPoints);
    const ps = Number(passingScore);
    if (!title.trim() || Number.isNaN(dm) || dm < 1 || Number.isNaN(tp) || tp < 1 || Number.isNaN(ps) || ps < 0 || ps > tp) {
      setFormError(t("dashboard.instructor.exams.create.scoreValidation"));
      return;
    }
    try {
      const body = {
        title: title.trim(),
        description: description.trim() || undefined,
        durationMinutes: dm,
        totalPoints: tp,
        passingScore: ps,
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        targetLevels: selectedLevels,
      };
      const updated = await updateMutation.mutateAsync({ examId: exam.id, body });
      onSaved?.(updated);
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err, t("dashboard.common.error")));
    }
  };

  if (!exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1A1A22]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("dashboard.instructor.exams.edit.title", { defaultValue: "Edit exam" })}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          {formError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {formError}
            </div>
          ) : null}

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("dashboard.instructor.exams.create.titleLabel")}
            </span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} required />
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("dashboard.instructor.exams.create.descriptionLabel")}
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`${INPUT} min-h-[72px] resize-y py-2`}
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("dashboard.instructor.exams.create.durationLabel")}
              </span>
              <input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className={INPUT} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("dashboard.instructor.exams.create.totalPointsLabel")}
              </span>
              <input type="number" min={1} value={totalPoints} onChange={(e) => setTotalPoints(e.target.value)} className={INPUT} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("dashboard.instructor.exams.create.passingLabel")}
              </span>
              <input type="number" min={0} value={passingScore} onChange={(e) => setPassingScore(e.target.value)} className={INPUT} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("dashboard.instructor.exams.status")}
              </span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={INPUT}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`dashboard.instructor.exams.statusLabels.${s}`, { defaultValue: s })}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("dashboard.instructor.exams.create.scheduleLabel")}
            </span>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={INPUT} />
          </label>

          {/* Target Academic Years/Levels */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 font-cairo">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {isRtl ? "السنوات الدراسية المستهدفة" : "Target Academic Levels"}
            </span>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-[#0F0F13] p-4 border border-slate-100 dark:border-white/5">
              {LEVELS.map((lvl) => (
                <label key={lvl.value} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(selectedLevels || []).includes(lvl.value)}
                    onChange={() => {
                      const current = selectedLevels || [];
                      const updated = current.includes(lvl.value)
                        ? current.filter((v) => v !== lvl.value)
                        : [...current, lvl.value];
                      setSelectedLevels(updated);
                    }}
                    className="rounded text-pioneer-orange-normal focus:ring-pioneer-orange-normal/30 h-4 w-4"
                  />
                  <span>{isRtl ? lvl.labelAr : lvl.labelEn}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-white/10">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/15 dark:text-slate-200">
            {t("dashboard.common.cancel")}
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
            {t("dashboard.common.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
