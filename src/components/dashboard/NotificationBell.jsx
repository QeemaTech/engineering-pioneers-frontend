import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell } from "lucide-react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../../features/student/notifications/hooks";

export default function NotificationBell({ variant = "dashboard" }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data: items = [], isLoading } = useNotifications();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const list = Array.isArray(items) ? items : [];
  const unread = list.filter((n) => !n.isRead).length;

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const buttonClass =
    variant === "dashboard"
      ? `relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors sm:h-10 sm:w-10 ${
          open
            ? "bg-pioneer-orange text-white"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
        }`
      : "relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-pioneer-orange-normal";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("header.notifications")}
        className={buttonClass}
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {unread > 0 ? (
          <span className="absolute end-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-pioneer-orange-normal px-0.5 text-[10px] font-bold text-white ring-2 ring-pioneer-light-card dark:ring-pioneer-dark-card">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute end-0 z-50 mt-3 w-[min(20rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-slate-200 bg-pioneer-light-card shadow-md sm:mt-4 sm:w-80 sm:max-w-none dark:border-slate-800 dark:bg-[#1E293B] dark:shadow-2xl dark:shadow-black/50">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t("header.notifications")}</h3>
            <button
              type="button"
              onClick={() => markAll.mutate()}
              disabled={unread === 0 || markAll.isPending}
              className="text-[10px] font-bold text-pioneer-orange-normal hover:underline disabled:opacity-50"
            >
              {t("header.notificationsMarkAll")}
            </button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? <p className="px-4 py-6 text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
            {!isLoading && list.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">{t("header.notificationsEmpty")}</p>
            ) : null}
            {list.slice(0, 20).map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  if (!n.isRead) markOne.mutate(n.id);
                }}
                className={`block w-full border-b border-slate-100 px-4 py-3 text-start transition last:border-0 dark:border-slate-700 ${
                  n.isRead ? "text-slate-600 dark:text-slate-400" : "bg-pioneer-orange-light/20 dark:bg-pioneer-orange-normal/10"
                }`}
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">{n.message}</p>
                {n.createdAt ? (
                  <p className="mt-2 text-[10px] font-medium text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
