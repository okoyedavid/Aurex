import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  BusinessInvite,
  BusinessRole,
  InviteEmployee,
  InviteMembershipContext,
  PendingApprovalInvite,
} from "@/lib/access-api";
import type { Permission } from "@/types/generic";
import { BusinessApiError } from "@/lib/business-api";

import { InviteEmployeeSummary } from "./invite-employee-summary";
import { SentInviteCard } from "./business-invites-page";
import { MembershipOutcome } from "./membership-outcome";
import { ErrorState } from "./shared";
import {
  approvalPermissionGate,
  buildInvitationPayload,
  canBrowseExistingEmployees,
  canSelectEmployee,
  changeEmployeeList,
  invitationAcceptanceMessage,
  isEmployeeLinked,
  membershipApprovalPresentation,
  membershipOutcomeBlocksApproval,
  needsEmployeeCreation,
  resolveInviteManagementView,
  sentInvitationPresentation,
} from "./invitation-workflow";

const role = {
  id: "role-1",
  businessId: "business-1",
  name: "Viewer",
  key: "viewer",
  type: "system",
  status: "active",
  permissions: ["members:view"],
  deniedPermissions: [],
  createdAt: "2026-08-30T00:00:00.000Z",
  updatedAt: "2026-08-30T00:00:00.000Z",
} satisfies BusinessRole;

const sentInvite = (
  values: Partial<BusinessInvite> = {},
): BusinessInvite => ({
  id: "invite-1",
  businessId: {
    id: "business-1",
    name: "Aurex",
    industry: "Technology",
  },
  roleId: role,
  email: "employee@example.com",
  type: "EMPLOYEE",
  employeeId: null,
  invitedByUserId: {
    id: "user-1",
    name: "Admin User",
    email: "admin@example.com",
  },
  acceptedByUserId: null,
  rejectedByUserId: null,
  approvedByUserId: null,
  approvalRejectedByUserId: null,
  status: "pending",
  approvalStatus: "not_required",
  emailDeliveryStatus: "sent",
  emailDeliveryAttempts: 1,
  lastEmailAttemptAt: "2026-08-30T10:00:00.000Z",
  emailDeliveredAt: "2026-08-30T10:00:00.000Z",
  expiresAt: "2026-09-06T10:00:00.000Z",
  acceptedAt: null,
  rejectedAt: null,
  approvedAt: null,
  approvalRejectedAt: null,
  revokedAt: null,
  createdAt: "2026-08-30T10:00:00.000Z",
  updatedAt: "2026-08-30T10:00:00.000Z",
  ...values,
});

const membershipContext = (
  roleOutcome: InviteMembershipContext["roleOutcome"],
): InviteMembershipContext => ({
  membershipId:
    roleOutcome === "apply_requested" ? null : "membership-existing",
  status:
    roleOutcome === "blocked_suspended"
      ? "suspended"
      : roleOutcome === "apply_requested"
        ? "none"
        : "active",
  currentRole:
    roleOutcome === "apply_requested"
      ? null
      : {
          id: "role-admin",
          name: "Admin",
          key: "admin",
          type: "system",
          permissions: ["members:view"],
          deniedPermissions: [],
        },
  roleOutcome,
});

type ApprovalFixture = Pick<
  PendingApprovalInvite,
  "type" | "employeeId" | "roleId" | "membershipContext"
>;

const approvalInvite = (
  roleOutcome: InviteMembershipContext["roleOutcome"],
  type: PendingApprovalInvite["type"] = "MEMBER",
  employeeId: PendingApprovalInvite["employeeId"] = null,
) =>
  ({
    type,
    employeeId,
    roleId: role,
    membershipContext: membershipContext(roleOutcome),
  }) satisfies ApprovalFixture;

