import type { LucideIcon } from "lucide-react";
import {
  BarChart2,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Headphones,
  Heart,
  Ticket,
  Award,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Home,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  Shield,
  UserCog,
  Users,
  UserCheck,
  Video,
} from "lucide-react";

export type NavItem = {
  labelKey: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
  /** When true, only this path matches (not child routes). */
  exact?: boolean;
  /** Required permission(s) — any match grants access. */
  permission?: string | string[];
};

export type NavGroup = {
  labelKey: string;
  icon: LucideIcon;
  basePath: string;
  children: NavItem[];
  permission?: string | string[];
};

export type NavSection = {
  labelKey: string;
  items: (NavItem | NavGroup)[];
};

export function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
  return "children" in item;
}

function checkNavPermission(
  permission: string | string[] | undefined,
  hasPermission: (p: string) => boolean
) {
  if (!permission) return true;
  const perms = Array.isArray(permission) ? permission : [permission];
  return perms.some(hasPermission);
}

export function filterNavByPermission(
  sections: NavSection[],
  hasPermission: (p: string) => boolean
): NavSection[] {
  return sections
    .map((section) => {
      const items = section.items
        .map((item) => {
          if (isNavGroup(item)) {
            const children = item.children.filter((c) =>
              checkNavPermission(c.permission, hasPermission)
            );
            if (children.length === 0) return null;
            if (!checkNavPermission(item.permission, hasPermission)) return null;
            return { ...item, children };
          }
          if (!checkNavPermission(item.permission, hasPermission)) return null;
          return item;
        })
        .filter(Boolean) as (NavItem | NavGroup)[];

      if (items.length === 0) return null;
      return { ...section, items };
    })
    .filter(Boolean) as NavSection[];
}

export function getAdminNavigation(openTicketsCount = 0): NavSection[] {
  return [
    {
      labelKey: "sidebarNav.sections.analytics",
      items: [
        {
          labelKey: "sidebarNav.items.overview",
          path: "/admin",
          icon: LayoutDashboard,
          exact: true,
          permission: "dashboard:read",
        },
        {
          labelKey: "sidebarNav.items.finance",
          path: "/admin/finance",
          icon: DollarSign,
          permission: "finance:manage",
        },
        {
          labelKey: "sidebarNav.items.analytics",
          path: "/admin/performance",
          icon: LayoutDashboard,
          permission: "dashboard:read",
        },
        {
          labelKey: "sidebarNav.items.coupons",
          path: "/admin/coupons",
          icon: Ticket,
          permission: "coupon:manage",
        },
        {
          labelKey: "sidebarNav.items.certificates",
          path: "/admin/certificates",
          icon: Award,
          permission: "certificate:manage",
        },
      ],
    },
    {
      labelKey: "sidebarNav.sections.management",
      items: [
        {
          labelKey: "sidebarNav.items.allUsers",
          path: "/admin/users",
          icon: UserCog,
          permission: "user:manage",
        },
        {
          labelKey: "sidebarNav.items.students",
          icon: Users,
          basePath: "/admin/students",
          permission: "user:manage",
          children: [
            {
              labelKey: "sidebarNav.items.studentsList",
              path: "/admin/students",
              icon: Users,
              permission: "user:manage",
            },
          ],
        },
        {
          labelKey: "sidebarNav.items.instructors",
          icon: GraduationCap,
          basePath: "/admin/instructors",
          permission: "instructor:manage",
          children: [
            {
              labelKey: "sidebarNav.items.overview",
              path: "/admin/instructors",
              icon: GraduationCap,
              permission: "instructor:manage",
            },
            {
              labelKey: "sidebarNav.items.list",
              path: "/admin/instructors/list",
              icon: GraduationCap,
              permission: "instructor:manage",
            },
            {
              labelKey: "sidebarNav.items.payouts",
              path: "/admin/instructors/payouts",
              icon: GraduationCap,
              permission: "payout:manage",
            },
          ],
        },
        {
          labelKey: "sidebarNav.items.courses",
          icon: BookOpen,
          basePath: "/admin/courses",
          permission: ["course:manage", "course:review"],
          children: [
            {
              labelKey: "sidebarNav.items.allCourses",
              path: "/admin/courses",
              icon: BookOpen,
              permission: "course:manage",
            },
            {
              labelKey: "sidebarNav.items.addCourse",
              path: "/admin/courses/new",
              icon: BookOpen,
              permission: "course:manage",
            },
            {
              labelKey: "sidebarNav.items.reviewQueue",
              path: "/admin/courses/review",
              icon: ClipboardCheck,
              permission: "course:review",
            },
            {
              labelKey: "sidebarNav.items.categories",
              path: "/admin/courses/categories",
              icon: BookOpen,
              permission: "category:manage",
            },
          ],
        },
        {
          labelKey: "sidebarNav.items.enrollments",
          icon: ClipboardList,
          basePath: "/admin/enrollments",
          permission: "enrollment:manage",
          children: [
            {
              labelKey: "sidebarNav.items.history",
              path: "/admin/enrollments",
              icon: ClipboardList,
              permission: "enrollment:manage",
            },
            {
              labelKey: "sidebarNav.items.enrollStudent",
              path: "/admin/enrollments/new",
              icon: ClipboardList,
              permission: "enrollment:manage",
            },
          ],
        },
        {
          labelKey: "sidebarNav.items.exams",
          path: "/admin/exams",
          icon: ClipboardList,
          permission: "exam:manage",
        },
        {
          labelKey: "sidebarNav.items.tickets",
          path: "/admin/tickets",
          icon: MessageSquare,
          badge: openTicketsCount,
          permission: "support:manage",
        },
      ],
    },
    {
      labelKey: "sidebarNav.sections.content",
      items: [
        {
          labelKey: "sidebarNav.items.cms",
          icon: FileText,
          basePath: "/admin/cms",
          permission: "cms:manage",
          children: [
            {
              labelKey: "sidebarNav.items.siteContent",
              path: "/admin/cms",
              icon: FileText,
              exact: true,
              permission: "cms:manage",
            },
            {
              labelKey: "sidebarNav.items.sitePages",
              path: "/admin/cms/pages",
              icon: FileText,
              permission: "cms:manage",
            },
            {
              labelKey: "sidebarNav.items.blogPosts",
              path: "/admin/cms/posts",
              icon: FileText,
              permission: "cms:manage",
            },
            {
              labelKey: "sidebarNav.items.banners",
              path: "/admin/cms/banners",
              icon: FileText,
              permission: "cms:manage",
            },
          ],
        },
      ],
    },
    {
      labelKey: "sidebarNav.sections.system",
      items: [
        {
          labelKey: "sidebarNav.items.auditLogs",
          path: "/admin/audit-logs",
          icon: Shield,
          permission: "audit:read",
        },
        {
          labelKey: "sidebarNav.items.settings",
          icon: Settings2,
          basePath: "/admin/settings",
          permission: "settings:manage",
          children: [
            {
              labelKey: "sidebarNav.items.general",
              path: "/admin/settings",
              icon: Settings2,
              permission: "settings:manage",
            },
            {
              labelKey: "sidebarNav.items.rolesPerms",
              path: "/admin/settings/roles",
              icon: Settings2,
              permission: "role:manage",
            },
            {
              labelKey: "sidebarNav.items.emailTemplates",
              path: "/admin/settings/emails",
              icon: Settings2,
              permission: "settings:manage",
            },
            {
              labelKey: "sidebarNav.items.integrations",
              path: "/admin/settings/integrations",
              icon: Settings2,
              permission: "settings:manage",
            },
          ],
        },
      ],
    },
  ];
}

