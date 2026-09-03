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
  id: string;
  name: string;
  jobTitle: string;
  department: string;
  employeeType: string;
  state: string;
  employmentStartDate: string;
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
