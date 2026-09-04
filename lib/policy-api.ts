import { AxiosError } from "axios";

import { api } from "@/lib/api";
import { BusinessApiError, type BusinessResponse } from "@/lib/business-api";
import type { ApiErrorResponse } from "@/types/generic";
import { AuditItem } from "./audit-api";

export type PolicyCardinality = "ONE" | "MANY";
export type PolicyCategoryStatus = "active" | "archived";
export type PolicyStatus = "draft" | "active" | "archived";
export type PolicyRuleStatus = "active" | "disabled";
export type PolicyAssignmentSource = "rule" | "manual";
export type PolicyAssignmentStatus = "active" | "ended";
export type PolicyRuleField =
  | "department"
  | "state"
  | "tenure"
  | "employeeType"
  | "group";
export type PolicyRuleOperator =
  | "equals"
  | "not_equals"
  | "in"
  | "not_in"
  | "contains"
  | "not_contains"
  | "gte"
  | "lte"
  | "gt"
  | "lt";

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export type PolicyPage<T> = { items: T[]; pagination: Pagination };

export interface PolicyCategory {
  id: string;
  businessId: string;
  name: string;
  description?: string | null;
  cardinality: PolicyCardinality;
  status: PolicyCategoryStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  configuration?: Record<string, unknown>;
  version: number;
  status: PolicyStatus;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRuleCondition {
  field: PolicyRuleField;
  operator: PolicyRuleOperator;
  value: string | number | string[];
}

export interface PolicyRule {
  id: string;
  businessId: string;
  policyId: string;
  name?: string | null;
  conditions: PolicyRuleCondition[];
  priority: number;
  version: number;
  status: PolicyRuleStatus;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeePolicyAssignment {
  id: string;
  businessId: string;
  employeeId: string;
  policyId: string;
  categoryId: string;
  policyVersion: number;
  source: PolicyAssignmentSource;
  winningRuleId?: string | null;
  matchedRuleIds: string[];
  status: PolicyAssignmentStatus;
  effectiveFrom: string;
  effectiveTo?: string | null;
  resolvedAt: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConditionEvaluation {
  condition: PolicyRuleCondition;
  actualValue: string | string[] | number | null;
  matched: boolean;
}
export interface ResolvedPolicy {
  policyId: string;
  categoryId: string;
  policyVersion: number;
  source: PolicyAssignmentSource;
  priority: number | null;
  winningRuleId: string | null;
  matchedRuleIds: string[];
  conditionEvaluations: Record<string, ConditionEvaluation[]>;
  manualAssignmentId: string | null;
}
export interface SuppressedCandidate extends ResolvedPolicy {
  reason: "category_cardinality" | "manual_override";
}
export interface EvaluatedRule {
  ruleId: string;
  policyId: string;
  priority: number;
  matched: boolean;
  conditionEvaluations: ConditionEvaluation[];
}
export interface CategoryDecision {
  categoryId: string;
  name: string;
  cardinality: PolicyCardinality;
  winnerPolicyIds: string[];
  suppressedPolicyIds: string[];
}
export interface PolicyExplanation {
  businessId: string;
  employeeId: string;
  evaluationDate: string;
  intervalSemantics: string;
  desiredPolicies: ResolvedPolicy[];
  suppressedCandidates: SuppressedCandidate[];
  evaluatedRules: EvaluatedRule[];
  categoryDecisions: CategoryDecision[];
  historicalEmployeeAttributeSnapshotAvailable: boolean;
}

export type CategoryBody = {
  name: string;
  description?: string | null;
  cardinality: PolicyCardinality;
};
export type PolicyBody = {
  categoryId: string;
  name: string;
  description?: string | null;
  configuration?: Record<string, unknown>;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};
export type RuleBody = {
  name?: string | null;
  conditions: PolicyRuleCondition[];
  priority: number;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};
export type AuditFilters = {
  page: number;
  limit: number;
  entityType?: AuditItem["auditType"];
  entityId?: string;
  employeeId?: string;
  policyId?: string;
  ruleId?: string;
  categoryId?: string;
  actorUserId?: string;
  action?: string;
  from?: string;
  to?: string;
};

function normalize(error: unknown): never {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as Partial<ApiErrorResponse>;
    throw new BusinessApiError(error.response.status, {
      message: data.message ?? "The policy request could not be completed.",
      code: data.code,
      errors: data.errors,
      details: data.details,
      requestId: data.requestId,
    });
  }
  throw new BusinessApiError(500, {
    message: "Unable to reach Aurex. Check your connection and try again.",
  });
}

async function request<T>(work: () => Promise<{ data: BusinessResponse<T> }>) {
  try {
    return (await work()).data.data;
  } catch (error) {
    normalize(error);
  }
}

const base = (businessId: string) => `/businesses/${businessId}`;
const categories = (businessId: string, categoryId?: string) =>
  `${base(businessId)}/policy-categories${categoryId ? `/${categoryId}` : ""}`;
const policies = (businessId: string, policyId?: string) =>
  `${base(businessId)}/policies${policyId ? `/${policyId}` : ""}`;
const rules = (businessId: string, ruleId: string) =>
  `${base(businessId)}/policy-rules/${ruleId}`;
const employeePolicies = (businessId: string, employeeId: string) =>
  `${base(businessId)}/employees/${employeeId}/policies`;

export const getPolicyCategories = (
  businessId: string,
  page: number,
  limit: number,
  status: PolicyCategoryStatus = "active",
) =>
  request<PolicyPage<PolicyCategory>>(() =>
    api.get(categories(businessId), { params: { page, limit, status } }),
  );
export const createPolicyCategory = (businessId: string, body: CategoryBody) =>
  request<PolicyCategory>(() => api.post(categories(businessId), body));
export const getPolicyCategory = (businessId: string, categoryId: string) =>
  request<PolicyCategory>(() => api.get(categories(businessId, categoryId)));
export const updatePolicyCategory = (
  businessId: string,
  categoryId: string,
  body: Partial<CategoryBody>,
) =>
  request<PolicyCategory>(() =>
    api.patch(categories(businessId, categoryId), body),
  );
export const archivePolicyCategory = (businessId: string, categoryId: string) =>
  request<PolicyCategory>(() =>
    api.post(`${categories(businessId, categoryId)}/archive`, {}),
  );

export const getPolicies = (
  businessId: string,
  page: number,
  limit: number,
  filters: { categoryId?: string; status?: PolicyStatus } = {},
) =>
  request<PolicyPage<Policy>>(() =>
    api.get(policies(businessId), { params: { page, limit, ...filters } }),
  );
export const createPolicy = (businessId: string, body: PolicyBody) =>
  request<Policy>(() => api.post(policies(businessId), body));
export const getPolicy = (businessId: string, policyId: string) =>
  request<Policy>(() => api.get(policies(businessId, policyId)));
export const updatePolicy = (
  businessId: string,
  policyId: string,
  body: Partial<PolicyBody>,
) => request<Policy>(() => api.patch(policies(businessId, policyId), body));
export const activatePolicy = (businessId: string, policyId: string) =>
  request<Policy>(() =>
    api.post(`${policies(businessId, policyId)}/activate`, {}),
  );
export const archivePolicy = (businessId: string, policyId: string) =>
  request<Policy>(() =>
    api.post(`${policies(businessId, policyId)}/archive`, {}),
  );

export const getPolicyRules = (businessId: string, policyId: string) =>
  request<{ items: PolicyRule[] }>(() =>
    api.get(`${policies(businessId, policyId)}/rules`),
  );
export const createPolicyRule = (
  businessId: string,
  policyId: string,
  body: RuleBody,
) =>
  request<PolicyRule>(() =>
    api.post(`${policies(businessId, policyId)}/rules`, body),
  );
export const getPolicyRule = (businessId: string, ruleId: string) =>
  request<PolicyRule>(() => api.get(rules(businessId, ruleId)));
export const updatePolicyRule = (
  businessId: string,
  ruleId: string,
  body: Partial<RuleBody>,
) => request<PolicyRule>(() => api.patch(rules(businessId, ruleId), body));
export const setPolicyRuleEnabled = (
  businessId: string,
  ruleId: string,
  enabled: boolean,
) =>
  request<PolicyRule>(() =>
    api.post(
      `${rules(businessId, ruleId)}/${enabled ? "enable" : "disable"}`,
      {},
    ),
  );

export const getEmployeePolicies = (
  businessId: string,
  employeeId: string,
  asOf?: string,
) =>
  request<{
    items: EmployeePolicyAssignment[];
    asOf: string;
    intervalSemantics: string;
  }>(() =>
    api.get(employeePolicies(businessId, employeeId), {
      params: asOf ? { asOf } : {},
    }),
  );
export const explainEmployeePolicies = (
  businessId: string,
  employeeId: string,
  asOf?: string,
) =>
  request<PolicyExplanation>(() =>
    api.get(`${employeePolicies(businessId, employeeId)}/explain`, {
      params: asOf ? { asOf } : {},
    }),
  );
export const createManualPolicyAssignment = (
  businessId: string,
  employeeId: string,
  policyId: string,
  effectiveFrom?: string,
) =>
  request<EmployeePolicyAssignment>(() =>
    api.post(`${employeePolicies(businessId, employeeId)}/${policyId}/manual`, {
      ...(effectiveFrom ? { effectiveFrom } : {}),
    }),
  );
export const endManualPolicyAssignment = (
  businessId: string,
  employeeId: string,
  policyId: string,
  effectiveTo?: string,
) =>
  request<EmployeePolicyAssignment>(() =>
    api.post(
      `${employeePolicies(businessId, employeeId)}/${policyId}/manual/end`,
      {
        ...(effectiveTo ? { effectiveTo } : {}),
      },
    ),
  );
export const reconcileEmployeePolicies = (
  businessId: string,
  employeeId: string,
  reason?: string,
) =>
  request<{ jobId: string }>(() =>
    api.post(`${employeePolicies(businessId, employeeId)}/reconcile`, {
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    }),
  );
export const reconcileBusinessPolicies = (
  businessId: string,
  reason?: string,
) =>
  request<{ jobId: string }>(() =>
    api.post(`${policies(businessId)}/reconcile`, {
      ...(reason?.trim() ? { reason: reason.trim() } : {}),
    }),
  );

export const getPolicyAudit = (businessId: string, filters: AuditFilters) =>
  request<PolicyPage<AuditItem>>(() =>
    api.get(`${base(businessId)}/policy-audit`, { params: filters }),
  );
const historyParams = (
  page: number,
  limit: number,
  from?: string,
  to?: string,
) => ({
  page,
  limit,
  ...(from ? { from } : {}),
  ...(to ? { to } : {}),
});
export const getEmployeePolicyHistory = (
  businessId: string,
  employeeId: string,
  page: number,
  limit: number,
  from?: string,
  to?: string,
) =>
  request<PolicyPage<AuditItem>>(() =>
    api.get(`${base(businessId)}/employees/${employeeId}/policy-history`, {
      params: historyParams(page, limit, from, to),
    }),
  );
export const getPolicyHistory = (
  businessId: string,
  policyId: string,
  page: number,
  limit: number,
  from?: string,
  to?: string,
) =>
  request<PolicyPage<AuditItem>>(() =>
    api.get(`${policies(businessId, policyId)}/history`, {
      params: historyParams(page, limit, from, to),
    }),
  );
export const getPolicyRuleHistory = (
  businessId: string,
  ruleId: string,
  page: number,
  limit: number,
  from?: string,
  to?: string,
) =>
  request<PolicyPage<AuditItem>>(() =>
    api.get(`${rules(businessId, ruleId)}/history`, {
      params: historyParams(page, limit, from, to),
    }),
  );
