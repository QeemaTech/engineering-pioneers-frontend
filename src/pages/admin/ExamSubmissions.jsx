import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import DataTable from "../../components/ui/DataTable";
import { useAdminExamSubmissions, useAdminExamById } from "../../features/admin/exams/hooks";

export default function ExamSubmissions() {
  const { id } = useParams();
  const { data: exam } = useAdminExamById(id);
  const { data, isLoading } = useAdminExamSubmissions(id, { page: 1, limit: 200 });
  const submissions = data?.submissions || [];

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/exams" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Submissions</h1>
          <p className="text-xs text-slate-500">{exam?.title || "Loading..."}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-500 dark:border-white/8 dark:bg-[#1A1A22]">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center dark:border-white/10">
          <p className="text-sm font-bold text-slate-500">No submissions yet</p>
          <p className="mt-1 text-xs text-slate-400">Students haven't taken this exam yet.</p>
        </div>
      ) : (
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
          rows={submissions}
        />
      )}
    </section>
  );
}
