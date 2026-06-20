import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DataTable from "../../components/dashboard/DataTable";
import EmptyState from "../../components/dashboard/EmptyState";
import PageHeader from "../../components/dashboard/PageHeader";
import { useInstructorClasses } from "../../features/instructor/classes/hooks";

function Cohorts() {
  const { t } = useTranslation();
  const [query, setQuery] = useState({ page: 1, limit: 10, status: "" });
  const { data, isLoading } = useInstructorClasses(query);

  const rows = (data?.classes || []).map((c) => ({
    ...c,
    courseTitle: c.course?.title || "—",
    startLabel: c.startDate ? new Date(c.startDate).toLocaleString() : "—",
  }));

  return (
    <section>
      <PageHeader
        title={t("dashboard.instructor.pages.cohorts.title")}
        subtitle={t("dashboard.instructor.pages.cohorts.subtitle")}
        actions={
          <select
            value={query.status}
            onChange={(e) => setQuery((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-pioneer-orange-normal dark:border-white/10 dark:bg-[#1A1A22] dark:text-white"
          >
            <option value="">{t("dashboard.instructor.cohorts.allStatuses")}</option>
            <option value="UPCOMING">{t("dashboard.instructor.cohorts.upcoming")}</option>
            <option value="ONGOING">{t("dashboard.instructor.cohorts.ongoing")}</option>
            <option value="COMPLETED">{t("dashboard.instructor.cohorts.completed")}</option>
          </select>
        }
      />
      <DataTable
        columns={[
          { key: "name", title: t("dashboard.instructor.cohorts.nameCol") },
          { key: "courseTitle", title: t("dashboard.instructor.cohorts.courseCol") },
          { key: "type", title: t("dashboard.instructor.cohorts.type") },
          { key: "status", title: t("dashboard.instructor.cohorts.status") },
          { key: "startLabel", title: t("dashboard.instructor.cohorts.startDate") },
          {
            key: "id",
            title: t("dashboard.instructor.cohorts.students"),
            render: (_, row) => (
              <Link to={`/instructor/students?cohort=${row.id}`} className="font-semibold text-pioneer-orange-normal hover:underline">
                View
              </Link>
            ),
          },
        ]}
        rows={rows}
        emptyNode={
          <EmptyState
            title={isLoading ? t("dashboard.common.loading") : t("dashboard.instructor.cohorts.emptyTitle")}
            message={t("dashboard.instructor.cohorts.emptyDescription")}
          />
        }
      />
    </section>
  );
}

export default Cohorts;
