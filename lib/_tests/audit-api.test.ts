import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import { listBusinessAudit, listMyBusinessActivity } from "../audit-api";

describe("audit API", () => {
  afterEach(() => vi.restoreAllMocks());

  const policyEvent = {
    id: "audit-1",
    occurredAt: "2026-09-04T22:01:00.000Z",
    domain: "policy" as const,
    auditType: "policy" as const,
    action: "ASSIGNMENT_CREATED",
    actor: {
      type: "worker",
      displayName: "Aurex policy engine",
    },
    subject: {
      id: "employee-1",
      type: "employee",
      displayName: "Emeka Okoye",
    },
    policy: {
      id: "policy-1",
      version: 1,
      displayName: "GitLab access",
      description: "Engineering source-control access",
    },
    category: {
      id: "category-1",
      displayName: "Application access",
      description: "Access to company applications",
      cardinality: "MANY" as const,
    },
    historicalSnapshotAvailable: true,
    summary: "GitLab access was assigned to Emeka Okoye.",
  };

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
    const get = vi.spyOn(api, "get").mockResolvedValue({
      data: { data: { items: [policyEvent], pagination: {} } },
    });
    const result = await listBusinessAudit("business-1", filters);
    expect(get).toHaveBeenCalledWith("/businesses/business-1/audit", { params: filters });
    expect(result.items[0]?.policy).toEqual(policyEvent.policy);
    expect(result.items[0]?.category).toEqual(policyEvent.category);
    expect(result.items[0]?.subject).toEqual(policyEvent.subject);
    expect(result.items[0]?.historicalSnapshotAvailable).toBe(true);
  });

  it("sends only pagination to personal activity", async () => {
    const personalEvent = {
      ...policyEvent,
      subject: { ...policyEvent.subject, displayName: "You" },
      summary: "GitLab access was assigned to you.",
    };
    const get = vi.spyOn(api, "get").mockResolvedValue({
      data: { data: { items: [personalEvent], pagination: {} } },
    });
    const result = await listMyBusinessActivity("business-1", {
      page: 3,
      limit: 20,
    });
    expect(get).toHaveBeenCalledWith("/businesses/business-1/audit/me", {
      params: { page: 3, limit: 20 },
    });
    expect(get.mock.calls[0]?.[1]?.params).not.toHaveProperty("memberId");
    expect(get.mock.calls[0]?.[1]?.params).not.toHaveProperty("employeeId");
    expect(result.items[0]?.subject?.displayName).toBe("You");
    expect(result.items[0]?.policy?.displayName).toBe("GitLab access");
  });
});
