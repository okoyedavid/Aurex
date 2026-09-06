export type Cardinality = "ONE" | "MANY";

export interface DemoOverview {
  business: { name: string; description: string };
  stats: {
    employees: number;
    policyCategories: number;
    policies: number;
    activeRules: number;
    activeAssignments: number;
  };
  concepts: { employeeDimensions: string[] };
  cardinalityModel: "ONE_OR_MANY";
}

export interface DemoEmployee {
  alias?: "maya";
  id?: string;
  name: string;
  jobTitle: string | null;
  department: string;
  employeeType: string | null;
  state: string | null;
  employmentStartDate: string | null;
  tenureMonths: number;
  groups: string[];
  resolvedPolicyCount?: number;
}

export interface PolicyCategory {
  id: string;
  name: string;
  description: string;
  cardinality: Cardinality;
  maxAssignments: number | null;
  policyCount: number;
}

export interface PolicySummary {
  id: string;
  name: string;
  description: string;
  category: Pick<PolicyCategory, "id" | "name" | "cardinality" | "maxAssignments">;
  status: string;
  version: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  ruleCount: number;
}

export interface PolicyRule {
  id: string;
  name: string;
  priority: number;
  status: string;
  conditions: Array<{ field: string; operator: string; value: unknown }>;
}

export interface PolicyDetail extends PolicySummary {
  rules: PolicyRule[];
}

export interface ResolvedPolicy {
  id: string;
  name: string;
  category: Pick<PolicyCategory, "id" | "name" | "cardinality" | "maxAssignments">;
  source: string;
  priority: number;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  winningRuleName: string;
}

export interface ConditionEvaluation {
  field: string;
  operator: string;
  expectedValue: unknown;
  actualValue: unknown;
  matched: boolean;
}

export interface ExplanationCategory {
  category: Pick<PolicyCategory, "id" | "name" | "cardinality" | "maxAssignments">;
  candidates: Array<{
    policyId: string;
    policyName: string;
    matched: boolean;
    priority: number;
    selected: boolean;
    source: "rule";
    matchedRules: Array<{
      ruleId: string;
      ruleName: string;
      priority: number;
      conditions: ConditionEvaluation[];
    }>;
    suppressedReason: "cardinality_limit" | null;
  }>;
  selectedPolicies: Array<{ id: string; name: string }>;
}

export interface EmployeeExplanation {
  employee: DemoEmployee;
  evaluationDate: string;
  categories: ExplanationCategory[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  entityType: string;
  action: string;
  employeeName?: string;
  policyName?: string;
  categoryName?: string;
  actor: { type: string; displayName: string };
  summary: string;
  reason?: string;
}

export type WarpDemoMutation =
  | { employee: "maya"; field: "department"; value: "engineering" | "finance" }
  | { employee: "maya"; field: "employeeType"; value: "full_time" | "contractor" }
  | { employee: "maya"; field: "state"; value: "california" | "new_york" }
  | { employee: "maya"; field: "remoteGroup"; value: "member" | "not_member" };

export type RunStatus = "queued" | "running" | "completed" | "completed_with_warnings" | "failed";
export interface ReconciliationRun {
  id: string;
  status: RunStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  updatedAt: string;
  pollAfterMs: number;
  changedResources: Array<"employee" | "assignments" | "audit" | "externalAccess">;
  events: Array<{
    id: string;
    stage: "employee_update" | "queued" | "policy_resolution" | "assignment_reconciliation" | "external_access" | "audit" | "complete";
    status: "pending" | "running" | "success" | "warning" | "failed";
    title: string;
    description: string;
    occurredAt: string;
  }>;
}

export interface WarpDemoControls {
  department: Array<"engineering" | "finance">;
  employeeType: Array<"full_time" | "contractor">;
  state: Array<"california" | "new_york">;
  remoteGroup: Array<"member" | "not_member">;
}

export interface WarpDemoSession {
  sessionId: string;
  expiresAt: string;
  employee: DemoEmployee;
  initialization: { runId: string; status: "queued" };
  controls: WarpDemoControls;
}
