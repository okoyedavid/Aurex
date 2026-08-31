import { describe, expect, it } from "vitest";
import { policyKeys } from "./policy-hooks";

describe("policy query keys", () => {
  it("includes businessId in every business-owned root", () => {
    expect(policyKeys.categoriesRoot("business-1")).toContain("business-1");
    expect(policyKeys.policiesRoot("business-1")).toContain("business-1");
    expect(policyKeys.rulesRoot("business-1", "policy-1")).toContain("business-1");
    expect(policyKeys.employeePoliciesRoot("business-1", "employee-1")).toContain("business-1");
    expect(policyKeys.explanationRoot("business-1", "employee-1")).toContain("business-1");
    expect(policyKeys.auditRoot("business-1")).toContain("business-1");
    expect(policyKeys.employeeHistoryRoot("business-1", "employee-1")).toContain("business-1");
  });
});
