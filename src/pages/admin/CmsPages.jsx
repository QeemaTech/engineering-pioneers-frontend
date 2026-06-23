import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/ui/PageHeader";
import PermissionGate from "../../components/ui/PermissionGate";
import { useAdminCmsPages, useUpdateCmsPage } from "../../features/admin/cms/hooks";
import { fetchContactSubmissions, updateContactSubmission } from "../../features/admin/cms/api";
import { getErrorMessage } from "../../api/error";
import { parseCmsSections } from "../../utils/cmsLocale";

const field =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white";
const area =
  "min-h-24 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-200";
const card = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]";
const labelCls = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400";

const PAGE_META = [
  { slug: "contact", route: "/contact", labelEn: "Contact Us", labelAr: "اتصل بنا" },
  { slug: "community", route: "/community", labelEn: "Community", labelAr: "المجتمع" },
  { slug: "library", route: "/library", labelEn: "Resource Library", labelAr: "المكتبة" },
  { slug: "user-guide", route: "/guide", labelEn: "User Guide", labelAr: "دليل الاستخدام" },
  { slug: "terms", route: "/terms", labelEn: "Terms & Conditions", labelAr: "الشروط والأحكام" },
  { slug: "teach", route: "/teach", labelEn: "Become Instructor", labelAr: "كن معلّمًا" },
];

function emptySection() {
  return { id: `sec-${Date.now()}`, heading: "", body: "", listItems: [] };
}

function sectionsFromRaw(raw) {
  return parseCmsSections(raw).map((s) => ({
    ...s,
    listItems: s.listItems || [],
    listText: (s.listItems || []).join("\n"),
  }));
}

