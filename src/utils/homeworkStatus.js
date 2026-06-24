/** Map API homework row → UI status key + optional metadata. */
export function deriveHomeworkUiStatus(hw) {
  if (!hw) return { key: "pending" };

  const apiStatus = hw.status;
  const sub = hw.submission;

  if (apiStatus === "COMPLETED" || sub?.status === "GRADED") {
    const max = Number(hw.totalPoints) || 100;
    const g = sub?.grade != null ? Number(sub.grade) : null;
    const pct = g != null ? Math.round((g / max) * 100) : null;
    return { key: "completed", gradePct: pct };
  }
  if (apiStatus === "UNDER_REVIEW") return { key: "underReview" };
  if (apiStatus === "SUBMITTED" || sub?.submittedAt) return { key: "submitted" };

  const now = Date.now();
  const due = new Date(hw.dueDate).getTime();
  if (due < now) {
    const overdueDays = Math.max(1, Math.ceil((now - due) / 86400000));
    return { key: "late", overdueDays };
  }
  const daysLeft = Math.max(0, Math.ceil((due - now) / 86400000));
  return { key: "pending", daysLeft };
}

export const HOMEWORK_STATUS_BADGE = {
  pending: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
  late: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  submitted: "bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300",
  underReview: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
};

export const HOMEWORK_STATUS_LABEL = {
  pending: "homework.status.pending",
  late: "homework.status.late",
  submitted: "homework.status.submitted",
  underReview: "homework.status.underReview",
  completed: "homework.status.completed",
};

export function resolveUploadUrl(fileUrl) {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http") || fileUrl.startsWith("data:")) return fileUrl;
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
  const origin = apiBase.replace(/\/api\/v1\/?$/, "");
  return `${origin}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
}
