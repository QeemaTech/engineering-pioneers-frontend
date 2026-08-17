import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ClipboardList } from "lucide-react";
import client from "../../api/client";
import endpoints from "../../api/endpoints";

export async function fetchCourseExams(courseId) {
  const res = await client.get(endpoints.student.courseExams(courseId));
  return res?.data?.data ?? [];
}

export default function CourseExamsPanel({ courseId }) {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["student", "course-exams", courseId],
    queryFn: () => fetchCourseExams(courseId),
    enabled: !!courseId,
    retry: false,
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <ClipboardList className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-slate-600">
          {t("courseView.exams.empty", { defaultValue: "No exams for this course yet." })}
        </p>
        <Link to="/student/exams" className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
          {t("courseView.exams.viewAll", { defaultValue: "View all exams" })}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        {t("courseView.exams.hint", { defaultValue: "Open an exam to start or review your result." })}
      </p>
      <ul className="space-y-3">
        {items.map((exam) => (
          <li key={exam.id}>
            <Link
              to={`/student/exams/${exam.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm transition hover:border-pioneer-orange-normal"
            >
              <div className="min-w-0">
                <p className="font-bold text-slate-900">{exam.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {exam.durationMinutes != null ? `${exam.durationMinutes} min` : ""}
                  {exam.scheduledAt ? ` · ${new Date(exam.scheduledAt).toLocaleString()}` : ""}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {exam.status || "EXAM"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
