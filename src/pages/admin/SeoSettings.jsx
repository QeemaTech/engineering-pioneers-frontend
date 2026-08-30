import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Globe,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  Share2,
  Sliders,
  Sparkles,
  Save,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Plus,
  Trash2,
  Layers,
  Activity,
  Code,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/dashboard/PageHeader";
import ImageUploader from "../../components/ui/ImageUploader";
import {
  useAdminSeoSettings,
  useUpdateAdminSeoSettings,
  useAdminSeoAudit,
  useAdminSitemapPreview,
} from "../../features/admin/seo/hooks";

const TABS = [
  { id: "global", labelAr: "الإعدادات العامة", labelEn: "Global Settings", icon: Sliders },
  { id: "pages", labelAr: "سيو الصفحات", labelEn: "Pages SEO", icon: Layers },
  { id: "preview", labelAr: "المعاينة الحية", labelEn: "SERP & Social Preview", icon: Eye },
  { id: "sitemap", labelAr: "خريطة الموقع & Robots", labelEn: "Sitemap & Robots", icon: FileCode },
  { id: "audit", labelAr: "فاحص الجودة", labelEn: "SEO Health Audit", icon: Activity },
];

function CharCounter({ current = 0, min = 0, max = 160 }) {
  const isOptimal = current >= min && current <= max;
  const isOver = current > max;
  const isUnder = current > 0 && current < min;

  let color = "text-slate-400";
  if (isOptimal) color = "text-emerald-500 font-semibold";
  else if (isOver) color = "text-rose-500 font-semibold";
  else if (isUnder) color = "text-amber-500";

  return (
    <span className={`text-xs ${color}`}>
      {current} / {max} حرف {isOptimal ? "✓ مثالي" : isOver ? "⚠ طويل جداً" : isUnder ? "قصيرة" : ""}
    </span>
  );
}

