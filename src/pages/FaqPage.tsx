import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePublicLandingPage } from "../features/public/hooks";
import { pickLocalized } from "../utils/cmsLocale";

type FaqItem = { id?: string; question?: unknown; answer?: unknown };

function normalizeFaqContent(raw: unknown, lang: string): { id: string; question: string; answer: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const question = pickLocalized(o.question, lang);
      const answer = pickLocalized(o.answer, lang);
      const id = typeof o.id === "string" ? o.id : String(question).slice(0, 40);
      if (!question && !answer) return null;
      return { id, question, answer };
    })
    .filter(Boolean) as { id: string; question: string; answer: string }[];
}

export default function FaqPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { data, isLoading, isError } = usePublicLandingPage();
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo(() => {
    const sections = data?.sections ?? [];
    const faq = sections.find((s) => s.key === "FAQ");
    return normalizeFaqContent(faq?.content, lang);
  }, [data?.sections, lang]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50/80 to-white py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <nav className="text-sm text-slate-500">
          <Link to="/" className="transition hover:text-[#EE7C11]">
            {t("header.nav.home")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{t("publicFaq.title")}</span>
        </nav>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">{t("publicFaq.title")}</h1>
        <p className="mt-2 text-slate-600">{t("publicFaq.subtitle")}</p>

        <div className="mt-10 space-y-3">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              {t("dashboard.common.loading")}
            </div>
          ) : null}
          {isError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-800">
              {t("publicFaq.loadError")}
            </div>
          ) : null}
          {!isLoading && !isError && items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              <p>{t("publicFaq.empty")}</p>
              <Link to="/explore" className="mt-4 inline-block font-semibold text-[#EE7C11] hover:underline">
                {t("publicFaq.ctaExplore")}
              </Link>
            </div>
          ) : null}
          {items.map((item) => {
            const id = item.id || item.question || "";
            const open = openId === id;
            return (
              <div key={id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  <span>{item.question}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open ? (
                  <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">{item.answer}</div>
                ) : null}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link to="/guide" className="font-semibold text-[#EE7C11] hover:underline">
            {t("publicFaq.footerGuide", { defaultValue: t("footer.teaching.howToGuide") })}
          </Link>
          <span className="mx-2">·</span>
          <Link to="/explore" className="font-semibold text-[#EE7C11] hover:underline">
            {t("publicFaq.footerExplore", { defaultValue: "Browse our courses →" })}
          </Link>
        </p>
      </div>
    </div>
  );
}
