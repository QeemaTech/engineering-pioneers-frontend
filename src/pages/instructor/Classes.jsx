import { useState } from "react";
import { useTranslation } from "react-i18next";
import DataTable from "../../components/dashboard/DataTable";
import EmptyState from "../../components/dashboard/EmptyState";
import PageHeader from "../../components/dashboard/PageHeader";
import { useInstructorClasses } from "../../features/instructor/classes/hooks";

function Classes() {
  const { t } = useTranslation();
  const [query, setQuery] = useState({ page: 1, limit: 10, status: "" });
  const { data, isLoading } = useInstructorClasses(query);

  return (
    <section>
      <PageHeader
        title={t("dashboard.instructor.pages.classes.title")}
        subtitle={t("dashboard.instructor.pages.classes.subtitle")}
        actions={
          <select
            value={query.status}
            onChange={(e) => setQuery((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-pioneer-orange-normal"
          >
            <option value="">{t("dashboard.instructor.classes.allStatuses")}</option>
            <option value="UPCOMING">{t("dashboard.instructor.classes.upcoming")}</option>
            <option value="ONGOING">{t("dashboard.instructor.classes.ongoing")}</option>
            <option value="COMPLETED">{t("dashboard.instructor.classes.completed")}</option>
          </select>
        }
      />
      <DataTable
        columns={[
          { key: "title", title: t("dashboard.instructor.classes.titleCol") },
          { key: "type", title: t("dashboard.instructor.classes.type") },
          { key: "status", title: t("dashboard.instructor.classes.status") },
          { key: "scheduledAt", title: t("dashboard.instructor.classes.scheduledAt"), render: (v) => (v ? new Date(v).toLocaleString() : "-") },
        ]}
        rows={data?.classes || []}
        emptyNode={
          <EmptyState
            title={isLoading ? t("dashboard.common.loading") : t("dashboard.instructor.classes.emptyTitle")}
            message={t("dashboard.instructor.classes.emptyDescription")}
          />
        }
      />
    </section>
  );
}

export default Classes;
