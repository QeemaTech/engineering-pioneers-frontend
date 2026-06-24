import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar, User } from "lucide-react";
import PageHeader from "../components/dashboard/PageHeader";
import PrivateSessionPayModal, { formatSessionPrice } from "../components/student/PrivateSessionPayModal";
import { useAvailableBookingSlots } from "../features/student/bookings/hooks";

export default function BookPrivate() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar");
  const [searchParams] = useSearchParams();
  const instructorFilter = searchParams.get("instructor");
  const { data: slots = [], isLoading, isError, refetch } = useAvailableBookingSlots(120);
  const [msg, setMsg] = useState("");
  const [paySlot, setPaySlot] = useState(null);

  const filtered = instructorFilter
    ? slots.filter((s) => s.instructor?.id === instructorFilter)
    : slots;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bookSession.title")}
        subtitle={t("bookSession.subtitle")}
        actions={
          <Link to="/instructors" className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
            {t("publicInstructors.backToList", { defaultValue: "Browse instructors" })}
          </Link>
        }
      />

      {msg ? (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
          {msg}
        </p>
      ) : null}

      {isLoading ? <p className="text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <p className="text-red-600">
          {t("bookSession.loadError")}{" "}
          <button type="button" className="font-semibold text-pioneer-orange-normal hover:underline" onClick={() => void refetch()}>
            {t("takeExam.retry")}
          </button>
        </p>
      ) : null}

      <ul className="space-y-3">
        {filtered.map((s) => (
          <li
            key={s.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/40 dark:bg-[#1E293B]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pioneer-orange-light dark:bg-pioneer-orange-normal/15">
                <Calendar className="h-5 w-5 text-pioneer-orange-normal" />
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                  <User className="h-4 w-4 text-slate-400" />
                  {s.instructor?.fullName || "—"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(s.startTime).toLocaleString()} → {new Date(s.endTime).toLocaleString()}
                </p>
                {s.price > 0 ? (
                  <p className="mt-1 text-sm font-bold text-pioneer-orange-normal">{formatSessionPrice(s.price, isRtl)}</p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPaySlot(s)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2.5 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
            >
              {t("bookSession.book")}
            </button>
          </li>
        ))}
      </ul>

      {!isLoading && filtered.length === 0 ? <p className="py-12 text-center text-slate-500">{t("bookSession.empty")}</p> : null}

      {paySlot ? (
        <PrivateSessionPayModal
          slot={paySlot}
          isRtl={isRtl}
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
