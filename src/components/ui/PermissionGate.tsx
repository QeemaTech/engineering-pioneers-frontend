import type { ReactNode } from "react";
import { usePermissions } from "../../hooks/usePermissions";

type Props = {
  permission?: string;
  anyOf?: string[];
  fallback?: ReactNode;
  children: ReactNode;
};

export default function PermissionGate({
  permission,
  anyOf,
  fallback = null,
  children,
}: Props) {
  const { hasPermission, hasAnyPermission } = usePermissions();

  const allowed = permission
    ? hasPermission(permission)
    : anyOf?.length
      ? hasAnyPermission(anyOf)
      : true;

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
