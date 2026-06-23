import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User as UserIcon, Users, Cpu, Play, Star, ArrowRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import ShapeGrid from "./ui/ShapeGrid";
import { pickLocalized } from "../utils/cmsLocale";

const FEATURE_ICONS = [UserIcon, Users, Cpu];
const FEATURE_KEYS = ["experts", "liveCohorts", "membership"];

export default function Hero({ cmsContent }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = i18n.language;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const cmsHeadline = pickLocalized(cmsContent?.headline, lang).trim();
  const cmsSubheadline = pickLocalized(cmsContent?.subheadline, lang).trim();
  const useCmsCopy = Boolean(cmsHeadline || cmsSubheadline);

  return (
    <section className="relative isolate overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
        <ShapeGrid
          direction="diagonal"
          speed={0.12}
          borderColor="#EE7C11"
          hoverColor="#FFEFE2"
          size={36}
          shape="square"
          hoverTrailAmount={0}
          className="h-full w-full"
        />
      </div>

      <div className="pointer-events-none absolute -start-24 top-0 h-64 w-64 rounded-full bg-[#EE7C11]/8 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-20 lg:px-8">
        {/* Copy */}
        <div className="order-2 text-start lg:order-1 rtl:text-right">
          <p className="mb-4 inline-flex items-center rounded-full border border-[#EE7C11]/20 bg-[#EE7C11]/8 px-3.5 py-1.5 text-xs font-bold text-[#EE7C11]">
            {t("hero.upperTag")}
          </p>

          <h1 className="text-3xl font-black leading-[1.15] tracking-tight text-slate-950 sm:text-4xl lg:text-[2.65rem] xl:text-5xl">
            {useCmsCopy && cmsHeadline ? (
              cmsHeadline
            ) : (
              <>
                {t("hero.headline.start")}{" "}
                <span className="text-[#EE7C11]">{t("hero.headline.highlight")}</span>
              </>
            )}
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 lg:text-lg">
            {useCmsCopy && cmsSubheadline ? cmsSubheadline : t("hero.subheadline")}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {FEATURE_KEYS.map((key, idx) => {
              const Icon = FEATURE_ICONS[idx];
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-[#EE7C11]" />
                  {t(`hero.features.${key}`)}
                </span>
              );
            })}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              to="/explore"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#EE7C11]/20 transition hover:bg-[#d9700e] hover:shadow-[#EE7C11]/30 active:scale-[0.98]"
            >
              {t("hero.actions.startLearning")}
              <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </Link>

            <button
              type="button"
              onClick={() => window.open("https://www.youtube.com", "_blank", "noopener,noreferrer")}
              className="group inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-[#EE7C11]/30 hover:text-[#EE7C11]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-[#EE7C11]/10 group-hover:text-[#EE7C11]">
                <Play className="h-3.5 w-3.5 fill-current" />
              </span>
              {t("hero.actions.watchNow")}
            </button>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-600">{t("hero.socialProof.engineersCount")}</p>
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-600">{t("hero.socialProof.rating")}</span>
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="relative order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="relative w-full max-w-[420px] lg:max-w-none">
            <div className="pointer-events-none absolute inset-6 rounded-[2rem] bg-gradient-to-br from-[#EE7C11]/15 via-transparent to-[#EE7C11]/5 blur-2xl" />

            <img
              src="/assets/hero_student.png"
              alt=""
              className="relative z-10 mx-auto h-[280px] w-auto object-contain sm:h-[320px] lg:h-[420px] xl:h-[460px]"
            />

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute start-0 top-[12%] z-20 hidden w-44 rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:block lg:w-48"
            >
              <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">pioneer_opt.py</span>
              </div>
              <pre className="text-left font-mono text-[9px] leading-relaxed text-slate-700" dir="ltr">
                <span className="text-blue-600">import</span> numpy <span className="text-blue-600">as</span> np{"\n"}
                <span className="text-violet-600">def</span> <span className="text-[#EE7C11]">optimize_load</span>(beam):{"\n"}
                {"  "}return np.max(forces)
              </pre>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute end-0 bottom-[18%] z-20 hidden w-44 rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:block lg:w-48"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800">Stress Vectors</span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">Active</span>
              </div>
              <svg viewBox="0 0 100 40" className="h-9 w-full stroke-[#EE7C11] fill-none stroke-2">
                <path d="M0,35 Q25,5 50,25 T100,8" strokeLinecap="round" />
              </svg>
              <div className="mt-1 flex justify-between text-[9px] text-slate-500" dir="ltr">
                <span>X: 142.8 kN</span>
                <span>Y: 89.2 kN</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