function sectionsToPayload(sections) {
  return sections.map(({ id, heading, body, listText }) => ({
    id,
    heading: heading || "",
    body: body || "",
    listItems: String(listText || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
  }));
}

function ContactInbox() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["admin", "contact-submissions"],
    queryFn: () => fetchContactSubmissions({ limit: 30 }),
  });

  const markRead = useMutation({
    mutationFn: (id) => updateContactSubmission(id, { status: "READ" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "contact-submissions"] }),
  });

  if (isLoading) return <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>;

  return (
    <div className={`${card} mt-8`}>
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {t("adminPages.cmsPages.inbox", { defaultValue: "Contact form inbox" })}
      </h3>
      {submissions.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">{t("adminPages.cmsPages.inboxEmpty", { defaultValue: "No messages yet." })}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {submissions.map((row) => (
            <li key={row.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/5 dark:bg-white/[0.03]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
                  <a href={`mailto:${row.email}`} className="text-sm text-[#EE7C11]">
                    {row.email}
                  </a>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    row.status === "NEW" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {row.status}
                </span>
              </div>
              {row.subject ? <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{row.subject}</p> : null}
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{row.message}</p>
              <p className="mt-2 text-xs text-slate-400">{new Date(row.createdAt).toLocaleString()}</p>
              {row.status === "NEW" ? (
                <button
                  type="button"
                  onClick={() => markRead.mutate(row.id)}
                  className="mt-3 text-xs font-bold text-[#EE7C11] hover:underline"
                >
                  {t("adminPages.cmsPages.markRead", { defaultValue: "Mark as read" })}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PageEditor({ page, onSaved }) {
  const { t } = useTranslation();
  const updateMutation = useUpdateCmsPage();
  const [notice, setNotice] = useState(null);
  const [langTab, setLangTab] = useState("en");

  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    subtitleEn: "",
    subtitleAr: "",
    sectionsEn: [],
    sectionsAr: [],
    isPublished: true,
  });

  useEffect(() => {
    if (!page) return;
    setForm({
      titleEn: page.titleEn || "",
      titleAr: page.titleAr || "",
      subtitleEn: page.subtitleEn || "",
      subtitleAr: page.subtitleAr || "",
      sectionsEn: sectionsFromRaw(page.sectionsEn),
      sectionsAr: sectionsFromRaw(page.sectionsAr),
      isPublished: page.isPublished !== false,
    });
  }, [page?.slug, page?.updatedAt]);

  const meta = PAGE_META.find((p) => p.slug === page?.slug);
  const sectionsKey = langTab === "ar" ? "sectionsAr" : "sectionsEn";
  const sections = form[sectionsKey];

  const setSections = (updater) => {
    setForm((prev) => ({
      ...prev,
      [sectionsKey]: typeof updater === "function" ? updater(prev[sectionsKey]) : updater,
    }));
  };

  const save = async () => {
    setNotice(null);
    try {
      await updateMutation.mutateAsync({
        slug: page.slug,
        body: {
          titleEn: form.titleEn.trim(),
          titleAr: form.titleAr.trim(),
          subtitleEn: form.subtitleEn.trim(),
          subtitleAr: form.subtitleAr.trim(),
          sectionsEn: sectionsToPayload(form.sectionsEn),
          sectionsAr: sectionsToPayload(form.sectionsAr),
          isPublished: form.isPublished,
        },
      });
      setNotice({ type: "success", message: t("adminPages.cmsPages.saved", { defaultValue: "Page saved." }) });
      onSaved?.();
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err) });
    }
  };

  if (!page) return null;

  return (
    <div className="space-y-5">
      <Notice type={notice?.type} message={notice?.message} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{meta?.labelEn || page.slug}</h2>
          <p className="text-sm text-slate-500">{meta?.labelAr}</p>
        </div>
        {meta?.route ? (
          <Link
            to={meta.route}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#EE7C11]/40 hover:text-[#EE7C11] dark:border-white/10 dark:text-slate-200"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("adminPages.cmsPages.preview", { defaultValue: "Preview" })}
          </Link>
        ) : null}
      </div>

      <div className="flex gap-2">
        {["en", "ar"].map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setLangTab(lang)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
              langTab === lang
                ? "bg-[#EE7C11] text-white"
                : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
            }`}
          >
            {lang === "en" ? "English" : "العربية"}
          </button>
        ))}
      </div>

      <div className={card}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>{t("adminPages.cmsPages.titleEn", { defaultValue: "Title (English)" })}</label>
            <input
              value={form.titleEn}
              onChange={(e) => setForm((p) => ({ ...p, titleEn: e.target.value }))}
              className={field}
              dir="ltr"
            />
          </div>
          <div>
            <label className={labelCls}>{t("adminPages.cmsPages.titleAr", { defaultValue: "Title (Arabic)" })}</label>
            <input
              value={form.titleAr}
              onChange={(e) => setForm((p) => ({ ...p, titleAr: e.target.value }))}
              className={field}
              dir="rtl"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>
              {langTab === "ar"
                ? t("adminPages.cmsPages.subtitleAr", { defaultValue: "Subtitle (Arabic)" })
                : t("adminPages.cmsPages.subtitleEn", { defaultValue: "Subtitle (English)" })}
            </label>
            <textarea
              value={langTab === "ar" ? form.subtitleAr : form.subtitleEn}
              onChange={(e) =>
                setForm((p) =>
                  langTab === "ar" ? { ...p, subtitleAr: e.target.value } : { ...p, subtitleEn: e.target.value }
                )
              }
              className={area}
              dir={langTab === "ar" ? "rtl" : "ltr"}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            {t("adminPages.cmsPages.sections", { defaultValue: "Content sections" })}
          </h3>
          <button
            type="button"
            onClick={() => setSections((list) => [...list, { ...emptySection(), listText: "" }])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#EE7C11] px-3 py-1.5 text-xs font-bold text-[#EE7C11] transition hover:bg-[#EE7C11] hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("adminPages.cmsPages.addSection", { defaultValue: "Add section" })}
          </button>
        </div>

        {sections.map((section, index) => (
          <div key={section.id} className={`${card} space-y-3`}>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
                <GripVertical className="h-4 w-4" />#{index + 1}
              </span>
              <button
                type="button"
                onClick={() => setSections((list) => list.filter((s) => s.id !== section.id))}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className={labelCls}>{t("adminPages.cmsPages.sectionHeading", { defaultValue: "Heading" })}</label>
              <input
                value={section.heading}
                onChange={(e) =>
                  setSections((list) =>
                    list.map((s) => (s.id === section.id ? { ...s, heading: e.target.value } : s))
                  )
                }
                className={field}
                dir={langTab === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <label className={labelCls}>{t("adminPages.cmsPages.sectionBody", { defaultValue: "Body text" })}</label>
              <textarea
                value={section.body}
                onChange={(e) =>
                  setSections((list) =>
                    list.map((s) => (s.id === section.id ? { ...s, body: e.target.value } : s))
                  )
                }
                className={`${area} min-h-28`}
                dir={langTab === "ar" ? "rtl" : "ltr"}
              />
            </div>
            <div>
              <label className={labelCls}>
                {t("adminPages.cmsPages.sectionList", { defaultValue: "Bullet list (one item per line)" })}
              </label>
              <textarea
                value={section.listText || ""}
                onChange={(e) =>
                  setSections((list) =>
                    list.map((s) => (s.id === section.id ? { ...s, listText: e.target.value } : s))
                  )
                }
                className={area}
                dir={langTab === "ar" ? "rtl" : "ltr"}
                placeholder="- Item one&#10;- Item two"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-white/10">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
            className="rounded border-slate-300 text-[#EE7C11] focus:ring-[#EE7C11]"
          />
          {t("adminPages.cmsPages.published", { defaultValue: "Published (visible on site)" })}
        </label>
        <button
          type="button"
          disabled={updateMutation.isPending || !form.titleEn.trim() || !form.titleAr.trim()}
          onClick={save}
          className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#d9700e] disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("adminPages.common.save")}
        </button>
      </div>

      {page.slug === "contact" ? <ContactInbox /> : null}
    </div>
  );
}

export default function CmsPages() {
  const { t } = useTranslation();
  const { data: pages = [], isLoading } = useAdminCmsPages();
  const [activeSlug, setActiveSlug] = useState("contact");

  const orderedPages = useMemo(() => {
    const bySlug = new Map(pages.map((p) => [p.slug, p]));
    return PAGE_META.map((meta) => bySlug.get(meta.slug)).filter(Boolean);
  }, [pages]);

  const activePage = orderedPages.find((p) => p.slug === activeSlug) || orderedPages[0];

  useEffect(() => {
    if (orderedPages.length && !orderedPages.find((p) => p.slug === activeSlug)) {
      setActiveSlug(orderedPages[0].slug);
    }
  }, [orderedPages, activeSlug]);

  return (
    <PermissionGate
      permission="cms:manage"
      fallback={
        <p className="text-sm text-slate-500">{t("common.noAccess", { defaultValue: "You do not have access." })}</p>
      }
    >
      <section className="space-y-6">
        <PageHeader
          title={t("adminPages.cmsPages.title", { defaultValue: "Site pages" })}
          subtitle={t("adminPages.cmsPages.subtitle", {
            defaultValue: "Edit footer pages in English and Arabic — contact, terms, guide, and more.",
          })}
        />

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className={`${card} h-fit space-y-1 p-3`}>
            {isLoading ? (
              <p className="p-3 text-sm text-slate-500">{t("dashboard.common.loading")}</p>
            ) : (
              PAGE_META.map((meta) => {
                const exists = orderedPages.some((p) => p.slug === meta.slug);
                const active = activeSlug === meta.slug;
                return (
                  <button
                    key={meta.slug}
                    type="button"
                    disabled={!exists}
                    onClick={() => setActiveSlug(meta.slug)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition ${
                      active
                        ? "bg-[#EE7C11]/10 text-[#EE7C11]"
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                    } ${!exists ? "opacity-40" : ""}`}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span>{meta.labelEn}</span>
                  </button>
                );
              })
            )}
            {!isLoading && orderedPages.length === 0 ? (
              <p className="p-3 text-xs text-amber-700">
                {t("adminPages.cmsPages.emptySeed", {
                  defaultValue: "No pages in database. Run seed or migration to create default pages.",
                })}
              </p>
            ) : null}
          </aside>

          <div className={card}>
            {activePage ? (
              <PageEditor key={activePage.slug} page={activePage} />
            ) : (
              <p className="text-sm text-slate-500">{t("adminPages.cmsPages.selectPage", { defaultValue: "Select a page." })}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          {t("adminPages.cmsPages.aboutFaqNote", {
            defaultValue: "About, FAQ, and homepage hero are edited under Site content (/admin/cms). Blog posts under Blog posts.",
          })}
        </p>
      </section>
    </PermissionGate>
  );
}
