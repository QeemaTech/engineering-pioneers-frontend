import { useTranslation } from "react-i18next";
import PageHeader from "../../components/ui/PageHeader";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCreateAdminEnrollment } from "../../features/admin/enrollments/hooks";
import { getErrorMessage } from "../../api/error";
import { useAdminUsers } from "../../features/admin/users/hooks";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import { useAdminCohorts } from "../../features/admin/cohorts/hooks";

function EnrollStudent() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [amountPaid, setAmountPaid] = useState("");

  const createMutation = useCreateAdminEnrollment();
  const { data: usersData } = useAdminUsers({ role: "STUDENT", page: 1, limit: 200 });
  const { data: coursesData } = useAdminCourses({ page: 1, limit: 200 });
  const { data: cohortsData, isFetching: loadingCohorts } = useAdminCohorts({
    page: 1,
    limit: 100,
    courseId: courseId || undefined,
  });

  const students = usersData?.users || [];
  const courses = coursesData?.courses || [];
  const cohortsForCourse = useMemo(() => {
    if (!courseId) return [];
    return (cohortsData?.classes || []).filter((c) => c.courseId === courseId);
  }, [cohortsData?.classes, courseId]);

  const resetWizard = () => {
    createMutation.reset();
    setStep(1);
    setCourseId("");
    setCohortId("");
    setStudentId("");
    setAmountPaid("");
  };

  const onSubmit = () => {
    if (!studentId || !cohortId || !courseId) return;
    const amt = amountPaid.trim() ? Number(amountPaid) : undefined;
    createMutation.mutate(
      {
        studentId,
        cohortId,
        courseId,
        ...(amt != null && !Number.isNaN(amt) && amt > 0 ? { amountPaid: amt } : {}),
      },
      {
        onSuccess: () => {
          toast.success(t("adminPages.enrollStudent.success"));
          resetWizard();
        },
        onError: (e) => {
          toast.error(getErrorMessage(e, t("adminPages.enrollStudent.error", { defaultValue: "Enrollment failed." })));
        },
      }
    );
  };

  return (
    <section className="space-y-6">
      <PageHeader title={t("adminPages.enrollStudent.title")} subtitle={t("adminPages.enrollStudent.subtitle")} />

      <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
        <li className={step >= 1 ? "text-pioneer-orange-normal" : ""}>1. {t("adminPages.enrollStudent.stepCourse", { defaultValue: "Course" })}</li>
        <span aria-hidden>→</span>
        <li className={step >= 2 ? "text-pioneer-orange-normal" : ""}>2. {t("adminPages.enrollStudent.stepCohort", { defaultValue: "Cohort" })}</li>
        <span aria-hidden>→</span>
        <li className={step >= 3 ? "text-pioneer-orange-normal" : ""}>3. {t("adminPages.enrollStudent.stepStudent", { defaultValue: "Student" })}</li>
      </ol>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="grid max-w-2xl gap-4">
          {step === 1 ? (
            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("adminPages.enrollStudent.course")}
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setCohortId("");
                  if (e.target.value) setStep(2);
                }}
                className="h-11 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              >
                <option value="">{t("adminPages.enrollStudent.selectCourse", { defaultValue: "Select a course…" })}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {step >= 2 && courseId ? (
            <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("adminPages.enrollStudent.cohort", { defaultValue: "Cohort" })}
              <select
                value={cohortId}
                onChange={(e) => {
                  setCohortId(e.target.value);
                  if (e.target.value) setStep(3);
                }}
                disabled={loadingCohorts}
                className="h-11 rounded-lg border border-slate-200 px-3 text-sm disabled:opacity-60 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              >
                <option value="">
                  {loadingCohorts
                    ? t("dashboard.common.loading", { defaultValue: "Loading…" })
                    : t("adminPages.enrollStudent.selectCohort", { defaultValue: "Select a cohort…" })}
                </option>
                {cohortsForCourse.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.type} · {c.status}
                    {typeof c.price === "number" ? ` · $${c.price}` : ""}
                  </option>
                ))}
              </select>
              {!loadingCohorts && cohortsForCourse.length === 0 ? (
                <span className="text-xs font-normal text-amber-600 dark:text-amber-400">
                  {t("adminPages.enrollStudent.noCohorts", { defaultValue: "No cohorts for this course. Create one in Cohorts first." })}
                </span>
              ) : null}
            </label>
          ) : null}

          {step >= 3 && cohortId ? (
            <>
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("adminPages.enrollStudent.student")}
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="h-11 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                >
                  <option value="">{t("adminPages.enrollStudent.selectStudent", { defaultValue: "Select a student…" })}</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {(s.fullName || s.name) + " — " + s.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("adminPages.enrollStudent.amountOptional", { defaultValue: "Amount paid (optional)" })}
                <input
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="h-11 rounded-lg border border-slate-200 px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </label>
            </>
          ) : null}
        </div>

        {createMutation.isError ? (
          <p className="mt-3 text-sm text-red-600 dark:text-red-300">
            {getErrorMessage(createMutation.error, "Failed to enroll student.")}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetWizard}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10 dark:text-slate-200"
          >
            {t("adminPages.enrollStudent.reset", { defaultValue: "Start over" })}
          </button>
          <button
            type="button"
            disabled={!studentId || !cohortId || !courseId || createMutation.isPending}
            onClick={onSubmit}
            className="rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {createMutation.isPending ? t("dashboard.common.loading", { defaultValue: "Submitting…" }) : t("adminPages.enrollStudent.submit")}
          </button>
        </div>
      </div>
    </section>
  );
}

export default EnrollStudent;
