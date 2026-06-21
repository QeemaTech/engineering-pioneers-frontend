import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Home,
  Image,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/ui/PageHeader";
import PermissionGate from "../../components/ui/PermissionGate";
import {
  useAddFaqItem,
  useAdminFaqs,
  useAdminSections,
  useDeleteFaqItem,
  useUpdateAboutUs,
  useUpdateFaqItem,
  useUpdateHero,
} from "../../features/admin/cms/hooks";
import { getErrorMessage } from "../../api/error";

const field =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";
const area =
  "min-h-28 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200";
const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]";
const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400";

const TABS = [
  { id: "hero", icon: Home, labelKey: "dashboard.admin.pages.cms.tabHero", defaultLabel: "Homepage hero" },
  { id: "about", icon: Sparkles, labelKey: "dashboard.admin.pages.cms.tabAbout", defaultLabel: "About us" },
  { id: "faq", icon: HelpCircle, labelKey: "dashboard.admin.pages.cms.tabFaq", defaultLabel: "FAQ" },
];

function PreviewLinks() {
  const { t } = useTranslation();
  const links = [
    { to: "/", label: t("dashboard.admin.pages.cms.previewHome", { defaultValue: "Homepage" }), icon: Home },
    { to: "/about", label: t("dashboard.admin.pages.cms.previewAbout", { defaultValue: "About page" }), icon: Sparkles },
    { to: "/faq", label: t("dashboard.admin.pages.cms.previewFaq", { defaultValue: "FAQ page" }), icon: HelpCircle },
    { to: "/admin/cms/posts", label: t("sidebarNav.items.blogPosts"), icon: FileText, admin: true },
    { to: "/admin/cms/banners", label: t("sidebarNav.items.banners"), icon: Image, admin: true },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ to, label, icon: Icon, admin }) => (
        <Link
          key={to}
          to={to}
          target={admin ? undefined : "_blank"}
          rel={admin ? undefined : "noreferrer"}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#EE7C11]/40 hover:bg-[#EE7C11]/10 hover:text-[#d9700e] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
          {!admin ? <ExternalLink className="h-3 w-3 opacity-50" /> : null}
        </Link>
      ))}
    </div>
  );
}

