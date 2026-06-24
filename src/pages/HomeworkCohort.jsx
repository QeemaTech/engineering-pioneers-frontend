import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";
import PageHeader from "../components/dashboard/PageHeader";
import { useHomeworkList } from "../features/student/homework/hooks";
import { deriveHomeworkUiStatus, HOMEWORK_STATUS_BADGE, HOMEWORK_STATUS_LABEL } from "../utils/homeworkStatus";

export default function HomeworkCohort() {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const { data: items = [], isLoading, isError, refetch } = useHomeworkList(courseId);

  const courseTitle = items[0]?.courseTitle;

  return (
    <div className="space-y-8">
      <Link to="/student/homework" className="text-sm font-medium text-pioneer-orange-normal hover:underline">
        ← {t("homeworkDetail.back")}
      </Link>

      <PageHeader
        title={courseTitle || t("homework.titleAccent")}
        subtitle={t("homework.courseListSubtitle", { defaultValue: "Assignments for this course" })}
      />

      {isLoading ? <p className="text-slate-500 dark:text-slate-400">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <p className="text-red-600">
          {t("homework.loadError", { defaultValue: "Could not load homework." })}{" "}
          <button type="button" className="font-semibold text-pioneer-orange-normal hover:underline" onClick={() => void refetch()}>
            {t("takeExam.retry")}
          </button>
        </p>
      ) : null}

      {!isLoading && !isError && items.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400">{t("homework.hubEmpty")}</p>
      ) : null}

      {!isLoading && !isError && items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((hw) => {
            const st = deriveHomeworkUiStatus(hw);
            const badge = HOMEWORK_STATUS_BADGE[st.key] || HOMEWORK_STATUS_BADGE.pending;
            return (
              <li key={hw.id}>
                <Link
                  to={`/student/homework/assignment/${hw.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-pioneer-orange-normal/40 dark:border-slate-700 dark:bg-[#1E293B]"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-white">{hw.title}</span>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {t("homework.due")} {new Date(hw.dueDate).toLocaleDateString()}
                      <span className="mx-1">·</span>
                      {t(`homework.type.${String(hw.type || "TEXT").toUpperCase()}`)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badge}`}>
                    {t(HOMEWORK_STATUS_LABEL[st.key])}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
