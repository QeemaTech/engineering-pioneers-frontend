import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Calendar, Loader2, User, X } from "lucide-react";
import { useAvailableBookingSlots } from "../features/student/bookings/hooks";
import { postStudentPrivateCheckout } from "../features/student/financials/api";
import { getErrorMessage } from "../api/error";

function PayModal({ slot, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
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
              {slot.instructor?.fullName} · {new Date(slot.startTime).toLocaleString()}
            </p>
            {slot.price > 0 ? (
              <p className="mt-2 text-lg font-extrabold text-pioneer-orange-normal">${Number(slot.price).toFixed(0)}</p>
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

export default function BookPrivate() {
  const { t } = useTranslation();
  const { data: slots = [], isLoading, isError, refetch } = useAvailableBookingSlots(120);
  const [msg, setMsg] = useState("");
  const [paySlot, setPaySlot] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <h1 className="text-3xl font-bold text-slate-900">{t("bookSession.title")}</h1>
        <p className="mt-2 text-slate-600">{t("bookSession.subtitle")}</p>
        {msg ? <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{msg}</p> : null}
        {isLoading ? <p className="mt-8 text-slate-500">{t("dashboard.common.loading")}</p> : null}
        {isError ? (
          <p className="mt-8 text-red-600">
            {t("bookSession.loadError")}{" "}
            <button type="button" className="font-semibold text-pioneer-orange-normal hover:underline" onClick={() => void refetch()}>
              {t("takeExam.retry")}
            </button>
          </p>
        ) : null}
        <ul className="mt-8 space-y-3">
          {slots.map((s) => (
            <li key={s.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pioneer-orange-light">
                  <Calendar className="h-5 w-5 text-pioneer-orange-normal" />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <User className="h-4 w-4 text-slate-400" />
                    {s.instructor?.fullName || "—"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(s.startTime).toLocaleString()} → {new Date(s.endTime).toLocaleString()}
                  </p>
                  {s.price > 0 ? (
                    <p className="mt-1 text-sm font-bold text-pioneer-orange-normal">${Number(s.price).toFixed(0)}</p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaySlot(s)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-pioneer-orange-normal px-4 py-2 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
              >
                {t("bookSession.book")}
              </button>
            </li>
          ))}
        </ul>
        {!isLoading && slots.length === 0 ? <p className="mt-8 text-center text-slate-500">{t("bookSession.empty")}</p> : null}
      </div>

      {paySlot ? (
        <PayModal
          slot={paySlot}
          onClose={() => setPaySlot(null)}
          onSuccess={() => {
            setPaySlot(null);
            setMsg(t("bookSession.success"));
            void refetch();
          }}
        />
      ) : null}
    </div>
  );
}
