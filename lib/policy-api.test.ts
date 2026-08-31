import { AxiosError, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import {
  activatePolicy,
  archivePolicy,
  archivePolicyCategory,
  createManualPolicyAssignment,
  createPolicy,
  createPolicyCategory,
  createPolicyRule,
  endManualPolicyAssignment,
  explainEmployeePolicies,
  getEmployeePolicies,
  getPolicyAudit,
  reconcileBusinessPolicies,
  reconcileEmployeePolicies,
  setPolicyRuleEnabled,
} from "./policy-api";

describe("policy API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("creates a business policy category", async () => {
    const body = { name: "Benefits", cardinality: "ONE" as const };
    const post = vi.spyOn(api, "post").mockResolvedValue({ data: { data: { id: "category-1" } } });
    await createPolicyCategory("business-1", body);
    expect(post).toHaveBeenCalledWith("/businesses/business-1/policy-categories", body);
  });

  it("archives categories without using DELETE", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue({ data: { data: {} } });
    await archivePolicyCategory("business-1", "category-1");
    expect(post).toHaveBeenCalledWith("/businesses/business-1/policy-categories/category-1/archive", {});
  });

  it("creates a draft policy with effective dates", async () => {
    const body = { categoryId: "category-1", name: "Health", effectiveFrom: "2026-09-01T00:00:00.000Z", effectiveTo: null };
    const post = vi.spyOn(api, "post").mockResolvedValue({ data: { data: { id: "policy-1", status: "draft" } } });
    await createPolicy("business-1", body);
    expect(post).toHaveBeenCalledWith("/businesses/business-1/policies", body);
  });

  it("activates and archives policies through explicit actions", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue({ data: { data: {} } });
    await activatePolicy("business-1", "policy-1");
    await archivePolicy("business-1", "policy-1");
    expect(post).toHaveBeenNthCalledWith(1, "/businesses/business-1/policies/policy-1/activate", {});
    expect(post).toHaveBeenNthCalledWith(2, "/businesses/business-1/policies/policy-1/archive", {});
  });

  it("sends structured AND conditions and numeric priority", async () => {
    const body = { name: "Engineering tenure", priority: 25, conditions: [{ field: "department" as const, operator: "equals" as const, value: "list-1" }, { field: "tenure" as const, operator: "gte" as const, value: 12 }] };
    const post = vi.spyOn(api, "post").mockResolvedValue({ data: { data: {} } });
    await createPolicyRule("business-1", "policy-1", body);
    expect(post).toHaveBeenCalledWith("/businesses/business-1/policies/policy-1/rules", body);
  });

  it("enables and disables rules with empty POST bodies", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue({ data: { data: {} } });
    await setPolicyRuleEnabled("business-1", "rule-1", true);
    await setPolicyRuleEnabled("business-1", "rule-1", false);
    expect(post).toHaveBeenNthCalledWith(1, "/businesses/business-1/policy-rules/rule-1/enable", {});
    expect(post).toHaveBeenNthCalledWith(2, "/businesses/business-1/policy-rules/rule-1/disable", {});
  });

  it("passes as-of dates to assignments and explanations", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({ data: { data: { items: [] } } });
    const asOf = "2026-09-01T00:00:00.000Z";
    await getEmployeePolicies("business-1", "employee-1", asOf);
    await explainEmployeePolicies("business-1", "employee-1", asOf);
    expect(get).toHaveBeenNthCalledWith(1, "/businesses/business-1/employees/employee-1/policies", { params: { asOf } });
    expect(get).toHaveBeenNthCalledWith(2, "/businesses/business-1/employees/employee-1/policies/explain", { params: { asOf } });
  });

  it("creates and explicitly ends manual assignments", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue({ data: { data: {} } });
    await createManualPolicyAssignment("business-1", "employee-1", "policy-1", "2026-09-01T00:00:00.000Z");
    await endManualPolicyAssignment("business-1", "employee-1", "policy-1", "2026-10-01T00:00:00.000Z");
    expect(post).toHaveBeenNthCalledWith(1, "/businesses/business-1/employees/employee-1/policies/policy-1/manual", { effectiveFrom: "2026-09-01T00:00:00.000Z" });
    expect(post).toHaveBeenNthCalledWith(2, "/businesses/business-1/employees/employee-1/policies/policy-1/manual/end", { effectiveTo: "2026-10-01T00:00:00.000Z" });
  });

  it("accepts queued employee and business reconciliation jobs", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValueOnce({ status: 202, data: { data: { jobId: "job-employee" } } }).mockResolvedValueOnce({ status: 202, data: { data: { jobId: "job-business" } } });
    await expect(reconcileEmployeePolicies("business-1", "employee-1", "Manual refresh")).resolves.toEqual({ jobId: "job-employee" });
    await expect(reconcileBusinessPolicies("business-1")).resolves.toEqual({ jobId: "job-business" });
    expect(post).toHaveBeenNthCalledWith(1, "/businesses/business-1/employees/employee-1/policies/reconcile", { reason: "Manual refresh" });
    expect(post).toHaveBeenNthCalledWith(2, "/businesses/business-1/policies/reconcile", {});
  });

  it("passes audit pagination and filters", async () => {
    const filters = { page: 2, limit: 20, entityType: "policy_rule" as const, action: "updated" };
    const get = vi.spyOn(api, "get").mockResolvedValue({ data: { data: { items: [], pagination: {} } } });
    await getPolicyAudit("business-1", filters);
    expect(get).toHaveBeenCalledWith("/businesses/business-1/policy-audit", { params: filters });
  });

  it.each([
    [400, "Invalid effective interval"],
    [403, "Policy permission required"],
    [503, "Policy reconciliation queue is unavailable"],
  ])("preserves backend %s messages", async (status, message) => {
    const error = new AxiosError("Request failed");
    error.response = { status, data: { message } } as AxiosResponse;
    vi.spyOn(api, "post").mockRejectedValueOnce(error);
    await expect(reconcileBusinessPolicies("business-1")).rejects.toMatchObject({ status, message });
  });
});
