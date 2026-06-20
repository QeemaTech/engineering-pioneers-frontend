import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, X } from "lucide-react";

/**
 * Listens for `pioneer:subscription-quota` (dispatched from axios on 403 + SUBSCRIPTION_QUOTA).
 * Light mode only — no dark: variants.
 */
export default function QuotaUpgradeModalHost() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState("");

  useEffect(() => {
    const onQuota = (e) => {
      setDetail(typeof e.detail?.message === "string" ? e.detail.message : "");
      setOpen(true);
    };
    window.addEventListener("pioneer:subscription-quota", onQuota);
    return () => window.removeEventListener("pioneer:subscription-quota", onQuota);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="relative max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute end-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={t("quotaModal.close", { defaultValue: "Close" })}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pioneer-teal-light">
          <Sparkles className="h-6 w-6 text-pioneer-teal-dark" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">{t("quotaModal.title")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("quotaModal.body")}</p>
        {detail ? <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{detail}</p> : null}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t("quotaModal.close")}
          </button>
          <Link
            to="/subscription"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-pioneer-orange-normal px-4 py-2.5 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
          >
            {t("quotaModal.cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
