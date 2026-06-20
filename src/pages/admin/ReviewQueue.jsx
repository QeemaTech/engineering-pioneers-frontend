import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ContentStatusBadge from "../../components/ui/ContentStatusBadge";
import {
  useApproveCourse,
  useRejectCourse,
  useReviewQueue,
} from "../../features/admin/courses/hooks";
import { getErrorMessage } from "../../api/error";

export default function ReviewQueue() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useReviewQueue({ page: 1, limit: 50 });
  const approveMutation = useApproveCourse();
  const rejectMutation = useRejectCourse();
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const courses = data?.courses || [];

  const handleApprove = async (courseId) => {
    try {
      await approveMutation.mutateAsync({ courseId });
      toast.success(t("adminPages.reviewQueue.approved", "Course approved"));
      void refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.reviewQueue.approveFailed", "Approval failed")));
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectReason.trim()) return;
    try {
      await rejectMutation.mutateAsync({
        courseId: rejectingId,
        rejectionReason: rejectReason.trim(),
      });
      toast.success(t("adminPages.reviewQueue.rejected", "Course rejected"));
      setRejectingId(null);
      setRejectReason("");
      void refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.reviewQueue.rejectFailed", "Rejection failed")));
    }
  };

  return (
    <section>
      <PageHeader
        title={t("adminPages.reviewQueue.title", "Review queue")}
        subtitle={t("adminPages.reviewQueue.subtitle", "Courses awaiting content review.")}
      />

      {isError ? (
        <div className="rounded-xl border border-red-100 bg-pioneer-orange-light p-4 text-sm text-red-800">
          {t("adminPages.reviewQueue.loadError", "Failed to load review queue.")}
        </div>
      ) : null}

      <DataTable
        columns={[
          {
            key: "title",
            title: t("dashboard.admin.courses.titleCol", "Course"),
            render: (v, row) => (
              <Link to={`/admin/courses/${row.id}/edit`} className="font-semibold text-pioneer-orange hover:underline">
                {v}
              </Link>
            ),
          },
          {
            key: "status",
            title: t("adminPages.reviewQueue.status", "Status"),
            render: (v) => <ContentStatusBadge status={String(v || "PENDING_REVIEW")} />,
          },
          {
            key: "instructor",
            title: t("adminPages.reviewQueue.instructor", "Instructor"),
            render: (_, r) => r?.instructor?.fullName || "—",
          },
          {
            key: "id",
            title: t("adminPages.common.actions", "Actions"),
            render: (_, r) => (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleApprove(r.id)}
                  disabled={approveMutation.isPending}
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  {t("adminPages.reviewQueue.approve", "Approve")}
                </button>
                <button
                  type="button"
                  onClick={() => setRejectingId(r.id)}
                  className="rounded-lg border border-red-300 px-3 py-1 text-xs font-semibold text-red-700"
                >
                  {t("adminPages.reviewQueue.reject", "Reject")}
                </button>
              </div>
            ),
          },
        ]}
        rows={isLoading ? [] : courses}
      />

      {rejectingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-pioneer-dark-card">
            <h3 className="text-lg font-semibold">{t("adminPages.reviewQueue.rejectTitle", "Reject course")}</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="mt-3 w-full rounded-lg border px-3 py-2 text-sm dark:border-white/10 dark:bg-pioneer-dark-bg dark:text-white"
              placeholder={t("adminPages.reviewQueue.rejectPlaceholder", "Reason for rejection…")}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setRejectingId(null)} className="rounded-lg px-4 py-2 text-sm">
                {t("common.cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={() => void handleReject()}
                disabled={rejectMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                {t("adminPages.reviewQueue.confirmReject", "Confirm reject")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
