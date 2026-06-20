import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Edit2, Loader2, Plus, Shield, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "../../components/ui/PageHeader";
import PermissionGate from "../../components/ui/PermissionGate";
import { getErrorMessage } from "../../api/error";
import { useAdminRoles, useDeleteAdminRole } from "../../features/admin/roles/hooks";

function SettingsRoles() {
  const { t } = useTranslation();
  const tx = (key, fallback) => t(key, { defaultValue: fallback });
  const { data: roles = [], isLoading } = useAdminRoles();
  const deleteMutation = useDeleteAdminRole();

  const handleDelete = async (role) => {
    if (role?.isSystemRole) {
      toast.error(tx("adminPages.settingsRoles.systemRoleProtected", "System roles cannot be deleted"));
      return;
    }
    if (!window.confirm(tx("adminPages.settingsRoles.deleteConfirm", `Delete role "${role.name}"?`))) return;
    try {
      await deleteMutation.mutateAsync(role.id);
      toast.success(tx("adminPages.settingsRoles.deleted", "Role deleted successfully"));
    } catch (err) {
      toast.error(getErrorMessage(err, tx("adminPages.settingsRoles.deleteFailed", "Failed to delete role")));
    }
  };

  return (
    <PermissionGate
      permission="role:manage"
      fallback={<p className="text-sm text-slate-500">{tx("common.noAccess", "You do not have access to this section.")}</p>}
    >
      <section className="space-y-6">
        <PageHeader
          title={tx("adminPages.settingsRoles.title", "Roles & Permissions")}
          subtitle={tx("adminPages.settingsRoles.subtitle", "Manage role access matrix")}
          action={
            <Link
              to="/admin/settings/roles/new"
              className="inline-flex items-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-pioneer-orange-normal/20"
            >
              <Plus className="h-4 w-4" />
              {tx("adminPages.settingsRoles.newRole", "New Role")}
            </Link>
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 dark:border-white/10 dark:bg-[#14141C]">
            <Loader2 className="h-8 w-8 animate-spin text-pioneer-orange-normal" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <article
                key={role.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#14141C]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1">
                    <Link
                      to={`/admin/settings/roles/${role.id}/edit`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                      title={tx("common.edit", "Edit")}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(role)}
                      disabled={role.isSystemRole || Number(role.userCount || 0) > 0 || deleteMutation.isPending}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-500/10"
                      title={tx("common.delete", "Delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{role.name}</h3>
                  {role.isSystemRole ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      System
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 min-h-10 text-sm text-slate-500 dark:text-slate-400">{role.description || "—"}</p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-white/10">
                  <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Shield className="h-4 w-4 text-pioneer-orange-normal" />
                    {role.permissions?.length || 0}
                  </span>
                  <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Users className="h-4 w-4 text-blue-500" />
                    {role.userCount || 0}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PermissionGate>
  );
}

export default SettingsRoles;
