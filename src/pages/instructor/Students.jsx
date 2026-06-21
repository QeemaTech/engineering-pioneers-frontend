import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DataTable from "../../components/dashboard/DataTable";
import EmptyState from "../../components/dashboard/EmptyState";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import { useClassStudents, useInstructorClassesForStudents } from "../../features/instructor/students/hooks";
import { getErrorMessage } from "../../api/error";

function Students() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const courseFromUrl = searchParams.get("course") || searchParams.get("cohort") || "";
  const [selectedClass, setSelectedClass] = useState(courseFromUrl);
  const [notice, setNotice] = useState(null);
  const { data: classes = [] } = useInstructorClassesForStudents({ page: 1, limit: 50 });
  const { data: students = [], error } = useClassStudents(selectedClass);

  const classOptions = useMemo(() => classes.map((c) => ({ id: c.id, title: c.title })), [classes]);

  const rows = useMemo(
    () =>
      students.map((row) => ({
        id: row.student?.id || row.studentId,
        fullName: row.student?.fullName || "—",
        email: row.student?.email || "—",
        purchasedAt: row.purchasedAt ? new Date(row.purchasedAt).toLocaleDateString() : "—",
        progress: `${Math.round(Number(row.progressPercentage) || 0)}%`,
      })),
    [students]
  );

  useEffect(() => {
    if (courseFromUrl) setSelectedClass(courseFromUrl);
  }, [courseFromUrl]);

  useEffect(() => {
    if (error) setNotice({ type: "error", message: getErrorMessage(error, "Failed to load students.") });
  }, [error]);

  return (
    <section>
      <PageHeader
        title={t("dashboard.instructor.pages.students.title")}
        subtitle={t("dashboard.instructor.pages.students.subtitle")}
        actions={
          <select
            value={selectedClass}
            onChange={(e) => {
              setNotice(null);
              setSelectedClass(e.target.value);
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">{t("dashboard.instructor.students.selectCourse")}</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        }
      />
      <Notice type={notice?.type} message={notice?.message} />
      <DataTable
        columns={[
          { key: "fullName", title: t("dashboard.admin.users.name") },
          { key: "email", title: t("dashboard.admin.users.email") },
          { key: "purchasedAt", title: t("dashboard.instructor.students.purchasedAt") },
          { key: "progress", title: t("dashboard.instructor.students.progress") },
          {
            key: "actions",
            title: t("dashboard.common.actions"),
            render: (_, row) => (
              <Link
                to={`/instructor/students/${row.id}`}
                className="font-semibold text-[#EE7C11] hover:underline"
              >
                {t("dashboard.instructor.pages.studentDetail.viewProgress")}
              </Link>
            ),
          },
        ]}
        rows={rows}
        emptyNode={<EmptyState title={t("dashboard.instructor.students.emptyTitle")} message={t("dashboard.instructor.students.emptyDescription")} />}
      />
    </section>
  );
}

export default Students;
