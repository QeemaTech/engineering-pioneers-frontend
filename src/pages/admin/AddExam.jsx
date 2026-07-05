import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ClipboardList, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import { useCreateAdminExam } from "../../features/admin/exams/hooks";
import { getErrorMessage } from "../../api/error";

const EXAM_TYPES = ["STANDALONE", "FINAL", "UNIT", "LESSON"];

function AddExam() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const createMutation = useCreateAdminExam();

  const [form, setForm] = useState({
    title: "",
    type: "STANDALONE",
    durationMinutes: 60,
    totalPoints: 100,
    passingScore: 60,
  });
  const [selectedLevels, setSelectedLevels] = useState(["GENERAL"]);
  const isRtl = i18n.language?.startsWith("ar");

  const LEVELS = [
    { value: "GENERAL", labelAr: "عام / عمومي", labelEn: "General / Public" },
    { value: "PREPARATORY", labelAr: "إعدادي هندسة", labelEn: "Preparatory Year" },
    { value: "FIRST_YEAR", labelAr: "الفرقة الأولى", labelEn: "First Year" },
    { value: "SECOND_YEAR", labelAr: "الفرقة الثانية", labelEn: "Second Year" },
    { value: "THIRD_YEAR", labelAr: "الفرقة الثالثة", labelEn: "Third Year" },
    { value: "FOURTH_YEAR", labelAr: "الفرقة الرابعة / التخرج", labelEn: "Fourth Year" },
    { value: "GRADUATE", labelAr: "خريج / محترف", labelEn: "Graduate / Professional" },
  ];

  const handleLevelToggle = (lvl) => {
    if (selectedLevels.includes(lvl)) {
      setSelectedLevels(selectedLevels.filter((l) => l !== lvl));
    } else {
      setSelectedLevels([...selectedLevels, lvl]);
    }
  };

  const [error, setError] = useState("");

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (!form.title.trim()) throw new Error(t("adminPages.addExam.errorRequired", { defaultValue: "Title is required." }));
      const exam = await createMutation.mutateAsync({
        title: form.title.trim(),
        type: form.type,
        durationMinutes: Number(form.durationMinutes),
        totalPoints: Number(form.totalPoints),
        passingScore: Number(form.passingScore),
        targetLevels: selectedLevels.length > 0 ? selectedLevels : ["GENERAL"],
      });
      if (!exam?.id) throw new Error(t("adminPages.addExam.errorId", { defaultValue: "Exam was created but ID was not returned." }));
      navigate(`/admin/exams/${exam.id}/edit`);
    } catch (err) {
      setError(getErrorMessage(err, t("adminPages.addExam.errorCreate", { defaultValue: "Failed to create exam." })));
    }
  };

  return (
    <section className="mx-auto max-w-2xl space-y-8 py-4">
      <PageHeader
        title={t("adminPages.addExam.title", { defaultValue: "Create New Exam" })}
        subtitle={t("adminPages.addExam.subtitle", { defaultValue: "Set the basics, then build your question bank in the editor." })}
      />

      <div className="flex items-start gap-4 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-blue-900 dark:text-blue-200">
            {t("adminPages.addExam.quickStartTitle", { defaultValue: "Quick Start, Full Power" })}
          </p>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
            {t("adminPages.addExam.quickStartDesc", {
              defaultValue: "Fill in the essentials below. Once created, you'll be taken to the Exam Editor where you can add questions, set correct answers, and configure grading."
            })}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <label className="block space-y-1.5">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("adminPages.addExam.examTitle", { defaultValue: "Exam Title" })} <span className="text-[#EE7C11]">*</span>
            </span>
            <input 
              required 
              value={form.title} 
              onChange={(e) => set("title", e.target.value)} 
              placeholder={t("adminPages.addExam.titlePlaceholder", { defaultValue: "e.g. HSK 2 Midterm Exam" })} 
              className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all focus:border-[#EE7C11]/50 focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" 
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t("adminPages.addExam.type", { defaultValue: "Type" })}
              </span>
              <select 
                value={form.type} 
                onChange={(e) => set("type", e.target.value)} 
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-[#EE7C11]/50 focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              >
                {EXAM_TYPES.map((typeVal) => (
                  <option key={typeVal} value={typeVal}>
                    {t(`adminPages.addExam.types.${typeVal}`, { defaultValue: typeVal })}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t("adminPages.addExam.duration", { defaultValue: "Duration (min)" })}
              </span>
              <input type="number" min={1} value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-[#EE7C11]/50 focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t("adminPages.addExam.totalPoints", { defaultValue: "Total Points" })}
              </span>
              <input type="number" min={1} value={form.totalPoints} onChange={(e) => set("totalPoints", e.target.value)} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-[#EE7C11]/50 focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t("adminPages.addExam.passingScore", { defaultValue: "Passing Score" })}
              </span>
              <input type="number" min={1} value={form.passingScore} onChange={(e) => set("passingScore", e.target.value)} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-all focus:border-[#EE7C11]/50 focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
            </label>
          </div>

          {/* Academic target levels */}
          <div className="space-y-2 pt-2">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isRtl ? "السنوات الدراسية المستهدفة" : "Target Academic Levels"}
            </span>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-[#0F0F13] p-4 border border-slate-100 dark:border-white/5">
              {LEVELS.map((lvl) => (
                <label key={lvl.value} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLevels.includes(lvl.value)}
                    onChange={() => handleLevelToggle(lvl.value)}
                    className="rounded text-pioneer-orange-normal focus:ring-pioneer-orange-normal/30 h-4 w-4"
                  />
                  <span>{isRtl ? lvl.labelAr : lvl.labelEn}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error ? <div className="rounded-lg border border-red-200 bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">{error}</div> : null}

        <div className="flex items-center justify-between">
          <button 
            type="button" 
            onClick={() => navigate("/admin/exams")} 
            className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            {t("adminPages.addExam.cancel", { defaultValue: "Cancel" })}
          </button>
          <button disabled={createMutation.isPending} type="submit" className="inline-flex items-center gap-2.5 rounded-lg bg-[#EE7C11] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#d9700e] disabled:opacity-60">
            <ClipboardList className="h-4 w-4" />
            {createMutation.isPending 
              ? t("adminPages.addExam.creating", { defaultValue: "Creating..." }) 
              : t("adminPages.addExam.createBtn", { defaultValue: "Create & Open Editor" })
            }
            {!createMutation.isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddExam;
