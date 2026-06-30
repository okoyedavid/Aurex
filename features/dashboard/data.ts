import {
  Activity,
  Bell,
  Building2,
  CircleDollarSign,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ListChecks,
  ReceiptText,
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

export function getBusinessNavigationItems(
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

export const dashboardMetrics = [
  {
    label: "Available balance",
    value: "NGN 84.2M",
    detail: "+12.8% this month",
    icon: CircleDollarSign,
  },
  {
    label: "Pending settlements",
    value: "NGN 18.4M",
    detail: "4 expected this week",
    icon: ListChecks,
  },
  {
    label: "Open invoices",
    value: "NGN 32.9M",
    detail: "12 awaiting payment",
    icon: FileText,
  },
];

export const dashboardTransactions = [
  {
    company: "Northstar Retail",
    reference: "INV-2048",
    date: "Today, 10:42",
    amount: "+NGN 8.42M",
    status: "Received",
    incoming: true,
  },
  {
    company: "Atlas Logistics",
    reference: "PAY-8371",
    date: "Today, 09:18",
    amount: "-NGN 2.75M",
    status: "Processing",
    incoming: false,
  },
  {
    company: "Kora Systems",
    reference: "INV-2045",
    date: "Yesterday, 16:05",
    amount: "+NGN 4.98M",
    status: "Received",
    incoming: true,
  },
  {
    company: "Cedar Workspace",
    reference: "PAY-8362",
    date: "Yesterday, 11:30",
    amount: "-NGN 1.28M",
    status: "Completed",
    incoming: false,
  },
];

export const dashboardSettlements = [
  {
    label: "Card collections",
    date: "June 16",
    amount: "NGN 12.48M",
    progress: 82,
  },
  {
    label: "Bank transfers",
    date: "June 17",
    amount: "NGN 4.82M",
    progress: 58,
  },
  {
    label: "Invoice payouts",
    date: "June 18",
    amount: "NGN 1.12M",
    progress: 34,
  },
];

export const cashFlowBars = [44, 58, 48, 72, 66, 84, 76, 92, 70, 88, 78, 96];
