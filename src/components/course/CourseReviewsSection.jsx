import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Loader2, Star } from "lucide-react";
import { getErrorMessage } from "../../api/error";
import { useCourseReviews, useMyCourseReview, useUpsertCourseReview } from "../../features/student/reviews/hooks";
import { resolveMediaUrl } from "../../utils/mediaUrl";

function Stars({ rating, max = 5, size = "h-4 w-4", onSelect, disabled }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = rating >= i + 1;
        const fill = Math.min(Math.max(rating - i, 0), 1);
        if (onSelect) {
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(i + 1)}
              className="rounded p-0.5 disabled:opacity-50"
              aria-label={`${i + 1}`}
            >
              <Star className={`${size} ${filled ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
            </button>
          );
        }
        return (
          <span key={i} className="relative inline-block">
            <Star className={`${size} text-slate-200`} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} fill-amber-400 text-amber-400`} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function initials(name) {
  const parts = String(name || "?").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || "?").toUpperCase();
}

export default function CourseReviewsSection({
  courseId,
  isStudent,
  isEnrolled,
  isAuth,
  loginHref,
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data, isLoading, isError, refetch } = useCourseReviews(courseId);
  const mineQuery = useMyCourseReview(courseId, Boolean(isStudent && isEnrolled));
  const upsert = useUpsertCourseReview(courseId);

  const reviews = data?.reviews ?? [];
  const mine = mineQuery.data;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!mine) return;
    setRating(Number(mine.rating) || 5);
    setComment(mine.comment || "");
  }, [mine]);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) {
      toast.error(t("courseDetails.reviewsSection.pickStars", { defaultValue: "Pick a star rating." }));
      return;
    }
    try {
      await upsert.mutateAsync({ reviewId: mine?.id, rating, comment });
      toast.success(
        mine?.id
          ? t("courseDetails.reviewsSection.updated", { defaultValue: "Your review was updated." })
          : t("courseDetails.reviewsSection.submitted", { defaultValue: "Thanks for rating this course." })
      );
    } catch (err) {
      toast.error(getErrorMessage(err, t("courseDetails.reviewsSection.failed", { defaultValue: "Could not save your review." })));
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
      <h2 className="mb-1 text-xl font-bold text-slate-900">
        {t("courseDetails.reviewsSection.title", { defaultValue: "Student reviews" })}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        {t("courseDetails.reviewsSection.subtitle", { defaultValue: "Ratings from students who purchased this course." })}
      </p>

      {isStudent && isEnrolled ? (
        <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-bold text-slate-800">
            {mine?.id
              ? t("courseDetails.reviewsSection.editTitle", { defaultValue: "Update your rating" })
              : t("courseDetails.reviewsSection.formTitle", { defaultValue: "Rate this course" })}
          </p>
          {mine && mine.isVisible === false ? (
            <p className="mt-1 text-xs text-amber-700">
              {t("courseDetails.reviewsSection.hiddenNote", { defaultValue: "Your review is currently hidden by admin. You can still update it." })}
            </p>
          ) : null}
          <div className="mt-3">
            <Stars rating={rating} size="h-7 w-7" onSelect={setRating} disabled={upsert.isPending} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            rows={3}
            placeholder={t("courseDetails.reviewsSection.commentPlaceholder", { defaultValue: "Share what you liked (optional)" })}
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#EE7C11]"
          />
          <button
            type="submit"
            disabled={upsert.isPending}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white hover:bg-[#d9700e] disabled:opacity-60"
          >
            {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mine?.id
              ? t("courseDetails.reviewsSection.save", { defaultValue: "Save review" })
              : t("courseDetails.reviewsSection.submit", { defaultValue: "Submit review" })}
          </button>
        </form>
      ) : !isAuth ? (
        <p className="mb-6 text-sm text-slate-600">
          {t("courseDetails.reviewsSection.loginHint", { defaultValue: "Enrolled students can rate this course." })}{" "}
          <Link to={loginHref} className="font-semibold text-[#EE7C11] hover:underline">
            {t("courseDetails.card.logInToEnroll", { defaultValue: "Log in to Enroll" })}
          </Link>
        </p>
      ) : isStudent && !isEnrolled ? (
        <p className="mb-6 text-sm text-slate-600">
          {t("courseDetails.reviewsSection.enrollHint", { defaultValue: "Purchase this course to leave a rating." })}
        </p>
      ) : isAuth ? (
        <p className="mb-6 text-sm text-slate-600">
          {t("courseDetails.reviewsSection.staffHint", { defaultValue: "Only enrolled students can rate this course." })}
        </p>
      ) : null}

      {isLoading ? <p className="text-sm text-slate-500">{t("courseDetails.loading", { defaultValue: "Loading…" })}</p> : null}
      {isError ? (
        <p className="text-sm text-red-600">
          {t("courseDetails.reviewsSection.loadError", { defaultValue: "Could not load reviews." })}{" "}
          <button type="button" onClick={() => void refetch()} className="font-semibold underline">
            {t("courseDetails.retry", { defaultValue: "Retry" })}
          </button>
        </p>
      ) : null}

      {!isLoading && !isError && reviews.length === 0 ? (
        <p className="text-sm text-slate-500">
          {t("courseDetails.noReviewsYet", { defaultValue: "No reviews yet" })}
        </p>
      ) : null}

      <ul className="space-y-4">
        {reviews.map((review) => {
          const name = review.student?.fullName || t("feedback.anonymousStudent", { defaultValue: "Student" });
          const avatar = resolveMediaUrl(review.student?.avatar);
          return (
            <li key={review.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                {avatar ? (
                  <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pioneer-orange-light text-xs font-bold text-pioneer-orange-normal">
                    {initials(name)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{name}</p>
                    <Stars rating={Number(review.rating) || 0} />
                  </div>
                  {review.comment ? (
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                  ) : null}
                  {review.createdAt ? (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString(isRtl ? "ar-EG" : undefined)}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
