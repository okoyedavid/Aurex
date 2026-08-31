import {
  Activity,
  Bell,
  Building2,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldCheck,
  UserPlus,
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
};

export const personalNavigation = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard", exact: true },
  { name: "Businesses", icon: Building2, href: "/dashboard/business" },
  { name: "Invites", icon: UserPlus, href: "/dashboard/invites" },
  { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  { name: "Activity", icon: Activity, href: "/dashboard/activity" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export const personalSecondaryActions = [
  { name: "Create Business", icon: Building2, href: "/dashboard/business" },
  { name: "Notifications", icon: Bell, href: "/dashboard/notifications" },
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
    { name: "Payments", icon: WalletCards, href: `${base}/payments`, anyPermission: ["payments:view", "payments:view_own"] },
    { name: "Invoices", icon: ReceiptText, href: `${base}/invoices`, permission: "invoices:view" },
    { name: "Providers", icon: ClipboardList, href: `${base}/providers`, permission: "providers:view" },
    {
      name: "Employee Lists",
      icon: ListChecks,
      href: `${base}/employee-lists`,
      permission: "employee_lists:view",
    },
    { name: "Policies", icon: ScrollText, href: `${base}/policies`, anyPermission: ["policies:view", "policies:view_audit"] },
    { name: "Members", icon: Users, href: `${base}/members`, permission: "members:view" },
    { name: "Roles", icon: ShieldCheck, href: `${base}/roles`, permission: "roles:view" },
    { name: "Invites", icon: UserPlus, href: `${base}/invites`, permission: "members:invite" },
    { name: "Audit Logs", icon: Activity, href: `${base}/audit-logs`, permission: "audit_logs:view" },
    { name: "Settings", icon: Settings, href: `${base}/settings`, permission: "business:update" },
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
export function getBusinessNavigationItemForPath(
  businessId: string,
  pathname: string,
) {
  return getBusinessNavigationItems(businessId).find((item) =>
    isNavigationItemActive(pathname, item),
  );
}

export function isNavigationItemActive(
  pathname: string,
  item: { href: string; exact?: boolean },
) {
  return (
    pathname === item.href ||
    (!item.exact && pathname.startsWith(`${item.href}/`))
  );
}
