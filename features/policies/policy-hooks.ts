"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as service from "@/lib/policy-api";

export const policyKeys = {
  categoriesRoot: (businessId: string) => ["policy-categories", businessId] as const,
  categories: (businessId: string, page: number, limit: number, status: service.PolicyCategoryStatus) =>
    [...policyKeys.categoriesRoot(businessId), { page, limit, status }] as const,
  category: (businessId: string, categoryId: string) =>
    ["policy-category", businessId, categoryId] as const,
  policiesRoot: (businessId: string) => ["policies", businessId] as const,
  policies: (businessId: string, page: number, limit: number, filters: object) =>
    [...policyKeys.policiesRoot(businessId), { page, limit, ...filters }] as const,
  policy: (businessId: string, policyId: string) => ["policy", businessId, policyId] as const,
  rulesRoot: (businessId: string, policyId: string) => ["policy-rules", businessId, policyId] as const,
  rule: (businessId: string, ruleId: string) => ["policy-rule", businessId, ruleId] as const,
  employeePoliciesRoot: (businessId: string, employeeId: string) =>
    ["employee-policies", businessId, employeeId] as const,
  employeePolicies: (businessId: string, employeeId: string, asOf?: string) =>
    [...policyKeys.employeePoliciesRoot(businessId, employeeId), asOf ?? "current"] as const,
  explanationRoot: (businessId: string, employeeId: string) =>
    ["employee-policy-explanation", businessId, employeeId] as const,
  explanation: (businessId: string, employeeId: string, asOf?: string) =>
    [...policyKeys.explanationRoot(businessId, employeeId), asOf ?? "current"] as const,
  auditRoot: (businessId: string) => ["policy-audit", businessId] as const,
  audit: (businessId: string, filters: service.AuditFilters) =>
    [...policyKeys.auditRoot(businessId), filters] as const,
  employeeHistoryRoot: (businessId: string, employeeId: string) =>
    ["employee-policy-history", businessId, employeeId] as const,
  employeeHistory: (businessId: string, employeeId: string, filters: object) =>
    [...policyKeys.employeeHistoryRoot(businessId, employeeId), filters] as const,
  policyHistory: (businessId: string, policyId: string, filters: object) =>
    ["policy-history", businessId, policyId, filters] as const,
  ruleHistory: (businessId: string, ruleId: string, filters: object) =>
    ["policy-rule-history", businessId, ruleId, filters] as const,
};

