import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import { listBusinessAudit, listMyBusinessActivity } from "./audit-api";

describe("audit API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends every organization filter to the aggregated endpoint", async () => {
    const filters = {
      page: 2,
      limit: 50,
      domain: "employee" as const,
      action: "business.employee.updated",
      actorId: "actor-1",
      employeeId: "employee-1",
      from: "2026-09-01T00:00:00.000Z",
      to: "2026-09-02T23:59:59.999Z",
    };
    const get = vi.spyOn(api, "get").mockResolvedValue({ data: { data: { items: [], pagination: {} } } });
    await listBusinessAudit("business-1", filters);
    expect(get).toHaveBeenCalledWith("/businesses/business-1/audit", { params: filters });
  });

  it("sends only pagination to personal activity", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({ data: { data: { items: [], pagination: {} } } });
    await listMyBusinessActivity("business-1", { page: 3, limit: 20 });
    expect(get).toHaveBeenCalledWith("/businesses/business-1/audit/me", {
      params: { page: 3, limit: 20 },
    });
    expect(get.mock.calls[0]?.[1]?.params).not.toHaveProperty("memberId");
    expect(get.mock.calls[0]?.[1]?.params).not.toHaveProperty("employeeId");
  });
});
