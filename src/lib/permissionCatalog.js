/** Permission groups aligned with backend seed / RBAC catalog */
export const PERMISSION_GROUPS = {
  platform: {
    label: "Platform",
    permissions: [
      { key: "dashboard:read", label: "View dashboard & analytics" },
      { key: "audit:read", label: "View audit logs" },
      { key: "settings:manage", label: "Manage platform settings" },
    ],
  },
  users: {
    label: "Users & access",
    permissions: [
      { key: "user:manage", label: "Manage users" },
      { key: "user:permission:grant", label: "Grant user permissions" },
      { key: "role:manage", label: "Manage roles" },
    ],
  },
  curriculum: {
    label: "Curriculum",
    permissions: [
      { key: "course:manage", label: "Manage courses" },
      { key: "course:review", label: "Review & approve courses" },
      { key: "course:staff:manage", label: "Manage course staff" },
      { key: "curriculum:manage", label: "Manage units, sections & lessons" },
      { key: "category:manage", label: "Manage categories" },
      { key: "class:manage", label: "Manage cohorts / classes" },
      { key: "enrollment:manage", label: "Manage enrollments" },
      { key: "homework:manage", label: "Manage homework" },
    ],
  },
  assessments: {
    label: "Assessments",
    permissions: [
      { key: "exam:manage", label: "Manage exams" },
      { key: "certificate:manage", label: "Issue certificates" },
    ],
  },
  finance: {
    label: "Finance",
    permissions: [
      { key: "finance:manage", label: "Finance overview" },
      { key: "payment:manage", label: "Manage payments" },
      { key: "payout:manage", label: "Manage instructor payouts" },
      { key: "subscription:manage", label: "Manage subscription plans" },
      { key: "coupon:manage", label: "Manage coupons" },
    ],
  },
  people: {
    label: "People",
    permissions: [{ key: "instructor:manage", label: "Manage instructors" }],
  },
  content: {
    label: "Content & support",
    permissions: [
      { key: "cms:manage", label: "Manage CMS (FAQ, posts, banners)" },
      { key: "support:manage", label: "Manage support tickets" },
    ],
  },
};

export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flatMap((group) =>
  group.permissions.map((perm) => perm.key)
);

export function groupPermissionsFromBackend(catalog = []) {
  const known = new Set(ALL_PERMISSIONS);
  const extras = catalog
    .map((p) => p.action || p.name)
    .filter((action) => action && !known.has(action));

  if (extras.length === 0) return PERMISSION_GROUPS;

  return {
    ...PERMISSION_GROUPS,
    other: {
      label: "Other",
      permissions: extras.map((key) => ({ key, label: key })),
    },
  };
}
