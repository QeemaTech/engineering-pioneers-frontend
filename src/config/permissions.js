export const APP_ROLES = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
  STAFF: "staff",
};

export function normalizeRole(role) {
  const val = (role && typeof role === "object" ? role.name : role) || "";
  const normalized = String(val).trim().toLowerCase();
  if (normalized === "super_admin" || normalized === "super-admin") return APP_ROLES.ADMIN;
  return normalized;
}

export function hasAnyRole(user, allowedRoles = []) {
  const role = normalizeRole(user?.role?.name || user?.role);
  return allowedRoles.map(normalizeRole).includes(role);
}

export function hasPermission(user, permission) {
  if (!user) return false;

  const roleName = String(user.role?.name || user.role || "").toUpperCase();
  if (roleName === "SUPER_ADMIN") return true;

  if (Array.isArray(user.resolvedPermissions)) {
    if (user.resolvedPermissions.includes("*")) return true;
    return user.resolvedPermissions.includes(permission);
  }

  const rolePermissions = user.role?.permissions?.map((p) => p.permission?.action || p.action || p) || [];
  const directPermissions =
    user.userPermissions
      ?.filter((up) => !up.expiresAt || new Date(up.expiresAt) > new Date())
      .map((p) => p.permission?.action || p.action || p) || [];
  const all = [...rolePermissions, ...directPermissions];

  return all.includes(permission);
}

export function hasAdminAccess(user) {
  if (!user) return false;

  const roleName = String(user.role?.name || user.role || "").toUpperCase();
  if (roleName === "SUPER_ADMIN") return true;

  const adminPrefixes = [
    "dashboard:",
    "user:",
    "role:",
    "course:",
    "curriculum:",
    "exam:",
    "finance:",
    "payout:",
    "subscription:",
    "coupon:",
    "support:",
    "cms:",
    "settings:",
    "audit:",
    "instructor:",
    "class:",
    "enrollment:",
    "category:",
    "homework:",
  ];

  if (Array.isArray(user.resolvedPermissions)) {
    if (user.resolvedPermissions.includes("*")) return true;
    return user.resolvedPermissions.some((p) =>
      adminPrefixes.some((prefix) => p.startsWith(prefix))
    );
  }

  const perms = [
    ...(user.role?.permissions?.map((p) => p.permission?.action || p.action || p) || []),
    ...(user.userPermissions?.map((p) => p.permission?.action || p.action || p) || []),
  ];

  return perms.some((p) => adminPrefixes.some((prefix) => p.startsWith(prefix)));
}
