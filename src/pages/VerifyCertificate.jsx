import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Award, Download, Loader2, ShieldCheck } from "lucide-react";
import client from "../api/client";
import endpoints from "../api/endpoints";
import { getErrorMessage } from "../api/error";
import { getStaticCertificateUrl, openCertificateDownloadUrl } from "../utils/certificate";

async function fetchVerifiedCertificate(serial) {
  const res = await client.get(endpoints.public.verifyCertificate(serial), { skip403Redirect: true });
  return res?.data?.data;
}

export default function VerifyCertificate() {
  const { serial } = useParams();
  const decodedSerial = useMemo(() => decodeURIComponent(serial || ""), [serial]);
  const { t, i18n } = useTranslation();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public", "certificate-verify", decodedSerial],
    queryFn: () => fetchVerifiedCertificate(decodedSerial),
    enabled: Boolean(decodedSerial),
    retry: false,
  });

  const staticPdfUrl = getStaticCertificateUrl(data?.links?.pdfUrl);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pioneer-orange-light">
            <ShieldCheck className="h-6 w-6 text-pioneer-orange-normal" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("verifyCertificate.title", { defaultValue: "Certificate verification" })}
            </h1>
            <p className="text-sm text-slate-500">{decodedSerial}</p>
          </div>
        </div>

        {isLoading ? (
          <p className="mt-8 flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("verifyCertificate.loading", { defaultValue: "Verifying..." })}
          </p>
        ) : null}

        {isError ? (
          <p className="mt-8 text-sm text-red-600">
            {getErrorMessage(error, t("verifyCertificate.notFound", { defaultValue: "Certificate not found or invalid." }))}
          </p>
        ) : null}

        {data ? (
          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
              {t("verifyCertificate.verified", { defaultValue: "This certificate is authentic." })}
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">{t("verifyCertificate.student", { defaultValue: "Student" })}</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{data.studentName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("verifyCertificate.course", { defaultValue: "Course / program" })}</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">{data.courseName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("verifyCertificate.issued", { defaultValue: "Issued on" })}</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {data.issuedAt ? new Date(data.issuedAt).toLocaleDateString(i18n.language) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">{t("verifyCertificate.serial", { defaultValue: "Serial number" })}</dt>
                <dd className="font-mono text-xs font-semibold text-slate-900 dark:text-white">{data.serialNumber}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3 pt-2">
              {staticPdfUrl ? (
                <a
                  href={staticPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
                >
                  <Download className="h-4 w-4" />
                  {t("verifyCertificate.download", { defaultValue: "Download PDF" })}
                </a>
              ) : data.links?.publicDownloadPath ? (
                <button
                  type="button"
                  onClick={() => openCertificateDownloadUrl(data.links.publicDownloadPath)}
                  className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2 text-sm font-bold text-white hover:bg-pioneer-orange-hover"
                >
                  <Download className="h-4 w-4" />
                  {t("verifyCertificate.download", { defaultValue: "Download PDF" })}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {!isLoading && !isError && !data ? (
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-slate-500">
            <Award className="h-10 w-10 text-slate-300" />
            <p>{t("verifyCertificate.empty", { defaultValue: "Enter a valid certificate serial to verify." })}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
