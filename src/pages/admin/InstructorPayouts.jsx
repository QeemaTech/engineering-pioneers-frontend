import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import StatsRow from "../../components/ui/StatsRow";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import OtpConfirmModal from "../../components/ui/OtpConfirmModal";
import { useAdminPayouts, useProcessPayout } from "../../features/admin/finance/hooks";
import { getErrorMessage } from "../../api/error";
import toast from "react-hot-toast";

const PAYOUT_STATUSES = ["PENDING", "APPROVED", "REJECTED", "PAID"];

function payoutTone(status) {
  if (status === "PAID") return "success";
  if (status === "APPROVED") return "info";
  if (status === "REJECTED") return "danger";
  return "warning";
}

function InstructorPayouts() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("");
  const [notesById, setNotesById] = useState({});
  const [otpPayoutId, setOtpPayoutId] = useState(null);

  const { data: payouts = [], isLoading, isError, error, refetch, isFetching } = useAdminPayouts({
    ...(statusFilter ? { status: statusFilter } : {}),
  });
  const processMutation = useProcessPayout();

  const paid = useMemo(
    () => payouts.filter((p) => p.status === "PAID").reduce((acc, p) => acc + Number(p.amount || 0), 0),
    [payouts]
  );
  const pendingAmount = useMemo(
    () => payouts.filter((p) => p.status === "PENDING" || p.status === "APPROVED").reduce((acc, p) => acc + Number(p.amount || 0), 0),
    [payouts]
  );
  const nextPending = useMemo(() => {
    const pend = payouts.filter((p) => p.status === "PENDING" || p.status === "APPROVED");
    if (!pend.length) return "—";
    const sorted = [...pend].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return sorted[0].createdAt ? new Date(sorted[0].createdAt).toLocaleDateString() : "—";
  }, [payouts]);

  const runProcess = async (id, status, otpCode) => {
    const adminNotes = notesById[id]?.trim() || undefined;
    try {
      await processMutation.mutateAsync({ id, body: { status, adminNotes, otpCode } });
      toast.success(t("adminPages.payouts.updated", { defaultValue: "Payout updated." }));
      void refetch();
    } catch (e) {
      toast.error(getErrorMessage(e, t("adminPages.payouts.processFailed", { defaultValue: "Could not process payout." })));
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.payouts.title")} subtitle={t("adminPages.payouts.subtitle")} />

      <StatsRow
        items={[
          { key: "paid", label: t("adminPages.payouts.totalPaid"), value: `$${paid.toLocaleString()}` },
          { key: "pending", label: t("adminPages.payouts.pending"), value: `$${pendingAmount.toLocaleString()}` },
          { key: "next", label: t("adminPages.payouts.nextDate"), value: nextPending },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {t("adminPages.payouts.filterStatus", { defaultValue: "Status" })}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ms-2 h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
          >
            <option value="">{t("adminPages.payouts.allStatuses", { defaultValue: "All" })}</option>
            {PAYOUT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-white/10 dark:text-slate-200"
        >
          {isFetching ? t("dashboard.common.loading", { defaultValue: "Refreshing…" }) : t("dashboard.common.refresh", { defaultValue: "Refresh" })}
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
          {t("adminPages.payouts.loading", { defaultValue: "Loading payouts…" })}
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
          {getErrorMessage(error, t("adminPages.payouts.loadError", { defaultValue: "Failed to load payouts." }))}
          <button type="button" onClick={() => void refetch()} className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white">
            {t("adminPages.payouts.retry", { defaultValue: "Retry" })}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <DataTable
          columns={[
            {
              key: "instructor",
              title: t("adminPages.payouts.instructor"),
              render: (_, r) => r?.instructor?.fullName || r?.instructor?.email || "—",
            },
            {
              key: "amount",
              title: t("adminPages.payouts.amount"),
              render: (v) => `$${Number(v || 0).toLocaleString()}`,
            },
            {
              key: "status",
              title: t("adminPages.payouts.status"),
              render: (v) => <StatusBadge label={String(v)} tone={payoutTone(v)} />,
            },
            {
              key: "createdAt",
              title: t("adminPages.payouts.date"),
              render: (v) => (v ? new Date(v).toLocaleString() : "—"),
            },
            {
              key: "adminNotes",
              title: t("adminPages.payouts.notes", { defaultValue: "Admin notes" }),
              render: (_, r) => (
                <input
                  value={notesById[r.id] ?? r.adminNotes ?? ""}
                  onChange={(e) => setNotesById((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  placeholder="—"
                  className="h-8 w-full min-w-[120px] max-w-[200px] rounded border border-slate-200 px-2 text-xs dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              ),
            },
            {
              key: "id",
              title: t("adminPages.common.actions"),
              render: (_, r) => {
                const busy = processMutation.isPending;
                if (r.status === "PAID" || r.status === "REJECTED") {
                  return <span className="text-xs text-slate-400">—</span>;
                }
                return (
                  <div className="flex flex-wrap gap-1">
                    {r.status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void runProcess(r.id, "APPROVED")}
                          className="rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50 dark:bg-slate-600"
                        >
                          {t("adminPages.payouts.approve", { defaultValue: "Approve" })}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void runProcess(r.id, "REJECTED")}
                          className="rounded border border-slate-300 px-2 py-1 text-[10px] font-semibold dark:border-white/20"
                        >
                          {t("adminPages.payouts.reject", { defaultValue: "Reject" })}
                        </button>
                      </>
                    ) : null}
                    {r.status === "PENDING" || r.status === "APPROVED" ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setOtpPayoutId(r.id)}
                        className="rounded bg-pioneer-orange px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50"
                      >
                        {t("adminPages.payouts.payNow")}
                      </button>
                    ) : null}
                  </div>
                );
              },
            },
          ]}
          rows={payouts}
        />
      ) : null}
      <OtpConfirmModal
        open={Boolean(otpPayoutId)}
        purpose="PAYOUT_CONFIRM"
        title={t("adminPages.payouts.otpTitle", { defaultValue: "Confirm payout with OTP" })}
        onClose={() => setOtpPayoutId(null)}
        onVerified={async (code) => {
          if (!otpPayoutId) return;
          await runProcess(otpPayoutId, "PAID", code);
          setOtpPayoutId(null);
        }}
      />
    </section>
  );
}

export default InstructorPayouts;
