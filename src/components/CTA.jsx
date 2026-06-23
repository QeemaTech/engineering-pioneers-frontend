import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function CTA() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#EE7C11] via-[#e8750f] to-[#c9650a] px-6 py-12 text-center shadow-xl shadow-[#EE7C11]/20 md:px-12 md:py-14">
          <div className="pointer-events-none absolute -start-16 top-0 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -end-10 bottom-0 h-56 w-56 rounded-full bg-black/10 blur-2xl" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-2xl font-black text-white md:text-3xl lg:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/90 md:text-base">
              {t("cta.subtitle")}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/signup"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-extrabold text-[#EE7C11] shadow-md transition hover:bg-slate-50 active:scale-[0.98] sm:w-auto"
              >
                {t("cta.actions.createAccount")}
                <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex w-full items-center justify-center rounded-xl border-2 border-white/70 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 sm:w-auto"
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
