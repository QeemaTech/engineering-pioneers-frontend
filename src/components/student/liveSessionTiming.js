import { useEffect, useState } from "react";

export function useSessionTiming(scheduledAt, durationMinutes = 60) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = scheduledAt ? new Date(scheduledAt).getTime() : NaN;
  if (Number.isNaN(start)) return { phase: "unknown", msLeft: 0 };

  const durationMs = Math.max(1, Number(durationMinutes) || 60) * 60 * 1000;
  const end = start + durationMs;

  if (now < start) return { phase: "upcoming", msLeft: start - now };
  if (now < end) return { phase: "live", msLeft: end - now };
  return { phase: "ended", msLeft: 0 };
}

export function splitCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function formatSessionWhen(iso, locale) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString(locale?.startsWith("ar") ? "ar" : undefined, { dateStyle: "medium", timeStyle: "short" });
}
