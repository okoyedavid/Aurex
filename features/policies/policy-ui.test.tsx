import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { PolicyExplanation } from "@/lib/policy-api";
import { PolicyExplanationView } from "./components/policy-explanation-view";
import { PolicyAuditTable, PolicyEmpty, PolicyError, PolicyLoading } from "./components/policy-ui";

const explanation: PolicyExplanation = {
  businessId: "business-1",
  employeeId: "employee-1",
  evaluationDate: "2026-09-01T00:00:00.000Z",
  intervalSemantics: "effectiveFrom <= asOf < effectiveTo",
  desiredPolicies: [{
    policyId: "policy-winning",
    categoryId: "category-1",
    policyVersion: 2,
    source: "manual",
    priority: null,
    winningRuleId: null,
    matchedRuleIds: [],
    manualAssignmentId: "manual-1",
    conditionEvaluations: {
      "rule-1": [{ condition: { field: "state", operator: "equals", value: "Lagos" }, actualValue: "Abuja", matched: false }],
    },
  }],
  suppressedCandidates: [{
    policyId: "policy-suppressed",
    categoryId: "category-1",
    policyVersion: 1,
    source: "rule",
    priority: 10,
    winningRuleId: "rule-2",
    matchedRuleIds: ["rule-2"],
    manualAssignmentId: null,
    conditionEvaluations: {},
    reason: "manual_override",
  }],
  evaluatedRules: [],
  categoryDecisions: [{ categoryId: "category-1", name: "Benefits", cardinality: "ONE", winnerPolicyIds: ["policy-winning"], suppressedPolicyIds: ["policy-suppressed"] }],
  historicalEmployeeAttributeSnapshotAvailable: false,
};

describe("policy UI states", () => {
  it("renders manual winners, failed conditions, suppression, and historical warning", () => {
    const html = renderToStaticMarkup(<PolicyExplanationView explanation={explanation} policies={[{ id: "policy-winning", businessId: "business-1", categoryId: "category-1", name: "Health", version: 2, status: "active", createdBy: "user-1", updatedBy: "user-1", createdAt: "", updatedAt: "" }, { id: "policy-suppressed", businessId: "business-1", categoryId: "category-1", name: "Basic", version: 1, status: "active", createdBy: "user-1", updatedBy: "user-1", createdAt: "", updatedAt: "" }]} />);
    expect(html).toContain("Manual override");
    expect(html).toContain("Failed");
    expect(html).toContain("Basic");
    expect(html).toContain("complete historical employee-attribute snapshot is not available");
    expect(html).toContain("Benefits");
  });

  it("renders loading, empty, and retryable error states", () => {
    expect(renderToStaticMarkup(<PolicyLoading />)).toContain("Loading policies");
    expect(renderToStaticMarkup(<PolicyEmpty title="No policy categories have been created." />)).toContain("No policy categories");
    expect(renderToStaticMarkup(<PolicyError message="Backend unavailable" retry={() => undefined} />)).toContain("Backend unavailable");
  });

  it("renders a paginated audit row with actor and context", () => {
    const html = renderToStaticMarkup(<PolicyAuditTable items={[{ id: "audit-1", businessId: "business-1", entityType: "manual_assignment", entityId: "manual-1", action: "ended", actorType: "worker", actorUserId: null, employeeId: "employee-1", policyId: "policy-1", before: { status: "active" }, after: { status: "ended" }, changedFields: ["status"], reason: "Requested", metadata: { triggeredByUserId: "user-1" }, occurredAt: "2026-09-01T00:00:00.000Z", createdAt: "2026-09-01T00:00:00.000Z" }]} />);
    expect(html).toContain("manual assignment");
    expect(html).toContain("user-1");
    expect(html).toContain("Employee employee-1");
    expect(html).toContain("status");
  });
});
