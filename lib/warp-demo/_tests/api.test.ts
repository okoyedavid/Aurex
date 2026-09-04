import { AxiosError, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { warpDemoApi, warpDemoClient } from "../api";

describe("Warp public demo API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("resolves requests beneath the single /api/demo/warp prefix", () => {
    const overviewUrl = new URL(warpDemoClient.getUri({ url: "/api/demo/warp/overview" }));
    const filteredPoliciesUrl = new URL(warpDemoClient.getUri({
      url: "/api/demo/warp/policies",
      params: { categoryId: "category-1", status: "active" },
    }));

    expect(overviewUrl.pathname).toBe("/api/demo/warp/overview");
    expect(filteredPoliciesUrl.pathname).toBe("/api/demo/warp/policies");
    expect(filteredPoliciesUrl.searchParams.get("categoryId")).toBe("category-1");
    expect(filteredPoliciesUrl.searchParams.get("status")).toBe("active");
  });

  it("uses the dedicated public endpoints", async () => {
    const get = vi.spyOn(warpDemoClient, "get").mockResolvedValue({ data: { success: true, data: {} } });

    await warpDemoApi.overview();
    await warpDemoApi.employees();
    await warpDemoApi.employee("employee/1");
    await warpDemoApi.employeePolicies("employee/1");
    await warpDemoApi.explainEmployee("employee/1");
    await warpDemoApi.categories();
    await warpDemoApi.policies({ categoryId: "category-1", status: "active" });
    await warpDemoApi.policy("policy/1");

    expect(get).toHaveBeenNthCalledWith(1, "/api/demo/warp/overview", { params: undefined });
    expect(get).toHaveBeenNthCalledWith(2, "/api/demo/warp/employees", { params: undefined });
    expect(get).toHaveBeenNthCalledWith(3, "/api/demo/warp/employees/employee%2F1", { params: undefined });
    expect(get).toHaveBeenNthCalledWith(4, "/api/demo/warp/employees/employee%2F1/policies", { params: undefined });
    expect(get).toHaveBeenNthCalledWith(5, "/api/demo/warp/employees/employee%2F1/explain", { params: undefined });
    expect(get).toHaveBeenNthCalledWith(6, "/api/demo/warp/policy-categories", { params: undefined });
    expect(get).toHaveBeenNthCalledWith(7, "/api/demo/warp/policies", { params: { categoryId: "category-1", status: "active" } });
    expect(get).toHaveBeenNthCalledWith(8, "/api/demo/warp/policies/policy%2F1", { params: undefined });
  });

  it("passes combined audit filters and leaves the backend default intact", async () => {
    const get = vi.spyOn(warpDemoClient, "get").mockResolvedValue({ data: { success: true, data: { events: [] } } });
    await warpDemoApi.audit();
    await warpDemoApi.audit({ limit: 50, employeeId: "employee-1", policyId: "policy-1", action: "ASSIGNMENT_CREATED" });
    expect(get).toHaveBeenNthCalledWith(1, "/api/demo/warp/audit", { params: undefined });
    expect(get).toHaveBeenNthCalledWith(2, "/api/demo/warp/audit", { params: { limit: 50, employeeId: "employee-1", policyId: "policy-1", action: "ASSIGNMENT_CREATED" } });
  });

  it("preserves backend messages and supplies an offline fallback", async () => {
    const backendError = new AxiosError("failed");
    backendError.response = { data: { message: "Demo business was not seeded" } } as AxiosResponse;
    vi.spyOn(warpDemoClient, "get").mockRejectedValueOnce(backendError).mockRejectedValueOnce(new Error("offline"));

    await expect(warpDemoApi.overview()).rejects.toThrow("Demo business was not seeded");
    await expect(warpDemoApi.overview()).rejects.toThrow("The live Warp demo is unavailable");
  });
});