export function getStudentNavigation(): NavSection[] {
  return [
    {
      labelKey: "sidebarNav.sections.studentOverview",
      items: [
        { labelKey: "sidebarNav.items.overview", path: "/student", icon: LayoutDashboard, exact: true },
        { labelKey: "sidebarNav.items.myCourses", path: "/student/classes", icon: BookOpen },
      ],
    },
    {
      labelKey: "sidebarNav.sections.studentLearning",
      items: [
        { labelKey: "sidebarNav.items.liveSessions", path: "/student/live-sessions", icon: Video },
        { labelKey: "sidebarNav.items.recordings", path: "/student/recordings", icon: Headphones },
        { labelKey: "sidebarNav.items.studentHomework", path: "/student/homework", icon: ClipboardCheck },
        { labelKey: "sidebarNav.items.exams", path: "/student/exams", icon: ClipboardList },
        { labelKey: "sidebarNav.items.progress", path: "/student/progress", icon: BarChart2 },
      ],
    },
    {
      labelKey: "sidebarNav.sections.studentServices",
      items: [
        { labelKey: "sidebarNav.items.bookSession", path: "/student/book-session", icon: CalendarClock },
        { labelKey: "sidebarNav.items.payments", path: "/student/payments", icon: DollarSign },
        { labelKey: "sidebarNav.items.certificates", path: "/student/certificates", icon: Award },
        { labelKey: "sidebarNav.items.tickets", path: "/student/tickets", icon: MessageSquare },
        { labelKey: "sidebarNav.items.wishlist", path: "/student/wishlist", icon: Heart },
        { labelKey: "sidebarNav.items.settings", path: "/student/settings", icon: Settings2 },
      ],
    },
    {
      labelKey: "sidebarNav.sections.studentWebsite",
      items: [
        { labelKey: "sidebarNav.items.websiteHome", path: "/", icon: Home, exact: true },
        { labelKey: "sidebarNav.items.websiteExplore", path: "/explore", icon: Globe },
        { labelKey: "sidebarNav.items.websiteAbout", path: "/about", icon: FileText },
        { labelKey: "sidebarNav.items.websiteFaq", path: "/faq", icon: HelpCircle },
      ],
    },
  ];
}

export function getInstructorNavigation(): NavSection[] {
  return [
    {
      labelKey: "sidebarNav.sections.analytics",
      items: [
        { labelKey: "sidebarNav.items.overview", path: "/instructor/dashboard", icon: LayoutDashboard, exact: true },
        { labelKey: "sidebarNav.items.performance", path: "/instructor/performance", icon: BarChart2 },
      ],
    },
    {
      labelKey: "sidebarNav.sections.academicMatrix",
      items: [
        { labelKey: "sidebarNav.items.myCourses", path: "/instructor/courses", icon: BookOpen },
        { labelKey: "sidebarNav.items.qna", path: "/instructor/qna", icon: MessageSquare },
        { labelKey: "sidebarNav.items.homework", path: "/instructor/homework", icon: ClipboardCheck },
        { labelKey: "sidebarNav.items.exams", path: "/instructor/exams", icon: ClipboardList },
      ],
    },
    {
      labelKey: "sidebarNav.sections.liveOps",
      items: [
        { labelKey: "sidebarNav.items.students", path: "/instructor/students", icon: Users },
        { labelKey: "sidebarNav.items.attendance", path: "/instructor/attendance", icon: UserCheck },
        { labelKey: "sidebarNav.items.availability", path: "/instructor/availability", icon: CalendarClock },
      ],
    },
    {
      labelKey: "sidebarNav.sections.financialsSecurity",
      items: [
        { labelKey: "sidebarNav.items.wallet", path: "/instructor/wallet", icon: DollarSign },
        { labelKey: "sidebarNav.items.settings", path: "/instructor/settings", icon: Settings2 },
      ],
    },
  ];
}
