import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/ui/DataTable";
import { useAuditLogs } from "../../features/admin/audit-logs/hooks";

export default function AuditLogs() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useAuditLogs({ page, limit: 20 });
  const logs = data?.logs || [];
  const meta = data?.meta;

  return (
    <section>
      <PageHeader
        title={t("adminPages.auditLogs.title", "Audit logs")}
        subtitle={t("adminPages.auditLogs.subtitle", "Track administrative actions across the platform.")}
      />

      {isError ? (
        <div className="rounded-xl border border-red-100 bg-pioneer-orange-light p-4 text-sm text-red-800">
          {t("adminPages.auditLogs.loadError", "Failed to load audit logs.")}
        </div>
      ) : null}

      <DataTable
        columns={[
          {
            key: "createdAt",
            title: t("adminPages.auditLogs.when", "When"),
            render: (v) => (v ? new Date(String(v)).toLocaleString() : "—"),
          },
          {
            key: "user",
            title: t("adminPages.auditLogs.actor", "Actor"),
            render: (_, r) => r?.user?.fullName || r?.user?.email || r?.userId || "—",
          },
          { key: "action", title: t("adminPages.auditLogs.action", "Action") },
          { key: "entityType", title: t("adminPages.auditLogs.entity", "Entity") },
          {
            key: "entityId",
            title: t("adminPages.auditLogs.entityId", "Entity ID"),
            render: (v) => (
              <span className="font-mono text-xs text-slate-600">{String(v || "").slice(0, 8)}…</span>
            ),
          },
        ]}
        rows={isLoading ? [] : logs}
        pagination={
          meta ? (
            <div className="flex items-center justify-between px-2 py-2 text-sm text-slate-600">
              <span>
                {t("adminPages.pagination.page", { page: meta.page || page, pages: meta.totalPages || 1 })}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={(meta.page || page) <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border px-3 py-1 text-xs disabled:opacity-40"
                >
                  {t("adminPages.pagination.prev")}
                </button>
                <button
                  type="button"
                  disabled={(meta.page || page) >= (meta.totalPages || 1)}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border px-3 py-1 text-xs disabled:opacity-40"
                >
                  {t("adminPages.pagination.next")}
                </button>
              </div>
            </div>
          ) : null
        }
      />
    </section>
  );
}
