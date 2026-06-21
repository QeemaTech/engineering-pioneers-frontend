import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  FileBarChart2,
  PlusCircle,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import { useAdminExams, useDeleteAdminExam } from "../../features/admin/exams/hooks";
import { getErrorMessage } from "../../api/error";

function Exams() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, isError, error, refetch } = useAdminExams({ page: 1, limit: 200 });
  const deleteMutation = useDeleteAdminExam();
  const exams = data?.exams || [];
  const filteredExams = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return exams;
    return exams.filter((exam) => {
      const title = String(exam.title || "").toLowerCase();
      const course = String(exam?.course?.title || "").toLowerCase();
      const type = String(exam.type || "").toLowerCase();
      return title.includes(query) || course.includes(query) || type.includes(query);
    });
  }, [exams, searchTerm]);

  const total = filteredExams.length;
  const passedLike = filteredExams.filter((e) => e.status === "COMPLETED" || e.status === "AVAILABLE").length;
  const failedLike = filteredExams.filter((e) => e.status === "UPCOMING" || e.status === "DRAFT").length;

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("adminPages.assessments.title", { defaultValue: "All Assessments" })}
        subtitle={t("adminPages.assessments.subtitle", {
          defaultValue: "Track and manage quizzes and exams across the platform",
        })}
        action={
          <Link
            to="/admin/exams/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white"
          >
            <PlusCircle className="h-4 w-4" />
            {t("adminPages.assessments.add", { defaultValue: "Add Exam" })}
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="mb-2 inline-flex rounded-lg bg-[#EE7C11]/10 p-2 text-[#EE7C11]">
            <FileBarChart2 className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("adminPages.assessments.total", { defaultValue: "Total Assessments" })}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="mb-2 inline-flex rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("adminPages.assessments.active", { defaultValue: "Active / Completed" })}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{passedLike}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
          <div className="mb-2 inline-flex rounded-lg bg-amber-500/10 p-2 text-amber-500">
            <Clock className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("adminPages.assessments.upcoming", { defaultValue: "Upcoming / Draft" })}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{failedLike}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("adminPages.assessments.search", { defaultValue: "Filter by exam, course, or type..." })}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white ps-9 pe-3 text-sm text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
        />
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">
          {t("adminPages.assessments.loading", { defaultValue: "Loading exams..." })}
        </div>
      ) : null}
      {isError ? (
        <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
          {getErrorMessage(error, t("adminPages.assessments.loadError", { defaultValue: "Failed to load exams." }))}
          <button onClick={() => refetch()} className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white">
            {t("takeExam.retry", { defaultValue: "Retry" })}
          </button>
        </div>
      ) : null}
      {!isLoading && !isError ? (
        <DataTable
          columns={[
            {
              key: "title",
              title: t("adminPages.assessments.colAssessment", { defaultValue: "Assessment" }),
              render: (v, row) => (
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-white">{v}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {row?.course?.title || row?.unit?.title || row?.lesson?.title || t("adminPages.assessments.standalone", { defaultValue: "Standalone" })}
                  </span>
                </div>
              ),
            },
            {
              key: "type",
              title: t("adminPages.assessments.colType", { defaultValue: "Type" }),
            },
            {
              key: "_count",
              title: t("adminPages.assessments.colQuestions", { defaultValue: "Questions" }),
              render: (v) => <span className="font-bold">{v?.questions ?? 0}</span>,
            },
            {
              key: "durationMinutes",
              title: t("adminPages.assessments.colDuration", { defaultValue: "Duration" }),
              render: (v) => `${v || 0} ${t("adminPages.assessments.minutes", { defaultValue: "min" })}`,
            },
            {
              key: "totalPoints",
              title: t("adminPages.assessments.colPoints", { defaultValue: "Points" }),
            },
            {
              key: "status",
              title: t("adminPages.assessments.colStatus", { defaultValue: "Status" }),
              render: (v) => {
                const isAvailable = v === "COMPLETED" || v === "AVAILABLE";
                const label = v === "COMPLETED" ? t("adminPages.assessments.statusCompleted", { defaultValue: "Completed" }) :
                              v === "AVAILABLE" ? t("adminPages.assessments.statusAvailable", { defaultValue: "Available" }) :
                              v === "UPCOMING" ? t("adminPages.assessments.statusUpcoming", { defaultValue: "Upcoming" }) :
                              v === "DRAFT" ? t("adminPages.assessments.statusDraft", { defaultValue: "Draft" }) : v;
                return (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${isAvailable ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"}`}>
                    {isAvailable ? <CheckCircle2 className="me-1 h-3 w-3" /> : <XCircle className="me-1 h-3 w-3" />}{label}
                  </span>
                );
              },
            },
            {
              key: "actions",
              title: t("adminPages.assessments.colActions", { defaultValue: "Actions" }),
              render: (_, row) => (
                <div className="flex items-center gap-1">
                  <Link
                    to={`/admin/exams/${row.id}/edit`}
                    className="rounded p-1.5 text-blue-500 hover:bg-blue-500/10"
                    title={t("adminPages.assessments.editTitle", { defaultValue: "Edit Questions" })}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/admin/exams/${row.id}/submissions`}
                    className="rounded p-1.5 text-purple-500 hover:bg-purple-500/10"
                    title={t("adminPages.assessments.viewTitle", { defaultValue: "View Submissions" })}
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => deleteMutation.mutate(row.id)}
                    className="rounded p-1.5 text-red-500 hover:bg-[#EE7C11]/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={filteredExams}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-300">
            <Calendar className="h-4 w-4" />
            {t("adminPages.assessments.tip1Title", { defaultValue: "Quick Search" })}
          </div>
          <p className="text-sm text-blue-700/80 dark:text-blue-200">
            {t("adminPages.assessments.tip1Body", {
              defaultValue: "Filter by exam title, course, or type to quickly find records.",
            })}
          </p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/20 dark:bg-purple-500/10">
          <div className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-purple-700 dark:text-purple-300">
            <ChevronRight className="h-4 w-4" />
            {t("adminPages.assessments.tip2Title", { defaultValue: "Exam Builder" })}
          </div>
          <p className="text-sm text-purple-700/80 dark:text-purple-200">
            {t("adminPages.assessments.tip2Body", {
              defaultValue: "Use Add Exam to create new quizzes/exams with questions and grading rules.",
            })}
          </p>
        </div>
      </div>
    </section>
  );
}

export default Exams;
