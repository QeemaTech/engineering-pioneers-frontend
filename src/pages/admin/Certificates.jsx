import { useMemo, useState } from "react";
import { Award, Plus, RefreshCcw, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PageHeader from "../../components/ui/PageHeader";
import { useAdminCertificates, useIssueAdminCertificate } from "../../features/admin/certificates/hooks";
import { useAdminUsers } from "../../features/admin/users/hooks";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import { useAdminExams } from "../../features/admin/exams/hooks";
import { getErrorMessage } from "../../api/error";

function Certificates() {
  const { t, i18n } = useTranslation();
  const tx = (key, fallback) => t(key, { defaultValue: fallback });
  const [search, setSearch] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const { data, isLoading, isError, error, isFetching, refetch } = useAdminCertificates({ page: 1, limit: 100 });

  const certs = data?.certificates || [];
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return certs;
    return certs.filter((cert) => {
      return (
        String(cert.student?.fullName || "").toLowerCase().includes(term) ||
        String(cert.course?.title || "").toLowerCase().includes(term) ||
        String(cert.title || "").toLowerCase().includes(term) ||
        String(cert.serialNumber || "").toLowerCase().includes(term)
      );
    });
  }, [certs, search]);

  return (
    <section className="space-y-6">
      <PageHeader
        title={tx("adminPages.certificates.title", "Certificates")}
        subtitle={tx("adminPages.certificates.subtitle", "Issue and track certificates for students")}
        action={
          <button
            type="button"
            onClick={() => setShowIssueModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d9700e]"
          >
            <Plus className="h-4 w-4" />
            {tx("adminPages.certificates.issue", "Issue Certificate")}
          </button>
        }
      />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1A1A22] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tx("adminPages.certificates.search", "Search certificates")}
            className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 ps-9 pe-3 text-sm text-slate-900 outline-none focus:border-[#EE7C11] focus:bg-white dark:border-white/10 dark:bg-[#0F0F13] dark:text-white dark:focus:border-[#EE7C11]"
          />
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-500 transition hover:text-slate-900 dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300 dark:hover:text-white"
          title={tx("common.refresh", "Refresh")}
        >
          <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1A1A22]">
        {isLoading ? <p className="p-5 text-sm text-slate-500">{tx("common.loading", "Loading...")}</p> : null}
        {isError ? (
          <p className="p-5 text-sm text-red-500">
            {getErrorMessage(error, tx("adminPages.certificates.fetchError", "Failed to load certificates"))}{" "}
            <button onClick={() => refetch()} className="underline">
              {tx("common.retry", "Retry")}
            </button>
          </p>
        ) : null}
        {!isLoading && !isError ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-white/10">
              <thead className="bg-slate-50 dark:bg-[#0F0F13]">
                <tr>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500">{tx("adminPages.certificates.student", "Student")}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500">{tx("adminPages.certificates.titleLabel", "Title")}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500">{tx("adminPages.certificates.course", "Course")}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500">{tx("adminPages.certificates.serial", "Serial")}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wider text-slate-500">{tx("adminPages.certificates.date", "Issued Date")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filtered.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{cert.student?.fullName || "-"}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{cert.title || "-"}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{cert.course?.title || "-"}</td>
                    <td className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">{cert.serialNumber || "-"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString(i18n.language) : "-"}
                    </td>
                  </tr>
                ))}
                {!filtered.length ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                      <div className="inline-flex flex-col items-center gap-2">
                        <Award className="h-7 w-7 text-slate-400" />
                        {tx("adminPages.certificates.empty", "No certificates found")}
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {showIssueModal ? <IssueCertificateModal onClose={() => setShowIssueModal(false)} /> : null}
    </section>
  );
}

function IssueCertificateModal({ onClose }) {
  const { t } = useTranslation();
  const tx = (key, fallback) => t(key, { defaultValue: fallback });
  const issueMutation = useIssueAdminCertificate();
  const { data: studentsData } = useAdminUsers({ role: "STUDENT", page: 1, limit: 200 });
  const { data: coursesData } = useAdminCourses({ page: 1, limit: 200 });
  const { data: examsData } = useAdminExams({ page: 1, limit: 200 });
  const students = studentsData?.users || [];
  const courses = coursesData?.courses || [];
  const exams = examsData?.exams || [];

  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [examId, setExamId] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const blob = await issueMutation.mutateAsync({
        studentId,
        title,
        courseId: courseId || undefined,
        examId: examId || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || "certificate"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(tx("adminPages.certificates.issueSuccess", "Certificate issued successfully"));
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, tx("adminPages.certificates.issueError", "Failed to issue certificate")));
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#1A1A22]">
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{tx("adminPages.certificates.issue", "Issue Certificate")}</h3>
            <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:underline">
              {tx("common.cancel", "Cancel")}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <select required value={studentId} onChange={(e) => setStudentId(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white">
              <option value="">{tx("adminPages.certificates.selectStudent", "Select student")}</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName || student.email}
                </option>
              ))}
            </select>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tx("adminPages.certificates.titlePlaceholder", "Certificate title")} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white">
              <option value="">{tx("adminPages.certificates.selectCourse", "Optional: select course")}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <select value={examId} onChange={(e) => setExamId(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white">
              <option value="">{tx("adminPages.certificates.selectExam", "Optional: select exam")}</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title || exam.name || exam.id}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:text-slate-200">
              {tx("common.cancel", "Cancel")}
            </button>
            <button disabled={issueMutation.isPending} type="submit" className="rounded-lg bg-[#EE7C11] px-3 py-2 text-sm font-bold text-white disabled:opacity-70">
              {issueMutation.isPending ? tx("common.saving", "Saving...") : tx("adminPages.certificates.issue", "Issue Certificate")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Certificates;

