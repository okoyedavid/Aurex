import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  BusinessRole,
  InviteEmployee,
  InviteMembershipContext,
  PendingApprovalInvite,
} from "@/lib/access-api";
import type { Permission } from "@/types/generic";
import { BusinessApiError } from "@/lib/business-api";

import { InviteEmployeeSummary } from "./invite-employee-summary";
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
    expect(markup).toContain("verified");
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
