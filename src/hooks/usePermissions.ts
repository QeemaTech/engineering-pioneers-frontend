import { useMemo } from "react";
import useAuthStore from "../store/authStore";
import { hasPermission as checkPermission, hasAdminAccess } from "../config/permissions";

function isPermissionActive(expiresAt?: string | null) {
  if (!expiresAt) return true;
  return new Date(expiresAt) > new Date();
}

export function resolveUserPermissions(user: Record<string, unknown> | null | undefined): string[] {
  if (!user) return [];

  const roleName = String(
    (user.role as { name?: string })?.name || user.role || ""
  ).toUpperCase();
  if (roleName === "SUPER_ADMIN") return ["*"];

  const fromRole =
    (user.role as { permissions?: { permission?: { action: string } }[] })?.permissions
      ?.map((rp) => rp.permission?.action)
      .filter(Boolean) || [];

  const fromUser =
    (user.userPermissions as { permission?: { action: string }; expiresAt?: string }[])
      ?.filter((up) => isPermissionActive(up.expiresAt))
      .map((up) => up.permission?.action)
      .filter(Boolean) || [];

  return [...new Set([...fromRole, ...fromUser])];
}

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const permissions = useMemo(() => resolveUserPermissions(user), [user]);

  const hasPermission = (permission: string) => {
    if (permissions.includes("*")) return true;
    if (permissions.includes(permission)) return true;
    return checkPermission(user, permission);
  };

  const hasAnyPermission = (perms: string[]) =>
    perms.some((p) => hasPermission(p));

  const hasAdminAccessFn = () => hasAdminAccess(user);

  return { permissions, hasPermission, hasAnyPermission, hasAdminAccess: hasAdminAccessFn };
}
