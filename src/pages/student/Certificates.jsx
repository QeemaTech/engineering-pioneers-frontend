import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Award, Download, Loader2 } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import { useClaimCertificate, useMyCertificates } from "../../features/student/certificates/hooks";
import { useMyCourses } from "../../features/student/courses/hooks";
import { getErrorMessage } from "../../api/error";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Certificates() {
  const { t } = useTranslation();
  const { data: certificates = [], isLoading, isError, error, refetch } = useMyCertificates();
  const { data: courses = [] } = useMyCourses();
  const claim = useClaimCertificate();
  const [claimErr, setClaimErr] = useState("");
  const [claimingId, setClaimingId] = useState(null);

  const completedWithoutCert = courses.filter(
    (c) => c.isCompleted && !certificates.some((cert) => cert.courseId === c.id || cert.courseId === c.courseId)
  );

  const handleClaim = async (courseId) => {
    setClaimErr("");
    setClaimingId(courseId);
    try {
      const blob = await claim.mutateAsync(courseId);
      downloadBlob(blob, `certificate-${courseId}.pdf`);
    } catch (e) {
      setClaimErr(getErrorMessage(e, t("student.certificates.claimError", { defaultValue: "Could not claim certificate." })));
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("student.certificates.title", { defaultValue: "Certificates" })}
        subtitle={t("student.certificates.subtitle", { defaultValue: "Download certificates for completed courses." })}
      />

      {claimErr ? <p className="text-sm text-red-600">{claimErr}</p> : null}

      {completedWithoutCert.length > 0 ? (
        <section className="rounded-2xl border border-pioneer-orange-normal/30 bg-pioneer-orange-light/40 p-5">
          <h2 className="text-sm font-bold text-pioneer-orange-normal">{t("student.certificates.readyToClaim", { defaultValue: "Ready to claim" })}</h2>
          <ul className="mt-3 space-y-2">
            {completedWithoutCert.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 dark:bg-[#1E293B]">
                <span className="font-semibold text-slate-900 dark:text-white">{c.title}</span>
                <button
                  type="button"
                  disabled={claimingId === c.id}
                  onClick={() => void handleClaim(c.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2 text-sm font-bold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
                >
                  {claimingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {t("student.certificates.claim", { defaultValue: "Claim PDF" })}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <div className="text-sm text-red-600">
          <p>{getErrorMessage(error, t("student.certificates.loadError", { defaultValue: "Could not load certificates." }))}</p>
          <button type="button" onClick={() => void refetch()} className="mt-2 font-semibold text-pioneer-orange-normal hover:underline">
            {t("takeExam.retry")}
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && certificates.length === 0 && completedWithoutCert.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Award className="h-12 w-12 text-slate-300" />
          <p className="text-slate-600">{t("student.certificates.empty", { defaultValue: "Complete a course to earn your first certificate." })}</p>
        </div>
      ) : null}

      {!isLoading && !isError && certificates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <article key={cert.id} className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-700/40 dark:bg-[#1E293B]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pioneer-orange-light">
                <Award className="h-6 w-6 text-pioneer-orange-normal" />
              </div>
              <h3 className="mt-4 font-bold text-slate-900 dark:text-white">{cert.course?.title || cert.title}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {t("student.certificates.issued", { defaultValue: "Issued" })}:{" "}
                {cert.issuedAt ? new Date(cert.issuedAt).toLocaleDateString() : "—"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-400">{cert.serialNumber}</p>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
