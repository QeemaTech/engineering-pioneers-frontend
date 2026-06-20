import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/ui/PageHeader";
import PermissionGate from "../../components/ui/PermissionGate";
import {
  useAddFaqItem,
  useAdminFaqs,
  useAdminSections,
  useCreateSection,
  useDeleteFaqItem,
  useUpdateAboutUs,
  useUpdateFaqItem,
  useUpdateSection,
} from "../../features/admin/cms/hooks";
import { getErrorMessage } from "../../api/error";

const field =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11]/30 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white dark:placeholder:text-slate-500";
const area =
  "min-h-32 w-full rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11]/30 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200 dark:placeholder:text-slate-500";
const mono =
  "min-h-32 w-full rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0D0D11] dark:text-slate-300";
const card = "rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]";

function Cms() {
  const { t } = useTranslation();
  const [notice, setNotice] = useState(null);
  const [about, setAbout] = useState({ mission: "", vision: "", description: "" });
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [newSection, setNewSection] = useState({ key: "", content: "{}", isVisible: true, order: 1 });

  const { data: faqs = [] } = useAdminFaqs();
  const { data: sections = [] } = useAdminSections();
  const addFaqMutation = useAddFaqItem();
  const updateFaqMutation = useUpdateFaqItem();
  const deleteFaqMutation = useDeleteFaqItem();
  const createSectionMutation = useCreateSection();
  const updateSectionMutation = useUpdateSection();
  const updateAboutMutation = useUpdateAboutUs();

  const aboutSection = sections.find((s) => s.key === "ABOUT_US");

  useEffect(() => {
    if (!aboutSection?.content || typeof aboutSection.content !== "object" || Array.isArray(aboutSection.content)) {
      return;
    }
    const c = aboutSection.content;
    setAbout({
      mission: typeof c.mission === "string" ? c.mission : "",
      vision: typeof c.vision === "string" ? c.vision : "",
      description: typeof c.description === "string" ? c.description : "",
    });
  }, [aboutSection?.id, aboutSection?.updatedAt]);

  const run = async (action, okMessage) => {
    setNotice(null);
    try {
      await action();
      setNotice({ type: "success", message: okMessage });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    }
  };

  const pill =
    "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-[#EE7C11]/40 hover:bg-[#EE7C11]/10 hover:text-[#d9700e] dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10";

  return (
    <PermissionGate permission="cms:manage" fallback={<p className="text-sm text-slate-500">{t("common.noAccess", { defaultValue: "You do not have access to this section." })}</p>}>
    <section className="space-y-6">
      <PageHeader
        title={t("dashboard.admin.pages.cms.title")}
        subtitle={t("dashboard.admin.pages.cms.subtitle")}
      />
      <Notice type={notice?.type} message={notice?.message} />

      <div className="flex flex-wrap gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {t("dashboard.admin.pages.cms.more")}:
        </span>
        <Link to="/admin/cms/posts" className={pill}>
          {t("sidebarNav.items.blogPosts")}
        </Link>
        <Link to="/admin/cms/banners" className={pill}>
          {t("sidebarNav.items.banners")}
        </Link>
      </div>

      <div className={card}>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {t("dashboard.admin.pages.cms.aboutTitle")}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={about.mission}
            onChange={(e) => setAbout((p) => ({ ...p, mission: e.target.value }))}
            className={field}
            placeholder={t("dashboard.admin.pages.cms.phMission")}
          />
          <input
            value={about.vision}
            onChange={(e) => setAbout((p) => ({ ...p, vision: e.target.value }))}
            className={field}
            placeholder={t("dashboard.admin.pages.cms.phVision")}
          />
          <textarea
            value={about.description}
            onChange={(e) => setAbout((p) => ({ ...p, description: e.target.value }))}
            className={`${area} sm:col-span-2`}
            placeholder={t("dashboard.admin.pages.cms.phDescription")}
          />
        </div>
        <button
          type="button"
          onClick={() => run(() => updateAboutMutation.mutateAsync(about), t("dashboard.admin.pages.cms.aboutSaved"))}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d9700e]"
        >
          {updateAboutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{" "}
          {t("adminPages.common.save")}
        </button>
      </div>

      <div className={card}>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {t("dashboard.admin.pages.cms.faqTitle")}
        </h3>
        <div className="space-y-3">
          {(faqs || []).map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 dark:border-white/5 dark:bg-white/[0.03]"
            >
              <div className="mb-2 flex gap-2">
                <input
                  defaultValue={item.question}
                  className={`${field} flex-1`}
                  onBlur={(e) =>
                    run(
                      () => updateFaqMutation.mutateAsync({ id: item.id, body: { question: e.target.value } }),
                      t("dashboard.admin.pages.cms.faqUpdated")
                    )
                  }
                />
                <button
                  type="button"
                  title={t("adminPages.common.delete")}
                  onClick={() => {
                    if (!window.confirm(t("dashboard.admin.pages.cms.confirmDeleteFaq"))) return;
                    run(() => deleteFaqMutation.mutateAsync(item.id), t("dashboard.admin.pages.cms.faqDeleted"));
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-[#EE7C11]/10 hover:text-red-600 dark:border-white/10 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                defaultValue={item.answer}
                className={area}
                onBlur={(e) =>
                  run(
                    () => updateFaqMutation.mutateAsync({ id: item.id, body: { answer: e.target.value } }),
                    t("dashboard.admin.pages.cms.faqUpdated")
                  )
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            value={newFaq.question}
            onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))}
            className={field}
            placeholder={t("dashboard.admin.pages.cms.newQuestion")}
          />
          <input
            value={newFaq.answer}
            onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))}
            className={field}
            placeholder={t("dashboard.admin.pages.cms.newAnswer")}
          />
        </div>
        <button
          type="button"
          onClick={() => run(() => addFaqMutation.mutateAsync(newFaq), t("dashboard.admin.pages.cms.faqAdded"))}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#EE7C11] px-6 py-2.5 text-sm font-bold text-[#EE7C11] transition hover:bg-[#EE7C11] hover:text-white"
        >
          {addFaqMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{" "}
          {t("dashboard.admin.pages.cms.addFaq")}
        </button>
      </div>

      <div className={card}>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {t("dashboard.admin.pages.cms.sectionsTitle")}
        </h3>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{t("dashboard.admin.pages.cms.sectionsHint")}</p>
        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.id} className="rounded-lg border border-slate-100 p-4 dark:border-white/5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold tracking-wide text-slate-900 dark:text-white">{section.key}</p>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${section.isVisible ? "bg-emerald-500" : "bg-slate-400"}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {section.isVisible ? t("dashboard.admin.pages.cms.visible") : t("dashboard.admin.pages.cms.hidden")}
                  </span>
                </div>
              </div>
              <textarea
                defaultValue={JSON.stringify(section.content, null, 2)}
                className={mono}
                onBlur={(e) =>
                  run(
                    () =>
                      updateSectionMutation.mutateAsync({
                        id: section.id,
                        body: { content: JSON.parse(e.target.value) },
                      }),
                    t("dashboard.admin.pages.cms.sectionUpdated")
                  )
                }
              />
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {t("dashboard.admin.pages.cms.sectionKey")}
            </label>
            <input
              value={newSection.key}
              onChange={(e) => setNewSection((p) => ({ ...p, key: e.target.value }))}
              className={field}
              placeholder="HERO"
            />
          </div>
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {t("dashboard.admin.pages.cms.order")}
            </label>
            <input
              value={String(newSection.order)}
              onChange={(e) => setNewSection((p) => ({ ...p, order: Number(e.target.value || 1) }))}
              className={field}
              placeholder="1"
            />
          </div>
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              {t("dashboard.admin.pages.cms.visibility")}
            </label>
            <select
              value={newSection.isVisible ? "1" : "0"}
              onChange={(e) => setNewSection((p) => ({ ...p, isVisible: e.target.value === "1" }))}
              className={field}
            >
              <option value="1">{t("dashboard.admin.pages.cms.visible")}</option>
              <option value="0">{t("dashboard.admin.pages.cms.hidden")}</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-3">
            <label className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">JSON</label>
            <textarea
              value={newSection.content}
              onChange={(e) => setNewSection((p) => ({ ...p, content: e.target.value }))}
              className={mono}
              placeholder='{"title": "..."}'
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            run(
              () =>
                createSectionMutation.mutateAsync({
                  key: newSection.key,
                  order: newSection.order,
                  isVisible: newSection.isVisible,
                  content: JSON.parse(newSection.content || "{}"),
                }),
              t("dashboard.admin.pages.cms.sectionCreated")
            )
          }
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d9700e]"
        >
          {createSectionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{" "}
          {t("dashboard.admin.pages.cms.createSection")}
        </button>
      </div>
    </section>
    </PermissionGate>
  );
}

export default Cms;
