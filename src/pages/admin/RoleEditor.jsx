import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Check, Loader2, Save, Search, Shield } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/ui/PageHeader";
import PermissionGate from "../../components/ui/PermissionGate";
import { getErrorMessage } from "../../api/error";
import { groupPermissionsFromBackend } from "../../lib/permissionCatalog";
import {
  useAdminPermissions,
  useAdminRole,
  useCreateAdminRole,
  useUpdateAdminRole,
} from "../../features/admin/roles/hooks";

function PermissionMatrix({ groups, selected, onToggle, onSelectGroup, search }) {
  const q = search.trim().toLowerCase();

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([groupId, group]) => {
        const visible = group.permissions.filter(
          (perm) =>
            !q ||
            perm.key.toLowerCase().includes(q) ||
            perm.label.toLowerCase().includes(q) ||
            group.label.toLowerCase().includes(q)
        );
        if (visible.length === 0) return null;

        const allSelected = visible.every((p) => selected.has(p.key));

        return (
          <section key={groupId} className="rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#14141C]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">{group.label}</h3>
              <button
                type="button"
                onClick={() => onSelectGroup(visible.map((p) => p.key), !allSelected)}
                className="text-xs font-bold text-pioneer-orange-normal hover:underline"
              >
                {allSelected ? "Clear group" : "Select group"}
              </button>
            </div>
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {visible.map((perm) => {
                const checked = selected.has(perm.key);
                return (
                  <button
                    key={perm.key}
                    type="button"
                    onClick={() => onToggle(perm.key)}
                    className={`flex items-start gap-3 rounded-xl border p-3 text-start transition ${
                      checked
                        ? "border-pioneer-orange-normal/40 bg-pioneer-orange-normal/5 ring-2 ring-pioneer-orange-normal/10"
                        : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        checked ? "border-pioneer-orange-normal bg-pioneer-orange-normal text-white" : "border-slate-300 dark:border-white/20"
                      }`}
                    >
                      {checked ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">{perm.label}</span>
                      <span className="mt-0.5 block font-mono text-[11px] text-slate-500">{perm.key}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function RoleEditor() {
  const { t, i18n } = useTranslation();
  const tx = (key, fallback) => t(key, { defaultValue: fallback });
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: role, isLoading: loadingRole } = useAdminRole(id);
  const { data: permissionsCatalog = [] } = useAdminPermissions();
  const createMutation = useCreateAdminRole();
  const updateMutation = useUpdateAdminRole();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());

  const groups = useMemo(() => groupPermissionsFromBackend(permissionsCatalog), [permissionsCatalog]);

  useEffect(() => {
    if (!isEdit || !role) return;
    setName(role.name || "");
    setDescription(role.description || "");
    setSelected(new Set(role.permissions || []));
  }, [isEdit, role?.id, role?.name, role?.description, role?.permissions]);

  const toggle = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectGroup = (keys, add) => {
    setSelected((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => (add ? next.add(key) : next.delete(key)));
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(tx("adminPages.settingsRoles.roleNameRequired", "Role name is required"));
      return;
    }
    if (selected.size === 0) {
      toast.error(tx("adminPages.settingsRoles.permissionsRequired", "Select at least one permission"));
      return;
    }

    const body = {
      name: name.trim(),
      description: description.trim() || undefined,
      permissions: Array.from(selected),
    };

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, body });
        toast.success(tx("adminPages.settingsRoles.updated", "Role updated successfully"));
      } else {
        await createMutation.mutateAsync(body);
        toast.success(tx("adminPages.settingsRoles.created", "Role created successfully"));
      }
      navigate("/admin/settings/roles");
    } catch (err) {
      toast.error(getErrorMessage(err, tx("adminPages.settingsRoles.saveFailed", "Failed to save role")));
    }
  };

  const saving = createMutation.isPending || updateMutation.isPending;
  const BackIcon = i18n.dir() === "rtl" ? ArrowLeft : ArrowLeft;

  if (isEdit && loadingRole) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pioneer-orange-normal" />
      </div>
    );
  }

  return (
    <PermissionGate
      permission="role:manage"
      fallback={<p className="text-sm text-slate-500">{tx("common.noAccess", "You do not have access to this section.")}</p>}
    >
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/settings/roles"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300"
          >
            <BackIcon className="h-4 w-4" />
          </Link>
          <PageHeader
            title={
              isEdit
                ? tx("adminPages.settingsRoles.editRole", "Edit role")
                : tx("adminPages.settingsRoles.createRole", "Create new role")
            }
            subtitle={tx(
              "adminPages.settingsRoles.editorSubtitle",
              "Define the role identity and assign granular permissions."
            )}
          />
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#14141C]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-pioneer-orange-normal/10 text-pioneer-orange-normal">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {tx("adminPages.settingsRoles.roleDetails", "Role details")}
              </h3>
              <div className="mt-4 space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {tx("adminPages.settingsRoles.roleName", "Role name")}
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={role?.isSystemRole}
                    placeholder="CUSTOM_MANAGER"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold uppercase disabled:opacity-60 dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {tx("adminPages.settingsRoles.description", "Description")}
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder={tx("adminPages.settingsRoles.descriptionPlaceholder", "What can this role do?")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
                  />
                </label>
              </div>
              <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5">
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {selected.size} {tx("adminPages.settingsRoles.permissionsSelected", "permissions selected")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {tx("adminPages.settingsRoles.permissionsHint", "Users inherit all checked permissions through this role.")}
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal text-sm font-black text-white disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isEdit ? tx("common.save", "Save") : tx("adminPages.settingsRoles.createRole", "Create role")}
                </button>
                <Link
                  to="/admin/settings/roles"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold dark:border-white/10 dark:text-white"
                >
                  {tx("common.cancel", "Cancel")}
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tx("adminPages.settingsRoles.searchPermissions", "Search permissions…")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white ps-10 pe-3 text-sm dark:border-white/10 dark:bg-[#14141C] dark:text-white"
              />
            </div>
            <PermissionMatrix
              groups={groups}
              selected={selected}
              onToggle={toggle}
              onSelectGroup={selectGroup}
              search={search}
            />
          </div>
        </form>
      </section>
    </PermissionGate>
  );
}
