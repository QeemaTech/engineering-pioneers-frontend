import { useState } from "react";
import { Star, Eye, EyeOff, Trash2, Sparkles, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PageHeader from "../../components/ui/PageHeader";
import { getErrorMessage } from "../../api/error";
import {
  useAdminCourseReviews,
  useDeleteAdminReview,
  useSetAdminReviewFeatured,
  useSetAdminReviewVisibility,
} from "../../features/admin/reviews/hooks";

function CourseReviewsAdmin() {
  const { t } = useTranslation();
  const tx = (key, fallback) => t(key, { defaultValue: fallback });
  const [ratingFilter, setRatingFilter] = useState("");
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminCourseReviews({
    page: 1,
    limit: 100,
    ...(ratingFilter ? { rating: ratingFilter } : {}),
  });
  const visibility = useSetAdminReviewVisibility();
  const featured = useSetAdminReviewFeatured();
  const remove = useDeleteAdminReview();

  const reviews = data?.reviews || [];

  return (
    <section className="space-y-6">
      <PageHeader
        title={tx("adminPages.courseReviews.title", "Course reviews")}
        subtitle={tx("adminPages.courseReviews.subtitle", "Moderate ratings students leave on course pages")}
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1A1A22]">
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
        >
          <option value="">{tx("adminPages.courseReviews.allRatings", "All ratings")}</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={String(n)}>
              {n}★
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10"
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {tx("dashboard.common.refresh", "Refresh")}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#1A1A22]">
        {isLoading ? <p className="p-5 text-sm text-slate-500">{tx("dashboard.common.loading", "Loading...")}</p> : null}
        {isError ? (
          <p className="p-5 text-sm text-red-500">{getErrorMessage(error, tx("adminPages.courseReviews.loadError", "Failed to load reviews"))}</p>
        ) : null}
        {!isLoading && !isError ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-white/10">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:bg-[#0F0F13]">
                <tr>
                  <th className="px-4 py-3 text-start">{tx("adminPages.courseReviews.student", "Student")}</th>
                  <th className="px-4 py-3 text-start">{tx("adminPages.courseReviews.course", "Course")}</th>
                  <th className="px-4 py-3 text-start">{tx("adminPages.courseReviews.rating", "Rating")}</th>
                  <th className="px-4 py-3 text-start">{tx("adminPages.courseReviews.comment", "Comment")}</th>
                  <th className="px-4 py-3 text-start">{tx("adminPages.courseReviews.status", "Status")}</th>
                  <th className="px-4 py-3 text-start">{tx("adminPages.courseReviews.actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {reviews.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{row.student?.fullName || "—"}</p>
                      {row.student?.email ? (
                        <p className="text-xs text-slate-400">{row.student.email}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{row.course?.title || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {row.rating}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-slate-600 dark:text-slate-300">{row.comment || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-xs font-semibold">
                        <span className={row.isVisible ? "text-emerald-600" : "text-slate-400"}>
                          {row.isVisible ? tx("adminPages.courseReviews.visible", "Visible") : tx("adminPages.courseReviews.hidden", "Hidden")}
                        </span>
                        {row.isFeatured ? (
                          <span className="text-[#EE7C11]">{tx("adminPages.courseReviews.featured", "Featured")}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            visibility.mutate(
                              { reviewId: row.id, isVisible: !row.isVisible },
                              {
                                onSuccess: () => toast.success(tx("adminPages.courseReviews.visibilityUpdated", "Visibility updated")),
                                onError: (err) => toast.error(getErrorMessage(err)),
                              }
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold dark:border-white/10"
                        >
                          {row.isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          {row.isVisible ? tx("adminPages.courseReviews.hide", "Hide") : tx("adminPages.courseReviews.show", "Show")}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            featured.mutate(
                              { reviewId: row.id, isFeatured: !row.isFeatured },
                              {
                                onSuccess: () => toast.success(tx("adminPages.courseReviews.featureUpdated", "Homepage feature updated")),
                                onError: (err) => toast.error(getErrorMessage(err)),
                              }
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold dark:border-white/10"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          {row.isFeatured ? tx("adminPages.courseReviews.unfeature", "Unfeature") : tx("adminPages.courseReviews.feature", "Feature")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!window.confirm(tx("adminPages.courseReviews.confirmDelete", "Delete this review?"))) return;
                            remove.mutate(row.id, {
                              onSuccess: () => toast.success(tx("adminPages.courseReviews.deleted", "Review deleted")),
                              onError: (err) => toast.error(getErrorMessage(err)),
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {tx("dashboard.common.delete", "Delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!reviews.length ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                      {tx("adminPages.courseReviews.empty", "No reviews yet")}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default CourseReviewsAdmin;
