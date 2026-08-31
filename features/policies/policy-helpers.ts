import type {
  PolicyCardinality,
  PolicyRuleField,
  PolicyRuleOperator,
} from "@/lib/policy-api";
import type { Permission } from "@/types/generic";

export const fieldLabels: Record<PolicyRuleField, string> = {
  department: "Department / Employee list",
  employeeType: "Employee type",
  group: "Employee group",
  state: "State/location",
  tenure: "Tenure in completed months",
};

export const operatorLabels: Record<PolicyRuleOperator, string> = {
  equals: "Equals",
  not_equals: "Does not equal",
  in: "Is one of",
  not_in: "Is not one of",
  contains: "Contains",
  not_contains: "Does not contain",
  gte: "At least",
  lte: "At most",
  gt: "Greater than",
  lt: "Less than",
};

export const operatorsByField: Record<PolicyRuleField, PolicyRuleOperator[]> = {
  department: ["equals", "not_equals", "in", "not_in"],
  employeeType: ["equals", "not_equals", "in", "not_in"],
  group: ["contains", "not_contains", "in", "not_in"],
  state: ["equals", "not_equals", "in", "not_in"],
  tenure: ["equals", "not_equals", "gte", "lte", "gt", "lt"],
};

export function policyPermissions(permissions: ReadonlySet<Permission>) {
  return {
    view: permissions.has("policies:view"),
    create: permissions.has("policies:create"),
    update: permissions.has("policies:update"),
    archive: permissions.has("policies:archive"),
    assign: permissions.has("policies:assign"),
    audit: permissions.has("policies:view_audit"),
    reconcile: permissions.has("policies:reconcile"),
  };
}

export function cardinalityDescription(cardinality: PolicyCardinality) {
  return cardinality === "ONE"
    ? "One policy can apply to each employee in this category. A manual assignment takes precedence over automatic matches."
    : "Multiple distinct qualifying policies can apply to each employee in this category.";
}

export function validateEffectiveRange(from?: string | null, to?: string | null) {
  if (!from || !to) return null;
  return new Date(to).getTime() > new Date(from).getTime()
    ? null
    : "The effective end must be after the effective start.";
}

export function toRuleValue(
  field: PolicyRuleField,
  operator: PolicyRuleOperator,
  values: string[],
): string | number | string[] {
  if (field === "tenure") {
    const months = Number(values[0]);
    if (!Number.isFinite(months) || months < 0)
      throw new Error("Tenure must be a non-negative number of completed months.");
    return months;
  }
  if (operator === "in" || operator === "not_in") {
    const normalized = values.map((value) => value.trim()).filter(Boolean);
    if (!normalized.length) throw new Error("Select at least one value.");
    return normalized;
  }
  const value = values[0]?.trim();
  if (!value) throw new Error("Choose or enter a condition value.");
  return value;
}

export function formatPolicyDate(value?: string | null) {
  if (!value) return "No scheduled end";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function auditInitiatingUser(metadata?: Record<string, unknown> | null) {
  const value = metadata?.triggeredByUserId;
  return typeof value === "string" ? value : null;
}
