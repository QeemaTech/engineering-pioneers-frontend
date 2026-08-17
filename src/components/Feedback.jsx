import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { resolveMediaUrl } from "../utils/mediaUrl";

const StarRow = ({ value = 5, size = "h-4 w-4" }) => {
  const v = Math.min(5, Math.max(0, Math.round(Number(value) || 0)));
  return (
    <div className="flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${i <= v ? "fill-pioneer-teal-normal text-pioneer-teal-normal" : "fill-none text-slate-300"}`}
        />
      ))}
    </div>
  );
};

function ReviewAvatar({ name, src }) {
  const initials = String(name || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="h-14 w-14 rounded-full border-2 border-white object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-sm font-bold text-slate-600">
      {initials}
    </div>
  );
}

export default function Feedback({ featuredReviews = [], reviewsLoading = false }) {
  const { t } = useTranslation();
  const list = Array.isArray(featuredReviews) ? featuredReviews : [];
  const hasReviews = list.length > 0;

  const avgRating =
    hasReviews ? list.reduce((sum, r) => sum + (Number(r?.rating) || 0), 0) / list.length : 0;

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div className="text-start">
            <h2 className="max-w-md text-3xl font-bold leading-snug text-slate-900 md:text-4xl">
              {t("feedback.titlePrefix")}{" "}
              <span className="rounded bg-pioneer-teal-normal px-1 text-slate-900">
                {t("feedback.titleHighlight")}
              </span>{" "}
              {t("feedback.titleSuffix")}
            </h2>
            <p className="mt-4 max-w-sm text-base text-slate-500">{t("feedback.subtitle")}</p>
            <Link
              to="/explore"
              className="mt-7 inline-block rounded-lg bg-pioneer-orange-normal px-7 py-3 text-sm font-semibold text-white transition hover:bg-pioneer-orange-hover"
            >
              {t("feedback.button")}
            </Link>
          </div>

          <div className="relative min-h-[200px]">
            {reviewsLoading && !hasReviews ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-sm text-slate-500">
                {t("dashboard.common.loading")}
              </div>
            ) : null}

            {!reviewsLoading && !hasReviews ? (
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-8 text-start shadow-sm">
                <p className="text-base font-semibold text-slate-900">{t("feedback.empty.title")}</p>
                <p className="text-sm leading-relaxed text-slate-600">{t("feedback.empty.description")}</p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    to="/explore"
                    className="inline-flex rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pioneer-orange-hover"
                  >
                    {t("feedback.empty.ctaExplore")}
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-pioneer-orange-normal hover:text-pioneer-orange-normal"
                  >
                    {t("feedback.empty.ctaSignup")}
                  </Link>
                </div>
              </div>
            ) : null}

            {hasReviews ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {list.slice(0, 4).map((r) => {
                    const name = r?.student?.fullName || t("feedback.anonymousStudent");
                    const avatar = resolveMediaUrl(r?.student?.avatar);
                    const courseTitle = r?.course?.title;
                    const quote = (r?.comment || "").trim();
                    const rating = Math.min(5, Math.max(1, Number(r?.rating) || 5));
                    return (
                      <article
                        key={r.id || `${name}-${r.createdAt}`}
                        className="rounded-xl border border-slate-100 bg-white p-5 shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <ReviewAvatar name={name} src={avatar} />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900">{name}</p>
                            {courseTitle ? (
                              <p className="mt-0.5 text-xs text-slate-500">{courseTitle}</p>
                            ) : null}
                          </div>
                        </div>
                        {quote ? (
                          <p className="mt-4 text-sm italic leading-6 text-slate-600">&ldquo;{quote}&rdquo;</p>
                        ) : (
                          <p className="mt-4 text-sm text-slate-500">{t("feedback.noComment")}</p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <StarRow value={rating} />
                          <span className="text-xs font-medium text-slate-500">
                            {rating}/5
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t("feedback.discover.title")}</p>
                    <p className="mt-1 text-xs text-slate-500">{t("feedback.discover.subtitle")}</p>
                  </div>
                  <Link
                    to="/explore"
                    className="inline-flex shrink-0 justify-center rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pioneer-orange-hover"
                  >
                    {t("feedback.discover.cta")}
                  </Link>
                </div>

                {avgRating > 0 ? (
                  <div className="rounded-xl bg-pioneer-orange-normal p-4 text-white shadow-md">
                    <p className="text-2xl font-bold">
                      {avgRating.toFixed(1)}
                      <span className="text-base font-semibold text-white/90">/5</span>
                    </p>
                    <div className="mt-1.5">
                      <StarRow size="h-3 w-3" value={avgRating} />
                    </div>
                    <p className="mt-1.5 text-xs text-white/90">
                      {t("feedback.rating.fromPublished", { count: list.length })}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
