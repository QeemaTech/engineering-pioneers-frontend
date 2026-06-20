import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSiteSettings } from "../features/public/siteSettings/hooks";

const FbIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
const IgIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const LiIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

function SocialIcon({ label, Icon, href }) {
  const { t } = useTranslation();
  const baseClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal";
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
      className={`${baseClass} cursor-default opacity-50`}
    >
      <Icon />
    </span>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const { settings: site } = useSiteSettings();
  const mailto = `mailto:${site.contactEmail}`;

  const cols = [
    {
      title: t("footer.company.title"),
      links: [
        { to: "/about", label: t("footer.company.about") },
        { href: mailto, label: t("footer.company.contact") },
        { to: "/blogs", label: t("footer.company.news") },
        { to: "/explore", label: t("footer.company.library") },
        { to: "/signup", label: t("footer.company.career") },
      ],
    },
    {
      title: t("footer.community.title"),
      links: [
        { to: "/about", label: t("footer.community.documentation") },
        { to: "/faq", label: t("footer.community.faq") },
      ],
    },
    {
      title: t("footer.teaching.title"),
      links: [
        { to: "/signup", label: t("footer.teaching.becomeTeacher") },
        { to: "/faq", label: t("footer.teaching.howToGuide") },
        { to: "/about", label: t("footer.teaching.terms") },
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
    <footer className="bg-white pt-14">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          <div className="text-start">
<div className="flex items-center gap-2">
  
            <img
              src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg"
              alt={t("footer.brand.logoAlt")}
              className="h-12 w-auto"
            />
            <h1 className="text-2xl font-bold text-slate-900">Engineering Pioneers</h1>
</div>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-500">{t("footer.brand.description")}</p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ label, Icon, href }) => (
                <SocialIcon key={label} label={label} Icon={Icon} href={href} />
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title} className="text-start">
              <h3 className="text-base font-semibold text-slate-900">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((item) => (
                  <li key={`${col.title}-${item.label}`}>
                    {"href" in item ? (
                      <a href={item.href} className="text-sm text-slate-500 transition hover:text-pioneer-orange-normal">
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.to} className="text-sm text-slate-500 transition hover:text-pioneer-orange-normal">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-slate-200 py-6">
          <p className="text-center text-sm text-slate-400">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
