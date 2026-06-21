import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function CTA() {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-pioneer-teal-normal px-6 py-14 text-center md:px-12 md:py-16">

          {/* Decorative semi-circles — Figma edges */}
          <div className="pointer-events-none absolute -start-14 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-pioneer-teal-light/60" />
          <div className="pointer-events-none absolute -end-14 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-pioneer-teal-light/60" />
          <div className="pointer-events-none absolute -bottom-10 start-1/4 h-28 w-28 rounded-full bg-pioneer-teal-light/40" />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-2xl font-bold text-slate-900 md:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-800/80">
              {t("cta.subtitle")}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="w-full rounded-xl bg-white px-8 py-3.5 text-center text-sm font-semibold text-pioneer-orange-normal shadow-sm transition hover:bg-slate-50 sm:w-auto"
              >
                {t("cta.actions.createAccount")}
              </Link>
              <Link
                to="/explore"
                className="w-full rounded-xl border border-pioneer-orange-normal/30 bg-transparent px-8 py-3.5 text-center text-sm font-semibold text-pioneer-orange-normal transition hover:bg-white/30 sm:w-auto"
              >
                {t("cta.actions.learnMore")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
