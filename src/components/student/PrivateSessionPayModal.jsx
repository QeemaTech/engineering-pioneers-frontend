import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Loader2, X } from "lucide-react";
import { postStudentPrivateCheckout } from "../../features/student/financials/api";
import { getErrorMessage } from "../../api/error";

export function formatSessionPrice(price, isRtl) {
  const value = Math.round(Number(price) || 0);
  return isRtl ? `${value} جنيه` : `${value} EGP`;
}

export default function PrivateSessionPayModal({ slot, instructorName, onClose, onSuccess, isRtl }) {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!slot?.price || Number(slot.price) <= 0) {
      const message = t("bookSession.priceNotConfigured");
      setErr(message);
      toast.error(message);
      return;
    }
    const url = receiptUrl.trim();
    if (!url) {
      setErr(t("checkout.package.receiptRequired"));
      return;
    }
    try {
      new URL(url);
    } catch {
      setErr(t("checkout.package.receiptUrlInvalid"));
      return;
    }
    setSubmitting(true);
    try {
      await postStudentPrivateCheckout(slot.id, { paymentMethod, receiptUrl: url });
      toast.success(t("bookSession.success"));
      onSuccess();
    } catch (e2) {
      const message = getErrorMessage(e2, t("bookSession.bookError", { defaultValue: "Booking failed." }));
      setErr(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t("bookSession.payTitle", { defaultValue: "Complete payment" })}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {instructorName || slot.instructor?.fullName} · {new Date(slot.startTime).toLocaleString()}
            </p>
            {slot.price > 0 ? (
              <p className="mt-2 text-lg font-extrabold text-pioneer-orange-normal">{formatSessionPrice(slot.price, isRtl)}</p>
            ) : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="private-pay-method" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("checkout.package.paymentMethod")}
            </label>
            <select
              id="private-pay-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="BANK_TRANSFER">{t("checkout.package.methodBank")}</option>
              <option value="CARD">{t("checkout.package.methodCard")}</option>
              <option value="OTHER">{t("checkout.package.methodOther")}</option>
            </select>
          </div>
          <div>
            <label htmlFor="private-receipt-url" className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("checkout.package.receiptUrl")}
            </label>
            <input
              id="private-receipt-url"
              type="url"
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">{t("checkout.package.receiptHint")}</p>
          </div>
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
              {t("adminPages.common.cancel", { defaultValue: "Cancel" })}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-pioneer-orange-normal px-4 py-2 text-sm font-bold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("bookSession.book")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
