import { useTranslation } from "react-i18next";

/**
 * Reusable Qeema Tech copyright & branding badge.
 * Directs to https://www.qeematech.net/
 */
export default function QeemaCopyrightBadge({ variant = "auto", className = "" }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const isDarkFooter = variant === "dark";

  return (
    <a
      href="https://www.qeematech.net/"
      target="_blank"
      rel="noopener noreferrer"
      title="Qeema Tech | https://www.qeematech.net/"
      className={`group inline-flex items-center gap-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0C5ADB]/40 ${
        isDarkFooter
          ? "border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 hover:border-[#0C5ADB]/60 hover:bg-white/10 hover:text-white"
          : "border border-slate-200/90 bg-white/90 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur hover:border-[#0C5ADB]/50 hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-[#0C5ADB]/60 dark:hover:bg-white/10 dark:hover:text-white"
      } ${className}`}
    >
      <span className="font-medium">
        {t("footer.developedBy", { defaultValue: isRtl ? "تم التطوير بواسطة" : "Developed by" })}
      </span>
      <span
        className={`inline-flex items-center justify-center rounded-md bg-white px-1.5 py-0.5 shadow-sm transition-transform duration-200 group-hover:scale-105 ${
          isDarkFooter ? "ring-1 ring-white/20" : "ring-1 ring-slate-200/60 dark:ring-white/10"
        }`}
      >
        <img
          src="/assets/qeema_letters.svg"
          alt={t("footer.qeemaTech", { defaultValue: "Qeema Tech" })}
          className="h-3.5 w-auto object-contain transition-opacity group-hover:opacity-90"
        />
      </span>
    </a>
  );
}
