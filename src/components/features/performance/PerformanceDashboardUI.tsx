import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { BarChart2, ClipboardList, FileText, Star, Video } from "lucide-react";

export type PerformanceQuestionRow = {
  question: string;
  avgRating: number;
  responses: number;
};

export type PerformanceDashboardData = {
  sessions: {
    total: number;
    finished: number;
    pending: number;
    running: number;
    missed?: number;
    liveSessions: number;
    physicalSessions: number;
    transferredSessions: number;
    privateSessions: number;
    avgDurationMinutes: number;
    studentAttendance: {
      present: number;
      totalSlots: number;
      percentage: number;
    };
  };
  recordings: {
    totalFinishedSessions: number;
    recordsUploaded: number;
    uploadedWithin24h: number;
    uploadRatePct: number;
    onTimeRatePct: number;
  };
  checklist: {
    totalSessions: number;
    checklistsSubmitted: number;
  };
  surveys: {
    totalSessions: number;
    surveysSubmitted: number;
  };
  reviews: {
    overallRating: number;
    totalResponses: number;
    distribution: Record<number, number>;
    questionBreakdown: PerformanceQuestionRow[];
  };
};

const tones: Record<string, string> = {
  blue: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  green: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  red: "border-red-500/40 bg-[#EE7C11]/10 text-red-600 dark:text-red-400",
  violet: "border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  orange: "border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  teal: "border-teal-500/40 bg-teal-500/10 text-teal-600 dark:text-teal-400",
  slate: "border-slate-300/80 bg-slate-100 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-200",
};

function MetricTile({ label, value, tone = "slate" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone] || tones.slate}`}>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-90">{label}</div>
    </div>
  );
}

function ProgressRow({ label, pct, left, right }: { label: string; pct: number; left: string; right: string }) {
  const w = Math.min(100, Math.max(0, pct));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="tabular-nums text-slate-500 dark:text-slate-400">{right}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-emerald-500 transition-all dark:bg-emerald-500/90" style={{ width: `${w}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{left}</span>
      </div>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1A1A22] dark:shadow-none">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-pioneer-orange-normal" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export type PerformanceDashboardUIProps = {
  data: PerformanceDashboardData;
};

export function PerformanceDashboardUI({ data }: PerformanceDashboardUIProps) {
  const s = data.sessions;
  const r = data.recordings;
  const att = s.studentAttendance;
  const rev = data.reviews;
  const dist = rev.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const maxDist = Math.max(1, ...[1, 2, 3, 4, 5].map((k) => dist[k] || 0));

  return (
    <div className="space-y-6">
      <SectionCard icon={BarChart2} title="Session statistics">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricTile label="Total sessions" value={s.total} tone="blue" />
          <MetricTile label="Finished" value={s.finished} tone="green" />
          <MetricTile label="Pending" value={s.pending} tone="amber" />
          <MetricTile label="Running" value={s.running} tone="red" />
          <MetricTile label="Live (group)" value={s.liveSessions} tone="blue" />
          <MetricTile label="Private" value={s.privateSessions} tone="violet" />
          <MetricTile label="Transferred" value={s.transferredSessions} tone="orange" />
          <MetricTile label="Avg duration" value={`${s.avgDurationMinutes}m`} tone="teal" />
        </div>
        <div className="mt-6">
          <ProgressRow
            label="Student lesson completion"
            pct={att.percentage}
            left={`${att.percentage}%`}
            right={`${att.present} / ${att.totalSlots}`}
          />
        </div>
      </SectionCard>

      <SectionCard icon={Video} title="Recording link upload">
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <MetricTile label="Finished live sessions" value={r.totalFinishedSessions} tone="blue" />
          <MetricTile label="Records uploaded" value={r.recordsUploaded} tone="green" />
          <MetricTile label="Uploaded within 24h" value={r.uploadedWithin24h} tone="green" />
        </div>
        <div className="space-y-5">
          <ProgressRow
            label="Upload rate"
            pct={r.uploadRatePct}
            left={`${r.uploadRatePct}%`}
            right={`${r.recordsUploaded} / ${r.totalFinishedSessions}`}
          />
          <ProgressRow
            label="On-time rate (within 24h)"
            pct={r.onTimeRatePct}
            left={`${r.onTimeRatePct}%`}
            right={`${r.uploadedWithin24h} / ${r.totalFinishedSessions}`}
          />
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard icon={ClipboardList} title="Checklist completion">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile label="Baseline sessions" value={data.checklist.totalSessions} tone="blue" />
            <MetricTile label="Homework submissions" value={data.checklist.checklistsSubmitted} tone="green" />
          </div>
        </SectionCard>
        <SectionCard icon={FileText} title="Survey completion">
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile label="Baseline sessions" value={data.surveys.totalSessions} tone="blue" />
            <MetricTile label="Cohort reviews" value={data.surveys.surveysSubmitted} tone={data.surveys.surveysSubmitted ? "green" : "red"} />
          </div>
        </SectionCard>
      </div>

      <SectionCard icon={Star} title="Student evaluations">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/5 px-6 py-8 dark:bg-amber-500/10">
            <div className="text-5xl font-black text-amber-500">{rev.overallRating}</div>
            <div className="mt-2 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${i <= Math.round(rev.overallRating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{rev.totalResponses} responses</p>
          </div>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const c = dist[stars] || 0;
              const w = (c / maxDist) * 100;
              return (
                <div key={stars} className="flex items-center gap-2 text-sm">
                  <span className="w-3 font-bold text-slate-600 dark:text-slate-300">{stars}</span>
                  <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${w}%` }} />
                  </div>
                  <span className="w-10 text-end tabular-nums text-slate-600 dark:text-slate-300">{c}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-white/10 dark:bg-white/5">
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Question</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Avg rating</th>
                <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">Responses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {(rev.questionBreakdown || []).map((row, idx) => (
                <tr key={idx} className="dark:hover:bg-white/5">
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{row.question}</td>
                  <td className="px-4 py-3 tabular-nums text-slate-700 dark:text-slate-300">
                    {row.avgRating} <Star className="inline h-4 w-4 fill-amber-400 text-amber-400" />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-400">{row.responses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
