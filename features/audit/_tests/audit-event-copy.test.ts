import { describe, expect, it } from "vitest";

import type { AuditItem } from "@/lib/audit-api";
import { formatAuditEvent } from "../audit-event-copy";

const policyEvent = (overrides: Partial<AuditItem> = {}): AuditItem => ({
  id: "audit-1",
  occurredAt: "2026-09-04T22:01:00.000Z",
  domain: "policy",
  auditType: "policy",
  action: "POLICY_UPDATED",
  actor: { type: "user", displayName: "Emeka Okoye" },
  subject: { type: "policy", id: "policy-1", displayName: "GitHub Access" },
  policy: {
    id: "policy-1",
    version: 2,
    displayName: "GitHub Access",
    description: "Source-control access",
  },
  category: {
    id: "category-1",
    displayName: "Application access",
    description: "Company applications",
    cardinality: "MANY",
  },
  historicalSnapshotAvailable: true,
  summary: "POLICY UPDATED: GitHub Access",
  ...overrides,
});

describe("formatAuditEvent", () => {
  it.each([
    ["CATEGORY_CREATED", "Application access category was created"],
    ["CATEGORY_UPDATED", "Application access category was updated"],
    ["CATEGORY_ARCHIVED", "Application access category was archived"],
    ["POLICY_CREATED", "GitHub Access policy was created"],
    ["POLICY_UPDATED", "GitHub Access policy was updated"],
    ["POLICY_ACTIVATED", "GitHub Access policy was activated"],
    ["POLICY_ARCHIVED", "GitHub Access policy was archived"],
    ["RULE_CREATED", "A rule was added to GitHub Access"],
    ["RULE_UPDATED", "A rule for GitHub Access was updated"],
    ["RULE_PRIORITY_CHANGED", "A rule priority changed for GitHub Access"],
    ["RULE_ENABLED", "A rule was enabled for GitHub Access"],
    ["RULE_DISABLED", "A rule was disabled for GitHub Access"],
  ])("normalizes %s using returned snapshots", (action, title) => {
    const result = formatAuditEvent(policyEvent({ action }), "organization");

    expect(result.title).toBe(title);
    expect(result.title).not.toContain(action);
  });

  it("uses assignment summaries as authoritative titles", () => {
    const result = formatAuditEvent(
      policyEvent({
        action: "ASSIGNMENT_CREATED",
        subject: {
          type: "employee",
          id: "employee-1",
          displayName: "Okoye David",
        },
        summary: "GitHub Access was assigned to Okoye David.",
      }),
      "organization",
    );

    expect(result.title).toBe("GitHub Access was assigned to Okoye David.");
    expect(result.title).not.toContain("ASSIGNMENT_CREATED");
  });

  it("translates known reconciliation reasons without exposing reason keys", () => {
    const result = formatAuditEvent(
      policyEvent({
        action: "ASSIGNMENT_CREATED",
        summary: "GitHub Access was assigned to Okoye David.",
        actor: { type: "worker", displayName: "Aurex policy engine" },
        reason: "policy.policy_activated",
      }),
      "employee-policy",
    );

    expect(result.description).toBe(
      "Assigned automatically after GitHub Access became active.",
    );
    expect(result.metadata).toEqual([
      "Aurex policy engine",
      "Automatic",
      "Policy",
    ]);
    expect(JSON.stringify(result)).not.toContain("policy.policy_activated");
  });

  it("does not claim manager or department names absent from the response", () => {
    const result = formatAuditEvent(
      {
        ...policyEvent(),
        domain: "employee",
        auditType: "employee",
        action: "business.employee.updated",
        subject: {
          type: "employee",
          id: "employee-1",
          displayName: "Okoye David",
        },
        summary: "Business Employee Updated: Okoye David",
        policy: undefined,
        category: undefined,
        changes: undefined,
      },
      "organization",
    );

    expect(result.title).toBe("Emeka Okoye updated Okoye David");
    expect(result.title).not.toMatch(/manager|department/i);
  });
});
