import {
  Activity,
  Bell,
  Building2,
  ClipboardList,
  LayoutDashboard,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  UserPlus,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { BusinessRole } from "@/lib/business-api";
import type { Permission } from "@/types/generic";

export type BusinessNavigationItem = {
  name: string;
  icon: LucideIcon;
  href: string;
  exact?: boolean;
  permission?: Permission;
  anyPermission?: Permission[];
  activeHrefs?: string[];
  sidebar?: boolean;
  section?: BusinessNavigationSection;
  sectionLabel?: string;
  sectionIcon?: LucideIcon;
};

export type BusinessNavigationSection = "financial" | "employees" | "policies";

export type HeaderCommand = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type HeaderSearchMetadata = {
  mode: "list" | "commands";
  placeholder: string;
};

export const personalNavigation = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard", exact: true },
  { name: "Businesses", icon: Building2, href: "/dashboard/business" },
  { name: "Invites", icon: UserPlus, href: "/dashboard/invites" },
  { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  { name: "Activity", icon: Activity, href: "/dashboard/activity" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export function getEffectivePermissions(role: BusinessRole) {
  const denied = new Set(role.deniedPermissions);
  return new Set(
    role.permissions.filter((permission) => !denied.has(permission)),
  );
}
export function canAccessBusinessNavigationItem(
  item: Pick<BusinessNavigationItem, "permission" | "anyPermission">,
  permissions: ReadonlySet<Permission>,
) {
  if (item.permission) return permissions.has(item.permission);
  if (item.anyPermission) {
    return item.anyPermission.some((permission) => permissions.has(permission));
  }
  return true;
}
function getBusinessRouteItems(
  businessId: string,
): BusinessNavigationItem[] {
  const base = `/business/${businessId}`;

  return [
    {
      name: "Overview",
      icon: LayoutDashboard,
      href: base,
      exact: true,
      sidebar: true,
    },
    {
      name: "Payments",
      icon: WalletCards,
      href: `${base}/payments`,
      anyPermission: [
        "payments:view",
        "payments:view_own",
        "invoices:view",
        "providers:view",
      ],
      activeHrefs: [
        `${base}/payments`,
        `${base}/invoices`,
        `${base}/providers`,
      ],
      sidebar: true,
      section: "financial",
      sectionIcon: WalletCards,
    },
    {
      name: "Invoices",
      icon: ReceiptText,
      href: `${base}/invoices`,
      permission: "invoices:view",
      section: "financial",
      sectionIcon: ReceiptText,
    },
    {
      name: "Providers",
      icon: ClipboardList,
      href: `${base}/providers`,
      permission: "providers:view",
      section: "financial",
      sectionIcon: ClipboardList,
    },
    {
      name: "Employees",
      icon: UserRound,
      href: `${base}/employees`,
      permission: "employees:view",
      sidebar: true,
      section: "employees",
      sectionLabel: "Directory",
    },
    {
      name: "Departments",
      icon: UserRound,
      href: `${base}/employees/employee-lists`,
      permission: "employee_lists:view",
      section: "employees",
    },
    {
      name: "Employee types",
      icon: UserRound,
      href: `${base}/employees/types`,
      permission: "employees:view",
      section: "employees",
    },
    {
      name: "Employee groups",
      icon: UserRound,
      href: `${base}/employees/groups`,
      permission: "employees:view",
      section: "employees",
    },
    {
      name: "Policies",
      icon: ScrollText,
      href: `${base}/policies`,
      permission: "policies:view",
      sidebar: true,
      section: "policies",
    },
    {
      name: "Categories",
      icon: ScrollText,
      href: `${base}/policies/categories`,
      permission: "policies:view",
      section: "policies",
    },
    {
      name: "Policy audit",
      icon: Activity,
      href: `${base}/policies/audit`,
      permission: "policies:view_audit",
      sidebar: true,
      section: "policies",
      sectionLabel: "Audit History",
    },
    {
      name: "Members",
      icon: Users,
      href: `${base}/members`,
      permission: "members:view",
      sidebar: true,
    },
    {
      name: "Roles",
      icon: ShieldCheck,
      href: `${base}/roles`,
      permission: "roles:view",
      sidebar: true,
    },
    {
      name: "Invites",
      icon: UserPlus,
      href: `${base}/invites`,
      anyPermission: ["members:invite", "roles:assign"],
      sidebar: true,
    },
    {
      name: "Audit Logs",
      icon: Activity,
      href: `${base}/audit-logs`,
      sidebar: true,
    },
    {
      name: "Settings",
      icon: Settings,
      href: `${base}/settings`,
      permission: "business:update",
      sidebar: true,
    },
  ];
}

export function getBusinessNavigation(
  businessId: string,
  permissions: ReadonlySet<Permission>,
) {
  return getBusinessRouteItems(businessId).filter(
    (item) =>
      item.sidebar && canAccessBusinessNavigationItem(item, permissions),
  );
}

export function getBusinessSubnavigation(
  businessId: string,
  section: BusinessNavigationSection,
) {
  return getBusinessRouteItems(businessId)
    .filter((item) => item.section === section)
    .map((item) => ({
      label: item.sectionLabel ?? item.name,
      href: item.href,
      icon: item.sectionIcon,
      permission: item.permission,
      anyPermission: item.anyPermission,
      exact: item.exact,
    }));
}

export function getHeaderSearchMetadata(
  pathname: string,
  mode: "personal" | "business",
  businessId?: string,
): HeaderSearchMetadata {
  if (mode === "personal") {
    return { mode: "commands", placeholder: "Search pages and actions..." };
  }

  const base = `/business/${businessId}`;
  const searchableRoutes = [
    {
      matches: pathname === `${base}/employees`,
      placeholder: "Search employees...",
    },
    {
      matches: new RegExp(`^${base}/employees/employee-lists/[^/]+$`).test(
        pathname,
      ),
      placeholder: "Search employees in this department...",
    },
    { matches: pathname === `${base}/roles`, placeholder: "Search roles..." },
  ];
  const searchable = searchableRoutes.find((route) => route.matches);
  return searchable
    ? { mode: "list", placeholder: searchable.placeholder }
    : { mode: "commands", placeholder: "Search pages and actions..." };
}

export function getPersonalHeaderCommands(): HeaderCommand[] {
  return personalNavigation.map((item) => ({
    label: item.name,
    description: `Go to ${item.name.toLowerCase()}`,
    href: item.href,
    icon: item.icon,
  }));
}

export function getBusinessHeaderCommands(
  businessId: string,
  permissions: ReadonlySet<Permission>,
  businessNavigation = getBusinessNavigation(businessId, permissions),
): HeaderCommand[] {
  const navigation = businessNavigation.map(
    (item) => ({
      label: item.name,
      description: `Go to ${item.name.toLowerCase()}`,
      href: item.href,
      icon: item.icon,
    }),
  );
  const base = `/business/${businessId}`;
  return [
    ...navigation,
    ...(permissions.has("members:invite")
      ? [
          {
            label: "Invite employee",
            description: "Open employee invitation",
            href: `${base}/invites?action=invite-employee`,
            icon: UserPlus,
          },
        ]
      : []),
    ...(permissions.has("policies:create")
      ? [
          {
            label: "Create policy",
            description: "Open policy creation",
            href: `${base}/policies?action=create-policy`,
            icon: ScrollText,
          },
        ]
      : []),
  ];
}
export function getBusinessNavigationItemForPath(
  businessId: string,
  pathname: string,
) {
  return getBusinessRouteItems(businessId)
    .filter((item) => isDirectRouteMatch(pathname, item))
    .sort((a, b) => b.href.length - a.href.length)[0];
}

type BusinessRouteAuthorization = Pick<
  BusinessNavigationItem,
  "permission" | "anyPermission"
>;

/**
 * Route authorization is intentionally separate from sidebar metadata. A
 * navigation group can be visible for several reasons while a child route
 * still needs its own capability.
 */
export function getBusinessRouteAuthorization(
  businessId: string,
  pathname: string,
): BusinessRouteAuthorization | null {
  const base = `/business/${businessId}`;
  const rules: Array<{
    match: (value: string) => boolean;
    authorization: BusinessRouteAuthorization;
  }> = [
    { match: (value) => value === base, authorization: {} },
    {
      match: (value) => value === `${base}/invites`,
      authorization: { anyPermission: ["members:invite", "roles:assign"] },
    },
    {
      match: (value) => value === `${base}/settings/integrations`,
      authorization: {
        anyPermission: ["integrations:view", "integrations:manage"],
      },
    },
    {
      match: (value) => value === `${base}/settings`,
      authorization: { permission: "business:update" },
    },
    {
      match: (value) => value === `${base}/policies/audit`,
      authorization: { permission: "policies:view_audit" },
    },
    {
      match: (value) => value === `${base}/policies`,
      authorization: { permission: "policies:view" },
    },
    {
      match: (value) => value === `${base}/policies/categories` ||
        new RegExp(`^${escapeRegExp(base)}/policies/categories/[^/]+$`).test(value),
      authorization: { permission: "policies:view" },
    },
    {
      match: (value) => new RegExp(`^${escapeRegExp(base)}/policies/[^/]+$`).test(value),
      authorization: { permission: "policies:view" },
    },
    {
      match: (value) => new RegExp(`^${escapeRegExp(base)}/employees/[^/]+/policies$`).test(value),
      authorization: { permission: "policies:view" },
    },
    {
      match: (value) => value === `${base}/employees/types` || value === `${base}/employees/groups`,
      authorization: { permission: "employees:view" },
    },
    {
      match: (value) => new RegExp(
        `^${escapeRegExp(base)}/employees/employee-lists/[^/]+/employees/[^/]+/policies$`,
      ).test(value),
      authorization: { permission: "policies:view" },
    },
    {
      match: (value) => value === `${base}/employees/employee-lists` ||
        new RegExp(`^${escapeRegExp(base)}/employees/employee-lists/[^/]+$`).test(value),
      authorization: { permission: "employee_lists:view" },
    },
    {
      match: (value) => value === `${base}/employees` ||
        new RegExp(`^${escapeRegExp(base)}/employees/[^/]+$`).test(value),
      authorization: { permission: "employees:view" },
    },
    {
      match: (value) => value === `${base}/members` ||
        new RegExp(`^${escapeRegExp(base)}/members/[^/]+$`).test(value),
      authorization: { permission: "members:view" },
    },
    {
      match: (value) => value === `${base}/roles`,
      authorization: { permission: "roles:view" },
    },
    {
      match: (value) => value === `${base}/audit-logs`,
      authorization: {},
    },
    {
      match: (value) => value === `${base}/payments`,
      authorization: {
        anyPermission: [
          "payments:view",
          "payments:view_own",
          "invoices:view",
          "providers:view",
        ],
      },
    },
    {
      match: (value) => value === `${base}/invoices`,
      authorization: { permission: "invoices:view" },
    },
    {
      match: (value) => value === `${base}/providers`,
      authorization: { permission: "providers:view" },
    },
  ];

  return rules.find((rule) => rule.match(pathname))?.authorization ?? null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isDirectRouteMatch(
  pathname: string,
  item: { href: string; exact?: boolean },
) {
  return (
    pathname === item.href ||
    (!item.exact && pathname.startsWith(`${item.href}/`))
  );
}

export function isNavigationItemActive(
  pathname: string,
  item: { href: string; exact?: boolean; activeHrefs?: string[] },
) {
  if (
    item.activeHrefs?.some(
      (href) => pathname === href || pathname.startsWith(`${href}/`),
    )
  ) {
    return true;
  }

  return isDirectRouteMatch(pathname, item);
}
