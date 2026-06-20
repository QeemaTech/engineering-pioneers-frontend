import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Zap } from "lucide-react";
import { usePublicPackages } from "../features/public/hooks";
import useAuthStore from "../store/authStore";
import { APP_ROLES, normalizeRole } from "../config/permissions";

function parseDescription(description) {
  if (!description) return [];
  return description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function durationLabel(months) {
  const n = Number(months || 0);
  if (!n) return "-";
  return n === 1 ? "1 month" : `${n} months`;
}

function PlanCard({ pkg, onGetStarted }) {
  const { t } = useTranslation();
  const descriptionLines = useMemo(() => parseDescription(pkg.description), [pkg.description]);
  const highlighted = !!pkg.isRecommended;

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-0.5 transition-all hover:-translate-y-1 ${
        highlighted
          ? "bg-gradient-to-b from-[#EE7C11] to-[#093443] shadow-2xl shadow-[#EE7C11]/30"
          : "border border-slate-200 bg-white shadow-sm hover:shadow-md"
      }`}
    >
      {highlighted ? (
        <span className="absolute -top-3.5 start-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-pioneer-teal-normal px-3 py-1 text-xs font-bold text-white shadow">
          <Zap className="h-3 w-3" />
          {t("subscription.mostPopular", { defaultValue: "Most Popular" })}
        </span>
      ) : null}

      <div className={`flex flex-1 flex-col rounded-2xl p-6 ${highlighted ? "bg-white mt-1" : ""}`}>
        <div className="space-y-1">
          <h3 className={`text-xl font-bold ${highlighted ? "text-[#EE7C11]" : "text-slate-900"}`}>{pkg.name}</h3>
          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
            {durationLabel(pkg.durationMonths)}
          </span>
        </div>

        <div className="mt-5 flex items-end gap-1">
          <span className="text-4xl font-extrabold text-slate-900">${Number(pkg.price).toFixed(0)}</span>
          <span className="mb-1 text-sm text-slate-400">/ {t("subscription.billing.oneTime", { defaultValue: "one-time" })}</span>
        </div>

        {descriptionLines.length > 0 ? (
          <ul className="mt-6 space-y-3 flex-1">
            {descriptionLines.map((line, idx) => (
              <li key={`${pkg.id}-desc-${idx}`} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${highlighted ? "bg-[#fdf2e9]" : "bg-pioneer-teal-light"}`}>
                  <Check className={`h-2.5 w-2.5 ${highlighted ? "text-[#EE7C11]" : "text-pioneer-teal-normal"}`} strokeWidth={3} />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 flex-1 flex items-center justify-center border border-dashed border-slate-150 rounded-xl p-6">
            <span className="text-xs text-slate-400">{t("subscription.noDescription", { defaultValue: "No details available." })}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => onGetStarted(pkg.id)}
          className={`mt-8 w-full rounded-xl py-3.5 text-sm font-semibold transition ${
            highlighted
              ? "bg-[#EE7C11] text-white hover:bg-pioneer-orange-hover"
              : "border border-pioneer-orange-normal text-pioneer-orange-normal hover:bg-pioneer-orange-light"
          }`}
        >
          {t("subscription.getStarted")}
        </button>
      </div>
    </div>
  );
}

export default function Subscription() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: packages = [], isLoading, isError } = usePublicPackages();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);

  const handleGetStarted = (id) => {
    const qs = new URLSearchParams({ packageId: id });
    const path = `/checkout?${qs.toString()}`;
    if (!isAuthenticated || role !== APP_ROLES.STUDENT) {
      navigate(`/login?redirect=${encodeURIComponent(path)}`);
      return;
    }
    navigate(path);
  };

  const sortedPackages = useMemo(
    () => [...packages].sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0)),
    [packages]
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl lg:text-5xl">
            {t("subscription.titlePrefix")}{" "}
            <span className="text-pioneer-orange-normal">{t("subscription.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-slate-500">{t("subscription.subtitle")}</p>
        </div>

        {isLoading ? (
          <p className="mt-16 text-center text-slate-500">{t("dashboard.common.loading", { defaultValue: "Loading…" })}</p>
        ) : null}
        {isError ? (
          <p className="mt-16 text-center text-red-600">{t("subscription.loadError", { defaultValue: "Could not load plans." })}</p>
        ) : null}

        {!isLoading && !isError && sortedPackages.length === 0 ? (
          <p className="mt-16 text-center text-slate-500">{t("subscription.empty", { defaultValue: "No packages are available yet." })}</p>
        ) : null}

        {!isLoading && sortedPackages.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 justify-center">
            {sortedPackages.map((pkg) => (
              <PlanCard key={pkg.id} pkg={pkg} onGetStarted={handleGetStarted} />
            ))}
          </div>
        ) : null}

        <p className="mt-10 text-center text-sm text-slate-500">
          {t("subscription.faqTeaser")}{" "}
          <Link to="/faq" className="font-medium text-pioneer-orange-normal hover:underline">
            {t("subscription.faqLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
