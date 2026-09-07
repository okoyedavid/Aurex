import type {
  DemoEmployee,
  EmployeeExplanation,
  ReconciliationRun,
  WarpDemoMutation,
} from "@/lib/warp-demo/types";

export function controlValue(
  employee: DemoEmployee,
  field: WarpDemoMutation["field"],
) {
  if (field === "department") {
    return employee.department.toLowerCase() === "engineering"
      ? "engineering"
      : "finance";
  }
  if (field === "employeeType") {
    return employee.employeeType?.toLowerCase().replace(" ", "_") ?? "";
  }
  if (field === "state") {
    return employee.state?.toLowerCase().replace(" ", "_") ?? "";
  }
  return employee.groups.some((group) => group.toLowerCase() === "remote")
    ? "member"
    : "not_member";
}

export function fieldLabel(value: string) {
  if (value === "employeeType") return "Employee type";
  if (value === "remoteGroup") return "Remote group membership";
  return value[0].toUpperCase() + value.slice(1);
}

export function humanValue(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace("Full Time", "Full-time")
    .replace("Not Member", "Not a member");
}

export function timelineEventCopy(event: ReconciliationRun["events"][number]) {
  if (event.stage === "queued") {
    return {
      title: "Policies queued",
      description: "Aurex is preparing this employee's policies for recalculation.",
    };
  }
  if (event.stage === "policy_resolution" && event.status !== "success") {
    return {
      title: "Policies recalculating",
      description:
        "Aurex is evaluating the employee's current details against active policy rules.",
    };
  }
  if (event.stage === "external_access") {
    return {
      title: "External access checked",
      description:
        "The demo shows the access decision without changing a real GitHub account.",
    };
  }
  if (event.stage === "audit") {
    return {
      title: "Audit trail updated",
      description: "The employee and assignment changes were added to the audit trail.",
    };
  }
  if (event.stage === "complete") {
    return {
      title: "Update complete",
      description:
        "The employee profile, policy assignments and audit trail are now up to date.",
    };
  }
  return { title: event.title, description: event.description };
}

export function explanationRuleLabel(matched: boolean, ruleName: string | null) {
  return matched
    ? `Matched through ${ruleName ?? "policy rule"}`
    : `Rule checked: ${ruleName ?? "Policy rule"}`;
}

export function humanField(field: string) {
  return (
    {
      department: "Department",
      employeeType: "Employee type",
      group: "Employee group",
      state: "State",
      tenure: "Tenure",
    } as Record<string, string>
  )[field] ?? field.replaceAll("_", " ");
}

export function humanOperator(operator?: string) {
  return operator ? operator.replaceAll("_", " ").toLowerCase() : "matches";
}

export function formatDisplayValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(formatDisplayValue).join(", ");
  if (value === null || value === undefined || value === "") return "not set";
  if (typeof value === "object") return "available";
  return String(value);
}

export function displayValueForRule(
  explanation: EmployeeExplanation | undefined,
  ruleId: string,
  field: string,
  fallback: unknown,
) {
  const rule = explanation?.evaluatedRules?.find((item) => item.ruleId === ruleId);
  const condition = rule?.conditions.find((item) => item.condition.field === field);
  if (condition) {
    return condition.expectedDisplayValue ?? condition.expectedValue ?? fallback;
  }
  return ["department", "employeeType", "group"].includes(field)
    ? "Reference unavailable"
    : fallback;
}

export function rulesForCandidate(
  explanation: EmployeeExplanation,
  candidate: EmployeeExplanation["categories"][number]["candidates"][number],
) {
  const evaluated = explanation.evaluatedRules?.filter(
    (rule) => rule.policyId === candidate.policyId,
  );
  if (evaluated?.length) {
    return evaluated.map((rule) => ({
      ruleId: rule.ruleId,
      ruleName: rule.ruleName,
      matched: rule.matched,
      conditions: rule.conditions.map((condition) => ({
        field: condition.condition.field,
        operator: condition.condition.operator,
        expectedValue:
          condition.expectedDisplayValue ?? condition.expectedValue,
        actualValue: condition.actualDisplayValue ?? condition.actualValue,
        matched: condition.matched,
      })),
    }));
  }
  return candidate.matchedRules.map((rule) => ({ ...rule, matched: true }));
}

function humanizeMachineLabel(value: string) {
  const words = value.toLowerCase().replaceAll("_", " ").trim();
  return words ? words[0].toUpperCase() + words.slice(1) : words;
}

export function humanAuditAction(value: string) {
  return humanizeMachineLabel(value);
}

export function humanAuditReason(value: string) {
  const reason = value.split(".").at(-1) ?? value;
  return reason === "session_initialized"
    ? "Demo initialized"
    : humanizeMachineLabel(reason);
}

export function humanAuditSummary(value: string) {
  const normalized = value.trim();
  return normalized
    ? normalized[0].toUpperCase() + normalized.slice(1)
    : normalized;
}

export function formatDemoDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
