import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white via-slate-50 to-white px-6 py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-[#EE7C11]">404</p>
      <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">{t("notFound.title")}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">{t("notFound.body")}</p>
      <Link
        to="/explore"
        className="mt-8 inline-flex rounded-xl bg-[#EE7C11] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#d9700e]"
      >
        {t("notFound.cta", { defaultValue: isRtl ? "تصفّح الدورات" : "Browse courses" })}
      </Link>
    </div>
  );
}
