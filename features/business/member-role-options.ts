import type { Permission } from "@/types/generic";

export const permissionLabels: Record<Permission, string> = {
  "business:update": "Allow this person to update business settings",
  "members:invite": "Allow this person to invite members",
  "members:remove": "Allow this person to remove member access",
  "members:update_role": "Allow this person to change member roles",
  "members:update_status": "Allow this person to change member status",
  "members:view": "Allow this person to view members",
  "payments:create": "Allow this person to create payments",
  "payments:view": "Allow this person to view all payments",
  "payments:view_own": "Allow this person to view their own payments",
  "payments:approve": "Allow this person to approve payments",
  "payments:cancel": "Allow this person to cancel payments",
  "providers:create": "Allow this person to create providers",
  "providers:update": "Allow this person to update providers",
  "providers:view": "Allow this person to view providers",
  "invoices:create": "Allow this person to create invoices",
  "invoices:view": "Allow this person to view invoices",
  "reports:view": "Allow this person to view reports",
  "audit_logs:view": "Allow this person to view audit logs",
  "roles:view": "Allow this person to view roles",
  "roles:create": "Allow this person to create roles",
  "roles:update": "Allow this person to update roles",
  "roles:delete": "Allow this person to archive roles",
  "roles:assign": "Allow this person to approve privileged role assignments",
  "employee_lists:create": "Allow this person to create employee lists",
  "employee_lists:view": "Allow this person to view employee lists",
  "employee_lists:update": "Allow this person to update employee lists",
  "employee_lists:archive": "Allow this person to archive employee lists",
  "employees:create": "Allow this person to create employees",
  "employees:view": "Allow this person to view employees",
  "employees:update": "Allow this person to update employees",
  "employees:archive": "Allow this person to archive employees",
  "employees:verify": "Allow this person to verify employees",
};

export const assignableSystemRoles = [
  {
    key: "admin",
    name: "Admin",
    permissions: [
      "members:invite",
      "members:view",
      "members:update_status",
      "payments:create",
      "payments:approve",
      "payments:view",
      "providers:create",
      "providers:update",
      "invoices:create",
      "invoices:view",
      "reports:view",
      "audit_logs:view",
      "employee_lists:create",
      "employee_lists:view",
      "employee_lists:update",
      "employee_lists:archive",
      "employees:create",
      "employees:view",
      "employees:update",
      "employees:archive",
      "employees:verify",
    ],
  },
  {
    key: "finance_manager",
    name: "Finance Manager",
    permissions: [
      "payments:create",
      "payments:approve",
      "payments:view",
      "providers:create",
      "invoices:create",
      "invoices:view",
      "reports:view",
      "employee_lists:create",
      "employee_lists:view",
      "employee_lists:update",
      "employees:create",
      "employees:view",
      "employees:update",
      "employees:verify",
      "members:view",
    ],
  },
  {
    key: "accountant",
    name: "Accountant",
    permissions: [
      "payments:view",
      "invoices:view",
      "reports:view",
      "members:view",
      "employee_lists:view",
      "employees:view",
    ],
  },
  {
    key: "contributor",
    name: "Contributor",
    permissions: ["payments:create", "members:view", "payments:view_own"],
  },
  {
    key: "viewer",
    name: "Viewer",
    permissions: [
      "payments:view",
      "invoices:view",
      "members:view",
      "reports:view",
    ],
  },
] satisfies Array<{ key: string; name: string; permissions: Permission[] }>;

export const customRolePermissions = Object.keys(permissionLabels).filter(
  (permission) => permission !== "roles:view",
) as Permission[];

export function canUpdateMemberRole(permissions: ReadonlySet<Permission>) {
  return (
    permissions.has("members:update_role") &&
    permissions.has("roles:assign") &&
    permissions.has("roles:view")
  );
}

export function canUpdateMemberStatus(permissions: ReadonlySet<Permission>) {
  return permissions.has("members:update_status");
}

export function getMemberMutationActions(
  permissions: ReadonlySet<Permission>,
  member: { isOwner: boolean; isCurrentUser: boolean; isRemoved: boolean },
) {
  const protectedMember =
    member.isOwner || member.isCurrentUser || member.isRemoved;
  return {
    role: !protectedMember && canUpdateMemberRole(permissions),
    status: !protectedMember && canUpdateMemberStatus(permissions),
    remove: !protectedMember && permissions.has("members:remove"),
  };
}
