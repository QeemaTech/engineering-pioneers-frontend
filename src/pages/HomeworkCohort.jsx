import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHomeworkList } from "../features/student/homework/hooks";

export default function HomeworkCohort() {
  const { t } = useTranslation();
  const { cohortId } = useParams();
  const { data: items = [], isLoading, isError, refetch } = useHomeworkList(cohortId);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <Link to="/homework" className="text-sm font-medium text-pioneer-orange-normal hover:underline">
          ← {t("homework.hubTitle")}
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{t("homework.titleAccent")}</h1>
        {isLoading ? <p className="mt-8 text-slate-500">{t("dashboard.common.loading")}</p> : null}
        {isError ? (
          <p className="mt-8 text-red-600">
            {t("homework.loadError", { defaultValue: "Could not load homework." })}{" "}
            <button type="button" className="font-semibold text-pioneer-orange-normal hover:underline" onClick={() => void refetch()}>
              {t("takeExam.retry")}
            </button>
          </p>
        ) : null}
        {!isLoading && !isError ? (
          <ul className="mt-8 space-y-3">
            {items.map((hw) => {
              const sub = hw.submission;
              const status = sub?.status || "pending";
              return (
                <li key={hw.id}>
                  <Link
                    to={`/homework/assignment/${hw.id}`}
                    className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-pioneer-orange-normal/40"
                  >
                    <span className="font-semibold text-slate-900">{hw.title}</span>
                    <span className="text-xs text-slate-500">
                      {t("homework.due")} {new Date(hw.dueDate).toLocaleDateString()} · {hw.type} · {status}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
        {!isLoading && !isError && items.length === 0 ? (
          <p className="mt-8 text-slate-500">{t("homework.emptyCohort", { defaultValue: "No assignments for this cohort." })}</p>
        ) : null}
      </div>
    </div>
  );
}