describe("invitation workflow", () => {
  it("opens sent invitations first and falls back to an allowed view", () => {
    expect(resolveInviteManagementView("sent", true, true)).toBe("sent");
    expect(resolveInviteManagementView("sent", false, true)).toBe(
      "approvals",
    );
    expect(resolveInviteManagementView("approvals", true, false)).toBe(
      "sent",
    );
  });

  it.each([
    ["pending", "not_required", "Pending", "warn", false],
    ["accepted", "not_required", "Accepted", "good", false],
    ["accepted", "pending", "Approval required", "warn", true],
    ["accepted", "approved", "Accepted", "good", false],
    ["accepted", "rejected", "Rejected", "bad", false],
    ["rejected", "not_required", "Rejected", "bad", false],
    ["expired", "not_required", "Expired", "bad", false],
    ["revoked", "not_required", "Revoked", "bad", false],
  ] as const)(
    "maps %s/%s to one human-readable invitation state",
    (status, approvalStatus, label, tone, approvalRequired) => {
      expect(sentInvitationPresentation({ status, approvalStatus })).toEqual({
        label,
        tone,
        approvalRequired,
      });
    },
  );

  it("renders one primary status without completed delivery internals", () => {
    const markup = renderToStaticMarkup(
      <SentInviteCard
        invite={sentInvite({
          status: "accepted",
          approvalStatus: "not_required",
          acceptedAt: "2026-08-30T12:00:00.000Z",
        })}
      />,
    );

    expect(markup).toContain("Employee invitation");
    expect(markup).toContain("Accepted");
    expect(markup).not.toContain("not required");
    expect(markup).not.toContain(">sent<");
  });

  it.each([
    ["MEMBER", "pending", "not_required", "Member invitation", "Pending"],
    ["MEMBER", "accepted", "not_required", "Member invitation", "Accepted"],
    ["EMPLOYEE", "pending", "not_required", "Employee invitation", "Pending"],
    ["EMPLOYEE", "accepted", "approved", "Employee invitation", "Accepted"],
  ] as const)(
    "renders a %s invitation in the %s/%s state",
    (type, status, approvalStatus, typeLabel, statusLabel) => {
      const markup = renderToStaticMarkup(
        <SentInviteCard
          invite={sentInvite({ type, status, approvalStatus })}
        />,
      );
      expect(markup).toContain(typeLabel);
      expect(markup).toContain(statusLabel);
    },
  );

  it("shows the real approval action only while approval is pending", () => {
    const markup = renderToStaticMarkup(
      <SentInviteCard
        invite={sentInvite({
          status: "accepted",
          approvalStatus: "pending",
          acceptedAt: "2026-08-30T12:00:00.000Z",
        })}
        onReview={() => undefined}
      />,
    );

    expect(markup).toContain("Approval required");
    expect(markup).toContain("Review employee");
  });

  it("builds a MEMBER invitation", () => {
    expect(
      buildInvitationPayload({
        type: "MEMBER",
        email: " member@example.com ",
        roleId: "role-1",
      }),
    ).toEqual({
      type: "MEMBER",
      email: "member@example.com",
      roleId: "role-1",
    });
  });

  it("builds an EMPLOYEE invitation for an existing employee", () => {
    expect(
      buildInvitationPayload({
        type: "EMPLOYEE",
        email: "employee@example.com",
        roleId: "role-1",
        employeeSource: "existing",
        employeeId: "employee-1",
      }),
    ).toEqual({
      type: "EMPLOYEE",
      email: "employee@example.com",
      roleId: "role-1",
      employeeId: "employee-1",
    });
  });

  it("never submits employeeListId for an existing employee", () => {
    expect(
      buildInvitationPayload({
        type: "EMPLOYEE",
        email: "employee@example.com",
        roleId: "role-1",
        employeeSource: "existing",
        employeeId: "employee-1",
      }),
    ).not.toHaveProperty("employeeListId");
  });

  it("builds an EMPLOYEE invitation without employeeId for a new employee", () => {
    expect(
      buildInvitationPayload({
        type: "EMPLOYEE",
        email: "new@example.com",
        roleId: "role-1",
        employeeSource: "new",
      }),
    ).toEqual({
      type: "EMPLOYEE",
      email: "new@example.com",
      roleId: "role-1",
    });
  });

  it("requires a list before employee selection", () => {
    expect(canSelectEmployee("")).toBe(false);
    expect(canSelectEmployee("list-1")).toBe(true);
  });

  it("requires all three browsing permissions", () => {
    const complete = new Set<Permission>([
      "members:invite",
      "employee_lists:view",
      "employees:view",
    ]);
    expect(canBrowseExistingEmployees(complete)).toBe(true);
    complete.delete("employees:view");
    expect(canBrowseExistingEmployees(complete)).toBe(false);
  });

  it("clears employeeId and returns to page one when the list changes", () => {
    expect(changeEmployeeList("list-2")).toEqual({
      employeeListId: "list-2",
      employeeId: "",
      employeePage: 1,
    });
  });

  it("disables employees that already have a businessMemberId", () => {
    expect(isEmployeeLinked({ businessMemberId: "member-1" })).toBe(true);
    expect(isEmployeeLinked({ businessMemberId: null })).toBe(false);
  });

  it("renders populated existing employee details for approval", () => {
    const employee: InviteEmployee = {
      id: "employee-1",
      fullName: "Jane Doe",
      jobTitle: "Intern",
      employeeListId: { id: "list-1", name: "Graduate staff" },
      status: "active",
      accountVerificationStatus: "verified",
      businessMemberId: null,
    };
    const markup = renderToStaticMarkup(
      <InviteEmployeeSummary employeeId={employee} />,
    );

    expect(markup).toContain("Jane Doe");
    expect(markup).toContain("Intern");
    expect(markup).toContain("Graduate staff");
    expect(markup).toContain("Not linked");
  });

  it("never renders a raw employee list ID as a department name", () => {
    const employee: InviteEmployee = {
      id: "employee-1",
      fullName: "Jane Doe",
      jobTitle: "Intern",
      employeeListId: "6a405df858f472a2f58ccbb9",
      status: "active",
      accountVerificationStatus: "verified",
      businessMemberId: null,
    };
    const markup = renderToStaticMarkup(
      <InviteEmployeeSummary employeeId={employee} />,
    );

    expect(markup).toContain("Name unavailable");
    expect(markup).not.toContain("6a405df858f472a2f58ccbb9");
  });

  it("identifies when the employee creation form is required", () => {
    expect(needsEmployeeCreation({ type: "EMPLOYEE", employeeId: null })).toBe(
      true,
    );
    expect(
      needsEmployeeCreation({
        type: "EMPLOYEE",
        employeeId: "employee-1",
      }),
    ).toBe(false);
    expect(needsEmployeeCreation({ type: "MEMBER", employeeId: null })).toBe(
      false,
    );
  });

  it("apply_requested displays the requested role as assignable", () => {
    const invite = approvalInvite("apply_requested");
    const markup = renderToStaticMarkup(<MembershipOutcome invite={invite} />);
    expect(markup).toContain("Viewer");
    expect(markup).toContain("will be applied");
    expect(membershipApprovalPresentation(invite)).toMatchObject({
      kind: "apply_requested",
      requestedRole: "Viewer",
      blocked: false,
    });
  });

  it("preserve_current displays the current role and preservation policy", () => {
    const invite = approvalInvite("preserve_current", "EMPLOYEE", "employee-1");
    const markup = renderToStaticMarkup(<MembershipOutcome invite={invite} />);
    expect(markup).toContain("Admin");
    expect(markup).toContain("will be preserved");
    expect(markup).toContain("Requested role: Viewer");
    expect(membershipApprovalPresentation(invite)).toMatchObject({
      kind: "preserve_current",
      currentRole: "Admin",
      preservesCurrentRole: true,
    });
  });

  it("blocked_suspended blocks approval and explains restoration", () => {
    const invite = approvalInvite("blocked_suspended");
    const markup = renderToStaticMarkup(<MembershipOutcome invite={invite} />);
    expect(membershipOutcomeBlocksApproval(invite)).toBe(true);
    expect(markup).toContain("Approval blocked: suspended member");
    expect(markup).toContain("restored separately");
  });

  it("blocked_existing_member blocks approval and points to role management", () => {
    const invite = approvalInvite("blocked_existing_member");
    const markup = renderToStaticMarkup(<MembershipOutcome invite={invite} />);
    expect(membershipOutcomeBlocksApproval(invite)).toBe(true);
    expect(markup).toContain("Approval blocked: existing member");
    expect(markup).toContain("role-management workflow");
  });

  it("requires roles:assign for every approval", () => {
    const gate = approvalPermissionGate(
      approvalInvite("apply_requested"),
      new Set(),
    );
    expect(gate).toEqual({ allowed: false, missing: ["roles:assign"] });
  });

  it("requires employees:update when linking an existing employee", () => {
    const gate = approvalPermissionGate(
      approvalInvite("preserve_current", "EMPLOYEE", "employee-1"),
      new Set<Permission>(["roles:assign"]),
    );
    expect(gate.missing).toEqual(["employees:update"]);
  });

  it("requires employees:create and employee_lists:view for a new employee", () => {
    const gate = approvalPermissionGate(
      approvalInvite("apply_requested", "EMPLOYEE", null),
      new Set<Permission>(["roles:assign"]),
    );
    expect(gate.missing).toEqual([
      "employees:create",
      "employee_lists:view",
    ]);
    expect(
      approvalPermissionGate(
        approvalInvite("apply_requested", "EMPLOYEE", null),
        new Set<Permission>([
          "roles:assign",
          "employees:create",
          "employee_lists:view",
        ]),
      ).allowed,
    ).toBe(true);
  });

  it("uses membershipActivated as workflow completion", () => {
    expect(
      invitationAcceptanceMessage({
        membershipActivated: true,
        membershipCreated: false,
        requiresApproval: false,
      }),
    ).toBe("Invitation accepted. Business access is ready.");
  });

  it("does not mistake membershipCreated=false for pending approval", () => {
    expect(
      invitationAcceptanceMessage({
        membershipActivated: false,
        membershipCreated: false,
        requiresApproval: true,
      }),
    ).toBe("Invitation accepted. Access is awaiting approval.");
  });

  it.each([
    [403, "Access denied", "Approval permission denied"],
    [409, "Unable to load this content", "Membership state changed"],
  ])(
    "displays backend %s messages clearly",
    (status, heading, message) => {
      const markup = renderToStaticMarkup(
        <ErrorState
          error={new BusinessApiError(status, { message })}
        />,
      );
      expect(markup).toContain(heading);
      expect(markup).toContain(message);
    },
  );
});
