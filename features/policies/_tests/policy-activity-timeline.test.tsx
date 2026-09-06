import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AuditActivityTimeline } from "@/features/audit/audit-activity-timeline";
import type { AuditItem } from "@/lib/audit-api";

const event = (overrides: Partial<AuditItem> = {}): AuditItem => ({
  id: "event-1",
  occurredAt: "2026-09-04T22:01:00",
  domain: "policy",
  auditType: "policy",
  action: "ASSIGNMENT_CREATED",
  actor: { type: "worker", displayName: "Aurex policy engine" },
  subject: {
    id: "employee-1",
    type: "employee",
    displayName: "Emeka Okoye",
  },
  policy: {
    id: "policy-1",
    version: 3,
    displayName: "Executive vacation",
    description: "Vacation allowance for executives",
  },
  category: {
    id: "category-1",
    displayName: "Time off",
    description: "Employee leave policies",
    cardinality: "ONE",
  },
  historicalSnapshotAvailable: true,
  summary: "Executive vacation was assigned to Emeka Okoye.",
  ...overrides,
});

describe("employee policy activity timeline", () => {
  it("groups events by date without changing their API order", () => {
    const markup = renderToStaticMarkup(
      <AuditActivityTimeline
        scope="employee-policy"
        items={[
          event(),
          event({
            id: "event-2",
            occurredAt: "2026-09-04T20:42:00",
            action: "policy:policy_updated",
            actor: { type: "user", displayName: "Emeka Okoye" },
            summary: "Executive vacation policy was updated.",
          }),
          event({
            id: "event-3",
            occurredAt: "2026-09-02T12:00:00",
            action: "ASSIGNMENT_REMOVED",
            summary: "Executive vacation was removed from Emeka Okoye.",
          }),
        ]}
      />,
    );

    expect(markup.match(/September 4, 2026/g)).toHaveLength(1);
    expect(markup).toContain("September 2, 2026");
    expect(
      markup.indexOf("Executive vacation was assigned to Emeka Okoye."),
    ).toBeLessThan(
      markup.indexOf("Executive vacation policy was updated."),
    );
    expect(markup).toContain("Emeka Okoye");
  });

  it("uses the authoritative summary and never treats the employee as the policy", () => {
    const internalId = "6a99fbea-3f0a-4ace-99df-117c27f00000";
    const markup = renderToStaticMarkup(
      <AuditActivityTimeline
        scope="employee-policy"
        items={[
          event({
            action: "POLICY_UPDATED",
            summary: "Executive vacation was updated.",
            changes: [
              { field: "policyVersion", before: 2, after: 3 },
              { field: "priority", before: 20, after: 30 },
              { field: "employeeId", before: internalId, after: internalId },
            ],
          }),
        ]}
      />,
    );

    expect(markup).toContain("Executive vacation was updated.");
    expect(markup).toContain("Aurex policy engine · Automatic");
    expect(markup).not.toContain("Emeka Okoye was updated");
    expect(markup).not.toContain(
      "Emeka Okoye was assigned to this employee.",
    );
    expect(markup).toContain("Policy version");
    expect(markup).toContain("2");
    expect(markup).toContain("3");
    expect(markup).not.toContain(internalId);
    expect(markup).not.toContain("employeeId");
  });

  it("does not expose legacy or backend terminology in the primary UI", () => {
    const markup = renderToStaticMarkup(
      <AuditActivityTimeline
        scope="employee-policy"
        items={[event({ historicalSnapshotAvailable: false })]}
      />,
    );

    expect(markup).not.toContain("Legacy record");
    expect(markup).not.toContain("historicalSnapshotAvailable");
    expect(markup).not.toContain("ASSIGNMENT_CREATED");
  });

  it("uses a lightweight empty state", () => {
    const markup = renderToStaticMarkup(
      <AuditActivityTimeline
        items={[]}
        scope="employee-policy"
        emptyTitle="No policy activity yet."
      />,
    );

    expect(markup).toContain("No policy activity yet.");
    expect(markup).not.toContain("<table");
  });
});
