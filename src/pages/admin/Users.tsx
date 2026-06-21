import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Download, Eye } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import DataTable from "../../components/ui/DataTable";
import SlideOver from "../../components/ui/SlideOver";
import usePaginatedQuery from "../../hooks/usePaginatedQuery";
import {
  useAdminUsers,
  useToggleAdminUserActive,
  useUpdateAdminUser,
} from "../../features/admin/users/hooks";
import { useAdminRoles } from "../../features/admin/roles/hooks";

function downloadUsersCsv(rows) {
  const headers = ["id", "fullName", "email", "role", "isActive", "phone", "createdAt"];
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    if (/[\",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          if (h === "role") {
            const name = typeof r.role === "object" ? r.role?.name : r.role;
            return esc(name);
          }
          return esc(r[h]);
        })
        .join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pioneer-users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Users() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, limit, search, role, status } = usePaginatedQuery(searchParams);
  const [draftSearch, setDraftSearch] = useState(search);

  const [roleUser, setRoleUser] = useState(null);
  const [roleDraft, setRoleDraft] = useState("");

  const apiParams = useMemo(() => {
    const p = { page, limit };
    if (search.trim()) p.search = search.trim();
    if (role) p.role = role;
    if (status === "active") p.isActive = "true";
    if (status === "inactive") p.isActive = "false";
    return p;
  }, [page, limit, search, role, status]);

  const { data, isLoading, isError } = useAdminUsers(apiParams);
  const { data: roles = [] } = useAdminRoles();
  const users = data?.users || [];
  const meta = data?.meta;

  const toggleActive = useToggleAdminUserActive();
  const updateUser = useUpdateAdminUser();

  const setParam = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === undefined || v === "") next.delete(k);
      else next.set(k, v);
    });
    setSearchParams(next);
  };

  const saveRole = async () => {
    if (!roleUser || !roleDraft) return;
    try {
      await updateUser.mutateAsync({ id: roleUser.id, body: { roleId: roleDraft } });
      toast.success(t("dashboard.common.save"));
      setRoleUser(null);
    } catch {
      toast.error(t("adminPages.userDirectory.loadError"));
    }
  };

  const columns = [
    {
      key: "fullName",
      title: t("adminPages.userDirectory.table.name"),
      render: (_, row) => <span className="font-semibold text-slate-900 dark:text-white">{row.fullName}</span>,
    },
    {
      key: "email",
      title: t("adminPages.userDirectory.table.email"),
      render: (v) => <span className="text-slate-500 dark:text-slate-400 font-medium">{v}</span>,
    },
    {
      key: "role",
      title: t("adminPages.userDirectory.table.role"),
      render: (v, row) => {
        const name = typeof row.role === "object" ? row.role?.name : String(v || "");
        const isStudent = name.toUpperCase() === "STUDENT";
        const isInstructor = name.toUpperCase() === "INSTRUCTOR" || name.toUpperCase() === "TEACHER";
        const isAdmin = name.toUpperCase().includes("ADMIN");

        let themeClass = "bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:border-white/5";
        if (isAdmin) {
          themeClass = "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30";
        } else if (isInstructor) {
          themeClass = "bg-pioneer-orange/10 text-pioneer-orange border border-pioneer-orange/20 dark:bg-pioneer-orange/15 dark:text-[#EE7C11] dark:border-[#EE7C11]/30";
        }

        return (
          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest ${themeClass}`}>
            {name}
          </span>
        );
      },
    },
    {
      key: "isActive",
      title: t("adminPages.userDirectory.table.status"),
      render: (v) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${v
            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-450 dark:border-emerald-500/35"
            : "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-450 dark:border-rose-500/35"
          }`}>
          <span className={`me-1.5 h-1.5 w-1.5 rounded-full ${v ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
          {v ? t("dashboard.common.active") : t("dashboard.common.inactive")}
        </span>
      ),
    },
    {
      key: "id",
      title: t("adminPages.userDirectory.table.actions"),
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer select-none dark:text-slate-400">
            <input
              type="checkbox"
              className="h-4.5 w-4.5 rounded border-slate-300 text-pioneer-orange focus:ring-pioneer-orange dark:border-slate-700 dark:bg-[#0F172A]"
              checked={Boolean(row.isActive)}
              onChange={() =>
                toggleActive.mutate(row.id, {
                  onSuccess: () => toast.success(t("dashboard.common.save")),
                  onError: () => toast.error(t("adminPages.userDirectory.loadError")),
                })
              }
            />
            <span>{t("adminPages.userDirectory.toggleActive")}</span>
          </label>
          <Link to={`/admin/users/${row.id}`} className="inline-flex rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:border-pioneer-orange hover:text-pioneer-orange dark:border-slate-800 dark:bg-[#1E293B] dark:text-slate-400 dark:hover:text-white" title={t("adminPages.userDirectory.viewProfile")}>
            <Eye className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => {
              setRoleUser(row);
              const roleId = typeof row.role === "object" ? row.role?.id : "";
              setRoleDraft(roleId || "");
            }}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:border-pioneer-orange hover:text-pioneer-orange dark:border-slate-800 dark:bg-[#1E293B] dark:text-slate-400 dark:hover:text-white"
          >
            {t("adminPages.userDirectory.menu.editRole")}
          </button>
        </div>
      ),
    },
  ];

  const totalPages = meta?.totalPages ?? 1;

  return (
    <section>
      <PageHeader
        title={t("adminPages.userDirectory.title")}
        subtitle={t("adminPages.userDirectory.subtitle")}
        actions={
          <button
            type="button"
            onClick={() => downloadUsersCsv(users)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm dark:text-white dark:text-pioneer-white font-semibold text-slate-800 hover:border-pioneer-orange hover:text-pioneer-orange dark:border-slate-800 dark:bg-[#1E293B] dark:text-slate-250 dark:hover:text-pioneer-orange"
          >
            <Download className="h-4 w-4" />
            {t("adminPages.userDirectory.export")}
          </button>
        }
      />

      <div className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-12 md:items-end dark:border-slate-800 dark:bg-[#1E293B]">
        <div className="md:col-span-4">
          <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t("adminPages.userDirectory.filters.role")}</label>
          <select value={role} onChange={(e) => setParam({ role: e.target.value || undefined, page: "1" })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-[#0F172A] dark:text-white dark:focus:border-pioneer-orange outline-none transition-all">
            <option value="">{t("adminPages.userDirectory.filters.allRoles")}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t("adminPages.userDirectory.filters.status")}</label>
          <select value={status} onChange={(e) => setParam({ status: e.target.value || undefined, page: "1" })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-[#0F172A] dark:text-white dark:focus:border-pioneer-orange outline-none transition-all">
            <option value="">{t("adminPages.userDirectory.filters.allStatuses")}</option>
            <option value="active">{t("adminPages.userDirectory.filters.active")}</option>
            <option value="inactive">{t("adminPages.userDirectory.filters.suspended")}</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400">{t("adminPages.common.search")}</label>
          <input
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setParam({ search: draftSearch.trim() || undefined, page: "1" })}
            placeholder={t("adminPages.userDirectory.filters.searchPlaceholder")}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-[#0F172A] dark:text-white dark:focus:border-pioneer-orange outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 md:col-span-1">
          <button type="button" onClick={() => setParam({ search: draftSearch.trim() || undefined, page: "1" })} className="mt-6 w-full rounded-xl bg-pioneer-orange px-3 py-2 text-sm font-semibold text-white">
            {t("adminPages.userDirectory.filters.apply")}
          </button>
        </div>
      </div>

      {isError ? <div className="mb-4 rounded-xl border border-red-100 bg-pioneer-orange-light p-4 text-sm text-red-800">{t("adminPages.userDirectory.loadError")}</div> : null}

      <DataTable
        columns={columns}
        rows={isLoading ? [] : users}
        pagination={
          meta ? (
            <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-2 text-sm text-slate-600 dark:text-slate-400">
              <span>{t("adminPages.userDirectory.pagination.page", { page: meta.page, pages: totalPages })}</span>
              <div className="flex items-center gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setParam({ page: String(Math.max(1, page - 1)) })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">{t("adminPages.pagination.prev")}</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setParam({ page: String(Math.min(totalPages, page + 1)) })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">{t("adminPages.pagination.next")}</button>
              </div>
            </div>
          ) : null
        }
      />

      <SlideOver open={Boolean(roleUser)} onClose={() => setRoleUser(null)} title={t("adminPages.userDirectory.slideRole.title")}>
        {roleUser ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{roleUser.email}</p>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">{t("adminPages.userDirectory.slideRole.role")}</label>
              <select value={roleDraft} onChange={(e) => setRoleDraft(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-[#0F172A] dark:text-white">
                <option value="">{t("adminPages.userDirectory.slideRole.select", "Select role")}</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" disabled={updateUser.isPending} onClick={() => void saveRole()} className="w-full rounded-xl bg-pioneer-orange py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {t("adminPages.userDirectory.slideRole.save")}
            </button>
          </div>
        ) : null}
      </SlideOver>
    </section>
  );
}
