import { Eye, Plus, Search, UserCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAdminUsers, useCreateStudentByAdmin, useSetAdminUserPassword, useUpdateAdminUser } from "../../features/admin/users/hooks";
import PageHeader from "../../components/ui/PageHeader";
import StatsRow from "../../components/ui/StatsRow";
import FilterBar from "../../components/ui/FilterBar";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import { getErrorMessage } from "../../api/error";

function Students() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [page, setPage] = useState(1);
  const query = {
    role: "STUDENT",
    search: search || undefined,
    isActive: status === "All" ? undefined : status === "Active" ? "true" : "false",
    page,
    limit: 8,
  };
  const { data, isLoading, isError, error, refetch } = useAdminUsers(query);
  const updateMutation = useUpdateAdminUser();
  const createMutation = useCreateStudentByAdmin();
  const setPasswordMutation = useSetAdminUserPassword();
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalPassword, setModalPassword] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalAcademicLevel, setModalAcademicLevel] = useState("");
  const [modalIsActive, setModalIsActive] = useState(true);

  const isRtl = i18n.language?.startsWith("ar");
  const students = data?.users || [];

  const filtered = useMemo(() => {
    const rows = students
      .sort((a, b) => {
        if (sort === "Name A-Z") return String(a.fullName || "").localeCompare(String(b.fullName || ""));
        if (sort === "Oldest") return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
        return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      });
    return rows;
  }, [students, sort]);

  const columns = [
    {
      key: "name",
      title: t("adminPages.students.table.name"),
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 dark:bg-white/10 dark:text-white">
            {String(row.fullName || "ST").split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white block">{row.fullName || "-"}</span>
            {row.academicLevel && (
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded font-medium text-slate-500 dark:text-slate-400">
                {row.academicLevel === "PREPARATORY" ? (isRtl ? "إعدادي هندسة" : "Prep Year") :
                 row.academicLevel === "FIRST_YEAR" ? (isRtl ? "الفرقة الأولى" : "Year 1") :
                 row.academicLevel === "SECOND_YEAR" ? (isRtl ? "الفرقة الثانية" : "Year 2") :
                 row.academicLevel === "THIRD_YEAR" ? (isRtl ? "الفرقة الثالثة" : "Year 3") :
                 row.academicLevel === "FOURTH_YEAR" ? (isRtl ? "الفرقة الرابعة" : "Year 4") :
                 row.academicLevel === "GRADUATE" ? (isRtl ? "خريج" : "Graduate") : row.academicLevel}
              </span>
            )}
          </div>
        </div>
      ),
    },
    { key: "email", title: t("adminPages.students.table.email") },
    {
      key: "enrolledCourses",
      title: t("adminPages.students.table.courses"),
      render: (_, row) => (
        <div className="max-w-[240px]">
          <span className="font-semibold text-slate-900 dark:text-white">{row.enrollmentCount ?? 0}</span>
          {row.coursesSummary ? (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400" title={row.coursesSummary}>
              {row.coursesSummary}
            </p>
          ) : (
            <p className="text-xs text-slate-400">—</p>
          )}
        </div>
      ),
    },
    { key: "joinDate", title: t("adminPages.students.table.joined"), render: (_, row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-" },
    {
      key: "status",
      title: t("adminPages.students.table.status"),
      render: (_, row) => <StatusBadge label={row.isActive ? "Active" : "Inactive"} tone={row.isActive ? "success" : "warning"} />,
    },
    {
      key: "actions",
      title: t("adminPages.students.table.actions"),
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setEditing(row);
              setModalName(row.fullName || "");
              setModalEmail(row.email || "");
              setModalPassword("");
              setModalPhone(row.phone || "");
              setModalAcademicLevel(row.academicLevel || "");
              setModalIsActive(row.isActive !== false);
            }}
            className="inline-flex rounded-md px-2.5 py-1.5 text-xs font-bold text-[#EE7C11] hover:bg-[#EE7C11]/10 transition"
          >
            Edit
          </button>
          <Link to={`/admin/students/${row.id || row.userId}`} className="inline-flex rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/15">
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        title={t("adminPages.students.title")}
        subtitle={t("adminPages.students.subtitle")}
        action={
          <button
            type="button"
            onClick={() => {
              setCreating(true);
              setModalName("");
              setModalEmail("");
              setModalPassword("");
              setModalPhone("");
              setModalAcademicLevel("");
              setModalIsActive(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-opacity-95 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {t("adminPages.students.addStudent")}
          </button>
        }
      />
      <StatsRow
        items={[
          {
            key: "total",
            label: t("adminPages.students.totalStudents"),
            value: data?.meta?.studentStats?.totalAll ?? data?.meta?.total ?? students.length,
            icon: Users,
            iconWrap: "bg-blue-500/10 text-blue-400",
          },
          {
            key: "month",
            label: t("adminPages.students.joinedThisMonth"),
            value: data?.meta?.studentStats?.joinedThisMonth ?? "—",
            icon: UserCheck,
            iconWrap: "bg-green-500/10 text-green-400",
          },
          {
            key: "new",
            label: t("adminPages.students.newThisWeek"),
            value: data?.meta?.studentStats?.joinedThisWeek ?? 0,
            icon: Plus,
            iconWrap: "bg-orange-500/10 text-[#EE7C11]",
          },
        ]}
      />
      <FilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={t("adminPages.students.searchPlaceholder")}
        filters={[
          {
            key: "status",
            value: status,
            onChange: (v) => { setStatus(v); setPage(1); },
            options: ["All", "Active", "Suspended"],
          },
          {
            key: "sort",
            value: sort,
            onChange: setSort,
            options: ["Newest", "Oldest", "Name A-Z"],
          },
        ]}
      />

      {isLoading ? <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p> : null}
      {isError ? (
        <p className="text-sm text-red-600 dark:text-red-300">
          {getErrorMessage(error, "Failed to load students list.")}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        filtered.length === 0 ? (
          <EmptyState title={t("adminPages.students.empty")} />
        ) : (
          <div className="space-y-4">
            <DataTable columns={columns} rows={filtered} />
          </div>
        )
      ) : null}

      {/* CREATE STUDENT MODAL */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1A1A22] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
              {isRtl ? "إضافة طالب جديد" : "Create New Student"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "الاسم الكامل" : "Full Name"} *
                </label>
                <input
                  required
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder={t("adminPages.students.table.name")}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "البريد الإلكتروني" : "Email Address"} *
                </label>
                <input
                  required
                  type="email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder={t("adminPages.students.table.email")}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  placeholder="+201..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "المستوى الدراسي / السنة" : "Academic Level"}
                </label>
                <select
                  value={modalAcademicLevel}
                  onChange={(e) => setModalAcademicLevel(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                >
                  <option value="">{isRtl ? "عام / غير محدد" : "General / Unspecified"}</option>
                  <option value="PREPARATORY">{isRtl ? "إعدادي هندسة" : "Preparatory Year"}</option>
                  <option value="FIRST_YEAR">{isRtl ? "الفرقة الأولى" : "First Year"}</option>
                  <option value="SECOND_YEAR">{isRtl ? "الفرقة الثانية" : "Second Year"}</option>
                  <option value="THIRD_YEAR">{isRtl ? "الفرقة الثالثة" : "Third Year"}</option>
                  <option value="FOURTH_YEAR">{isRtl ? "الفرقة الرابعة" : "Fourth Year"}</option>
                  <option value="GRADUATE">{isRtl ? "خريج" : "Graduate"}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "كلمة المرور" : "Password"} *
                </label>
                <input
                  type="password"
                  required
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  placeholder={isRtl ? "لا تقل عن 8 أحرف" : "Minimum 8 characters"}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-white/10 dark:text-white dark:hover:bg-slate-800"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!modalName || !modalEmail || modalPassword.length < 8) {
                    toast.error(isRtl ? "يرجى ملء جميع الحقول المطلوبة. كلمة المرور لا تقل عن 8 رموز." : "Please fill all required fields. Password must be at least 8 characters.");
                    return;
                  }
                  try {
                    await createMutation.mutateAsync({
                      fullName: modalName,
                      email: modalEmail,
                      password: modalPassword,
                      confirmPassword: modalPassword,
                      phone: modalPhone || undefined,
                      academicLevel: modalAcademicLevel || undefined,
                    });
                    toast.success(isRtl ? "تم إنشاء حساب الطالب بنجاح" : "Student created successfully.");
                    setCreating(false);
                    setModalName("");
                    setModalEmail("");
                    setModalPassword("");
                    setModalPhone("");
                    setModalAcademicLevel("");
                    refetch();
                  } catch (err) {
                    toast.error(getErrorMessage(err, "Failed to create student."));
                  }
                }}
                className="rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white transition"
              >
                {createMutation.isPending ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ" : "Save Student")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#1A1A22] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-white/5">
              {isRtl ? "تعديل الملف الشخصي للطالب" : "Edit Student Profile"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "الاسم الكامل" : "Full Name"}
                </label>
                <input
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <input
                  type="email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "رقم الهاتف" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? "المستوى الدراسي / السنة" : "Academic Level"}
                </label>
                <select
                  value={modalAcademicLevel}
                  onChange={(e) => setModalAcademicLevel(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                >
                  <option value="">{isRtl ? "عام / غير محدد" : "General / Unspecified"}</option>
                  <option value="PREPARATORY">{isRtl ? "إعدادي هندسة" : "Preparatory Year"}</option>
                  <option value="FIRST_YEAR">{isRtl ? "الفرقة الأولى" : "First Year"}</option>
                  <option value="SECOND_YEAR">{isRtl ? "الفرقة الثانية" : "Second Year"}</option>
                  <option value="THIRD_YEAR">{isRtl ? "الفرقة الثالثة" : "Third Year"}</option>
                  <option value="FOURTH_YEAR">{isRtl ? "الفرقة الرابعة" : "Fourth Year"}</option>
                  <option value="GRADUATE">{isRtl ? "خريج" : "Graduate"}</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#0F0F13] border border-slate-100 dark:border-white/5">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isRtl ? "حالة الحساب" : "Account Status"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isRtl ? "تعليق حساب الطالب يمنعه من تسجيل الدخول للمنصة." : "Suspending the account blocks the student from signing in."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isActiveToggle"
                    type="checkbox"
                    checked={modalIsActive}
                    onChange={(e) => setModalIsActive(e.target.checked)}
                    className="rounded text-[#EE7C11] focus:ring-[#EE7C11]/30 h-5 w-5 cursor-pointer"
                  />
                  <label htmlFor="isActiveToggle" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    {modalIsActive ? (isRtl ? "نشط" : "Active") : (isRtl ? "معلق" : "Suspended")}
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-300">
              <p className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
                {isRtl ? "تعديل كلمة المرور (اختياري)" : "Update Password (Optional)"}
              </p>
              <p className="mt-1">
                {isRtl ? "في حال قمت بتعيين كلمة مرور جديدة، فسيتم تسجيل خروج الطالب تلقائياً من جميع أجهزته الحالية." : "If you set a new password, the student will be logged out from all active sessions."}
              </p>
              <input
                type="password"
                value={modalPassword}
                onChange={(e) => setModalPassword(e.target.value)}
                placeholder={isRtl ? "كلمة المرور الجديدة (8 رموز كحد أدنى)" : "New password (min 8 characters)"}
                className="mt-2.5 h-10 w-full rounded-xl border border-amber-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-amber-500 dark:border-amber-500/30 dark:bg-[#0F0F13] dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => { setEditing(null); setModalPassword(""); }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-white/10 dark:text-white dark:hover:bg-slate-800"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateMutation.mutateAsync({
                      id: editing.id,
                      body: {
                        fullName: modalName,
                        email: modalEmail,
                        phone: modalPhone || undefined,
                        academicLevel: modalAcademicLevel || null,
                        isActive: modalIsActive,
                      },
                    });
                    if (modalPassword) {
                      if (modalPassword.length < 8) {
                        toast.error(isRtl ? "كلمة المرور يجب أن لا تقل عن 8 رموز." : "Password must be at least 8 characters.");
                        return;
                      }
                      await setPasswordMutation.mutateAsync({ id: editing.id, newPassword: modalPassword });
                    }
                    toast.success(isRtl ? "تم تعديل بيانات الطالب بنجاح" : "Student profile updated successfully.");
                    setEditing(null);
                    setModalPassword("");
                    refetch();
                  } catch (err) {
                    toast.error(getErrorMessage(err, "Failed to update student profile."));
                  }
                }}
                className="rounded-xl bg-[#EE7C11] px-5 py-2.5 text-sm font-bold text-white transition"
              >
                {updateMutation.isPending ? (isRtl ? "جاري الحفظ..." : "Saving...") : (isRtl ? "حفظ التعديلات" : "Save Changes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Students;
