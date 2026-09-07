import { describe, expect, it } from "vitest";

import {
  explanationRuleLabel,
  humanAuditAction,
  humanAuditReason,
  humanAuditSummary,
  timelineEventCopy,
} from "../components/demo-presentation";
import type { ReconciliationRun } from "@/lib/warp-demo/types";

function event(
  stage: ReconciliationRun["events"][number]["stage"],
  description: string,
  status: ReconciliationRun["events"][number]["status"] = "success",
): ReconciliationRun["events"][number] {
  return {
    id: stage,
    stage,
    status,
    title: "Backend title",
    description,
    occurredAt: "2026-09-06T12:00:00.000Z",
  };
}

describe("Warp demo presentation", () => {
  it("replaces backend-oriented reconciliation language", () => {
    expect(timelineEventCopy(event("queued", "Reconcile this session sandbox."))).toEqual({
      title: "Policies queued",
      description: "Aurex is preparing this employee's policies for recalculation.",
    });
    expect(timelineEventCopy(event("external_access", "No privileged GitHub action was created."))).toEqual({
      title: "External access checked",
      description: "The demo shows the access decision without changing a real GitHub account.",
    });
    expect(timelineEventCopy(event("policy_resolution", "Evaluating seeded policy rules.", "running")).description).not.toContain("seeded");
  });

  it("presents audit metadata as human-readable labels", () => {
    expect(humanAuditAction("EMPLOYEE_UPDATED")).toBe("Employee updated");
    expect(humanAuditReason("warp_demo.state_changed")).toBe("State changed");
    expect(humanAuditReason("warp_demo.session_initialized")).toBe("Demo initialized");
    expect(humanAuditSummary("employee updated for Maya Patel")).toBe("Employee updated for Maya Patel");
  });

  it("does not describe a failed rule as a match", () => {
    expect(explanationRuleLabel(false, "Finance non-intern")).toBe("Rule checked: Finance non-intern");
    expect(explanationRuleLabel(true, "Engineering")).toBe("Matched through Engineering");
  });
});
