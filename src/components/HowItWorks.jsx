import { useTranslation } from "react-i18next";

/* Curved arrow SVG — points right in LTR, flipped in RTL via scaleX(-1) */
const CurvedArrow = ({ flip = false }) => (
  <svg
    viewBox="0 0 120 50"
    className="h-10 w-28 text-slate-300"
    fill="none"
    style={flip ? { transform: "scaleX(-1)" } : undefined}
  >
    <path
      d="M10 40 Q60 -5 110 25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="5 4"
      fill="none"
    />
    <path
      d="M100 18 L110 25 L100 32"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const STEPS = ["step1", "step2", "step3", "step4"];
const NUMS  = ["01", "02", "03", "04"];

export default function HowItWorks() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">

        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            {t("howItWorks.titleStart")}{" "}
            <span className="text-pioneer-orange-normal">{t("howItWorks.titleAccent")}</span>
          </h2>
          <p className="mt-3 text-base text-slate-500">
            {t("howItWorks.subtitle")}
          </p>
        </header>

        {/* Steps */}
        <div className="mt-14 flex flex-col gap-8 md:flex-row md:items-start md:gap-0">
          {STEPS.map((stepKey, idx) => (
            <div key={stepKey} className="flex flex-1 flex-col items-center md:relative">

              {/* Circle + arrow row */}
              <div className="flex w-full items-center">
                {/* Red circle number */}
                <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-pioneer-orange-normal text-2xl font-bold text-white shadow-md md:mx-0">
                  {NUMS[idx]}
                </div>

                {/* Arrow between circles (desktop only, hidden on last step) */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden flex-1 md:flex md:items-center md:justify-center">
                    <CurvedArrow flip={isRtl} />
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="mt-5 px-2 text-center md:pe-8 md:text-start">
                <h3 className="text-[17px] font-bold text-slate-900">
                  {t(`howItWorks.steps.${stepKey}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {t(`howItWorks.steps.${stepKey}.description`)}
                </p>
              </div>

              {/* Vertical connector on mobile */}
              {idx < STEPS.length - 1 && (
                <div className="my-4 h-8 w-px bg-slate-200 md:hidden" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
