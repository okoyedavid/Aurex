import type {
  AcceptInviteMeta,
  BusinessInvite,
  CreateInvitePayload,
  InviteEmployee,
  PendingApprovalInvite,
} from "@/lib/access-api";
import type { Employee } from "@/lib/employee-lists-api";
import type { Permission } from "@/types/generic";

export type EmployeeSource = "existing" | "new";
export type InviteManagementView = "sent" | "approvals";
export type SentInvitationTone = "good" | "bad" | "warn" | "neutral";

const inviteStatusLabels: Record<BusinessInvite["status"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  revoked: "Revoked",
  expired: "Expired",
};

export function sentInvitationPresentation(
  invite: Pick<BusinessInvite, "status" | "approvalStatus">,
): {
  label: string;
  tone: SentInvitationTone;
  approvalRequired: boolean;
} {
  if (invite.status === "accepted" && invite.approvalStatus === "pending") {
    return {
      label: "Approval required",
      tone: "warn",
      approvalRequired: true,
    };
  }
  if (invite.approvalStatus === "rejected") {
    return { label: "Rejected", tone: "bad", approvalRequired: false };
  }
  return {
    label: inviteStatusLabels[invite.status],
    tone:
      invite.status === "accepted"
        ? "good"
        : invite.status === "pending"
          ? "warn"
          : "bad",
    approvalRequired: false,
  };
}

export function resolveInviteManagementView(
  requested: InviteManagementView,
  canInvite: boolean,
  canApprove: boolean,
): InviteManagementView {
  if (requested === "approvals") return canApprove ? "approvals" : "sent";
  return canInvite ? "sent" : "approvals";
}

export function canBrowseExistingEmployees(
  permissions: ReadonlySet<Permission>,
) {
  return (
    permissions.has("members:invite") &&
    permissions.has("employee_lists:view") &&
    permissions.has("employees:view")
  );
}

export function canSelectEmployee(employeeListId: string) {
  return Boolean(employeeListId);
}

export function buildInvitationPayload({
  type,
  email,
  roleId,
  employeeSource,
  employeeId,
}: {
  type: BusinessInvite["type"];
  email: string;
  roleId: string;
  employeeSource?: EmployeeSource;
  employeeId?: string;
}): CreateInvitePayload {
  const common = { email: email.trim(), roleId };
  if (type === "MEMBER") return { type, ...common };
  if (employeeSource === "existing" && employeeId) {
    return { type, ...common, employeeId };
  }
  return { type, ...common };
}

export function changeEmployeeList(
  employeeListId: string,
): { employeeListId: string; employeeId: string; employeePage: number } {
  return { employeeListId, employeeId: "", employeePage: 1 };
}

export function isEmployeeLinked(employee: Pick<Employee, "businessMemberId">) {
  return Boolean(employee.businessMemberId);
}

export function effectiveRolePermissions(
  role: Pick<BusinessInvite["roleId"], "permissions" | "deniedPermissions">,
): Permission[] {
  const denied = new Set(role.deniedPermissions);
  return role.permissions.filter((permission) => !denied.has(permission));
}

export function invitationAcceptanceMessage(meta: AcceptInviteMeta) {
  if (meta.requiresApproval) {
    return "Invitation accepted. Access is awaiting approval.";
  }
  if (meta.membershipActivated) {
    return "Invitation accepted. Business access is ready.";
  }
  return "Invitation accepted. The workflow is still processing.";
}

export function populatedEmployee(
  employeeId: BusinessInvite["employeeId"],
): InviteEmployee | null {
  return employeeId && typeof employeeId === "object" ? employeeId : null;
}

export function employeeListIdentity(employee: InviteEmployee) {
  return typeof employee.employeeListId === "string"
    ? { id: employee.employeeListId, name: null }
    : { id: employee.employeeListId.id, name: employee.employeeListId.name };
}

export function needsEmployeeCreation(
  invite: Pick<BusinessInvite, "type" | "employeeId">,
) {
  return invite.type === "EMPLOYEE" && !invite.employeeId;
}

export function membershipApprovalPresentation(
  invite: Pick<PendingApprovalInvite, "membershipContext" | "roleId">,
) {
  return {
    kind: invite.membershipContext.roleOutcome,
    requestedRole: invite.roleId.name,
    currentRole: invite.membershipContext.currentRole?.name ?? null,
    preservesCurrentRole:
      invite.membershipContext.roleOutcome === "preserve_current",
    blocked:
      invite.membershipContext.roleOutcome === "blocked_suspended" ||
      invite.membershipContext.roleOutcome === "blocked_existing_member",
  };
}

export function approvalPermissionGate(
  invite: Pick<PendingApprovalInvite, "type" | "employeeId">,
  permissions: ReadonlySet<Permission>,
) {
  const missing: Permission[] = [];
  if (!permissions.has("roles:assign")) missing.push("roles:assign");
  if (invite.type === "EMPLOYEE" && invite.employeeId) {
    if (!permissions.has("employees:update")) missing.push("employees:update");
  }
  if (invite.type === "EMPLOYEE" && !invite.employeeId) {
    if (!permissions.has("employees:create")) missing.push("employees:create");
    if (!permissions.has("employee_lists:view")) {
      missing.push("employee_lists:view");
    }
  }
  return { allowed: missing.length === 0, missing };
}

export function membershipOutcomeBlocksApproval(
  invite: Pick<PendingApprovalInvite, "membershipContext">,
) {
  return (
    invite.membershipContext.roleOutcome === "blocked_suspended" ||
    invite.membershipContext.roleOutcome === "blocked_existing_member"
  );
}
