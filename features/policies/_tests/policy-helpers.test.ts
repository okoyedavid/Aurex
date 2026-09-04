import { describe, expect, it } from "vitest";

import type { Permission } from "@/types/generic";
import {
  cardinalityDescription,
  operatorsByField,
  policyPermissions,
  toRuleValue,
  validateEffectiveRange,
} from "../policy-helpers";

describe("policy helpers", () => {
  it("keeps assign separate from update permission", () => {
    const access = policyPermissions(new Set<Permission>(["policies:update"]));
    expect(access.update).toBe(true);
    expect(access.assign).toBe(false);
  });

  it("explains ONE manual precedence and MANY coexistence", () => {
    expect(cardinalityDescription("ONE")).toContain(
      "manual assignment takes precedence",
    );
    expect(cardinalityDescription("MANY")).toContain(
      "Multiple distinct qualifying policies",
    );
  });

  it("exposes only field-specific operators", () => {
    expect(operatorsByField.department).toEqual([
      "equals",
      "not_equals",
      "in",
      "not_in",
    ]);
    expect(operatorsByField.group).toContain("contains");
    expect(operatorsByField.tenure).toEqual([
      "equals",
      "not_equals",
      "gte",
      "lte",
      "gt",
      "lt",
    ]);
    expect(operatorsByField.state).not.toContain("contains");
  });

  it("preserves department, employee-type, and group IDs", () => {
    expect(toRuleValue("department", "equals", ["list-id"])).toBe("list-id");
    expect(toRuleValue("employeeType", "in", ["type-1", "type-2"])).toEqual([
      "type-1",
      "type-2",
    ]);
    expect(toRuleValue("group", "in", ["group-1", "group-2"])).toEqual([
      "group-1",
      "group-2",
    ]);
  });

  it("converts tenure to a non-negative month number", () => {
    expect(toRuleValue("tenure", "gte", ["18"])).toBe(18);
    expect(() => toRuleValue("tenure", "gte", ["-1"])).toThrow("non-negative");
  });

  it("rejects an end that is not after the start", () => {
    expect(validateEffectiveRange("2026-09-02", "2026-09-01")).toContain(
      "after",
    );
    expect(validateEffectiveRange("2026-09-01", "2026-09-01")).toContain(
      "after",
    );
    expect(validateEffectiveRange("2026-09-01", "2026-09-02")).toBeNull();
  });
});