export function usePolicyCategoriesQuery(businessId: string, page = 1, limit = 20, status: service.PolicyCategoryStatus = "active", enabled = true) {
  return useQuery({ queryKey: policyKeys.categories(businessId, page, limit, status), queryFn: () => service.getPolicyCategories(businessId, page, limit, status), enabled: Boolean(businessId) && enabled, placeholderData: keepPreviousData });
}
export function usePolicyCategoryQuery(businessId: string, categoryId: string, enabled = true) {
  return useQuery({ queryKey: policyKeys.category(businessId, categoryId), queryFn: () => service.getPolicyCategory(businessId, categoryId), enabled: Boolean(businessId && categoryId) && enabled });
}
export function usePoliciesQuery(businessId: string, page = 1, limit = 20, filters: { categoryId?: string; status?: service.PolicyStatus } = {}, enabled = true) {
  return useQuery({ queryKey: policyKeys.policies(businessId, page, limit, filters), queryFn: () => service.getPolicies(businessId, page, limit, filters), enabled: Boolean(businessId) && enabled, placeholderData: keepPreviousData });
}
export function usePolicyQuery(businessId: string, policyId: string, enabled = true) {
  return useQuery({ queryKey: policyKeys.policy(businessId, policyId), queryFn: () => service.getPolicy(businessId, policyId), enabled: Boolean(businessId && policyId) && enabled });
}
export function usePolicyRulesQuery(businessId: string, policyId: string, enabled = true) {
  return useQuery({ queryKey: policyKeys.rulesRoot(businessId, policyId), queryFn: () => service.getPolicyRules(businessId, policyId), enabled: Boolean(businessId && policyId) && enabled });
}
export function useEmployeePoliciesQuery(businessId: string, employeeId: string, asOf?: string, enabled = true) {
  return useQuery({ queryKey: policyKeys.employeePolicies(businessId, employeeId, asOf), queryFn: () => service.getEmployeePolicies(businessId, employeeId, asOf), enabled: Boolean(businessId && employeeId) && enabled });
}
export function usePolicyExplanationQuery(businessId: string, employeeId: string, asOf?: string, enabled = true) {
  return useQuery({ queryKey: policyKeys.explanation(businessId, employeeId, asOf), queryFn: () => service.explainEmployeePolicies(businessId, employeeId, asOf), enabled: Boolean(businessId && employeeId) && enabled });
}
export function usePolicyAuditQuery(businessId: string, filters: service.AuditFilters, enabled = true) {
  return useQuery({ queryKey: policyKeys.audit(businessId, filters), queryFn: () => service.getPolicyAudit(businessId, filters), enabled: Boolean(businessId) && enabled, placeholderData: keepPreviousData });
}
export function useEmployeePolicyHistoryQuery(businessId: string, employeeId: string, page: number, limit: number, enabled = true) {
  const filters = { page, limit };
  return useQuery({ queryKey: policyKeys.employeeHistory(businessId, employeeId, filters), queryFn: () => service.getEmployeePolicyHistory(businessId, employeeId, page, limit), enabled: Boolean(businessId && employeeId) && enabled, placeholderData: keepPreviousData });
}
export function usePolicyHistoryQuery(businessId: string, policyId: string, page: number, limit: number, enabled = true) {
  const filters = { page, limit };
  return useQuery({ queryKey: policyKeys.policyHistory(businessId, policyId, filters), queryFn: () => service.getPolicyHistory(businessId, policyId, page, limit), enabled: Boolean(businessId && policyId) && enabled, placeholderData: keepPreviousData });
}
export function useRuleHistoryQuery(businessId: string, ruleId: string, page: number, limit: number, enabled = true) {
  const filters = { page, limit };
  return useQuery({ queryKey: policyKeys.ruleHistory(businessId, ruleId, filters), queryFn: () => service.getPolicyRuleHistory(businessId, ruleId, page, limit), enabled: Boolean(businessId && ruleId) && enabled, placeholderData: keepPreviousData });
}

function useCategoryInvalidation(businessId: string) {
  const qc = useQueryClient();
  return (categoryId?: string) => Promise.all([
    qc.invalidateQueries({ queryKey: policyKeys.categoriesRoot(businessId) }),
    ...(categoryId ? [qc.invalidateQueries({ queryKey: policyKeys.category(businessId, categoryId) })] : []),
    qc.invalidateQueries({ queryKey: policyKeys.policiesRoot(businessId) }),
  ]);
}
export function useCreateCategoryMutation(businessId: string) { const invalidate = useCategoryInvalidation(businessId); return useMutation({ mutationFn: (body: service.CategoryBody) => service.createPolicyCategory(businessId, body), onSuccess: (item) => invalidate(item.id) }); }
export function useUpdateCategoryMutation(businessId: string, categoryId: string) { const invalidate = useCategoryInvalidation(businessId); return useMutation({ mutationFn: (body: Partial<service.CategoryBody>) => service.updatePolicyCategory(businessId, categoryId, body), onSuccess: () => invalidate(categoryId) }); }
export function useArchiveCategoryMutation(businessId: string, categoryId: string) { const invalidate = useCategoryInvalidation(businessId); return useMutation({ mutationFn: () => service.archivePolicyCategory(businessId, categoryId), onSuccess: () => invalidate(categoryId) }); }

function usePolicyInvalidation(businessId: string, policyId?: string) { const qc = useQueryClient(); return () => Promise.all([qc.invalidateQueries({ queryKey: policyKeys.policiesRoot(businessId) }), ...(policyId ? [qc.invalidateQueries({ queryKey: policyKeys.policy(businessId, policyId) }), qc.invalidateQueries({ queryKey: policyKeys.rulesRoot(businessId, policyId) })] : [])]); }
export function useCreatePolicyMutation(businessId: string) { const invalidate = usePolicyInvalidation(businessId); return useMutation({ mutationFn: (body: service.PolicyBody) => service.createPolicy(businessId, body), onSuccess: invalidate }); }
export function useUpdatePolicyMutation(businessId: string, policyId: string) { const invalidate = usePolicyInvalidation(businessId, policyId); return useMutation({ mutationFn: (body: Partial<service.PolicyBody>) => service.updatePolicy(businessId, policyId, body), onSuccess: invalidate }); }
export function useActivatePolicyMutation(businessId: string, policyId: string) { const invalidate = usePolicyInvalidation(businessId, policyId); return useMutation({ mutationFn: () => service.activatePolicy(businessId, policyId), onSuccess: invalidate }); }
export function useArchivePolicyMutation(businessId: string, policyId: string) { const invalidate = usePolicyInvalidation(businessId, policyId); return useMutation({ mutationFn: () => service.archivePolicy(businessId, policyId), onSuccess: invalidate }); }

