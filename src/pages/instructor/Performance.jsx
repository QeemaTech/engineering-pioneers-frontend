import { useState } from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "../../components/dashboard/PageHeader";
import { PerformanceDashboardUI } from "../../components/features/performance/PerformanceDashboardUI";
import { useInstructorPerformance } from "../../features/instructor/performance/hooks";
import { FileText, RefreshCw } from "lucide-react";
import client from "../../api/client";
import toast from "react-hot-toast";

function Performance() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data, isLoading, isError } = useInstructorPerformance();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const response = await client.get("/instructor/performance/export-pdf", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "instructor-performance-report.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success(isRtl ? "تم تحميل تقرير التقييم بنجاح!" : "Evaluation report downloaded successfully!");
    } catch (e) {
      toast.error(isRtl ? "فشل تحميل التقرير" : "Failed to download evaluation report.");
    } finally {
      setDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <section>
        <PageHeader title={t("dashboard.instructor.pages.performance.title")} subtitle={t("dashboard.instructor.pages.performance.subtitle")} />
        <p className="text-slate-500 dark:text-slate-400">{t("dashboard.common.loading")}</p>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section>
        <PageHeader title={t("dashboard.instructor.pages.performance.title")} subtitle={t("dashboard.instructor.pages.performance.subtitle")} />
        <p className="text-red-600 dark:text-red-400">Could not load performance data.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("dashboard.instructor.pages.performance.title")}
        subtitle={t("dashboard.instructor.pages.performance.subtitle")}
        actions={
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
          >
            {downloading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {isRtl ? "تحميل تقرير التقييم (PDF)" : "Download Evaluation Report (PDF)"}
          </button>
        }
      />
      <PerformanceDashboardUI data={data} />
    </section>
  );
}

export default Performance;
