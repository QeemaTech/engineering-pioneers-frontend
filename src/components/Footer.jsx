import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin } from "lucide-react";
import { useSiteSettings } from "../features/public/siteSettings/hooks";
import QeemaCopyrightBadge from "./common/QeemaCopyrightBadge";

const FbIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const IgIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LiIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

function SocialIcon({ label, Icon, href }) {
  const { t } = useTranslation();
  const baseClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition hover:border-[#EE7C11]/50 hover:bg-[#EE7C11]/10 hover:text-[#EE7C11]";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={baseClass}>
        <Icon />
      </a>
    );
  }
  return (
    <span
      role="img"
      aria-label={label}
      title={t("footer.socialComingSoon")}
      className={`${baseClass} cursor-default opacity-40`}
    >
      <Icon />
    </span>
  );
}

const DISCIPLINE_KEYS = ["structural", "bim", "hvac", "geo", "transport", "cfd"];

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { settings: site } = useSiteSettings();
  const mailto = `mailto:${site.contactEmail}`;

  const cols = [
    {
      title: t("footer.company.title"),
      links: [
        { to: "/about", label: t("footer.company.about") },
        { to: "/contact", label: t("footer.company.contact") },
        { to: "/blogs", label: t("footer.company.news") },
        { to: "/library", label: t("footer.company.library") },
      ],
    },
    {
      title: t("footer.community.title"),
      links: [
        { to: "/faq", label: t("footer.community.faq") },
        { to: "/community", label: t("footer.community.documentation") },
        { to: "/explore", label: t("footer.community.courses", { defaultValue: isRtl ? "تصفح الدورات" : "Browse courses" }) },
        { to: "/instructors", label: t("footer.community.instructors", { defaultValue: isRtl ? "المدرّسون" : "Instructors" }) },
      ],
    },
    {
      title: t("footer.teaching.title"),
      links: [
        { to: "/teach", label: t("footer.teaching.becomeTeacher") },
        { to: "/guide", label: t("footer.teaching.howToGuide") },
        { to: "/terms", label: t("footer.teaching.terms") },
      ],
    },
  ];

  const socials = [
    { label: "Facebook", Icon: FbIcon, href: site.social.facebook?.trim() },
    { label: "Twitter", Icon: TwIcon, href: site.social.twitter?.trim() },
    { label: "Instagram", Icon: IgIcon, href: site.social.instagram?.trim() },
    { label: "LinkedIn", Icon: LiIcon, href: site.social.linkedin?.trim() },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      {/* Engineering disciplines strip */}
      <div className="border-b border-white/5 bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6 lg:px-8">
          <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {t("footer.disciplinesLabel")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DISCIPLINE_KEYS.map((key) => (
              <span
                key={key}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-[#EE7C11]/30 hover:text-[#EE7C11]"
              >
                {t(`footer.disciplines.${key}`)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <img
                src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg"
                alt={t("footer.brand.logoAlt", { defaultValue: "Engineering Pioneers Logo" })}
                width="44"
                height="44"
                className="h-11 w-auto"
              />
              <span className="text-lg font-extrabold text-white">Engineering Pioneers</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">{t("footer.brand.description")}</p>

            <div className="mt-5 space-y-2 text-sm text-slate-400">
              {site.contactEmail ? (
                <a href={mailto} className="inline-flex items-center gap-2 transition hover:text-[#EE7C11]">
                  <Mail className="h-4 w-4 shrink-0 text-[#EE7C11]" />
                  {site.contactEmail}
                </a>
              ) : null}
              <p className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#EE7C11]" />
                {t("footer.brand.location", { defaultValue: isRtl ? "القاهرة، مصر" : "Cairo, Egypt" })}
              </p>
            </div>

            {socials.length > 0 ? (
              <div className="mt-5 flex items-center gap-2">
                {socials.map(({ label, Icon, href }) => (
                  <SocialIcon key={label} label={label} Icon={Icon} href={href} />
                ))}
              </div>
            ) : null}
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-white">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((item) => (
                  <li key={`${col.title}-${item.label}`}>
                    {"href" in item ? (
                      <a
                        href={item.href}
                        className="text-sm text-slate-400 transition hover:text-[#EE7C11]"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        to={item.to}
                        className="text-sm text-slate-400 transition hover:text-[#EE7C11]"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-center text-xs text-slate-400 md:text-start">{t("footer.copyright")}</p>
          <QeemaCopyrightBadge variant="dark" />
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <Link to="/terms" className="transition hover:text-[#EE7C11]">
              {t("footer.teaching.terms")}
            </Link>
            <Link to="/contact" className="transition hover:text-[#EE7C11]">
              {t("footer.company.contact")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
