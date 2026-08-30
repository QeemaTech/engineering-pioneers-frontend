import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Phone, ChevronRight, ChevronLeft } from "lucide-react";
import { usePublicCmsPage } from "../features/public/hooks";
import { useSiteSettings } from "../features/public/siteSettings/hooks";
import { parseCmsSections } from "../utils/cmsLocale";
import ContactForm from "../components/ContactForm";
import BecomeInstructorModal from "../components/BecomeInstructorModal";
import SEOHead from "../components/common/SEOHead";

function SectionBlock({ section, isRtl }) {
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      {section.heading ? (
        <h2 className="text-lg font-extrabold text-slate-900 md:text-xl">{section.heading}</h2>
      ) : null}
      {section.body ? (
        <p className={`text-sm leading-relaxed text-slate-600 md:text-base ${section.heading ? "mt-3" : ""}`}>
          {section.body}
        </p>
      ) : null}
      {section.listItems?.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {section.listItems.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
              <Chevron className="mt-0.5 h-4 w-4 shrink-0 text-[#EE7C11]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function StaticContentPage({ slug, showContactInfo = false, extraActions = null }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const [instructorModalOpen, setInstructorModalOpen] = useState(false);

  const { data: page, isLoading, isError } = usePublicCmsPage(slug);
  const { settings: site } = useSiteSettings();

  const title = page ? (isRtl ? page.titleAr || page.titleEn : page.titleEn || page.titleAr) : "";
  const subtitle = page
    ? isRtl
      ? page.subtitleAr || page.subtitleEn
      : page.subtitleEn || page.subtitleAr
    : "";
  const sections = parseCmsSections(isRtl ? page?.sectionsAr : page?.sectionsEn);
  const fallbackSections = parseCmsSections(isRtl ? page?.sectionsEn : page?.sectionsAr);
  const displaySections = sections.length > 0 ? sections : fallbackSections;

  const mailto = site.contactEmail ? `mailto:${site.contactEmail}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white py-12 md:py-16">
      <SEOHead
        path={`/${slug}`}
        title={title ? `${title} | رواد الهندسة` : undefined}
        description={subtitle || undefined}
      />
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <nav className="text-sm text-slate-500">
          <Link to="/" className="transition hover:text-[#EE7C11]">
            {t("header.nav.home")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{title || t("dashboard.common.loading")}</span>
        </nav>

        <header className="mt-4 border-b border-slate-200/80 pb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{title || "—"}</h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-base">{subtitle}</p>
          ) : null}
        </header>

        {showContactInfo && (site.contactEmail || site.phoneNumber) ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {site.contactEmail ? (
              <a
                href={mailto}
                className="flex items-start gap-3 rounded-2xl border border-[#EE7C11]/20 bg-[#EE7C11]/5 p-5 transition hover:border-[#EE7C11]/40"
              >
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#EE7C11]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t("publicContact.emailLabel", { defaultValue: isRtl ? "البريد الإلكتروني" : "Email" })}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{site.contactEmail}</p>
                </div>
              </a>
            ) : null}
            {site.phoneNumber ? (
              <a
                href={`tel:${site.phoneNumber}`}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[#EE7C11]/30"
              >
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#EE7C11]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {t("publicContact.phoneLabel", { defaultValue: isRtl ? "الهاتف" : "Phone" })}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{site.phoneNumber}</p>
                </div>
              </a>
            ) : null}
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#EE7C11]" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {t("publicContact.locationLabel", { defaultValue: isRtl ? "الموقع" : "Location" })}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {t("footer.brand.location", { defaultValue: isRtl ? "القاهرة، مصر" : "Cairo, Egypt" })}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="mt-10 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <div className="mt-10 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">
            {t("publicPage.loadError", { defaultValue: isRtl ? "تعذّر تحميل الصفحة." : "Could not load this page." })}
          </div>
        ) : null}

        {!isLoading && !isError && displaySections.length > 0 ? (
          <div className="mt-10 space-y-5">
            {displaySections.map((section) => (
              <SectionBlock key={section.id} section={section} isRtl={isRtl} />
            ))}
          </div>
        ) : null}

        {!isLoading && !isError && displaySections.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
            {t("publicPage.empty", { defaultValue: isRtl ? "المحتوى قيد الإعداد." : "Content is being prepared." })}
          </div>
        ) : null}

        {slug === "contact" ? <ContactForm /> : null}

        {extraActions ? <div className="mt-10">{extraActions}</div> : null}

        {slug === "library" ? (
          <div className="mt-10 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center rounded-xl bg-[#EE7C11] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d9700e]"
            >
              {t("footer.community.courses", { defaultValue: isRtl ? "تصفح الدورات" : "Browse courses" })}
            </Link>
          </div>
        ) : null}

        {slug === "teach" ? (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setInstructorModalOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-[#EE7C11] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d9700e]"
            >
              {t("publicTeach.applyCta", { defaultValue: isRtl ? "قدّم طلبك الآن" : "Apply now" })}
            </button>
          </div>
        ) : null}

        {instructorModalOpen && (
          <BecomeInstructorModal onClose={() => setInstructorModalOpen(false)} />
        )}
      </div>
    </div>
  );
}
