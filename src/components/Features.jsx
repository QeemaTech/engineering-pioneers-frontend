import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";

const YellowIcon = ({ children }) => (
  <div
    className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-pioneer-teal-light/90 text-pioneer-teal-dark shadow-sm ring-1 ring-amber-200/60 transition duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:ring-amber-300/80"
    aria-hidden
  >
    <span className="flex text-pioneer-teal-normal transition group-hover:text-[#b45309]">{children}</span>
  </div>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const DocIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-[1.75]" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" ry="1" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ITEMS = [
  { key: "liveClasses", Icon: VideoIcon, to: "/explore" },
  { key: "groupAndOneToOne", Icon: UsersIcon, to: "/subscription" },
  { key: "homeworkAndPractice", Icon: DocIcon, to: "/signup" },
  { key: "recordedSessions", Icon: ClipboardIcon, to: "/recordings" },
];

export default function Features() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(185,28,28,0.06),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10 lg:gap-14">
          <div className="flex flex-col justify-center md:col-span-4 lg:col-span-4">
            <h2 className="text-start text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {t("features.titlePrefix")}{" "}
              <span className="text-pioneer-orange-normal">{t("features.titleBrand")}</span>
              <span className="text-slate-900">?</span>
            </h2>
            <p className="mt-5 max-w-md text-start text-base leading-relaxed text-slate-600 md:text-[17px]">
              {t("features.subtitle")}
            </p>
            <span className="mt-8 hidden h-px w-16 rounded-full bg-gradient-to-r from-pioneer-orange-normal/50 to-transparent md:block" aria-hidden />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:col-span-8 lg:col-span-8 md:gap-6">
            {ITEMS.map(({ key, Icon, to }) => (
              <Link
                key={key}
                to={to}
                className="group relative block rounded-2xl border border-slate-200/90 bg-white/80 p-6 text-start shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none ring-slate-900/5 transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.12)] focus-visible:ring-2 focus-visible:ring-pioneer-orange-normal focus-visible:ring-offset-2 sm:p-7"
              >
                <article className="flex h-full flex-col">
                  <YellowIcon>
                    <Icon />
                  </YellowIcon>
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 transition group-hover:text-pioneer-orange-normal">
                    {t(`features.items.${key}.title`)}
                  </h3>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-600">
                    {t(`features.items.${key}.description`)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-pioneer-orange-normal">
                    {t("features.learnMore")}
                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" aria-hidden />
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
