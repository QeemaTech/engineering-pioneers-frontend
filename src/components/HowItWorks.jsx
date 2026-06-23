import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";

const STEPS = ["step1", "step2", "step3", "step4"];
const NUMS  = ["01", "02", "03", "04"];

export default function HowItWorks() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";

  const containerRef = useRef(null);
  
  // Track scroll position of this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress to pathLength (from 0 to 1 between 20% and 75% scroll-through)
  const pathLength = useTransform(scrollYProgress, [0.2, 0.75], [0, 1]);
  // Mobile vertical line height progress
  const mobileHeight = useTransform(scrollYProgress, [0.2, 0.75], ["0%", "100%"]);

  return (
    <section className="bg-white py-20 md:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">

        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-black text-slate-950 md:text-4xl lg:text-5xl font-sans">
            {t("howItWorks.titleStart", { defaultValue: isRtl ? "كيف" : "How It" })}{" "}
            <span className="text-[#EE7C11]">{t("howItWorks.titleAccent", { defaultValue: isRtl ? "نعمل؟" : "Works" })}</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 font-normal leading-relaxed">
            {t("howItWorks.subtitle", { defaultValue: isRtl ? "خارطة طريقك من التعلم إلى التوظيف في النخبة الهندسية" : "Your roadmap from learning to landing elite engineering roles" })}
          </p>
        </header>

        {/* Steps container */}
        <div className="relative mt-20" ref={containerRef}>
          
          {/* Horizontal SVG line for desktop */}
          <div className="absolute inset-x-0 top-8 -translate-y-1/2 h-16 hidden md:block -z-10 pointer-events-none">
            <svg viewBox="0 0 1000 100" className="w-full h-full rtl:-scale-x-100" fill="none" preserveAspectRatio="none">
              <defs>
                <filter id="neon-glow-roadmap" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Background path (inactive gray line) */}
              <path 
                d="M 125,50 C 250,90 250,10 375,50 C 500,90 500,10 625,50 C 750,90 750,10 875,50" 
                stroke="#F1F5F9" 
                strokeWidth="4" 
                strokeLinecap="round"
                fill="none" 
              />
              
              {/* Active path (neon orange glowing line) */}
              <motion.path 
                d="M 125,50 C 250,90 250,10 375,50 C 500,90 500,10 625,50 C 750,90 750,10 875,50" 
                stroke="#EE7C11" 
                strokeWidth="4" 
                strokeLinecap="round"
                fill="none" 
                style={{ pathLength }}
                filter="url(#neon-glow-roadmap)"
              />
            </svg>
          </div>

          {/* Vertical line for mobile (hidden on desktop) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-8 bottom-8 w-[4px] bg-slate-100 md:hidden -z-10 rounded-full">
            <motion.div 
              style={{ height: mobileHeight }}
              className="w-full bg-[#EE7C11] rounded-full shadow-[0_0_8px_#EE7C11]"
            />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-0">
            {STEPS.map((stepKey, idx) => (
              <div key={stepKey} className="flex flex-col items-center md:relative">

                {/* White Node with Orange Border */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white border-2 border-[#EE7C11] text-2xl font-black text-slate-900 shadow-md relative z-10 transition-transform duration-300 hover:scale-110">
                  {NUMS[idx]}
                </div>

                {/* Text */}
                <div className="mt-6 px-4 text-center">
                  <h3 className="text-lg font-bold text-slate-950 font-sans tracking-wide">
                    {t(`howItWorks.steps.${stepKey}.title`)}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 max-w-[240px] mx-auto">
                    {t(`howItWorks.steps.${stepKey}.description`)}
                  </p>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
