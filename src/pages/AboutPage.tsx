import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Target, Sparkles, Users } from "lucide-react";
import { usePublicLandingPage } from "../features/public/hooks";
import { useSiteSettings } from "../features/public/siteSettings/hooks";

type AboutContent = {
  mission?: string;
  vision?: string;
  description?: string;
  teamPhoto?: string;
};

function parseAbout(raw: unknown): AboutContent | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as AboutContent;
}

export default function AboutPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = usePublicLandingPage();
  const { settings: site } = useSiteSettings();

  const about = useMemo(() => {
    const sections = data?.sections ?? [];
    const row = sections.find((s) => s.key === "ABOUT_US");
    return parseAbout(row?.content);
  }, [data?.sections]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <nav className="text-sm text-slate-500">
          <Link to="/" className="hover:text-pioneer-orange-normal">
            {t("header.nav.home")}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{t("publicAbout.title")}</span>
        </nav>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">{t("publicAbout.title")}</h1>
        <p className="mt-2 max-w-2xl text-slate-600">{t("publicAbout.subtitle")}</p>

        {isLoading ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">{t("dashboard.common.loading")}</div>
        ) : null}
        {isError ? (
          <div className="mt-10 rounded-2xl border border-red-100 bg-[#EE7C11]/10 p-6 text-sm text-red-800">{t("publicAbout.loadError")}</div>
        ) : null}

        {!isLoading && !isError && !about?.description && !about?.mission ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            <p>{t("publicAbout.empty")}</p>
            <Link to="/explore" className="mt-4 inline-block font-semibold text-pioneer-orange-normal hover:underline">
              {t("publicAbout.cta")}
            </Link>
          </div>
        ) : null}

        {about ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:col-span-2">
              <h2 className="text-lg font-bold text-slate-900">{t("publicAbout.storyTitle")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{about.description || t("publicAbout.fallbackStory")}</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-pioneer-orange-light bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pioneer-orange-light text-pioneer-orange-normal">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{t("publicAbout.mission")}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{about.mission || "—"}</p>
              </div>
              <div className="rounded-2xl border border-pioneer-teal-light bg-white p-5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pioneer-teal-light text-pioneer-teal-normal">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{t("publicAbout.vision")}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{about.vision || "—"}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div id="policies" className="scroll-mt-24 mt-10 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t("publicAbout.policiesTitle")}</h2>
          <p className="mt-2 text-sm text-slate-600">{t("publicAbout.policiesBody")}</p>
          <a href={`mailto:${site.contactEmail}`} className="mt-3 inline-block text-sm font-semibold text-pioneer-orange-normal hover:underline">
            {t("publicAbout.policiesContact")}
          </a>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
          <Users className="h-8 w-8 text-pioneer-orange-normal" />
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900">{t("publicAbout.joinTitle")}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-semibold text-white hover:bg-pioneer-orange-hover"
              >
                {t("header.actions.signUp")}
              </Link>
              <Link
                to="/faq"
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal"
              >
                {t("footer.community.faq")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