export default function SeoSettings() {
  const { t, i18n } = useTranslation();
  const isArabic = (i18n.language || "ar").startsWith("ar");

  const { data: seoData, isLoading, refetch } = useAdminSeoSettings();
  const updateMutation = useUpdateAdminSeoSettings();
  const { data: auditData, isLoading: isAuditLoading, refetch: refetchAudit } = useAdminSeoAudit();
  const { data: sitemapXml } = useAdminSitemapPreview();

  const [activeTab, setActiveTab] = useState("global");
  const [globalForm, setGlobalForm] = useState({
    siteTitle: "",
    titleTemplate: "%s | رواد الهندسة",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "/assets/logo.png",
    canonicalBaseUrl: "https://engineeringpioneers.com",
    googleSiteVerification: "",
    bingSiteVerification: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    allowIndexing: true,
    twitterHandle: "@EngPioneers",
  });

  const [pagesList, setPagesList] = useState([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [robotsTxt, setRobotsTxt] = useState("");
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewPlatform, setPreviewPlatform] = useState("google");

  useEffect(() => {
    if (seoData) {
      if (seoData.global) {
        setGlobalForm((prev) => ({ ...prev, ...seoData.global }));
      }
      if (Array.isArray(seoData.pages)) {
        setPagesList(seoData.pages);
      }
      if (typeof seoData.robotsTxt === "string") {
        setRobotsTxt(seoData.robotsTxt);
      }
    }
  }, [seoData]);

  const selectedPage = pagesList[selectedPageIndex] || pagesList[0] || {};

  const handleGlobalChange = (field, value) => {
    setGlobalForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePageChange = (field, value) => {
    setPagesList((prev) => {
      const next = [...prev];
      if (next[selectedPageIndex]) {
        next[selectedPageIndex] = { ...next[selectedPageIndex], [field]: value };
      }
      return next;
    });
  };

  const handleAddNewPage = () => {
    const newPage = {
      id: `custom-page-${Date.now()}`,
      path: "/new-page",
      nameAr: "صفحة جديدة",
      nameEn: "New Page",
      titleAr: "عنوان الصفحة الجديدة | رواد الهندسة",
      titleEn: "New Page Title | Engineering Pioneers",
      descriptionAr: "وصف الصفحة الجديدة لنتائج محركات البحث.",
      descriptionEn: "Description of the new page for search engines.",
      keywords: "كلمات مفتاحية",
      priority: 0.7,
      changeFreq: "weekly",
      noIndex: false,
    };
    setPagesList((prev) => [...prev, newPage]);
    setSelectedPageIndex(pagesList.length);
    toast.success(isArabic ? "تمت إضافة مسار صفحة جديدة" : "New page route added");
  };

  const handleDeletePage = (index) => {
    if (pagesList.length <= 1) {
      toast.error(isArabic ? "لا يمكن حذف جميع الصفحات" : "Cannot delete all pages");
      return;
    }
    setPagesList((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedPageIndex(0);
    toast.success(isArabic ? "تم حذف الصفحة" : "Page removed");
  };

  const handleSaveAll = async () => {
    await updateMutation.mutateAsync({
      global: globalForm,
      pages: pagesList,
      robotsTxt,
    });
    refetchAudit();
  };

  const handleCopySitemapUrl = () => {
    const sitemapUrl = `${globalForm.canonicalBaseUrl || window.location.origin}/sitemap.xml`;
    navigator.clipboard.writeText(sitemapUrl);
    setCopiedSitemap(true);
    toast.success(isArabic ? "تم نسخ رابط خريطة الموقع" : "Sitemap URL copied");
    setTimeout(() => setCopiedSitemap(false), 2500);
  };

  const handleResetRobots = () => {
    const defaultRobots = `# Robots.txt for Engineering Pioneers
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /student/
Disallow: /instructor/
Disallow: /api/
Disallow: /uploads/receipts/
Disallow: /uploads/payouts/

# Sitemap location
Sitemap: ${globalForm.canonicalBaseUrl || "https://engineeringpioneers.com"}/sitemap.xml
`;
    setRobotsTxt(defaultRobots);
    toast.success(isArabic ? "تمت استعادة إعدادات ملف الروبوت الافتراضية" : "Reset to default robots.txt");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <PageHeader
        eyebrow={isArabic ? "محركات البحث والظهور الرقمي" : "Search Engines & Visibility"}
        title={isArabic ? "إدارة تحسين محركات البحث (SEO)" : "SEO Management Hub"}
        subtitle={
          isArabic
            ? "التحكم الشامل في البيانات الوصفية، خريطة الموقع، بطاقات المشاركة، والتحليلات للظهور في الصفحة الأولى لجوجل."
            : "Complete control over metadata, sitemap, social cards, schema markup, and analytics to boost SERP rankings."
        }
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAll}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#EE7C11]/20 transition-all hover:bg-[#EE7C11]/90 active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending
                ? isArabic
                  ? "جاري الحفظ..."
                  : "Saving..."
                : isArabic
                ? "حفظ التغييرات"
                : "Save All Changes"}
            </button>
          </div>
        }
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2.5 border-b-2 px-5 py-3.5 text-sm font-bold transition-all ${
                isActive
                  ? "border-[#EE7C11] text-[#EE7C11] dark:border-[#EE7C11] dark:text-[#EE7C11]"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {isArabic ? tab.labelAr : tab.labelEn}
              {tab.id === "audit" && auditData && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    auditData.score >= 85
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : auditData.score >= 60
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {auditData.score}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Global SEO Settings */}
      {activeTab === "global" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Global Settings */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Sliders className="h-5 w-5 text-[#EE7C11]" />
                {isArabic ? "الهوية العامة والبيانات الوصفية الأساسية" : "Primary Site Metadata"}
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isArabic ? "عنوان الموقع الافتراضي (Site Title)" : "Default Site Title"}
                    </label>
                    <CharCounter current={globalForm.siteTitle?.length || 0} min={10} max={60} />
                  </div>
                  <input
                    type="text"
                    value={globalForm.siteTitle}
                    onChange={(e) => handleGlobalChange("siteTitle", e.target.value)}
                    placeholder="رواد الهندسة | Engineering Pioneers"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isArabic ? "قالب صيغة العناوين (Title Template)" : "Title Format Template"}
                  </label>
                  <input
                    type="text"
                    value={globalForm.titleTemplate}
                    onChange={(e) => handleGlobalChange("titleTemplate", e.target.value)}
                    placeholder="%s | رواد الهندسة"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    {isArabic
                      ? "استخدم %s كعنصر نائب لعنوان الصفحة الفرعية (مثال: كورس الميكانيكا | رواد الهندسة)"
                      : "Use %s as a placeholder for child page titles."}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {isArabic ? "الوصف العام الافتراضي (Meta Description)" : "Default Meta Description"}
                    </label>
                    <CharCounter current={globalForm.metaDescription?.length || 0} min={70} max={160} />
                  </div>
                  <textarea
                    rows={3}
                    value={globalForm.metaDescription}
                    onChange={(e) => handleGlobalChange("metaDescription", e.target.value)}
                    placeholder="منصة رواد الهندسة - المنصة التعليمية الرائدة للطلاب والمهندسين..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isArabic ? "الكلمات المفتاحية العامة (Keywords)" : "Global Keywords"}
                  </label>
                  <input
                    type="text"
                    value={globalForm.metaKeywords}
                    onChange={(e) => handleGlobalChange("metaKeywords", e.target.value)}
                    placeholder="هندسة, كورسات هندسية, رواد الهندسة, engineering pioneers"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    {isArabic ? "افصل بين الكلمات بفواصل (,)" : "Comma-separated keywords."}
                  </p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isArabic ? "الرابط الأساسي للمنصة (Canonical Base URL)" : "Canonical Base URL"}
                  </label>
                  <input
                    type="url"
                    value={globalForm.canonicalBaseUrl}
                    onChange={(e) => handleGlobalChange("canonicalBaseUrl", e.target.value)}
                    placeholder="https://engineeringpioneers.com"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <ImageUploader
                    value={globalForm.ogImage}
                    onChange={(url) => handleGlobalChange("ogImage", url)}
                    label={isArabic ? "صورة المشاركة الافتراضية لمواقع التواصل (Social Share OG Image)" : "Default Social Share Image"}
                    helperText={isArabic ? "الصورة التي ستظهر للمستخدمين عند إرسال أو مشاركة رابط المنصة على فيسبوك، واتساب، وتويتر (JPEG, PNG, WEBP حتى 5MB)." : "The image preview shown when sharing platform links on Facebook, WhatsApp, Twitter, etc."}
                    kind="image"
                  />
                </div>
              </div>
            </div>

            {/* Tracking & Webmaster Tools */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <Code className="h-5 w-5 text-indigo-500" />
                {isArabic ? "أكواد التحقق وأدوات القياس (Analytics & Webmaster)" : "Verification & Tracking IDs"}
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Google Search Console Verification
                  </label>
                  <input
                    type="text"
                    value={globalForm.googleSiteVerification}
                    onChange={(e) => handleGlobalChange("googleSiteVerification", e.target.value)}
                    placeholder="google-site-verification token..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-mono text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Bing Webmaster Verification
                  </label>
                  <input
                    type="text"
                    value={globalForm.bingSiteVerification}
                    onChange={(e) => handleGlobalChange("bingSiteVerification", e.target.value)}
                    placeholder="msvalidate.01 token..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-mono text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Google Analytics 4 (Measurement ID)
                  </label>
                  <input
                    type="text"
                    value={globalForm.googleAnalyticsId}
                    onChange={(e) => handleGlobalChange("googleAnalyticsId", e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-mono text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Google Tag Manager (GTM ID)
                  </label>
                  <input
                    type="text"
                    value={globalForm.googleTagManagerId}
                    onChange={(e) => handleGlobalChange("googleTagManagerId", e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-mono text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Facebook Pixel ID
                  </label>
                  <input
                    type="text"
                    value={globalForm.facebookPixelId}
                    onChange={(e) => handleGlobalChange("facebookPixelId", e.target.value)}
                    placeholder="123456789012345"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-mono text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Twitter / X Account Handle
                  </label>
                  <input
                    type="text"
                    value={globalForm.twitterHandle}
                    onChange={(e) => handleGlobalChange("twitterHandle", e.target.value)}
                    placeholder="@EngPioneers"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] focus:ring-2 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Indexing & Quick Status */}
          <div className="space-y-6">
            {/* Global Indexing Toggle Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                {isArabic ? "حالة فهرسة الموقع (Indexing Control)" : "Global Indexing Status"}
              </h4>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-black/20">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {globalForm.allowIndexing
                      ? isArabic
                        ? "الموقع مفهرس ونشط لمحركات البحث"
                        : "Indexing Allowed (Index, Follow)"
                      : isArabic
                      ? "الموقع محجوب عن الفهرسة (NoIndex)"
                      : "Indexing Disabled (NoIndex)"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isArabic
                      ? "قم بالتعطيل فقط أثناء التطوير أو الصيانة الشاملة."
                      : "Disable only during maintenance or testing."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleGlobalChange("allowIndexing", !globalForm.allowIndexing)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    globalForm.allowIndexing ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      globalForm.allowIndexing
                        ? isArabic
                          ? "-translate-x-5"
                          : "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm dark:border-slate-800 dark:from-[#1A1A22] dark:to-[#121218]">
              <h4 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">
                {isArabic ? "ملخص إعدادات السيو" : "SEO Configuration Summary"}
              </h4>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">{isArabic ? "الصفحات المهيأة" : "Configured Pages"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pagesList.length}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Google Analytics</span>
                  <span className={`font-bold ${globalForm.googleAnalyticsId ? "text-emerald-500" : "text-slate-400"}`}>
                    {globalForm.googleAnalyticsId ? "مفعل ✓" : "غير مدخل"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Search Console</span>
                  <span className={`font-bold ${globalForm.googleSiteVerification ? "text-emerald-500" : "text-slate-400"}`}>
                    {globalForm.googleSiteVerification ? "مفعل ✓" : "غير مدخل"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{isArabic ? "خريطة الموقع" : "Sitemap Status"}</span>
                  <span className="font-bold text-emerald-500">ديناميكية حية ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Page-by-Page SEO Manager */}
      {activeTab === "pages" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: List of Pages */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isArabic ? "صفحات الموقع" : "Website Pages"} ({pagesList.length})
              </h3>
              <button
                onClick={handleAddNewPage}
                className="inline-flex items-center gap-1 rounded-lg bg-[#EE7C11]/10 px-3 py-1.5 text-xs font-bold text-[#EE7C11] transition hover:bg-[#EE7C11]/20"
              >
                <Plus className="h-3.5 w-3.5" />
                {isArabic ? "إضافة مسار" : "Add Route"}
              </button>
            </div>

            <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
              {pagesList.map((page, idx) => {
                const isSelected = selectedPageIndex === idx;
                return (
                  <div
                    key={page.id || idx}
                    onClick={() => setSelectedPageIndex(idx)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-[#EE7C11] bg-[#EE7C11]/5 shadow-sm dark:bg-[#EE7C11]/10"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-[#1A1A22] dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {isArabic ? page.nameAr : page.nameEn || page.nameAr}
                      </p>
                      {page.noIndex && (
                        <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-500">
                          NoIndex
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-xs text-slate-400">{page.path}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Edit Selected Page */}
          <div className="lg:col-span-8">
            {selectedPage ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-white/5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {isArabic ? "تعديل سيو صفحة:" : "Edit Page SEO:"}{" "}
                      <span className="text-[#EE7C11]">{isArabic ? selectedPage.nameAr : selectedPage.nameEn}</span>
                    </h3>
                    <p className="font-mono text-xs text-slate-400">{selectedPage.path}</p>
                  </div>

                  <button
                    onClick={() => handleDeletePage(selectedPageIndex)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {isArabic ? "حذف الصفحة" : "Delete Page"}
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Basic page info */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        {isArabic ? "مسار الرابط (Path)" : "Route Path"}
                      </label>
                      <input
                        type="text"
                        value={selectedPage.path || ""}
                        onChange={(e) => handlePageChange("path", e.target.value)}
                        placeholder="/explore"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-mono text-slate-900 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        {isArabic ? "اسم الصفحة (عربي)" : "Name (Arabic)"}
                      </label>
                      <input
                        type="text"
                        value={selectedPage.nameAr || ""}
                        onChange={(e) => handlePageChange("nameAr", e.target.value)}
                        placeholder="استكشاف الكورسات"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        {isArabic ? "اسم الصفحة (إنجليزي)" : "Name (English)"}
                      </label>
                      <input
                        type="text"
                        value={selectedPage.nameEn || ""}
                        onChange={(e) => handlePageChange("nameEn", e.target.value)}
                        placeholder="Explore Courses"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Title Arabic */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        {isArabic ? "عنوان الصفحة في محرك البحث (عربي)" : "Meta Title (Arabic)"}
                      </label>
                      <CharCounter current={selectedPage.titleAr?.length || 0} min={30} max={60} />
                    </div>
                    <input
                      type="text"
                      value={selectedPage.titleAr || ""}
                      onChange={(e) => handlePageChange("titleAr", e.target.value)}
                      placeholder="عنوان الصفحة بالعربية..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    />
                  </div>

                  {/* Title English */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        {isArabic ? "عنوان الصفحة في محرك البحث (إنجليزي)" : "Meta Title (English)"}
                      </label>
                      <CharCounter current={selectedPage.titleEn?.length || 0} min={30} max={60} />
                    </div>
                    <input
                      type="text"
                      value={selectedPage.titleEn || ""}
                      onChange={(e) => handlePageChange("titleEn", e.target.value)}
                      placeholder="Page Title in English..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    />
                  </div>

                  {/* Description Arabic */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        {isArabic ? "الوصف في محرك البحث (عربي)" : "Meta Description (Arabic)"}
                      </label>
                      <CharCounter current={selectedPage.descriptionAr?.length || 0} min={70} max={160} />
                    </div>
                    <textarea
                      rows={2}
                      value={selectedPage.descriptionAr || ""}
                      onChange={(e) => handlePageChange("descriptionAr", e.target.value)}
                      placeholder="وصف الصفحة بالعربية يظهر تحت الرابط في جوجل..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    />
                  </div>

                  {/* Description English */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        {isArabic ? "الوصف في محرك البحث (إنجليزي)" : "Meta Description (English)"}
                      </label>
                      <CharCounter current={selectedPage.descriptionEn?.length || 0} min={70} max={160} />
                    </div>
                    <textarea
                      rows={2}
                      value={selectedPage.descriptionEn || ""}
                      onChange={(e) => handlePageChange("descriptionEn", e.target.value)}
                      placeholder="Page description in English appearing on SERP..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-900 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                      {isArabic ? "الكلمات المفتاحية المستهدفة لهذه الصفحة" : "Focus Keywords"}
                    </label>
                    <input
                      type="text"
                      value={selectedPage.keywords || ""}
                      onChange={(e) => handlePageChange("keywords", e.target.value)}
                      placeholder="كورسات, تدريب هندسي, محاضرات"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                    />
                  </div>

                  <div className="pt-2">
                    <ImageUploader
                      value={selectedPage.ogImage || ""}
                      onChange={(url) => handlePageChange("ogImage", url)}
                      label={isArabic ? "صورة المشاركة الخاصة بهذه الصفحة (Custom OG Image)" : "Custom Page Social Share Image"}
                      helperText={isArabic ? "صورة مخصصة تظهر عند مشاركة رابط هذه الصفحة تحديداً على مواقع التواصل الاجتماعي (اختياري، في حال تركها فارغة سيتم استخدام الصورة الافتراضية للموقع)." : "Custom thumbnail shown when this specific page link is shared. Defaults to global site OG image if left empty."}
                      kind="image"
                    />
                  </div>

                  {/* Priority, ChangeFreq & NoIndex */}
                  <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        {isArabic ? "أولوية خريطة الموقع (Priority)" : "Sitemap Priority"}
                      </label>
                      <select
                        value={selectedPage.priority ?? 0.8}
                        onChange={(e) => handlePageChange("priority", parseFloat(e.target.value))}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                      >
                        <option value={1.0}>1.0 (أعلى أولوية - مثل الرئيسية)</option>
                        <option value={0.9}>0.9 (أولوية عالية جداً - مثل الكورسات)</option>
                        <option value={0.8}>0.8 (أولوية عالية - مثل الباقات)</option>
                        <option value={0.7}>0.7 (أولوية متوسطة-عالية)</option>
                        <option value={0.6}>0.6 (أولوية متوسطة - مثل الأسئلة الشائعة)</option>
                        <option value={0.5}>0.5 (أولوية عادية - مثل اتصل بنا)</option>
                        <option value={0.3}>0.3 (أولوية منخفضة - مثل الشروط)</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                        {isArabic ? "معدل تكرار التحديث (ChangeFreq)" : "Change Frequency"}
                      </label>
                      <select
                        value={selectedPage.changeFreq || "weekly"}
                        onChange={(e) => handlePageChange("changeFreq", e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                      >
                        <option value="always">Always (مستمر)</option>
                        <option value="hourly">Hourly (ساعي)</option>
                        <option value="daily">Daily (يومي)</option>
                        <option value="weekly">Weekly (أسبوعي)</option>
                        <option value="monthly">Monthly (شهري)</option>
                        <option value="yearly">Yearly (سنوي)</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-6">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <input
                          type="checkbox"
                          checked={selectedPage.noIndex || false}
                          onChange={(e) => handlePageChange("noIndex", e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#EE7C11] focus:ring-[#EE7C11]"
                        />
                        {isArabic ? "حجب هذه الصفحة عن الفهرسة (NoIndex)" : "Hide from search engines (NoIndex)"}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Tab 3: Live SERP & Social Preview */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                {isArabic ? "معاينة صفحة:" : "Preview Page:"}
              </label>
              <select
                value={selectedPageIndex}
                onChange={(e) => setSelectedPageIndex(parseInt(e.target.value, 10))}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              >
                {pagesList.map((p, idx) => (
                  <option key={p.id || idx} value={idx}>
                    {isArabic ? p.nameAr : p.nameEn} ({p.path})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewPlatform("google")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  previewPlatform === "google"
                    ? "bg-[#EE7C11] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Google Search
              </button>
              <button
                onClick={() => setPreviewPlatform("facebook")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  previewPlatform === "facebook"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Facebook / Social
              </button>
              <button
                onClick={() => setPreviewPlatform("twitter")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  previewPlatform === "twitter"
                    ? "bg-black text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Twitter / X
              </button>
            </div>
          </div>

          {/* Google Search Preview */}
          {previewPlatform === "google" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <Search className="h-4 w-4 text-[#EE7C11]" />
                  {isArabic ? "معاينة نتيجة بحث جوجل (Google Snippet Preview)" : "Google Search Result Preview"}
                </h4>
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                      previewDevice === "desktop"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition ${
                      previewDevice === "mobile"
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500"
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* SERP Card Box */}
              <div
                className={`mx-auto rounded-2xl border border-slate-200 bg-[#FFFFFF] p-6 shadow-sm dark:border-slate-700 dark:bg-[#202124] ${
                  previewDevice === "mobile" ? "max-w-md" : "max-w-2xl"
                }`}
                dir={isArabic ? "rtl" : "ltr"}
              >
                {/* URL Breadcrumb */}
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <Globe className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {globalForm.siteTitle?.split("|")[0]?.trim() || "Engineering Pioneers"}
                    </p>
                    <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {globalForm.canonicalBaseUrl || "https://engineeringpioneers.com"}
                      {selectedPage.path}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <h3 className="mt-2.5 text-lg font-medium text-[#1a0dab] hover:underline cursor-pointer dark:text-[#8ab4f8]">
                  {selectedPage.titleAr || selectedPage.titleEn || globalForm.siteTitle}
                </h3>

                {/* Description */}
                <p className="mt-1 text-sm leading-relaxed text-[#4d5156] dark:text-[#bdc1c6]">
                  {selectedPage.descriptionAr || selectedPage.descriptionEn || globalForm.metaDescription}
                </p>
              </div>
            </div>
          )}

          {/* Facebook / Social Share Preview */}
          {previewPlatform === "facebook" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
              <h4 className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Share2 className="h-4 w-4 text-blue-600" />
                {isArabic ? "معاينة بطاقة المشاركة في فيسبوك ولينكد إن" : "Facebook / LinkedIn OpenGraph Card"}
              </h4>

              <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-[#242526]">
                {/* Banner Thumbnail */}
                <div className="h-56 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedPage.ogImage || globalForm.ogImage || "/assets/logo.png"}
                    alt="Social Preview"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/logo.png";
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Metadata content */}
                <div className="p-4" dir={isArabic ? "rtl" : "ltr"}>
                  <p className="font-mono text-xs uppercase text-slate-400">
                    {new URL(globalForm.canonicalBaseUrl || "https://engineeringpioneers.com").hostname}
                  </p>
                  <h4 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    {selectedPage.titleAr || selectedPage.titleEn || globalForm.siteTitle}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {selectedPage.descriptionAr || selectedPage.descriptionEn || globalForm.metaDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Twitter / X Card Preview */}
          {previewPlatform === "twitter" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
              <h4 className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Globe className="h-4 w-4 text-black dark:text-white" />
                {isArabic ? "معاينة بطاقة إكس / تويتر (Twitter Large Summary Card)" : "Twitter / X Large Card Preview"}
              </h4>

              <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md dark:border-slate-700 dark:bg-[#000000]">
                <div className="h-56 w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedPage.ogImage || globalForm.ogImage || "/assets/logo.png"}
                    alt="Twitter Preview"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/logo.png";
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4" dir={isArabic ? "rtl" : "ltr"}>
                  <p className="font-mono text-xs text-slate-400">
                    {new URL(globalForm.canonicalBaseUrl || "https://engineeringpioneers.com").hostname}
                  </p>
                  <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {selectedPage.titleAr || selectedPage.titleEn || globalForm.siteTitle}
                  </h4>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {selectedPage.descriptionAr || selectedPage.descriptionEn || globalForm.metaDescription}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Sitemap & Robots.txt */}
      {activeTab === "sitemap" && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Sitemap Management */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <FileCode className="h-5 w-5 text-[#EE7C11]" />
                  {isArabic ? "خريطة الموقع الحية (Dynamic Sitemap.xml)" : "Dynamic XML Sitemap"}
                </h3>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isArabic ? "تلقائية ومحدثة" : "Auto-generated"}
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                {isArabic
                  ? "يتم إنشاء وتحديث ملف خريطة الموقع تلقائياً من قاعدة البيانات ليشمل جميع الكورسات المنشورة، ملفات المدربين، المقالات، والصفحات العامة."
                  : "Sitemap is dynamically generated from database entities including all published courses, active instructors, articles, and pages."}
              </p>

              <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 font-mono text-xs text-slate-700 dark:bg-black/30 dark:text-slate-300">
                <Globe className="h-4 w-4 text-slate-400" />
                <span className="flex-1 truncate">
                  {globalForm.canonicalBaseUrl || window.location.origin}/sitemap.xml
                </span>
                <button
                  onClick={handleCopySitemapUrl}
                  className="rounded-lg bg-white p-2 shadow-sm transition hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                  title="Copy URL"
                >
                  {copiedSitemap ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-white p-2 shadow-sm transition hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                  title="Open Sitemap"
                >
                  <ExternalLink className="h-4 w-4 text-[#EE7C11]" />
                </a>
              </div>

              {/* Sitemap Preview Box */}
              {sitemapXml && (
                <div className="mt-4">
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    {isArabic ? "معاينة محتوى الـ XML:" : "XML Output Preview:"}
                  </label>
                  <pre className="max-h-64 overflow-auto rounded-xl bg-[#0F0F13] p-4 text-[11px] font-mono leading-relaxed text-emerald-400">
                    {sitemapXml}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Robots.txt Editor */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <Code className="h-5 w-5 text-indigo-500" />
                  {isArabic ? "محرر ملف الروبوت (Robots.txt Editor)" : "Robots.txt Editor"}
                </h3>
                <button
                  onClick={handleResetRobots}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {isArabic ? "استعادة الافتراضي" : "Reset Default"}
                </button>
              </div>

              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                {isArabic
                  ? "يتحكم هذا الملف في توجيه عناكب محركات البحث ومنعها من أرشفة لوحات التحكم والملفات الحساسة."
                  : "Directs web crawlers on which areas of the platform are permitted or forbidden to index."}
              </p>

              <textarea
                rows={12}
                value={robotsTxt}
                onChange={(e) => setRobotsTxt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#0F0F13] p-4 font-mono text-xs leading-relaxed text-amber-300 outline-none transition focus:border-[#EE7C11] dark:border-white/10"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: SEO Health Audit */}
      {activeTab === "audit" && (
        <div className="space-y-8">
          {/* Score Header */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-[#EE7C11]/10 via-amber-500/5 to-transparent p-8 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="space-y-2 text-center sm:text-right">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {isArabic ? "مؤشر جودة وصحة الـ SEO للمنصة" : "Platform SEO Health Score"}
                </h3>
                <p className="max-w-xl text-sm text-slate-600 dark:text-slate-400">
                  {isArabic
                    ? "يقوم النظام بفحص كافة الصفحات والكورسات والميتا تاج وإعطاء تقييم فوري وتوصيات دقيقة لرفع الأداء في جوجل."
                    : "Automated scanner checking meta lengths, thumbnails, indexability, and providing actionable optimizations."}
                </p>
              </div>

              {/* Circle Score Gauge */}
              <div className="flex items-center gap-6">
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-[#EE7C11] bg-white shadow-xl dark:bg-black/40">
                  <span className="text-3xl font-black text-[#EE7C11]">
                    {auditData ? auditData.score : "--"}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Issues and Recommendations List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#1A1A22]">
            <div className="mb-6 flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {isArabic ? "قائمة التنبيهات والتوصيات البرمجية" : "Audit Checklist & Recommendations"}
              </h4>
              <button
                onClick={() => refetchAudit()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {isArabic ? "إعادة الفحص" : "Re-run Audit"}
              </button>
            </div>

            {isAuditLoading ? (
              <div className="py-12 text-center text-sm text-slate-400">
                {isArabic ? "جاري فحص المنصة..." : "Scanning platform SEO..."}
              </div>
            ) : auditData?.issues && auditData.issues.length > 0 ? (
              <div className="space-y-3">
                {auditData.issues.map((issue, idx) => {
                  let badgeCls = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                  let Icon = CheckCircle2;

                  if (issue.type === "critical") {
                    badgeCls = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30";
                    Icon = XCircle;
                  } else if (issue.type === "warning") {
                    badgeCls = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30";
                    Icon = AlertTriangle;
                  } else if (issue.type === "good") {
                    badgeCls = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30";
                    Icon = CheckCircle2;
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-4 rounded-xl border p-4 transition ${badgeCls}`}
                    >
                      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">{issue.title}</h5>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{issue.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-sm text-emerald-500 font-bold">
                {isArabic ? "لا توجد أخطاء! المنصة مهيأة بشكل ممتاز." : "No critical issues found!"}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
