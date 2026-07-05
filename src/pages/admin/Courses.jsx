import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Play, Pencil, Trash2, ExternalLink, Loader2, FileText } from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "../../components/dashboard/DataTable";
import EmptyState from "../../components/dashboard/EmptyState";
import PageHeader from "../../components/dashboard/PageHeader";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import { useAdminInstructors } from "../../features/admin/instructors/hooks";
import { useAssignAdminCourseInstructor } from "../../features/admin/courses/hooks";
import ContentStatusBadge from "../../components/ui/ContentStatusBadge";
import { useDeleteAdminCourse, useSubmitCourseForReview, useUpdateAdminCourse } from "../../features/admin/courses/hooks";
import { getErrorMessage } from "../../api/error";
import client from "../../api/client";

function Courses() {
  const { t } = useTranslation();
  const [query, setQuery] = useState({ page: 1, limit: 10, search: "" });
  const { data, isLoading } = useAdminCourses(query);
  const { data: instructorsData } = useAdminInstructors({ page: 1, limit: 100 });
  const assignMutation = useAssignAdminCourseInstructor();
  const updateMutation = useUpdateAdminCourse();
  const submitReviewMutation = useSubmitCourseForReview();
  const instructors = instructorsData?.instructors || [];

  const deleteMutation = useDeleteAdminCourse();
  const [downloadingCourseId, setDownloadingCourseId] = useState(null);

  const handleDownloadReviewsPdf = async (courseId) => {
    setDownloadingCourseId(courseId);
    try {
      const response = await client.get(`/admin/reviews/export-pdf?courseId=${courseId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `course-reviews-${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(t("adminPages.courses.pdfSuccess", { defaultValue: "Reviews PDF downloaded successfully!" }));
    } catch (e) {
      toast.error(t("adminPages.courses.pdfError", { defaultValue: "Failed to download reviews PDF report." }));
    } finally {
      setDownloadingCourseId(null);
    }
  };

  const submitForReview = async (course) => {
    try {
      await submitReviewMutation.mutateAsync(course.id);
      toast.success(t("adminPages.courses.submittedForReview", "Submitted for review"));
    } catch (err) {
      toast.error(getErrorMessage(err, t("adminPages.courses.submitFailed", "Submit failed")));
    }
  };

  const toggleStatus = async (course) => {
    try {
      await updateMutation.mutateAsync({
        id: course.id,
        body: { isActive: !course.isActive },
      });
      toast.success(
        !course.isActive
          ? t("dashboard.admin.courses.activated")
          : t("dashboard.admin.courses.deactivated")
      );
    } catch (err) {
      toast.error(getErrorMessage(err, t("dashboard.admin.courses.statusUpdateFailed")));
    }
  };

  return (
    <section>
      <PageHeader
        title={t("dashboard.admin.pages.courses.title")}
        subtitle={t("dashboard.admin.pages.courses.subtitle")}
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query.search}
              onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              placeholder={t("dashboard.common.search")}
              className="h-10 w-64 rounded-lg border border-slate-200 bg-white ps-9 pe-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11]/20 dark:border-white/10 dark:bg-[#1A1A22] dark:text-white"
            />
          </div>
        }
      />

      <DataTable
        columns={[
          { 
            key: "title", 
            title: t("dashboard.admin.courses.titleCol"),
            render: (value, row) => (
              <div className="group/item relative flex items-center gap-3">
                <Link to={`/admin/courses/${row.id}/edit`} className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200 relative dark:bg-[#252530] dark:border-white/5">
                  {row.thumbnail ? (
                    <img src={row.thumbnail} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-white/5">
                      <Play className="h-5 w-5 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Pencil className="h-5 w-5 text-white" />
                  </div>
                </Link>
                <div className="flex flex-col">
                  <Link to={`/admin/courses/${row.id}/edit`} className="font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-[#EE7C11] transition-colors">{value}</Link>
                  <span className="text-[11px] text-slate-500">ID: {row.id.slice(0, 8)}...</span>
                </div>
              </div>
            )
          },
          {
            key: "introVideoUrl",
            title: t("dashboard.admin.courses.introVideo"),
            render: (value) =>
              value ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {t("dashboard.admin.courses.open")} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-xs text-slate-400">-</span>
              ),
          },
          { key: "instructor", title: t("dashboard.admin.courses.instructor"), render: (_, row) => row?.instructor?.fullName || "-" },
          {
            key: "status",
            title: t("adminPages.courses.contentStatus", "Content status"),
            render: (v, row) => <ContentStatusBadge status={String(row.status || v || "DRAFT")} />,
          },
          {
            key: "isActive", 
            title: t("dashboard.admin.courses.status"), 
            render: (v, row) => (
              <button 
                onClick={() => toggleStatus(row)}
                disabled={updateMutation.isPending}
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${
                  v ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-slate-500/10 text-slate-500 border border-slate-200 dark:border-white/5"
                }`}
              >
                {updateMutation.isPending && updateMutation.variables?.id === row.id ? (
                  <Loader2 className="me-1 h-3 w-3 animate-spin" />
                ) : null}
                {v ? t("dashboard.common.active") : t("dashboard.common.inactive")}
              </button>
            )
          },
          {
            key: "assign",
            title: t("dashboard.admin.courses.assignInstructor"),
            render: (_, row) => (
              <div className="relative">
                <select
                  disabled={assignMutation.isPending}
                  defaultValue={row?.instructor?.id || ""}
                  onChange={(e) => e.target.value && assignMutation.mutate({ id: row.id, instructorId: e.target.value })}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-[#EE7C11] disabled:opacity-60 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                >
                  <option value="">{t("dashboard.admin.courses.selectInstructor")}</option>
                  {instructors.map((i) => (
                    <option key={i.id} value={i.id}>{i.fullName}</option>
                  ))}
                </select>
                {assignMutation.isPending && assignMutation.variables?.id === row.id && (
                  <Loader2 className="absolute end-8 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-[#EE7C11]" />
                )}
              </div>
            ),
          },
          {
            key: "actions",
            title: t("adminPages.common.actions"),
            render: (_, row) => (
              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/courses/${row.id}/edit`}
                  className="inline-flex rounded-md p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                  title={t("dashboard.admin.courses.deepEdit")}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => void handleDownloadReviewsPdf(row.id)}
                  disabled={downloadingCourseId === row.id}
                  className="inline-flex rounded-md p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-40"
                  title={t("adminPages.courses.downloadReviews", { defaultValue: "Download reviews PDF report" })}
                >
                  {downloadingCourseId === row.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => void submitForReview(row)}
                  disabled={submitReviewMutation.isPending || String(row.status || "").toUpperCase() !== "DRAFT"}
                  className="inline-flex rounded-md p-2 text-amber-600 hover:bg-amber-50 disabled:opacity-40"
                  title={t("adminPages.courses.submitForReview", "Submit for review")}
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm(t("dashboard.admin.courses.deleteConfirm"))) return;
                    try {
                      await deleteMutation.mutateAsync(row.id);
                      toast.success(t("dashboard.admin.courses.deleted"));
                    } catch {
                      toast.error(t("dashboard.admin.courses.deleteFailed"));
                    }
                  }}
                  className="inline-flex rounded-md p-2 text-red-500 hover:bg-[#EE7C11]/10 dark:hover:bg-[#EE7C11]/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
          { key: "createdAt", title: t("dashboard.admin.courses.createdAt"), render: (v) => <span className="text-slate-500">{v ? new Date(v).toLocaleDateString() : "-"}</span> },
        ]}
        rows={data?.courses || []}
        emptyNode={
          <EmptyState
            title={isLoading ? t("dashboard.common.loading") : t("dashboard.admin.courses.emptyTitle")}
            message={t("dashboard.admin.courses.emptyDescription")}
          />
        }
      />
    </section>
  );
}

export default Courses;
