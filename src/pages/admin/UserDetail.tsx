import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { ArrowLeft, Mail, Phone, Shield, User, Monitor, Key } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import {
  useAdminUserById,
  useForceLogoutUser,
  useGrantUserPermission,
  useRevokeUserPermission,
  useUserDevices,
  useUserSessions,
} from "../../features/admin/users/hooks";
import { useAdminPermissions } from "../../features/admin/roles/hooks";
import PermissionGate from "../../components/ui/PermissionGate";

const ROLES_STUDENT = "STUDENT";
const ROLES_INSTRUCTOR = "INSTRUCTOR";

export default function UserDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [tab, setTab] = useState("overview");
  const [grantPermissionId, setGrantPermissionId] = useState("");
  const [grantExpiresAt, setGrantExpiresAt] = useState("");

  const { data: user, isLoading, isError } = useAdminUserById(id);
  const { data: permissions = [] } = useAdminPermissions();
  const { data: sessions = [] } = useUserSessions(id);
  const { data: devices = [] } = useUserDevices(id);
  const grantMutation = useGrantUserPermission();
  const revokeMutation = useRevokeUserPermission();
  const forceLogoutMutation = useForceLogoutUser();

  if (isLoading) {
    return (
      <section>
        <PageHeader title={t("adminPages.userDetail.title")} subtitle="" />
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          {t("dashboard.common.loading")}
        </div>
      </section>
    );
  }

  if (isError || !user) {
    return (
      <section>
        <PageHeader title={t("adminPages.userDetail.title")} subtitle="" />
        <div className="rounded-2xl border border-red-100 bg-pioneer-orange-light p-6 text-sm text-red-800">
          {t("adminPages.userDetail.loadError")}
        </div>
        <Link to="/admin/users" className="mt-4 inline-flex text-sm font-semibold text-pioneer-orange hover:underline">
          ← {t("adminPages.userDetail.back")}
        </Link>
      </section>
    );
  }

  const role = typeof user.role === "object" ? user.role.name : String(user.role || "");
  const userPermissions = user.userPermissions || [];

  const handleGrant = async () => {
    if (!grantPermissionId) return;
    try {
      await grantMutation.mutateAsync({
        userId: id,
        permissionId: grantPermissionId,
        expiresAt: grantExpiresAt ? new Date(grantExpiresAt).toISOString() : undefined,
      });
      toast.success(t("adminPages.userDetail.permissionGranted", "Permission granted"));
      setGrantPermissionId("");
      setGrantExpiresAt("");
    } catch {
      toast.error(t("adminPages.userDetail.permissionGrantFailed", "Failed to grant permission"));
    }
  };

  const tabs = [
    { key: "overview", label: t("adminPages.userDetail.tabs.overview", "Overview") },
    { key: "permissions", label: t("adminPages.userDetail.tabs.permissions", "Permissions") },
    { key: "sessions", label: t("adminPages.userDetail.tabs.sessions", "Sessions") },
  ];

  return (
    <section>
      <Link
        to="/admin/users"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-pioneer-orange"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("adminPages.userDetail.back")}
      </Link>
      <PageHeader title={user.fullName || user.email} subtitle={user.email} />

      <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`border-b-2 px-4 py-2 text-sm font-semibold ${
              tab === item.key
                ? "border-pioneer-orange text-pioneer-orange"
                : "border-transparent text-slate-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
              <User className="h-4 w-4 text-pioneer-orange" />
              {t("adminPages.userDetail.identity")}
            </div>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-slate-400">{t("adminPages.userDirectory.table.email")}</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-slate-900">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-400">{t("adminPages.userDirectory.slideDetails.phone")}</dt>
                <dd className="mt-1 flex items-center gap-2 text-sm text-slate-900">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {user.phone || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-400">{t("adminPages.userDirectory.table.role")}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{role}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-slate-400">{t("adminPages.userDirectory.toggleActive")}</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {user.isActive ? t("dashboard.common.active") : t("dashboard.common.inactive")}
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-pioneer-orange/10 to-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Shield className="h-4 w-4 text-pioneer-orange" />
              {t("adminPages.userDetail.quickLinks", "Quick links")}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {role === ROLES_STUDENT ? (
                <Link to={`/admin/students/${user.id}`} className="rounded-xl bg-pioneer-orange px-4 py-2.5 text-center text-sm font-semibold text-white">
                  {t("adminPages.userDetail.openStudent")}
                </Link>
              ) : null}
              {role === ROLES_INSTRUCTOR ? (
                <Link to={`/admin/instructors/${user.id}`} className="rounded-xl bg-pioneer-orange px-4 py-2.5 text-center text-sm font-semibold text-white">
                  {t("adminPages.userDetail.openInstructor")}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "permissions" ? (
        <PermissionGate permission="user:permission:grant" fallback={<p className="text-sm text-slate-500">{t("adminPages.userDetail.noPermissionGrant", "You cannot manage permissions.")}</p>}>
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Key className="h-4 w-4" />
                {t("adminPages.userDetail.grantPermission", "Grant permission")}
              </h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <select
                  value={grantPermissionId}
                  onChange={(e) => setGrantPermissionId(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">{t("adminPages.userDetail.selectPermission", "Select permission…")}</option>
                  {permissions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.action || p.name}
                    </option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  value={grantExpiresAt}
                  onChange={(e) => setGrantExpiresAt(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                />
                <button type="button" onClick={() => void handleGrant()} className="rounded-lg bg-pioneer-orange px-4 py-2 text-sm font-semibold text-white">
                  {t("adminPages.userDetail.grant", "Grant")}
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-bold text-slate-900">{t("adminPages.userDetail.directPermissions", "Direct permissions")}</h3>
              <ul className="mt-3 space-y-2">
                {userPermissions.length === 0 ? (
                  <li className="text-sm text-slate-500">{t("adminPages.userDetail.noDirectPermissions", "None")}</li>
                ) : (
                  userPermissions.map((up) => (
                    <li key={up.id || up.permissionId} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span>{up.permission?.action || up.permissionId}</span>
                      <button
                        type="button"
                        onClick={() =>
                          revokeMutation.mutate(
                            { userId: id, permissionId: up.permissionId || up.permission?.id },
                            { onSuccess: () => toast.success(t("dashboard.common.save")) }
                          )
                        }
                        className="text-xs text-red-600 hover:underline"
                      >
                        {t("adminPages.userDetail.revoke", "Revoke")}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </PermissionGate>
      ) : null}

      {tab === "sessions" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <Monitor className="h-4 w-4" />
                {t("adminPages.userDetail.sessions", "Active sessions")}
              </h3>
              <button
                type="button"
                onClick={() =>
                  forceLogoutMutation.mutate(id, {
                    onSuccess: () => toast.success(t("adminPages.userDetail.forceLogoutDone", "Sessions terminated")),
                  })
                }
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                {t("adminPages.userDetail.forceLogout", "Force logout all")}
              </button>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {sessions.length === 0 ? (
                <li className="text-slate-500">{t("adminPages.userDetail.noSessions", "No active sessions")}</li>
              ) : (
                sessions.map((s) => (
                  <li key={s.id} className="rounded-lg bg-slate-50 px-3 py-2">
                    <p>{s.userAgent || s.deviceName || "Session"}</p>
                    <p className="text-xs text-slate-500">
                      {s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString() : ""}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-bold">{t("adminPages.userDetail.devices", "Devices")}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {devices.length === 0 ? (
                <li className="text-slate-500">{t("adminPages.userDetail.noDevices", "No devices")}</li>
              ) : (
                devices.map((d) => (
                  <li key={d.id} className="rounded-lg bg-slate-50 px-3 py-2">
                    <p>{d.deviceName || "Device"} · {d.os}</p>
                    <p className="text-xs text-slate-500">{d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString() : ""}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
