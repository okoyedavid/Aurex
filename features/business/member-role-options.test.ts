import { describe, expect, it } from "vitest";

import {
  assignableSystemRoles,
  canUpdateMemberRole,
  canUpdateMemberStatus,
  permissionLabels,
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
