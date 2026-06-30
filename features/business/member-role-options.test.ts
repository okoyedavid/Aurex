import { describe, expect, it } from "vitest";

import {
  assignableSystemRoles,
  canUpdateMemberRole,
  canUpdateMemberStatus,
  permissionLabels,
  getMemberMutationActions,
} from "./member-role-options";
import type { Permission } from "@/types/generic";

describe("member management permissions", () => {
  it("does not expose Owner as an assignable role", () => {
    expect(assignableSystemRoles.some((role) => role.key === "owner")).toBe(
      false,
    );
  });

  it("gates role and status actions independently", () => {
    expect(
      canUpdateMemberRole(new Set<Permission>(["members:update_role"])),
    ).toBe(false);
    expect(
      canUpdateMemberRole(
        new Set<Permission>([
          "members:update_role",
          "roles:assign",
          "roles:view",
        ]),
      ),
    ).toBe(true);
    expect(
      canUpdateMemberRole(new Set<Permission>(["members:update_status"])),
    ).toBe(false);
    expect(
      canUpdateMemberStatus(new Set<Permission>(["members:update_status"])),
    ).toBe(true);
  });

  it("uses customer-facing permission descriptions", () => {
    expect(permissionLabels["invoices:create"]).toBe(
      "Allow this person to create invoices",
    );
  });
});

describe("member mutation actions", () => {
  const member = { isOwner: false, isCurrentUser: false, isRemoved: false };

  it("requires all three role-management permissions", () => {
    expect(
      getMemberMutationActions(
        new Set(["members:update_role", "roles:assign"]),
        member,
      ).role,
    ).toBe(false);
    expect(
      getMemberMutationActions(
        new Set(["members:update_role", "roles:assign", "roles:view"]),
        member,
      ).role,
    ).toBe(true);
  });

  it("gates status and removal independently", () => {
    const actions = getMemberMutationActions(
      new Set(["members:update_status", "members:remove"]),
      member,
    );
    expect(actions.status).toBe(true);
    expect(actions.remove).toBe(true);
    expect(actions.role).toBe(false);
  });

  it.each([
    { isOwner: true, isCurrentUser: false, isRemoved: false },
    { isOwner: false, isCurrentUser: true, isRemoved: false },
    { isOwner: false, isCurrentUser: false, isRemoved: true },
  ])("hides every action for protected memberships", (protectedMember) => {
    expect(
      getMemberMutationActions(
        new Set([
          "members:update_role",
          "roles:assign",
          "roles:view",
          "members:update_status",
          "members:remove",
        ]),
        protectedMember,
      ),
    ).toEqual({ role: false, status: false, remove: false });
  });
});
