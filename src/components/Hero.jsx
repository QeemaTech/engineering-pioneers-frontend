import { Link } from "react-router-dom";
import { Check, CheckCircle2, Lightbulb, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Hero() {
  const { t } = useTranslation();

  const features = [
    t("hero.features.experts"),
    t("hero.features.liveCohorts"),
    t("hero.features.membership"),
  ];

  return (
    <section className="overflow-hidden bg-white py-10 md:py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-0 lg:px-8">

        {/* ── LEFT: Text ── */}
        <div className="text-start lg:pe-8">
          <h1 className="text-[36px] font-bold leading-[1.2] text-[#121323] md:text-[48px] lg:text-[52px]">
            {t("hero.titleStart")}{" "}
            <span className="hero-brush relative inline-block text-[#121323]">
              {t("hero.titleHighlight")}
            </span>
            <br />
            {t("hero.titleEnd")}
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-slate-500 md:text-[17px]">
            {t("hero.subtitle")}
          </p>

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
            <button
              type="button"
              className="rounded-lg border border-pioneer-orange-normal px-7 py-3 text-sm font-semibold text-pioneer-orange-normal transition hover:bg-pioneer-orange-light"
            >
              {t("hero.actions.startLearning")}
            </button>
            <button
              type="button"
              className="px-4 py-3 text-sm font-bold text-[#121323] transition hover:text-pioneer-orange-normal"
            >
              {t("hero.actions.exploreClasses")}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Image + Floating Cards ── */}
        <div className="relative mx-auto flex w-full max-w-[580px] items-end justify-center lg:max-w-none">
          {/* Red circle bg */}
          <div className="relative mx-auto h-[420px] w-[420px] md:h-[500px] md:w-[500px] lg:h-[520px] lg:w-[520px]">
            <div className="absolute inset-0 rounded-full bg-pioneer-orange-normal" />

            {/* Student image */}
            <img
              src="/assets/hero-student.png"
              alt="Engineering Pioneers Student"
              className="absolute bottom-0 left-1/2 z-10 h-[105%] w-auto -translate-x-1/2 object-contain"
            />

            {/* Lightbulb decoration — top right of circle */}
            <div className="absolute -top-2 end-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border-2 border-pioneer-teal-normal/40 bg-white/90 shadow-md">
              <Lightbulb className="h-5 w-5 text-pioneer-teal-normal" />
            </div>

            {/* "Our daily new students" card — right side */}
            <div className="absolute -end-4 top-[28%] z-20 w-[200px] rounded-2xl bg-pioneer-teal-normal p-4 shadow-xl md:-end-6">
              <p className="text-xs font-semibold text-white">{t("hero.floating.dailyStudentsTitle")}</p>
              <div className="mt-2.5 flex items-center">
                <div className="flex -space-x-2.5">
                  <img src="/assets/hero-student.png" alt="a" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
                  <img src="/assets/Cover.png"       alt="b" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
                  <img src="/assets/hero-student.png" alt="c" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
                </div>
                <span className="ms-2 text-sm font-bold text-white">{t("hero.floating.studentsHint")}</span>
              </div>
            </div>

            {/* "Congratulations" card — bottom left */}
            <div className="absolute -start-4 bottom-10 z-20 w-[230px] rounded-2xl bg-white px-4 py-3 shadow-xl md:-start-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pioneer-teal-normal">
                  <Mail className="h-4 w-4 text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("hero.floating.congratsTitle")}</p>
                  <p className="text-xs text-slate-400">{t("hero.floating.congratsSubtitle")}</p>
                </div>
                <CheckCircle2 className="ms-auto h-5 w-5 shrink-0 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
