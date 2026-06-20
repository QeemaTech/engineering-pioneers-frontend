import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import DataTable from "../../components/dashboard/DataTable";
import Notice from "../../components/dashboard/Notice";
import PageHeader from "../../components/dashboard/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import { getErrorMessage } from "../../api/error";
import { useRequestPayout, useWalletPayouts, useWalletSummary, useWalletTransactions } from "../../features/instructor/wallet/hooks";

const payoutSchema = z.object({
  amount: z.coerce.number().positive(),
});

function Wallet() {
  const { t } = useTranslation();
  const [notice, setNotice] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const { data: summary } = useWalletSummary();
  const { data: transactions } = useWalletTransactions({ page: 1, limit: 20 });
  const { data: payouts } = useWalletPayouts();
  const requestMutation = useRequestPayout();

  const form = useForm({
    resolver: zodResolver(payoutSchema),
    defaultValues: { amount: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setNotice(null);
    try {
      await requestMutation.mutateAsync(values);
      setNotice({ type: "success", message: "Payout requested successfully." });
      setOpenModal(false);
      form.reset();
    } catch (err) {
      setNotice({ type: "error", message: getErrorMessage(err, "Payout request failed.") });
    }
  });

  return (
    <section>
      <PageHeader
        title={t("dashboard.instructor.pages.wallet.title")}
        subtitle={t("dashboard.instructor.pages.wallet.subtitle")}
        actions={
          <button onClick={() => setOpenModal(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 text-sm font-semibold text-white">
            <DollarSign className="h-4 w-4" /> {t("dashboard.instructor.wallet.requestPayout")}
          </button>
        }
      />

      <Notice type={notice?.type} message={notice?.message} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label={t("dashboard.instructor.wallet.balance")} value={summary?.balance ?? 0} />
        <StatCard label={t("dashboard.instructor.wallet.totalEarned")} value={summary?.totalEarned ?? 0} />
        <StatCard label={t("dashboard.instructor.wallet.totalWithdrawn")} value={summary?.totalWithdrawn ?? 0} />
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.instructor.wallet.transactions")}</h3>
          <DataTable
            columns={[
              { key: "type", title: "Type" },
              { key: "amount", title: "Amount" },
              { key: "description", title: "Description" },
              { key: "createdAt", title: "Date", render: (v) => (v ? new Date(v).toLocaleString() : "-") },
            ]}
            rows={transactions?.transactions || []}
          />
        </div>
        <div>
          <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.instructor.wallet.payoutHistory")}</h3>
          <DataTable
            columns={[
              { key: "amount", title: "Amount" },
              { key: "status", title: "Status" },
              {
                key: "payoutDetails",
                title: "Payout Details",
                render: (v) => {
                  if (!v) return "-";
                  if (typeof v === "string") return v;
                  const bank = v.bankName || v.bank || "";
                  const holder = v.accountHolderName || v.accountName || "";
                  const acct = v.accountNumber ? String(v.accountNumber).slice(-4) : "";
                  return [bank, holder, acct ? `****${acct}` : ""].filter(Boolean).join(" · ") || "-";
                },
              },
              { key: "createdAt", title: "Requested", render: (v) => (v ? new Date(v).toLocaleString() : "-") },
              { key: "processedAt", title: "Processed", render: (v) => (v ? new Date(v).toLocaleString() : "-") },
            ]}
            rows={payouts || []}
          />
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1A1A22]">
            <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">{t("dashboard.instructor.wallet.requestPayout")}</h3>
            <input
              {...form.register("amount")}
              placeholder="Amount"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
              >
                {t("dashboard.common.cancel")}
              </button>
              <button type="submit" disabled={requestMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2 text-sm font-semibold text-white">
                {requestMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} {t("dashboard.common.submit")}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Wallet;
