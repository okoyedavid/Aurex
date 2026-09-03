import {
  Activity,
  Bell,
  Building2,
  LayoutDashboard,
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
};

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
  return new Set(role.permissions.filter((permission) => !denied.has(permission)));
}
export function canAccessBusinessNavigationItem(
  item: BusinessNavigationItem,
  permissions: ReadonlySet<Permission>,
) {
  if (item.permission) return permissions.has(item.permission);
  if (item.anyPermission) {
    return item.anyPermission.some((permission) => permissions.has(permission));
  }
  return true;
}
function getBusinessNavigationItems(
  businessId: string,
): BusinessNavigationItem[] {
  const base = `/business/${businessId}`;

  return [
    { name: "Overview", icon: LayoutDashboard, href: base, exact: true },
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
    },
    { name: "Employees", icon: UserRound, href: `${base}/employees`, permission: "employees:view" },
    { name: "Policies", icon: ScrollText, href: `${base}/policies`, anyPermission: ["policies:view", "policies:view_audit"] },
    { name: "Members", icon: Users, href: `${base}/members`, permission: "members:view" },
    { name: "Roles", icon: ShieldCheck, href: `${base}/roles`, permission: "roles:view" },
    { name: "Invites", icon: UserPlus, href: `${base}/invites`, permission: "members:invite" },
    { name: "Audit Logs", icon: Activity, href: `${base}/audit-logs` },
    { name: "Settings", icon: Settings, href: `${base}/settings`, permission: "business:update" },
  ];
}

function getBusinessRouteItems(
  businessId: string,
): BusinessNavigationItem[] {
  const base = `/business/${businessId}`;

  return [
    ...getBusinessNavigationItems(businessId).filter(
      (item) => item.name !== "Payments",
    ),
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
    },
    {
      name: "Invoices",
      icon: WalletCards,
      href: `${base}/invoices`,
      permission: "invoices:view",
    },
    {
      name: "Providers",
      icon: WalletCards,
      href: `${base}/providers`,
      permission: "providers:view",
    },
    {
      name: "Departments",
      icon: UserRound,
      href: `${base}/employee-lists`,
      permission: "employee_lists:view",
    },
  ];
}

export function getBusinessNavigation(
  businessId: string,
  permissions: ReadonlySet<Permission>,
) {
  return getBusinessNavigationItems(businessId).filter((item) =>
    canAccessBusinessNavigationItem(item, permissions),
  );
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
    { matches: pathname === `${base}/employees`, placeholder: "Search employees..." },
    {
      matches: new RegExp(`^${base}/employee-lists/[^/]+$`).test(pathname),
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
): HeaderCommand[] {
  const navigation = getBusinessNavigation(businessId, permissions).map((item) => ({
    label: item.name,
    description: `Go to ${item.name.toLowerCase()}`,
    href: item.href,
    icon: item.icon,
  }));
  const base = `/business/${businessId}`;
  return [
    ...navigation,
    ...(permissions.has("members:invite")
      ? [{ label: "Invite employee", description: "Open employee invitation", href: `${base}/invites?action=invite-employee`, icon: UserPlus }]
      : []),
    ...(permissions.has("policies:create")
      ? [{ label: "Create policy", description: "Open policy creation", href: `${base}/policies?action=create-policy`, icon: ScrollText }]
      : []),
  ];
}
export function getBusinessNavigationItemForPath(
  businessId: string,
  pathname: string,
) {
  return getBusinessRouteItems(businessId).find((item) =>
    isNavigationItemActive(pathname, item),
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

  return (
    pathname === item.href ||
    (!item.exact && pathname.startsWith(`${item.href}/`))
  );
}
