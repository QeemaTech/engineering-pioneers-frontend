import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Hero({ content }) {
  const { t } = useTranslation();

  const headline = content?.headline?.trim() || null;
  const subheadline = content?.subheadline?.trim() || null;

  const titleStart = headline ? null : t("hero.titleStart");
  const titleHighlight = headline ? null : t("hero.titleHighlight");
  const titleEnd = headline ? null : t("hero.titleEnd");
  const subtitle = subheadline || t("hero.subtitle");

  const features = [
    t("hero.features.experts"),
    t("hero.features.liveCohorts"),
    t("hero.features.membership"),
  ];

  return (
    <section className="overflow-hidden bg-white py-10 md:py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-0 lg:px-8">
        <div className="text-start lg:pe-8">
          {headline ? (
            <h1 className="text-[36px] font-bold leading-[1.2] text-[#121323] md:text-[48px] lg:text-[52px]">
              {headline}
            </h1>
          ) : (
            <h1 className="text-[36px] font-bold leading-[1.2] text-[#121323] md:text-[48px] lg:text-[52px]">
              {titleStart}{" "}
              <span className="hero-brush relative inline-block text-[#121323]">{titleHighlight}</span>
              <br />
              {titleEnd}
            </h1>
          )}

          <p className="mt-5 max-w-lg text-base leading-7 text-slate-500 md:text-[17px]">{subtitle}</p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {features.map((f) => (
              <span key={f} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pioneer-orange-normal">
                  <Check className="h-3 w-3 text-white" />
                </span>
                {f}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/courses"
              className="rounded-lg border border-pioneer-orange-normal px-7 py-3 text-sm font-semibold text-pioneer-orange-normal transition hover:bg-pioneer-orange-light"
            >
              {t("hero.actions.startLearning")}
            </Link>
            <Link
              to="/courses"
              className="px-4 py-3 text-sm font-bold text-[#121323] transition hover:text-pioneer-orange-normal"
            >
              {t("hero.actions.exploreClasses")}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[580px] items-end justify-center lg:max-w-none">
          <div className="relative mx-auto h-[420px] w-[420px] md:h-[500px] md:w-[500px] lg:h-[520px] lg:w-[520px]">
            <div className="absolute inset-0 rounded-full bg-pioneer-orange-normal" />
            <img
              src="/assets/hero-student.png"
              alt="Engineering Pioneers Student"
              className="absolute bottom-0 left-1/2 z-10 h-[105%] w-auto -translate-x-1/2 object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
