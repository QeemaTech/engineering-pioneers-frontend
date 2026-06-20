export {
  PERMISSION_GROUPS,
  ALL_PERMISSIONS,
  groupPermissionsFromBackend,
} from "./permissionCatalog.js";

export const buildPermission = (resource, action) => `${resource}:${action}`;
