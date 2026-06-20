import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Loader2, User } from "lucide-react";
import { useAvailableBookingSlots, useBookSlot } from "../features/student/bookings/hooks";
import { getErrorMessage } from "../api/error";

export default function BookPrivate() {
  const { t } = useTranslation();
  const { data: slots = [], isLoading, isError, refetch } = useAvailableBookingSlots(120);
  const book = useBookSlot();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [needsSubscription, setNeedsSubscription] = useState(false);

  const onBook = async (id) => {
    setErr("");
    setMsg("");
    setNeedsSubscription(false);
    try {
      await book.mutateAsync(id);
      setMsg(t("bookSession.success"));
      toast.success(t("bookSession.success"));
    } catch (e) {
      const code = e?.response?.data?.code;
      const message = getErrorMessage(e, t("bookSession.bookError", { defaultValue: "Booking failed." }));
      if (code === "SUBSCRIPTION_QUOTA") {
        setNeedsSubscription(true);
        const friendly = t("bookSession.needPlan");
        const shown = message || friendly;
        setErr(shown);
        toast.error(shown);
      } else {
        setErr(message);
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <h1 className="text-3xl font-bold text-slate-900">{t("bookSession.title")}</h1>
        <p className="mt-2 text-slate-600">{t("bookSession.subtitle")}</p>
        {msg ? <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">{msg}</p> : null}
        {err ? (
          <div className="mt-4 rounded-xl border border-red-100 bg-[#EE7C11]/10 px-4 py-3 text-sm text-red-800">
            <p>{err}</p>
            {needsSubscription ? (
              <Link
                to="/subscription"
                className="mt-3 inline-flex rounded-lg bg-pioneer-orange-normal px-4 py-2 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
              >
                {t("bookSession.viewPlans")}
              </Link>
            ) : null}
          </div>
        ) : null}
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
                </div>
              </div>
              <button
                type="button"
                disabled={book.isPending}
                onClick={() => void onBook(s.id)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-pioneer-orange-normal px-4 py-2 text-sm font-bold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
              >
                {book.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("bookSession.book")}
              </button>
            </li>
          ))}
        </ul>
        {!isLoading && slots.length === 0 ? <p className="mt-8 text-center text-slate-500">{t("bookSession.empty")}</p> : null}
      </div>
    </div>
  );
}
