import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GraduationCap, Layers, ShieldCheck } from "lucide-react";
import QeemaCopyrightBadge from "../common/QeemaCopyrightBadge";

const highlights = [
  { icon: GraduationCap, key: "auth.shell.highlight1" },
  { icon: Layers, key: "auth.shell.highlight2" },
  { icon: ShieldCheck, key: "auth.shell.highlight3" },
];

export default function AuthShell({ title, subtitle, footer, children }) {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#0B0B10] dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(238,124,17,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(13,148,136,0.14),transparent_55%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 lg:flex-row lg:items-center lg:gap-10 lg:px-8">
        {/* Brand panel */}
        <section className="mb-8 flex flex-1 flex-col justify-center lg:mb-0 lg:pe-6">
          <Link to="/" className="mb-8 inline-flex items-center gap-3">
            <img
              src="/assets/ChatGPT%20Image%20Mar%2025,%202026,%2002_45_22%20PM%201.svg"
              alt="رواد الهندسة"
              className="h-11 w-auto object-contain"
            />
            <span className="text-2xl font-black text-slate-950 dark:text-white">رواد الهندسة</span>
          </Link>

          <div className="max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-pioneer-orange-normal">
              Engineering Pioneers
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 dark:text-white md:text-4xl">
              {t("auth.shell.headline", { defaultValue: "Engineering education, built for professionals." })}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {t("auth.shell.body", {
                defaultValue: "Live cohorts, structured curricula, and certificates — one platform for students and teams.",
              })}
            </p>
          </div>

          <ul className="mt-8 hidden space-y-3 sm:block">
            {highlights.map(({ icon: Icon, key }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pioneer-orange-normal/10 text-pioneer-orange-normal">
                  <Icon className="h-4 w-4" />
                </span>
                {t(key)}
              </li>
            ))}
          </ul>
        </section>

        {/* Form card */}
        <section className="flex w-full flex-1 flex-col justify-center lg:max-w-md">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-[#14141C] dark:shadow-black/40 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
              {subtitle ? <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
            </div>
            {children}
            {footer ? <div className="mt-6 border-t border-slate-100 pt-5 dark:border-white/10">{footer}</div> : null}
          </div>
        </section>
      </div>

      {/* Auth page bottom footer */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-white/40 px-4 py-4 backdrop-blur-sm dark:border-white/5 dark:bg-black/20 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
          <p className="text-center sm:text-start">{t("footer.copyright")}</p>
          <QeemaCopyrightBadge variant="auto" />
        </div>
      </footer>
    </div>
  );
}
