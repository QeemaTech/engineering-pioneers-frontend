import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-pioneer-light-bg text-pioneer-light-textPrimary dark:bg-pioneer-dark-bg dark:text-pioneer-dark-textPrimary px-6 py-16 text-center transition-colors duration-300">
      <p className="text-sm font-semibold uppercase tracking-wider text-pioneer-orange">404</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">{t("notFound.title")}</h1>
      <p className="mt-3 max-w-md text-sm text-pioneer-light-textSecondary dark:text-pioneer-dark-textSecondary">{t("notFound.body")}</p>
      <Link
        to="/courses"
        className="mt-8 inline-flex rounded-xl bg-pioneer-orange px-8 py-3 text-sm font-bold text-white hover:bg-opacity-90 transition-all"
      >
        {t("notFound.cta")}
      </Link>
    </div>
  );
}
