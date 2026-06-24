import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import StudentAttendanceReport from "../../components/features/student/StudentAttendanceReport";
import { useMyAttendance } from "../../features/student/attendance/hooks";
import { useAttendanceSocket } from "../../hooks/useAttendanceSocket";
import useAuthStore from "../../store/authStore";

export default function StudentAttendance() {
  const { t } = useTranslation();
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const { data, isLoading, isError, refetch } = useMyAttendance({ enabled: isAuth });

  useAttendanceSocket({ enabled: isAuth });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("studentAttendance.title")}
        subtitle={t("studentAttendance.subtitle")}
      />

      {isLoading ? (
        <p className="flex items-center gap-2 text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("dashboard.common.loading")}
        </p>
      ) : null}

      {isError ? (
        <p className="text-red-600">
          {t("studentAttendance.loadError")}{" "}
          <button type="button" className="font-semibold text-pioneer-orange-normal hover:underline" onClick={() => void refetch()}>
            {t("takeExam.retry")}
          </button>
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <StudentAttendanceReport summary={data?.summary} records={data?.records ?? []} live />
      ) : null}
    </div>
  );
}