function Cms() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("hero");
  const [notice, setNotice] = useState(null);

  const [hero, setHero] = useState({ headline: "", subheadline: "", isVisible: true });
  const [about, setAbout] = useState({ mission: "", vision: "", description: "" });
  const [faqDrafts, setFaqDrafts] = useState([]);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  const { data: faqs = [], isLoading: faqsLoading } = useAdminFaqs();
  const { data: sections = [] } = useAdminSections();

  const heroSection = sections.find((s) => s.key === "HERO");
  const aboutSection = sections.find((s) => s.key === "ABOUT_US");

  const updateHeroMutation = useUpdateHero();
  const updateAboutMutation = useUpdateAboutUs();
  const addFaqMutation = useAddFaqItem();
  const updateFaqMutation = useUpdateFaqItem();
  const deleteFaqMutation = useDeleteFaqItem();

  useEffect(() => {
    const c = heroSection?.content;
    if (c && typeof c === "object" && !Array.isArray(c)) {
      setHero({
        headline: typeof c.headline === "string" ? c.headline : "",
        subheadline: typeof c.subheadline === "string" ? c.subheadline : "",
        isVisible: heroSection.isVisible !== false,
      });
    }
  }, [heroSection?.id, heroSection?.updatedAt, heroSection?.isVisible]);

  useEffect(() => {
    const c = aboutSection?.content;
    if (c && typeof c === "object" && !Array.isArray(c)) {
      setAbout({
        mission: typeof c.mission === "string" ? c.mission : "",
        vision: typeof c.vision === "string" ? c.vision : "",
        description: typeof c.description === "string" ? c.description : "",
      });
    }
  }, [aboutSection?.id, aboutSection?.updatedAt]);

  useEffect(() => {
    setFaqDrafts(
      (faqs || []).map((item) => ({
        id: item.id,
        question: item.question || "",
        answer: item.answer || "",
      }))
    );
  }, [faqs]);

  const run = async (action, okMessage) => {
    setNotice(null);
    try {
      await action();
      setNotice({ type: "success", message: okMessage });
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    }
  };

  const faqCount = useMemo(() => faqDrafts.filter((f) => f.question.trim()).length, [faqDrafts]);

  return (
    <PermissionGate
      permission="cms:manage"
      fallback={<p className="text-sm text-slate-500">{t("common.noAccess", { defaultValue: "You do not have access to this section." })}</p>}
    >
      <section className="space-y-6">
        <PageHeader
          title={t("dashboard.admin.pages.cms.title")}
          subtitle={t("dashboard.admin.pages.cms.subtitleNew", {
            defaultValue: "Edit what visitors see on the homepage, About page, and FAQ — no JSON required.",
          })}
        />
        <Notice type={notice?.type} message={notice?.message} />

        <PreviewLinks />

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1 dark:border-white/10">
          {TABS.map(({ id, icon: Icon, labelKey, defaultLabel }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition ${
                tab === id
                  ? "border-b-2 border-[#EE7C11] text-[#EE7C11]"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(labelKey, { defaultValue: defaultLabel })}
            </button>
          ))}
        </div>

        {tab === "hero" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className={card}>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t("dashboard.admin.pages.cms.heroTitle", { defaultValue: "Hero banner" })}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t("dashboard.admin.pages.cms.heroHint", {
                      defaultValue: "Main headline at the top of the public homepage.",
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setHero((p) => ({ ...p, isVisible: !p.isVisible }))}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    hero.isVisible
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
                  }`}
                >
                  {hero.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {hero.isVisible
                    ? t("dashboard.admin.pages.cms.visible")
                    : t("dashboard.admin.pages.cms.hidden")}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelCls}>{t("dashboard.admin.pages.cms.heroHeadline", { defaultValue: "Headline" })}</label>
                  <input
                    value={hero.headline}
                    onChange={(e) => setHero((p) => ({ ...p, headline: e.target.value }))}
                    className={field}
                    placeholder="Build Real Engineering Skills"
                  />
                </div>
                <div>
                  <label className={labelCls}>{t("dashboard.admin.pages.cms.heroSubheadline", { defaultValue: "Subheadline" })}</label>
                  <textarea
                    value={hero.subheadline}
                    onChange={(e) => setHero((p) => ({ ...p, subheadline: e.target.value }))}
                    className={area}
                    placeholder="Hybrid & recorded courses · Expert instructors · Certificates"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!hero.headline.trim() || !hero.subheadline.trim() || updateHeroMutation.isPending}
                onClick={() =>
                  run(
                    () => updateHeroMutation.mutateAsync(hero),
                    t("dashboard.admin.pages.cms.heroSaved", { defaultValue: "Homepage hero saved." })
                  )
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d9700e] disabled:opacity-50"
              >
                {updateHeroMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t("adminPages.common.save")}
              </button>
            </div>

            <div className={`${card} bg-gradient-to-br from-slate-50 to-white dark:from-[#12121A] dark:to-[#1A1A22]`}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                {t("dashboard.admin.pages.cms.previewLabel", { defaultValue: "Preview" })}
              </p>
              <h2 className="text-2xl font-black leading-tight text-slate-900 dark:text-white md:text-3xl">
                {hero.headline || "—"}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {hero.subheadline || "—"}
              </p>
              <p className="mt-6 text-xs text-slate-400">
                {t("dashboard.admin.pages.cms.heroPreviewNote", {
                  defaultValue: "Buttons and feature bullets still use theme defaults. Banners rotate separately under Banners.",
                })}
              </p>
            </div>
          </div>
        ) : null}

        {tab === "about" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className={card}>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.admin.pages.cms.aboutTitle")}</h3>
              <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-slate-400">
                {t("dashboard.admin.pages.cms.aboutHint", {
                  defaultValue: "Shown on the public /about page — mission, vision, and story.",
                })}
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>{t("dashboard.admin.pages.cms.phMission")}</label>
                  <input
                    value={about.mission}
                    onChange={(e) => setAbout((p) => ({ ...p, mission: e.target.value }))}
                    className={field}
                  />
                </div>
                <div>
                  <label className={labelCls}>{t("dashboard.admin.pages.cms.phVision")}</label>
                  <input
                    value={about.vision}
                    onChange={(e) => setAbout((p) => ({ ...p, vision: e.target.value }))}
                    className={field}
                  />
                </div>
                <div>
                  <label className={labelCls}>{t("dashboard.admin.pages.cms.phDescription")}</label>
                  <textarea
                    value={about.description}
                    onChange={(e) => setAbout((p) => ({ ...p, description: e.target.value }))}
                    className={`${area} min-h-36`}
                  />
                </div>
              </div>
              <button
                type="button"
                disabled={updateAboutMutation.isPending}
                onClick={() => run(() => updateAboutMutation.mutateAsync(about), t("dashboard.admin.pages.cms.aboutSaved"))}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d9700e] disabled:opacity-50"
              >
                {updateAboutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {t("adminPages.common.save")}
              </button>
            </div>

            <div className={card}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                {t("dashboard.admin.pages.cms.previewLabel", { defaultValue: "Preview" })}
              </p>
              <div className="space-y-4">
                <div className="rounded-xl border border-pioneer-orange-light bg-pioneer-orange-light/30 p-4 dark:border-pioneer-orange-normal/20">
                  <p className="text-xs font-bold uppercase text-pioneer-orange-normal">{t("publicAbout.mission", { defaultValue: "Mission" })}</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{about.mission || "—"}</p>
                </div>
                <div className="rounded-xl border border-pioneer-teal-light bg-pioneer-teal-light/20 p-4">
                  <p className="text-xs font-bold uppercase text-pioneer-teal-normal">{t("publicAbout.vision", { defaultValue: "Vision" })}</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{about.vision || "—"}</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{about.description || "—"}</p>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "faq" ? (
          <div className={card}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.admin.pages.cms.faqTitle")}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t("dashboard.admin.pages.cms.faqHint", {
                    defaultValue: "Questions appear on /faq. Save each entry after editing.",
                  })}
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {faqCount} {t("dashboard.admin.pages.cms.faqCount", { defaultValue: "entries" })}
              </span>
            </div>

            {faqsLoading ? (
              <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>
            ) : (
              <div className="space-y-4">
                {faqDrafts.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/5 dark:bg-white/[0.03]"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        title={t("adminPages.common.delete")}
                        onClick={() => {
                          if (!window.confirm(t("dashboard.admin.pages.cms.confirmDeleteFaq"))) return;
                          run(
                            () => deleteFaqMutation.mutateAsync(item.id),
                            t("dashboard.admin.pages.cms.faqDeleted")
                          );
                        }}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>{t("dashboard.admin.pages.cms.newQuestion")}</label>
                        <input
                          value={item.question}
                          onChange={(e) =>
                            setFaqDrafts((list) =>
                              list.map((f) => (f.id === item.id ? { ...f, question: e.target.value } : f))
                            )
                          }
                          className={field}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>{t("dashboard.admin.pages.cms.newAnswer")}</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) =>
                            setFaqDrafts((list) =>
                              list.map((f) => (f.id === item.id ? { ...f, answer: e.target.value } : f))
                            )
                          }
                          className={area}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={updateFaqMutation.isPending}
                        onClick={() =>
                          run(
                            () =>
                              updateFaqMutation.mutateAsync({
                                id: item.id,
                                body: { question: item.question, answer: item.answer },
                              }),
                            t("dashboard.admin.pages.cms.faqUpdated")
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-[#EE7C11] px-4 py-2 text-xs font-bold text-[#EE7C11] transition hover:bg-[#EE7C11] hover:text-white"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {t("dashboard.admin.pages.cms.saveFaqItem", { defaultValue: "Save this entry" })}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 rounded-xl border border-dashed border-slate-200 p-5 dark:border-white/10">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {t("dashboard.admin.pages.cms.addFaq")}
              </h4>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                disabled={!newFaq.question.trim() || !newFaq.answer.trim() || addFaqMutation.isPending}
                onClick={() =>
                  run(
                    async () => {
                      await addFaqMutation.mutateAsync(newFaq);
                      setNewFaq({ question: "", answer: "" });
                    },
                    t("dashboard.admin.pages.cms.faqAdded")
                  )
                }
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d9700e] disabled:opacity-50"
              >
                {addFaqMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {t("dashboard.admin.pages.cms.addFaq")}
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </PermissionGate>
  );
}

export default Cms;
