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
  const { t } = useTranslation();
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
          <span className="font-semibold text-slate-900 dark:text-white">{row.fullName || "-"}</span>
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
          <button onClick={() => { setEditing(row); setModalName(row.fullName || ""); setModalEmail(row.email || ""); setModalPassword(""); }} className="inline-flex rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/15">Edit</button>
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
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white"
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
            iconWrap: "bg-amber-500/10 text-amber-400",
          },
        ]}
      />
      <FilterBar>
        <div className="relative lg:col-span-6">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("adminPages.students.searchPlaceholder")} className="h-10 w-full rounded-lg border border-slate-200 bg-white ps-9 pe-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300 lg:col-span-3">
          {["All", "Active", "Inactive", "Banned"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-slate-300 lg:col-span-3">
          {["Newest", "Oldest", "Name A-Z"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </FilterBar>
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/8 dark:bg-[#1A1A22] dark:text-slate-400">Loading students...</div>
      ) : isError ? (
        <div className="rounded-xl border border-red-200 bg-[#EE7C11]/10 p-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-[#EE7C11]/10 dark:text-red-300">
          {getErrorMessage(error, "Failed to load students.")}
          <button onClick={() => refetch()} className="ms-3 rounded bg-[#EE7C11] px-2 py-1 text-xs font-bold text-white">Retry</button>
        </div>
      ) : filtered.length ? (
        <DataTable
          columns={columns}
          rows={filtered}
          pagination={
            <div className="flex justify-end gap-2">
              {Array.from({ length: Math.max(1, Math.ceil((data?.meta?.total || filtered.length) / 8)) }).map((_, idx) => {
                const p = idx + 1;
                return (
                <button key={p} onClick={() => setPage(p)} className={`rounded-md px-3 py-1 text-sm ${page === p ? "bg-[#EE7C11] text-white" : "border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"}`}>
                  {p}
                </button>
              )})}
            </div>
          }
        />
      ) : (
        <EmptyState
          title={t("adminPages.students.empty")}
          message={t("adminPages.students.subtitle")}
          cta={
            <button
              type="button"
              onClick={() => {
                setCreating(true);
                setModalName("");
                setModalEmail("");
                setModalPassword("");
              }}
              className="rounded-lg bg-[#EE7C11] px-4 py-2 text-sm font-bold text-white"
            >
              {t("adminPages.students.addFirst")}
            </button>
          }
        />
      )}
      {creating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-[#1A1A22]">
            <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">{t("adminPages.students.addStudent")}</h3>
            <div className="space-y-3">
              <input
                value={modalName}
                onChange={(e) => setModalName(e.target.value)}
                placeholder={t("adminPages.students.table.name")}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
              <input
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                placeholder={t("adminPages.students.table.email")}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
              <input
                type="password"
                value={modalPassword}
                onChange={(e) => setModalPassword(e.target.value)}
                placeholder="Password (min 8 chars)"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreating(false)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!modalName || !modalEmail || modalPassword.length < 8) {
                      toast.error("Please fill all fields. Password must be at least 8 characters.");
                      return;
                    }
                    try {
                      await createMutation.mutateAsync({
                        fullName: modalName,
                        email: modalEmail,
                        password: modalPassword,
                        confirmPassword: modalPassword,
                      });
                      toast.success("Student created successfully.");
                      setCreating(false);
                      setModalName("");
                      setModalEmail("");
                      setModalPassword("");
                    } catch (err) {
                      toast.error(getErrorMessage(err, "Failed to create student."));
                    }
                  }}
                  className="rounded-lg bg-[#EE7C11] px-3 py-2 text-sm font-bold text-white"
                >
                  {createMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-[#1A1A22]">
            <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Edit Student</h3>
            <div className="space-y-3">
              <input value={modalName} onChange={(e) => setModalName(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
              <input value={modalEmail} onChange={(e) => setModalEmail(e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white" />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setEditing(null); setModalPassword(""); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:text-white">Cancel</button>
                <button
                  onClick={async () => {
                    try {
                      await updateMutation.mutateAsync({
                        id: editing.id,
                        body: { fullName: modalName, email: modalEmail },
                      });
                      if (modalPassword) {
                        if (modalPassword.length < 8) {
                          toast.error("Password must be at least 8 characters.");
                          return;
                        }
                        await setPasswordMutation.mutateAsync({ id: editing.id, newPassword: modalPassword });
                      }
                      toast.success("Student profile updated successfully.");
                      setEditing(null);
                      setModalPassword("");
                    } catch (err) {
                      toast.error(getErrorMessage(err, "Failed to update student profile."));
                    }
                  }}
                  className="rounded-lg bg-[#EE7C11] px-3 py-2 text-sm font-bold text-white"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              <p className="font-bold uppercase tracking-wider">Warning</p>
              <p className="mt-1">If you set a new password, the student will be logged out from existing sessions.</p>
              <input
                type="password"
                value={modalPassword}
                onChange={(e) => setModalPassword(e.target.value)}
                placeholder="New password (optional)"
                className="mt-2 h-10 w-full rounded-lg border border-amber-300 bg-white px-3 text-sm text-slate-900 dark:border-amber-500/30 dark:bg-[#0F0F13] dark:text-white"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Students;

