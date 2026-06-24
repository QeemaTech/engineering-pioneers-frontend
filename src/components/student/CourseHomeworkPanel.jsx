import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, ClipboardList } from "lucide-react";
import { useHomeworkList } from "../../features/student/homework/hooks";
import { deriveHomeworkUiStatus, HOMEWORK_STATUS_BADGE, HOMEWORK_STATUS_LABEL } from "../../utils/homeworkStatus";

export default function CourseHomeworkPanel({ courseId }) {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useHomeworkList(courseId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <ClipboardList className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-600">
          {t("courseView.homework.empty", { defaultValue: "No homework assigned for this course yet." })}
        </p>
        <Link to="/student/homework" className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
          {t("courseView.homework.viewAll", { defaultValue: "View all homework" })}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        {t("courseView.homework.hint", { defaultValue: "Open an assignment to read instructions and submit your work." })}
      </p>
      <ul className="space-y-3">
        {items.map((hw) => {
          const st = deriveHomeworkUiStatus(hw);
          const badge = HOMEWORK_STATUS_BADGE[st.key] || HOMEWORK_STATUS_BADGE.pending;
          return (
            <li key={hw.id}>
              <Link
                to={`/student/homework/assignment/${hw.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm transition hover:border-pioneer-orange-normal"
              >
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{hw.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {t("homework.due")} {new Date(hw.dueDate).toLocaleDateString()}
                    <span className="mx-1">·</span>
                    {t(`homework.type.${String(hw.type || "TEXT").toUpperCase()}`, { defaultValue: hw.type })}
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
    </div>
  );
}