function useRuleInvalidation(businessId: string, policyId: string, ruleId?: string) { const qc = useQueryClient(); return () => Promise.all([qc.invalidateQueries({ queryKey: policyKeys.rulesRoot(businessId, policyId) }), qc.invalidateQueries({ queryKey: policyKeys.policy(businessId, policyId) }), ...(ruleId ? [qc.invalidateQueries({ queryKey: policyKeys.rule(businessId, ruleId) })] : []), qc.invalidateQueries({ queryKey: ["employee-policy-explanation", businessId] })]); }
export function useCreateRuleMutation(businessId: string, policyId: string) { const invalidate = useRuleInvalidation(businessId, policyId); return useMutation({ mutationFn: (body: service.RuleBody) => service.createPolicyRule(businessId, policyId, body), onSuccess: invalidate }); }
export function useUpdateRuleMutation(businessId: string, policyId: string, ruleId: string) { const invalidate = useRuleInvalidation(businessId, policyId, ruleId); return useMutation({ mutationFn: (body: Partial<service.RuleBody>) => service.updatePolicyRule(businessId, ruleId, body), onSuccess: invalidate }); }
export function useSetRuleEnabledMutation(businessId: string, policyId: string, ruleId: string) { const invalidate = useRuleInvalidation(businessId, policyId, ruleId); return useMutation({ mutationFn: (enabled: boolean) => service.setPolicyRuleEnabled(businessId, ruleId, enabled), onSuccess: invalidate }); }

function useEmployeePolicyInvalidation(businessId: string, employeeId: string) { const qc = useQueryClient(); return () => Promise.all([qc.invalidateQueries({ queryKey: policyKeys.employeePoliciesRoot(businessId, employeeId) }), qc.invalidateQueries({ queryKey: policyKeys.explanationRoot(businessId, employeeId) }), qc.invalidateQueries({ queryKey: policyKeys.employeeHistoryRoot(businessId, employeeId) }), qc.invalidateQueries({ queryKey: policyKeys.auditRoot(businessId) })]); }
export function useCreateManualAssignmentMutation(businessId: string, employeeId: string) { const invalidate = useEmployeePolicyInvalidation(businessId, employeeId); return useMutation({ mutationFn: ({ policyId, effectiveFrom }: { policyId: string; effectiveFrom?: string }) => service.createManualPolicyAssignment(businessId, employeeId, policyId, effectiveFrom), onSuccess: invalidate }); }
export function useEndManualAssignmentMutation(businessId: string, employeeId: string) { const invalidate = useEmployeePolicyInvalidation(businessId, employeeId); return useMutation({ mutationFn: ({ policyId, effectiveTo }: { policyId: string; effectiveTo?: string }) => service.endManualPolicyAssignment(businessId, employeeId, policyId, effectiveTo), onSuccess: invalidate }); }
export function useReconcileEmployeeMutation(businessId: string, employeeId: string) { const invalidate = useEmployeePolicyInvalidation(businessId, employeeId); return useMutation({ mutationFn: (reason?: string) => service.reconcileEmployeePolicies(businessId, employeeId, reason), onSuccess: invalidate }); }
export function useReconcileBusinessMutation(businessId: string) { const qc = useQueryClient(); return useMutation({ mutationFn: (reason?: string) => service.reconcileBusinessPolicies(businessId, reason), onSuccess: () => Promise.all([qc.invalidateQueries({ queryKey: ["employee-policies", businessId] }), qc.invalidateQueries({ queryKey: ["employee-policy-explanation", businessId] }), qc.invalidateQueries({ queryKey: policyKeys.auditRoot(businessId) })]) }); }
