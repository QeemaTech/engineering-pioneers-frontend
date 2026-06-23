import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/dashboard/PageHeader";
import { useMyPayments } from "../../features/student/financials/hooks";
import { getErrorMessage } from "../../api/error";

const STATUS_CLASS = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-700",
  PAID: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
};

function formatAmount(amount, currency = "EGP") {
  const n = Number(amount) || 0;
  return `${Math.round(n).toLocaleString()} ${currency}`;
}

export default function Payments() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data: payments = [], isLoading, isError, error, refetch } = useMyPayments();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("student.payments.title", { defaultValue: "Payments" })}
        subtitle={t("student.payments.subtitle", { defaultValue: "Track your course purchase requests and receipts." })}
      />

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <div className="text-sm text-red-600">
          <p>{getErrorMessage(error, t("student.payments.loadError", { defaultValue: "Could not load payments." }))}</p>
          <button type="button" onClick={() => void refetch()} className="mt-2 font-semibold text-pioneer-orange-normal hover:underline">
            {t("takeExam.retry")}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && payments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center dark:border-slate-700">
          <p className="text-slate-600">{t("student.payments.empty", { defaultValue: "No payment requests yet." })}</p>
          <Link to="/explore" className="mt-4 inline-flex rounded-xl bg-pioneer-orange-normal px-5 py-2.5 text-sm font-bold text-white hover:bg-pioneer-orange-hover">
            {t("student.overview.exploreCta", { defaultValue: "Explore courses" })}
          </Link>
        </div>
      ) : null}

      {!isLoading && !isError && payments.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white dark:border-slate-700/40 dark:bg-[#1E293B]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-start text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
                <th className="px-4 py-3">{t("student.payments.colCourse", { defaultValue: "Course / item" })}</th>
                <th className="px-4 py-3">{t("student.payments.colAmount", { defaultValue: "Amount" })}</th>
                <th className="px-4 py-3">{t("student.payments.colStatus", { defaultValue: "Status" })}</th>
                <th className="px-4 py-3">{t("student.payments.colDate", { defaultValue: "Date" })}</th>
                <th className="px-4 py-3">{t("student.payments.colReceipt", { defaultValue: "Receipt" })}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const label = p.course?.title || p.liveSession?.title || t("student.payments.unknownItem", { defaultValue: "Payment" });
                const status = String(p.status || "PENDING").toUpperCase();
                return (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 dark:border-slate-700/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{label}</td>
                    <td className="px-4 py-3" dir="ltr">{formatAmount(p.amount, p.currency || "EGP")}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASS[status] || "bg-slate-100 text-slate-700"}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString(isRtl ? "ar" : undefined) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {p.receiptUrl ? (
                        <a href={p.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-pioneer-orange-normal hover:underline">
                          {t("student.payments.viewReceipt", { defaultValue: "View" })} <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
