import { useTranslation } from "react-i18next";
import { CalendarDays, Clock3, ExternalLink, Radio, Video } from "lucide-react";
import { formatSessionWhen, pad2, splitCountdown, useSessionTiming } from "./liveSessionTiming";

function CountdownUnit({ value, label }) {
  return (
    <div className="flex min-w-[3rem] flex-col items-center rounded-xl bg-white/90 px-2 py-2 shadow-sm dark:bg-slate-800/90">
      <span className="text-xl font-extrabold tabular-nums text-pioneer-orange-normal md:text-2xl">{pad2(value)}</span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
    </div>
  );
}

export function LiveSessionCountdown({ scheduledAt, durationMinutes, compact = false }) {
  const { t } = useTranslation();
  const { phase, msLeft } = useSessionTiming(scheduledAt, durationMinutes);
  const parts = splitCountdown(msLeft);

  if (phase === "unknown") return null;

  if (phase === "ended") {
    return (
      <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-500 dark:border-slate-600 dark:bg-slate-800/50">
        {t("liveSessions.countdown.ended", { defaultValue: "Session ended" })}
      </p>
    );
  }

  if (phase === "live") {
    return (
      <div className="rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-center dark:border-green-500/40 dark:bg-green-500/10">
        <p className="flex items-center justify-center gap-1.5 text-sm font-bold text-green-700 dark:text-green-400">
          <Radio className="h-4 w-4 animate-pulse" />
          {t("liveSessions.countdown.liveNow", { defaultValue: "Live now" })}
        </p>
        {!compact ? (
          <p className="mt-1 text-[11px] text-green-600 dark:text-green-500">
            {t("liveSessions.countdown.endsIn", { defaultValue: "Ends in" })}{" "}
            {parts.hours > 0 ? `${parts.hours}:` : ""}
            {pad2(parts.minutes)}:{pad2(parts.seconds)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-pioneer-orange-normal/25 bg-pioneer-orange-light/40 p-3 dark:bg-pioneer-orange-normal/10">
      <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-wide text-pioneer-orange-normal">
        {t("liveSessions.countdown.startsIn", { defaultValue: "Starts in" })}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {parts.days > 0 ? <CountdownUnit value={parts.days} label={t("liveSessions.countdown.days", { defaultValue: "Days" })} /> : null}
        <CountdownUnit value={parts.hours} label={t("liveSessions.countdown.hours", { defaultValue: "Hrs" })} />
        <CountdownUnit value={parts.minutes} label={t("liveSessions.countdown.minutes", { defaultValue: "Min" })} />
        <CountdownUnit value={parts.seconds} label={t("liveSessions.countdown.seconds", { defaultValue: "Sec" })} />
      </div>
    </div>
  );
}

export default function LiveSessionCard({ session, locale, compact = false, showCourse = true }) {
  const { t } = useTranslation();
  const courseTitle = session.course?.title;
  const instructorName = session.instructor?.fullName || "—";
  const whenLabel = formatSessionWhen(session.scheduledAt, locale);
  const durationLabel =
    session.durationMinutes != null && session.durationMinutes > 0
      ? t("recordings.durationMinutes", { n: session.durationMinutes })
      : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
      <div className="relative overflow-hidden bg-gradient-to-br from-pioneer-orange-dark to-pioneer-orange-normal p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {showCourse && courseTitle ? (
              <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                {courseTitle}
              </span>
            ) : null}
            <h3 className="text-base font-bold leading-snug text-white">{session.title}</h3>
            <p className="mt-1 text-sm text-white/85">{instructorName}</p>
          </div>
          <Video className="h-8 w-8 shrink-0 text-white/80" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {whenLabel}
          </span>
          {durationLabel ? (
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {durationLabel}
            </span>
          ) : null}
        </div>

        <LiveSessionCountdown scheduledAt={session.scheduledAt} durationMinutes={session.durationMinutes} compact={compact} />

        {session.meetingUrl ? (
          <a
            href={session.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal py-2.5 text-sm font-semibold text-white transition hover:bg-pioneer-orange-hover"
          >
            <ExternalLink className="h-4 w-4" />
            {t("recordings.joinLive")}
          </a>
        ) : (
          <p className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-800/50">
            {t("recordings.noMeetingLink")}
          </p>
        )}
      </div>
    </article>
  );
}
