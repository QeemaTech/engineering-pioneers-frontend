import clsx from "clsx";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  PENDING_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

type Props = {
  status: string;
  className?: string;
};

export default function ContentStatusBadge({ status, className }: Props) {
  const key = status?.toUpperCase() || "DRAFT";
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[key] || STATUS_STYLES.DRAFT,
        className
      )}
    >
      {key.replace(/_/g, " ")}
    </span>
  );
}
