import { Suspense } from "react";

export function adminSuspenseFallback() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400"
      role="status"
      aria-live="polite"
    >
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-pioneer-orange-normal border-t-transparent"
        aria-hidden
      />
      <p className="text-sm font-medium">Loading…</p>
    </div>
  );
}

/** Wrap lazy-loaded admin pages (dashboard shell stays eager). */
export function AdminSuspense({ children }) {
  return <Suspense fallback={adminSuspenseFallback()}>{children}</Suspense>;
}
