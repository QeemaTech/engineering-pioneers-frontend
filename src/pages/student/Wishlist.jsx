import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart, Trash2 } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useToggleWishlist, useWishlist } from "../../features/student/wishlist/hooks";
import { getErrorMessage } from "../../api/error";

export default function Wishlist() {
  const { t } = useTranslation();
  const { data: items = [], isLoading, isError, error, refetch } = useWishlist();
  const toggle = useToggleWishlist();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("student.wishlist.title", { defaultValue: "Wishlist" })}
        subtitle={t("student.wishlist.subtitle", { defaultValue: "Courses you saved for later." })}
      />

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <div className="text-sm text-red-600">
          <p>{getErrorMessage(error, t("student.wishlist.loadError", { defaultValue: "Could not load wishlist." }))}</p>
          <button type="button" onClick={() => void refetch()} className="mt-2 font-semibold text-pioneer-orange-normal hover:underline">
            {t("takeExam.retry")}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="h-12 w-12 text-slate-300" />
          <p className="text-slate-600">{t("student.wishlist.empty", { defaultValue: "Your wishlist is empty." })}</p>
          <Link to="/explore" className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
            {t("student.overview.exploreCta", { defaultValue: "Explore courses" })}
          </Link>
        </div>
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((row) => {
            const course = row.course || row;
            const courseId = course.id || row.courseId;
            return (
              <article key={row.id || courseId} className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt="" className="h-36 w-full object-cover" />
                ) : (
                  <div className="flex h-36 items-center justify-center bg-pioneer-orange-light">
                    <Heart className="h-8 w-8 text-pioneer-orange-normal/40" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">{course.title}</h3>
                  <div className="mt-4 flex gap-2">
                    <Link
                      to={`/courses/${courseId}`}
                      className="flex-1 rounded-xl bg-pioneer-orange-normal py-2.5 text-center text-sm font-bold text-white hover:bg-pioneer-orange-hover"
                    >
                      {t("student.wishlist.viewCourse", { defaultValue: "View course" })}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void toggle.mutateAsync({ courseId, isWishlisted: true })}
                      className="rounded-xl border border-slate-200 px-3 py-2.5 text-slate-500 hover:border-red-200 hover:text-red-600"
                      aria-label={t("student.wishlist.remove", { defaultValue: "Remove" })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
