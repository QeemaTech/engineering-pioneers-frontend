import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileQuestion, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import DataTable from "../../components/dashboard/DataTable";
import EmptyState from "../../components/dashboard/EmptyState";
import { getErrorMessage } from "../../api/error";
import { useInstructorClasses } from "../../features/instructor/classes/hooks";
import { useDeleteInstructorExam, useInstructorExams } from "../../features/instructor/exams/hooks";
import CreateExamModal from "./CreateExamModal";
import EditExamModal from "./EditExamModal";

function scopeLabel(exam, t) {
  if (exam.lesson?.title) {
    const u = exam.unit?.title ? `${exam.unit.title} · ` : "";
    return `${u}${exam.lesson.title}`;
  }
  if (exam.unit?.title) return exam.unit.title;
  if (exam.course?.title)
    return `${t("dashboard.instructor.exams.wholeCourse")} · ${exam.course.title}`;
  return "—";
}

function ExamStatusBadge({ status, t }) {
  const styles = {
    AVAILABLE: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    UPCOMING: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    COMPLETED: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    EXPIRED: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${styles[status] || styles.COMPLETED}`}>
      {t(`dashboard.instructor.exams.statusLabels.${status}`, { defaultValue: status })}
    </span>
  );
}

const SEARCH_INPUT =
  "h-10 w-full rounded-xl border border-slate-200 bg-white ps-10 pe-3 text-sm text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/15 dark:bg-[#12121a] dark:text-slate-100 sm:w-64";

function Exams() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState({ search: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const { data, isLoading, isError, error, refetch } = useInstructorExams({
    search: query.search || undefined,
  });
  const deleteMutation = useDeleteInstructorExam();
  const { data: classesData } = useInstructorClasses({ page: 1, limit: 200 });

  const courses = useMemo(() => {
    return (classesData?.classes || []).map((c) => ({ id: c.id, title: c.title }));
  }, [classesData]);

  const exams = data?.exams || [];

  const handleDeleteExam = async (row) => {
    const submissions = row._count?.submissions ?? 0;
    const warnMsg =
      submissions > 0
        ? t("dashboard.instructor.exams.delete.warnWithSubmissions", {
            defaultValue: `This exam has ${submissions} student submission(s). Deleting it is permanent and cannot be undone. Continue?`,
            count: submissions,
          })
        : t("dashboard.instructor.exams.delete.warn", {
            defaultValue: "Delete this exam permanently? This cannot be undone.",
          });
    if (!window.confirm(warnMsg)) return;
    try {
      await deleteMutation.mutateAsync(row.id);
      toast.success(t("dashboard.instructor.exams.delete.success", { defaultValue: "Exam deleted." }));
      void refetch();
    } catch (e) {
      toast.error(getErrorMessage(e, t("dashboard.instructor.exams.delete.error", { defaultValue: "Could not delete exam." })));
    }
  };

  const stats = useMemo(() => {
    const totalQuestions = exams.reduce((n, e) => n + (e._count?.questions ?? 0), 0);
    const totalSubmissions = exams.reduce((n, e) => n + (e._count?.submissions ?? 0), 0);
    return { count: exams.length, totalQuestions, totalSubmissions };
  }, [exams]);

  return (
    <section className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-slate-900 dark:text-white">
            {t("dashboard.instructor.pages.exams.title")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("dashboard.instructor.pages.exams.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#d9700e]"
        >
          <Plus className="h-4 w-4" />
          {t("dashboard.instructor.exams.createExam")}
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t("dashboard.instructor.exams.stats.total"), value: stats.count },
          { label: t("dashboard.instructor.exams.stats.questions"), value: stats.totalQuestions },
          { label: t("dashboard.instructor.exams.stats.submissions"), value: stats.totalSubmissions },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#1A1A22]"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-auto">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query.search}
            onChange={(e) => setQuery({ search: e.target.value })}
            placeholder={t("dashboard.common.search")}
            className={SEARCH_INPUT}
          />
        </div>
        <p className="text-xs text-slate-400">
          {t("dashboard.instructor.exams.showing", { count: exams.length })}
        </p>
      </div>

      {isError && (
        <p className="text-sm text-red-600">
          {getErrorMessage(error, "Failed to load exams.")}{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            {t("dashboard.common.retry")}
          </button>
        </p>
      )}

      <DataTable
        columns={[
          {
            key: "title",
            title: t("dashboard.instructor.exams.titleCol"),
            render: (v, row) => (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EE7C11]/10 text-[#EE7C11]">
                  <FileQuestion className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{v}</p>
                  {row.course?.title ? (
                    <p className="text-xs text-slate-400">{row.course.title}</p>
                  ) : null}
                </div>
              </div>
            ),
          },
          {
            key: "scope",
            title: t("dashboard.instructor.exams.scope"),
            render: (_, row) => (
              <span className="text-xs text-slate-600 dark:text-slate-300">{scopeLabel(row, t)}</span>
            ),
          },
          {
            key: "durationMinutes",
            title: t("dashboard.instructor.exams.duration"),
            render: (v) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {v} {t("dashboard.instructor.exams.minutesShort")}
              </span>
            ),
          },
          {
            key: "totalPoints",
            title: t("dashboard.instructor.exams.points"),
            render: (v, row) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {row._count?.questions ?? 0} / {v}
              </span>
            ),
          },
          {
            key: "status",
            title: t("dashboard.instructor.exams.status"),
            render: (v) => <ExamStatusBadge status={v} t={t} />,
          },
          {
            key: "_count",
            title: t("dashboard.instructor.exams.submissionsCount"),
            render: (c) => (
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{c?.submissions ?? 0}</span>
            ),
          },
          {
            key: "id",
            title: t("dashboard.common.actions"),
            render: (_, row) => (
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  to={`/instructor/exams/${row.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#EE7C11]/10 px-3 py-1.5 text-xs font-bold text-[#EE7C11] hover:bg-[#EE7C11]/20"
                >
                  {t("dashboard.instructor.exams.details")}
                </Link>
                <button
                  type="button"
                  onClick={() => setEditExam(row)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {t("dashboard.common.edit", { defaultValue: "Edit" })}
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => void handleDeleteExam(row)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-500/20 disabled:opacity-50 dark:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("dashboard.common.delete", { defaultValue: "Delete" })}
                </button>
              </div>
            ),
          },
        ]}
        rows={exams}
        emptyNode={
          <EmptyState
            title={isLoading ? t("dashboard.common.loading") : t("dashboard.instructor.exams.emptyTitle")}
            message={t("dashboard.instructor.exams.emptyDescription")}
          />
        }
      />

      {editExam ? (
        <EditExamModal exam={editExam} onClose={() => setEditExam(null)} onSaved={() => void refetch()} />
      ) : null}

      {createOpen ? (
        <CreateExamModal
          courses={courses}
          onClose={() => setCreateOpen(false)}
          onCreated={(exam) => {
            setCreateOpen(false);
            if (exam?.id) navigate(`/instructor/exams/${exam.id}`);
          }}
        />
      ) : null}
    </section>
  );
}

export default Exams;
