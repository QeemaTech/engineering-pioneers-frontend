import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHomeworkList } from "../features/student/homework/hooks";

export default function HomeworkCohort() {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const { data: items = [], isLoading, isError, refetch } = useHomeworkList(courseId);

  return (
    <div className="space-y-6">
      <Link to="/student/homework" className="text-sm font-medium text-pioneer-orange-normal hover:underline">
        ← {t("homework.hubTitle")}
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("homework.titleAccent")}</h1>
      {isLoading ? <p className="text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <p className="text-red-600">
          {t("homework.loadError", { defaultValue: "Could not load homework." })}{" "}
          <button type="button" className="font-semibold text-pioneer-orange-normal hover:underline" onClick={() => void refetch()}>
            {t("takeExam.retry")}
          </button>
        </p>
      ) : null}
      {!isLoading && !isError ? (
        <ul className="space-y-3">
          {items.map((hw) => {
            const sub = hw.submission;
            const status = sub?.status || "pending";
            return (
              <li key={hw.id}>
                <Link
                  to={`/student/homework/assignment/${hw.id}`}
                  className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-pioneer-orange-normal/40 dark:border-slate-700 dark:bg-[#1E293B]"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{hw.title}</span>
                  <span className="text-xs text-slate-500">
                    {t("homework.due")} {new Date(hw.dueDate).toLocaleDateString()} · {hw.type} · {status}
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
