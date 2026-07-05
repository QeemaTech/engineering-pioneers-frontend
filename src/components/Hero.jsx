import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User as UserIcon, Users, Cpu, Play, Star, ArrowRight, ArrowLeft, GraduationCap, Award } from "lucide-react";
import { motion } from "framer-motion";
import ShapeGrid from "./ui/ShapeGrid";
import { pickLocalized } from "../utils/cmsLocale";
import client from "../api/client";

const FEATURE_ICONS = [UserIcon, Users, Cpu];
const FEATURE_KEYS = ["experts", "liveCohorts", "membership"];

const STATS_CONFIG = [
  {
    id: "students",
    labelAr: "طالب نشط مسجل",
    labelEn: "Active Registered Students",
    icon: Users,
    bg: "bg-orange-500/10",
    textColor: "text-orange-600 dark:text-orange-400",
  },
  {
    id: "courses",
    labelAr: "مساقات أكاديمية متخصصة",
    labelEn: "Specialized Academic Courses",
    icon: GraduationCap,
    bg: "bg-blue-500/10",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "instructors",
    labelAr: "محاضرين خبراء ومعتمدين",
    labelEn: "Certified Expert Lecturers",
    icon: UserIcon,
    bg: "bg-emerald-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "success",
    labelAr: "نسبة رضا الطلاب والاجتياز",
    labelEn: "Student Satisfaction & Passing Rate",
    icon: Award,
    bg: "bg-purple-500/10",
    textColor: "text-purple-600 dark:text-purple-400",
  },
];

export default function Hero({ cmsContent, stats }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const lang = i18n.language;
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    async function fetchBanners() {
      try {
        const res = await client.get("/public/banners");
        const items = res?.data?.data?.banners || [];
        setBanners(items);
      } catch (err) {
        console.error("Failed to fetch public banners", err);
      }
    }
    void fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const cmsHeadline = pickLocalized(cmsContent?.headline, lang).trim();
  const cmsSubheadline = pickLocalized(cmsContent?.subheadline, lang).trim();
  const useCmsCopy = Boolean(cmsHeadline || cmsSubheadline);

  const statsData = [
    { ...STATS_CONFIG[0], value: stats?.studentsFormatted || "1501" },
    { ...STATS_CONFIG[1], value: stats?.courses ? `${stats.courses}+` : "3+" },
    { ...STATS_CONFIG[2], value: stats?.instructors ? `${stats.instructors}+` : "3+" },
    { ...STATS_CONFIG[3], value: "100%" },
  ];

  const currentBanner = banners[currentBannerIndex];

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

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8 lg:py-20">
        {/* Content grid: copy + visual only */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          {/* Copy */}
          <div className="order-2 lg:order-none text-start rtl:text-right">
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

          {/* Visual / Banner Slider */}
          <div className="order-1 lg:order-none relative flex w-full justify-center lg:justify-start">
            <div className="group relative aspect-[16/10] w-full max-w-[500px] overflow-hidden rounded-[2rem] border border-slate-200/50 bg-white/70 shadow-xl dark:border-white/5 dark:bg-[#101625] lg:aspect-[16/9] lg:max-w-none">
              <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-[#EE7C11]/5 via-transparent to-transparent" />

              {currentBanner ? (
                <div className="relative z-10 h-full w-full">
                  {currentBanner.link ? (
                    <a
                      href={currentBanner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full w-full"
                    >
                      <img
                        src={currentBanner.imageUrl}
                        alt={currentBanner.title || "Banner"}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                      />
                    </a>
                  ) : (
                    <img
                      src={currentBanner.imageUrl}
                      alt={currentBanner.title || "Banner"}
                      className="h-full w-full object-cover"
                    />
                  )}

                  {banners.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
                        }}
                        className="absolute left-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-800 opacity-0 shadow-lg backdrop-blur-xs transition-opacity duration-200 hover:bg-white group-hover:opacity-100 dark:bg-slate-900/80 dark:text-slate-200"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
                        }}
                        className="absolute right-4 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-800 opacity-0 shadow-lg backdrop-blur-xs transition-opacity duration-200 hover:bg-white group-hover:opacity-100 dark:bg-slate-900/80 dark:text-slate-200"
                      >
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {banners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-3 py-1.5 backdrop-blur-xs">
                      {banners.map((_, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setCurrentBannerIndex(idx)}
                          className={`h-1.5 rounded-full transition-all duration-300 ${currentBannerIndex === idx ? "w-4 bg-white" : "w-1.5 bg-white/40"
                            }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative z-10 flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/50 dark:from-[#1E293B]/20 dark:to-transparent">
                  <img
                    src="/assets/hero_student.png"
                    alt="Student Fallback"
                    className="mx-auto h-[90%] w-auto object-contain"
                  />
                </div>
              )}
            </div>

            {/* Absolute Floaters */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute start-[-16px] top-[12%] z-20 hidden w-44 rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:block lg:w-48"
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
              className="absolute end-[-16px] bottom-[18%] z-20 hidden w-44 rounded-xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:block lg:w-48"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-800">Stress Vectors</span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">Active</span>
              </div>
              <svg viewBox="0 0 100 40" className="h-9 w-full fill-none stroke-[#EE7C11] stroke-2">
                <path d="M0,35 Q25,5 50,25 T100,8" strokeLinecap="round" />
              </svg>
              <div className="mt-1 flex justify-between text-[9px] text-slate-500" dir="ltr">
                <span>X: 142.8 kN</span>
                <span>Y: 89.2 kN</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Integrated Stats Row — full width, outside the 2-col grid */}
        <div className="relative z-20 mt-12 border-t border-slate-200/80 pt-10 dark:border-white/5 lg:mt-16">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {statsData.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-white/70 p-4 backdrop-blur-xs transition-all duration-300 hover:shadow-md dark:border-white/5 dark:bg-slate-900/60"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.textColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xl font-black leading-none tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                      {item.value}
                    </div>
                    <div className="mt-1.5 text-[10px] font-bold leading-tight text-slate-500 dark:text-slate-400 sm:text-xs">
                      {isRtl ? item.labelAr : item.labelEn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div >
    </section >
  );
}