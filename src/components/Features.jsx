import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Users, 
  Video, 
  FileCheck, 
  ClipboardList, 
  ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";

const OrangeIconWrapper = ({ children }) => (
  <div
    className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50/80 border border-orange-100 p-3 text-[#EE7C11] shadow-inner transition duration-300 group-hover:scale-110 group-hover:shadow-md"
    aria-hidden
  >
    {children}
  </div>
);

const ITEMS = [
  { key: "liveClasses", Icon: Video, to: "/explore" },
  { key: "groupAndOneToOne", Icon: Users, to: "/instructors" },
  { key: "homeworkAndPractice", Icon: FileCheck, to: "/signup" },
  { key: "recordedSessions", Icon: ClipboardList, to: "/student/live-sessions" },
];

export default function Features() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();
  const isRtl = dir === "rtl";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(238,124,17,0.05),transparent)]" aria-hidden />
      
      <motion.div 
        className="relative mx-auto max-w-7xl px-4 md:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        {/* Header Section above Bento Grid */}
        <motion.div 
          variants={headerVariants}
          className="flex flex-col mb-12 text-start rtl:text-right"
        >
          <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl lg:text-[2.75rem] lg:leading-tight font-sans">
            {t("features.titlePrefix")}{" "}
            <span className="text-[#EE7C11]">{t("features.titleBrand")}</span>
            <span className="text-slate-950">{isRtl ? "؟" : "?"}</span>
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-[17px]">
            {t("features.subtitle")}
          </p>
          <span className="mt-6 h-[2px] w-20 rounded-full bg-gradient-to-r rtl:bg-gradient-to-l from-[#EE7C11] to-transparent" aria-hidden />
        </motion.div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ITEMS.map(({ key, Icon, to }, index) => {
            const isWide = index === 0 || index === 3;
            return (
              <motion.div 
                key={key} 
                variants={cardVariants}
                className={isWide ? "md:col-span-2" : "md:col-span-1"}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to={to}
                  className="group relative block h-full rounded-3xl border border-slate-200 bg-white/85 backdrop-blur-md p-6 sm:p-8 text-start rtl:text-right shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-[#EE7C11]/5 hover:border-[#EE7C11]/30 focus-visible:ring-2 focus-visible:ring-[#EE7C11] focus-visible:ring-offset-2 outline-none"
                >
                  <article className="flex h-full flex-col justify-between">
                    <div>
                      <OrangeIconWrapper>
                        <Icon className="h-6 w-6 stroke-[2]" />
                      </OrangeIconWrapper>
                      <h3 className="text-xl font-bold tracking-tight text-slate-950 transition group-hover:text-[#EE7C11] font-sans">
                        {t(`features.items.${key}.title`)}
                      </h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                        {t(`features.items.${key}.description`)}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-1.5 text-sm font-bold text-[#EE7C11]">
                      <span>{t("features.learnMore")}</span>
                      <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1.5 rtl:rotate-180 rtl:group-hover:-translate-x-1.5" aria-hidden />
                    </div>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
