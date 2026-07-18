import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { ArrowLeft, CheckCircle2, XCircle, Download, RefreshCw } from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import { useAdminExamSubmissions, useAdminExamById } from "../../features/admin/exams/hooks";
import client from "../../api/client";
import toast from "react-hot-toast";

export default function ExamSubmissions() {
  const { id } = useParams();
  const { data: exam } = useAdminExamById(id);
  const { data, isLoading } = useAdminExamSubmissions(id, { page: 1, limit: 200 });
  const submissions = data?.submissions || [];

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [exporting, setExporting] = useState(false);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const name = (sub.student?.fullName || "").toLowerCase();
      const email = (sub.student?.email || "").toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "passed" && sub.isPassed === true) ||
        (statusFilter === "failed" && sub.isPassed === false) ||
        (statusFilter === "grading" && (sub.isPassed === null || sub.isPassed === undefined));

      return matchesSearch && matchesStatus;
    });
  }, [submissions, searchQuery, statusFilter]);

  const handleExportXlsx = async () => {
    setExporting(true);
    try {
      const response = await client.get(
        `/admin/exams/${id}/submissions/export-xlsx?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `exam-submissions-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Excel sheet downloaded successfully!");
    } catch (e) {
      toast.error("Failed to export submissions.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/exams" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Submissions</h1>
            <p className="text-xs text-slate-500">{exam?.title || "Loading..."}</p>
          </div>
        </div>

        {submissions.length > 0 && (
          <button
            type="button"
            disabled={exporting}
            onClick={handleExportXlsx}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {exporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export Excel (.xlsx)
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center dark:border-white/10">
          <p className="text-sm font-bold text-slate-500">No submissions yet</p>
          <p className="mt-1 text-xs text-slate-400">Students haven't taken this exam yet.</p>
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-[#1A1A22] border border-slate-200 dark:border-white/8 rounded-xl p-4">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] px-4 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-[#EE7C11] focus:ring-1 focus:ring-[#EE7C11] outline-none"
                />
              </div>

              {/* Status Dropdown */}
              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:border-[#EE7C11] outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                  <option value="grading">Pending</option>
                </select>
              </div>
            </div>
          </div>

          <DataTable
            columns={[
              { key: "student", title: "Student", render: (_, row) => (
                <div className="flex items-center gap-2">
                  {row.student?.avatar ? <img src={row.student.avatar} className="h-7 w-7 rounded-full object-cover" alt="" /> : <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-white/10">{(row.student?.fullName || "?")[0]}</div>}
                  <div><p className="text-sm font-bold text-slate-900 dark:text-white">{row.student?.fullName}</p><p className="text-[11px] text-slate-500">{row.student?.email}</p></div>
                </div>
              )},
              { key: "totalScore", title: "Score", render: (v, row) => <span className="font-bold">{v ?? "-"} / {row.exam?.totalPoints || "-"}</span> },
              { key: "attemptNumber", title: "Attempt", render: (v) => <span className="font-semibold">{v || 1}</span> },
              { key: "isPassed", title: "Result", render: (v) => v === true ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"><CheckCircle2 className="h-3 w-3" />Passed</span> : v === false ? <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700 dark:bg-[#EE7C11]/20 dark:text-red-300"><XCircle className="h-3 w-3" />Failed</span> : <span className="text-xs text-slate-400">Pending</span> },
              { key: "submittedAt", title: "Submitted", render: (v) => v ? new Date(v).toLocaleDateString() : <span className="text-xs text-slate-400">In progress</span> },
            ]}
            rows={filteredSubmissions}
          />
        </>
      )}
    </section>
  );
}
