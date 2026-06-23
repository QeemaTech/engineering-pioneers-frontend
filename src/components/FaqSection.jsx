import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, ArrowLeft, HelpCircle } from "lucide-react";

import { pickLocalized } from "../utils/cmsLocale";

function normalizeFaqContent(raw, lang) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const question = pickLocalized(item.question, lang);
      const answer = pickLocalized(item.answer, lang);
      const id = typeof item.id === "string" ? item.id : String(question).slice(0, 40);
      if (!question && !answer) return null;
      return { id, question, answer };
    })
    .filter(Boolean);
}

export default function FaqSection({ rawContent }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const [openId, setOpenId] = useState(null);

  const fallbackItems = useMemo(
    () => [
      {
        id: "q1",
        question: t("publicFaq.items.q1.question"),
        answer: t("publicFaq.items.q1.answer"),
      },
      {
        id: "q2",
        question: t("publicFaq.items.q2.question"),
        answer: t("publicFaq.items.q2.answer"),
      },
      {
        id: "q3",
        question: t("publicFaq.items.q3.question"),
        answer: t("publicFaq.items.q3.answer"),
      },
      {
        id: "q4",
        question: t("publicFaq.items.q4.question"),
        answer: t("publicFaq.items.q4.answer"),
      },
    ],
    [t]
  );

  const faqItems = useMemo(() => {
    const parsed = normalizeFaqContent(rawContent, i18n.language);
    return parsed.length > 0 ? parsed : fallbackItems;
  }, [rawContent, fallbackItems, i18n.language]);

  const schemaMarkup = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    }),
    [faqItems]
  );

  if (!faqItems.length) return null;

  return (
    <section className="relative overflow-hidden border-t border-slate-200/60 bg-white py-14 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(238,124,17,0.06),transparent)]" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#EE7C11]/20 bg-[#EE7C11]/8 px-3 py-1 text-xs font-bold text-[#EE7C11]">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl lg:text-4xl">
            {t("publicFaq.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 md:text-base">
            {t("publicFaq.subtitle")}
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item) => {
            const id = item.id || item.question;
            const isOpen = openId === id;

            return (
              <div
                key={id}
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${
                  isOpen ? "border-[#EE7C11]/35 shadow-md shadow-[#EE7C11]/5" : "border-slate-200/90 shadow-sm hover:border-[#EE7C11]/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-bold text-slate-900 transition hover:bg-slate-50/80 md:text-base rtl:text-right"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#EE7C11] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: "easeInOut" }}
                    >
                      <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
                        {item.answer}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#EE7C11] transition hover:text-[#d9700e]"
          >
            {t("publicFaq.viewAll", { defaultValue: isRtl ? "عرض كل الأسئلة" : "View all questions" })}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
