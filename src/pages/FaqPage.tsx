import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePublicLandingPage } from "../features/public/hooks";

type FaqItem = { id?: string; question?: string; answer?: string };

function normalizeFaqContent(raw: unknown): FaqItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const question = typeof o.question === "string" ? o.question : "";
      const answer = typeof o.answer === "string" ? o.answer : "";
      const id = typeof o.id === "string" ? o.id : String(question).slice(0, 40);
      if (!question && !answer) return null;
      return { id, question, answer };
    })
    .filter(Boolean) as FaqItem[];
}

export default function FaqPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePublicLandingPage();
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo(() => {
    const sections = data?.sections ?? [];
    const faq = sections.find((s) => s.key === "FAQ");
    return normalizeFaqContent(faq?.content);
  }, [data?.sections]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <nav className="text-sm text-slate-500">
          <Link to="/" className="hover:text-pioneer-orange-normal">
            {t("header.nav.home")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{t("publicFaq.title")}</span>
        </nav>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">{t("publicFaq.title")}</h1>
        <p className="mt-2 text-slate-600">{t("publicFaq.subtitle")}</p>

        <div className="mt-10 space-y-3">
          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">{t("dashboard.common.loading")}</div>
          ) : null}
          {isError ? (
            <div className="rounded-2xl border border-red-100 bg-[#EE7C11]/10 p-6 text-sm text-red-800">{t("publicFaq.loadError")}</div>
          ) : null}
          {!isLoading && !isError && items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              <p>{t("publicFaq.empty")}</p>
              <Link to="/explore" className="mt-4 inline-block font-semibold text-pioneer-orange-normal hover:underline">
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
                {open ? <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">{item.answer}</div> : null}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link to="/courses" className="font-semibold text-pioneer-orange-normal hover:underline">
            {t("publicFaq.footerExplore", { defaultValue: "Browse our courses →" })}
          </Link>
        </p>
      </div>
    </div>
  );
}
