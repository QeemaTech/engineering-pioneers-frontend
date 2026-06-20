import { useMemo, useState } from "react";
import { Calendar, CreditCard, RefreshCcw, Search, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/ui/PageHeader";
import {
  useAdminPayments,
  useUpdateAdminPaymentStatus,
} from "../../features/admin/finance/hooks";
import {
  useAdminSubscriptionEnrollments,
  useAdminSubscriptions,
  useCreateAdminSubscription,
  useUpdateAdminSubscriptionStatus,
} from "../../features/admin/subscriptions/hooks";
import { useAdminPackages } from "../../features/admin/packages/hooks";
import { useAdminUsers } from "../../features/admin/users/hooks";
import { useAdminCourses } from "../../features/admin/courses/hooks";
import { useAdminCohorts } from "../../features/admin/cohorts/hooks";
import { useCreateAdminEnrollment } from "../../features/admin/enrollments/hooks";

function Finance() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("payments");
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [enrollType, setEnrollType] = useState("package");
  const [studentId, setStudentId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [cohortId, setCohortId] = useState("");

  const { data: payments = [], isLoading: loadingPayments, refetch: refetchPayments, isFetching: refreshingPayments } = useAdminPayments({});
  const { data: subscriptions = [], isLoading: loadingSubscriptions, refetch: refetchSubscriptions, isFetching: refreshingSubscriptions } = useAdminSubscriptions();
  const { data: enrollments = [], isLoading: loadingEnrollments, refetch: refetchEnrollments } = useAdminSubscriptionEnrollments();
  const { data: packages = [], isLoading: loadingPackages } = useAdminPackages();
  const { data: studentsPayload, isLoading: loadingStudents } = useAdminUsers({ role: "STUDENT", page: 1, limit: 200 });
  const { data: coursesPayload, isLoading: loadingCourses } = useAdminCourses({ page: 1, limit: 200 });
  const { data: cohortsPayload, isFetching: loadingCohorts } = useAdminCohorts({
    page: 1,
    limit: 100,
    courseId: courseId || undefined,
    enabled: openCreate && enrollType === "course" && !!courseId,
  });
  const updatePaymentStatus = useUpdateAdminPaymentStatus();
  const updateSubStatus = useUpdateAdminSubscriptionStatus();
  const createSubscription = useCreateAdminSubscription();
  const createCohortEnrollment = useCreateAdminEnrollment();

  const students = studentsPayload?.users ?? [];
  const courses = coursesPayload?.courses ?? [];
  const cohortsForCourse = cohortsPayload?.classes ?? [];

  const filteredPayments = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter((p) =>
      String(p.id || "").toLowerCase().includes(q) ||
      String(p.student?.fullName || "").toLowerCase().includes(q) ||
      String(p.student?.email || "").toLowerCase().includes(q)
    );
  }, [payments, search]);

  const filteredSubs = useMemo(() => {
    const q = search.toLowerCase();
    return subscriptions.filter((s) =>
      String(s.student?.fullName || "").toLowerCase().includes(q) ||
      String(s.plan?.name || s.package?.name || "").toLowerCase().includes(q)
    );
  }, [subscriptions, search]);

  const filteredEnrollments = useMemo(() => {
    const q = search.toLowerCase();
    return enrollments.filter((e) =>
      String(e.student?.fullName || "").toLowerCase().includes(q) ||
      String(e.course?.title || "").toLowerCase().includes(q)
    );
  }, [enrollments, search]);

  return (
    <section className="space-y-6">
      <PageHeader title={t("dashboard.admin.pages.finance.title")} subtitle={t("dashboard.admin.pages.finance.subtitle")} />

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/8 dark:bg-[#1A1A22]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("dashboard.common.search")} className="h-10 w-full rounded-lg border border-slate-200 bg-white ps-9 pe-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === "payments") void refetchPayments();
                if (activeTab === "subscriptions") void refetchSubscriptions();
                if (activeTab === "enrollments") void refetchEnrollments();
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"
            >
              <RefreshCcw className={`h-4 w-4 ${(refreshingPayments || refreshingSubscriptions) ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => {
                setStudentId("");
                setPackageId("");
                setCourseId("");
                setCohortId("");
                setEnrollType("package");
                setOpenCreate(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#EE7C11] px-4 text-sm font-bold text-white"
            >
              <UserPlus className="h-4 w-4" /> Grant Access
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { key: "payments", label: "Payments" },
          { key: "subscriptions", label: "Package Balances" },
          { key: "enrollments", label: "Enrollments" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              activeTab === tab.key
                ? "bg-[#EE7C11] text-white"
                : "border border-slate-200 text-slate-700 dark:border-white/10 dark:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "payments" ? (
        <DataTable
          columns={[
            { key: "id", title: "Invoice", render: (v) => <span className="font-mono text-xs text-slate-500">#{String(v).slice(0, 8)}</span> },
            { key: "student", title: "Parent/Student", render: (_, row) => <div className="flex flex-col"><span className="font-bold text-slate-900 dark:text-white">{row?.student?.fullName || "-"}</span><span className="text-xs text-slate-500">{row?.student?.email || "-"}</span></div> },
            { key: "amount", title: "Amount", render: (v, row) => <span className="font-bold">{v} {row?.currency || "USD"}</span> },
            {
              key: "status",
              title: "Status",
              render: (v, row) => (
                <select
                  value={v}
                  onChange={async (e) => {
                    try {
                      await updatePaymentStatus.mutateAsync({ id: row.id, status: e.target.value });
                      toast.success("Payment status updated.");
                    } catch {
                      toast.error("Failed to update payment.");
                    }
                  }}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold dark:border-white/10 dark:bg-[#0F0F13]"
                >
                  {["PENDING", "PAID", "FAILED", "REFUNDED"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ),
            },
            {
              key: "createdAt",
              title: "Date",
              render: (v) => (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {v ? new Date(v).toLocaleString() : "-"}
                </div>
              ),
            },
          ]}
          rows={filteredPayments}
        />
      ) : null}

      {activeTab === "subscriptions" ? (
        <DataTable
          columns={[
            { key: "student", title: "Student", render: (_, row) => <div><p className="font-bold text-slate-900 dark:text-white">{row?.student?.fullName || "-"}</p><p className="text-xs text-slate-500">{row?.student?.email || "-"}</p></div> },
            { key: "plan", title: "Package", render: (_, row) => <span>{row?.plan?.name || row?.package?.name || "-"}</span> },
            {
              key: "period",
              title: "Period",
              render: (_, row) => (
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <p>Start: <b>{row.startDate ? new Date(row.startDate).toLocaleDateString() : "-"}</b></p>
                  <p>End: <b>{row.endDate ? new Date(row.endDate).toLocaleDateString() : "-"}</b></p>
                </div>
              )
            },
            { key: "createdAt", title: "Purchased", render: (v) => <span className="text-xs text-slate-500">{v ? new Date(v).toLocaleDateString() : "-"}</span> },
            {
              key: "status",
              title: "Status",
              render: (v, row) => (
                <select
                  value={v}
                  onChange={async (e) => {
                    try {
                      await updateSubStatus.mutateAsync({ id: row.id, status: e.target.value });
                      toast.success("Package balance updated.");
                    } catch {
                      toast.error("Failed to update package balance.");
                    }
                  }}
                  className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold dark:border-white/10 dark:bg-[#0F0F13]"
                >
                  {["ACTIVE", "EXPIRED", "CANCELED", "PENDING_PAYMENT"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ),
            },
          ]}
          rows={filteredSubs}
        />
      ) : null}

      {activeTab === "enrollments" ? (
        <DataTable
          columns={[
            { key: "student", title: "Student", render: (_, row) => <div><p className="font-bold text-slate-900 dark:text-white">{row?.student?.fullName || "-"}</p><p className="text-xs text-slate-500">{row?.student?.email || "-"}</p></div> },
            { key: "course", title: "Course", render: (_, row) => row?.course?.title || "-" },
            { key: "joinedAt", title: "Enrolled At", render: (v) => (v ? new Date(v).toLocaleDateString() : "-") },
          ]}
          rows={filteredEnrollments}
        />
      ) : null}

      {openCreate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-[#1A1A22]">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><CreditCard className="h-5 w-5" /> Grant Access</h3>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setEnrollType("package"); setCourseId(""); setCohortId(""); }} className={`rounded-lg px-3 py-2 text-sm ${enrollType === "package" ? "bg-[#EE7C11] text-white" : "border border-slate-200 dark:border-white/10"}`}>Package credits</button>
              <button type="button" onClick={() => { setEnrollType("course"); setPackageId(""); }} className={`rounded-lg px-3 py-2 text-sm ${enrollType === "course" ? "bg-[#EE7C11] text-white" : "border border-slate-200 dark:border-white/10"}`}>Manual cohort access</button>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {loadingStudents || loadingPackages || loadingCourses
                  ? t("dashboard.common.loading", { defaultValue: "Loading…" })
                  : `Students: ${students.length} | Packages: ${packages.length} | Courses: ${courses.length}`}
              </p>
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white">
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName || s.name}{s.email ? ` — ${s.email}` : ""}</option>
                ))}
              </select>
              {enrollType === "package" ? (
                <select value={packageId} onChange={(e) => setPackageId(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white">
                  <option value="">Select Package</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.durationMonths} {p.durationMonths === 1 ? 'month' : 'months'}) · ${p.price}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <select
                    value={courseId}
                    onChange={(e) => {
                      setCourseId(e.target.value);
                      setCohortId("");
                    }}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <select
                    value={cohortId}
                    onChange={(e) => setCohortId(e.target.value)}
                    disabled={!courseId || loadingCohorts}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm disabled:opacity-50 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  >
                    <option value="">{loadingCohorts ? "Loading cohorts…" : "Select Cohort"}</option>
                    {cohortsForCourse.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} · {c.type}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setOpenCreate(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:text-white">Cancel</button>
              <button
                onClick={async () => {
                  try {
                    if (!studentId) return toast.error("Select student first.");
                    if (enrollType === "package") {
                      if (!packageId) return toast.error("Select package.");
                      await createSubscription.mutateAsync({ studentId, packageId, status: "ACTIVE" });
                    } else {
                      if (!courseId) return toast.error("Select course.");
                      if (!cohortId) return toast.error("Select cohort.");
                      await createCohortEnrollment.mutateAsync({ studentId, cohortId, courseId });
                    }
                    toast.success("Created successfully.");
                    setOpenCreate(false);
                    setStudentId("");
                    setPackageId("");
                    setCourseId("");
                    setCohortId("");
                  } catch {
                    toast.error("Failed to create.");
                  }
                }}
                className="rounded-lg bg-[#EE7C11] px-3 py-2 text-sm font-bold text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {(loadingPayments || loadingSubscriptions || loadingEnrollments) ? <p className="text-sm text-slate-500">Loading...</p> : null}
    </section>
  );
}

export default Finance;
