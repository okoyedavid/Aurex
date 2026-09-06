import type { AuditItem } from "@/lib/audit-api";

export type AuditPresentationScope =
  | "organization"
  | "personal"
  | "employee-policy";

export type AuditEventPresentation = {
  title: string;
  description?: string;
  metadata: string[];
  changes: NonNullable<AuditItem["changes"]>;
};

const domainLabels: Record<AuditItem["domain"], string> = {
  business: "Business",
  member: "Membership",
  employee: "Employee",
  policy: "Policy",
  security: "Security",
};

const assignmentActions = new Set([
  "ASSIGNMENT_CREATED",
  "ASSIGNMENT_VERSION_UPDATED",
  "ASSIGNMENT_ENDED",
  "MANUAL_ASSIGNMENT_CREATED",
  "MANUAL_ASSIGNMENT_ENDED",
]);

export function formatAuditEvent(
  event: AuditItem,
  scope: AuditPresentationScope,
): AuditEventPresentation {
  const action = normalizeAction(event.action);
  const automatic = isAutomaticActor(event.actor?.type);
  const manual = action.startsWith("MANUAL_ASSIGNMENT_");

  return {
    title:
      event.domain === "policy"
        ? policyEventTitle(event, action, scope)
        : generalEventTitle(event, action),
    description:
      event.domain === "policy"
        ? policyEventDescription(event, action)
        : undefined,
    metadata: [
      event.actor?.displayName.trim() || undefined,
      manual ? "Manual" : automatic ? "Automatic" : undefined,
      domainLabels[event.domain],
    ].filter((value): value is string => Boolean(value)),
    changes: usefulChanges(event.changes),
  };
}

function policyEventTitle(
  event: AuditItem,
  action: string,
  scope: AuditPresentationScope,
) {
  const summary = event.summary.trim();
  if (
    summary &&
    (assignmentActions.has(action) || !isTechnicalSummary(summary, event.action))
  ) {
    return summary;
  }

  const policy = event.policy?.displayName.trim() || "Policy";
  const category = event.category?.displayName.trim() || "Policy category";

  const titles: Record<string, string> = {
    CATEGORY_CREATED: `${category} category was created`,
    CATEGORY_UPDATED: `${category} category was updated`,
    CATEGORY_ARCHIVED: `${category} category was archived`,
    POLICY_CREATED: `${policy} policy was created`,
    POLICY_UPDATED: `${policy} policy was updated`,
    POLICY_ACTIVATED: `${policy} policy was activated`,
    POLICY_ARCHIVED: `${policy} policy was archived`,
    RULE_CREATED: `A rule was added to ${policy}`,
    RULE_UPDATED: `A rule for ${policy} was updated`,
    RULE_PRIORITY_CHANGED: `A rule priority changed for ${policy}`,
    RULE_ENABLED: `A rule was enabled for ${policy}`,
    RULE_DISABLED: `A rule was disabled for ${policy}`,
  };

  if (titles[action]) return titles[action];

  const employee =
    event.subject?.type === "employee"
      ? event.subject.displayName
      : scope === "employee-policy"
        ? "this employee"
        : "an employee";

  const assignmentFallbacks: Record<string, string> = {
    ASSIGNMENT_CREATED: `${policy} was assigned to ${employee}`,
    ASSIGNMENT_VERSION_UPDATED: `${policy} was updated for ${employee}`,
    ASSIGNMENT_ENDED: `${policy} ended for ${employee}`,
    MANUAL_ASSIGNMENT_CREATED: `${policy} was manually assigned to ${employee}`,
    MANUAL_ASSIGNMENT_ENDED: `${policy}'s manual assignment ended for ${employee}`,
  };

  return (
    assignmentFallbacks[action] ??
    `${policy} policy activity was recorded`
  );
}

function isTechnicalSummary(summary: string, action: string) {
  const rawAction = action.trim();
  const spacedAction = rawAction.replaceAll(/[._-]+/g, " ");
  return (
    summary.toLowerCase().startsWith(`${rawAction.toLowerCase()}:`) ||
    summary.toLowerCase().startsWith(`${spacedAction.toLowerCase()}:`) ||
    /^[A-Z][A-Z\s_-]+:/.test(summary)
  );
}

function policyEventDescription(event: AuditItem, action: string) {
  const policy = event.policy?.displayName.trim() || "the policy";
  const category = event.category?.displayName.trim() || "the policy category";
  const reason = event.reason?.trim();

  const reasonDescriptions: Record<string, string> = {
    "employee.created":
      "Assigned during the employee's initial policy evaluation.",
    "employee.created_in_list":
      "Assigned during the employee's initial policy evaluation.",
    "employee_group.status.changed":
      "Re-evaluated after an employee group changed.",
    "employee_type.status.changed":
      "Re-evaluated after an employee type changed.",
    "manual_assignment.created":
      "Re-evaluated after a manual assignment was created.",
    "manual_assignment.ended":
      "Re-evaluated after a manual assignment ended.",
    "manual_assignment.precedence":
      `Ended because a manual assignment took precedence in ${category}.`,
    "manual_assignment.replaced_automatic":
      "The automatic assignment ended when the policy was assigned manually.",
    nightly_safety_reconciliation:
      "Confirmed during an automatic policy review.",
    "policy.category.changed":
      `Re-evaluated after ${category} changed.`,
    "policy.policy_activated":
      `Assigned automatically after ${policy} became active.`,
    "policy.policy_archived":
      `Re-evaluated after ${policy} was archived.`,
    "policy.policy_updated":
      `Re-evaluated after ${policy} was updated.`,
    "policy.rule.created": `Re-evaluated after a rule was added to ${policy}.`,
    "policy.rule.rule_disabled":
      `Re-evaluated after a rule for ${policy} was disabled.`,
    "policy.rule.rule_enabled":
      `Re-evaluated after a rule for ${policy} was enabled.`,
    "policy.rule.rule_updated":
      `Re-evaluated after a rule for ${policy} was updated.`,
  };

  if (reason && reasonDescriptions[reason]) return reasonDescriptions[reason];
  if (reason && /\s/.test(reason)) return reason;

  const actor = event.actor?.displayName.trim();
  if (!actor || assignmentActions.has(action)) return undefined;

  const actorDescriptions: Record<string, string> = {
    CATEGORY_CREATED: `${actor} created this category.`,
    CATEGORY_UPDATED: `${actor} updated this category.`,
    CATEGORY_ARCHIVED: `${actor} archived this category.`,
    POLICY_CREATED: `${actor} created this policy.`,
    POLICY_UPDATED: `${actor} updated this policy.`,
    POLICY_ACTIVATED: `${actor} activated this policy.`,
    POLICY_ARCHIVED: `${actor} archived this policy.`,
    RULE_CREATED: `${actor} added this rule.`,
    RULE_UPDATED: `${actor} updated this rule.`,
    RULE_PRIORITY_CHANGED: `${actor} changed this rule's priority.`,
    RULE_ENABLED: `${actor} enabled this rule.`,
    RULE_DISABLED: `${actor} disabled this rule.`,
  };

  return actorDescriptions[action];
}

function generalEventTitle(event: AuditItem, action: string) {
  const actor = event.actor?.displayName.trim();
  const subject = event.subject?.displayName.trim();
  const namedResource = changedValue(event, "name") ?? subject;
  const byActor = (verb: string, passive: string) =>
    actor ? `${actor} ${verb}` : passive;

  switch (action) {
    case "business.member.role_updated":
      return byActor(
        `changed ${subject ?? "a member"}'s role`,
        `${subject ?? "A member"}'s role was changed`,
      );
    case "business.member.status_updated":
      return byActor(
        `changed ${subject ?? "a member"}'s membership status`,
        `${subject ?? "A member"}'s membership status was changed`,
      );
    case "business.member.removed":
      return byActor(
        `removed ${subject ?? "a member"} from the business`,
        `${subject ?? "A member"} was removed from the business`,
      );
    case "business.employee.created":
      return byActor(
        `added ${subject ?? "an employee"}`,
        `${subject ?? "An employee"} was added`,
      );
    case "business.employee.updated":
      return byActor(
        `updated ${subject ?? "an employee"}`,
        `${subject ?? "An employee"} was updated`,
      );
    case "business.employee_type.created":
      return `${namedResource ?? "An employee type"} was created`;
    case "business.employee_type.updated":
      return `${namedResource ?? "An employee type"} was updated`;
    case "business.employee_group.created":
      return `${namedResource ?? "An employee group"} was created`;
    case "business.employee_group.updated":
      return `${namedResource ?? "An employee group"} was updated`;
    case "business.created":
      return actor ? `${actor} created the business` : "The business was created";
    case "business.updated":
      return actor ? `${actor} updated the business` : "The business was updated";
    case "business.invite.created":
      return "A business invitation was created";
    case "business.invite.resent":
      return "A business invitation was resent";
    case "business.invite.revoked":
      return "A business invitation was revoked";
    case "business.invite.accepted":
      return "A business invitation was accepted";
    case "business.invite.declined":
      return "A business invitation was declined";
    case "business.invite.approval_requested":
      return "Approval was requested for a business invitation";
    case "business.invite.approved":
      return "A business invitation was approved";
    case "business.invite.approval_rejected":
      return "A business invitation was rejected";
    case "business.membership.activated":
      return `${subject ?? "A member"}'s membership was activated`;
    case "auth.login.succeeded":
      return "A sign-in succeeded";
    case "auth.login.failed":
      return "A sign-in attempt failed";
    case "auth.logout":
      return "A user signed out";
    case "auth.session.revoked":
      return "A session was revoked";
    case "auth.sessions.revoked_all_others":
      return "All other sessions were revoked";
    case "account.email_verification.requested":
      return "Email verification was requested";
    case "account.email_verification.succeeded":
      return "An email address was verified";
    case "account.email_verification.failed":
      return "Email verification failed";
    case "account.email_change.requested":
      return "An email address change was requested";
    case "account.email_change.succeeded":
      return "An email address was changed";
    case "account.email_change.failed":
      return "An email address change failed";
    case "account.password_reset.requested":
      return "A password reset was requested";
    case "account.password_reset.succeeded":
      return "A password was reset";
    case "account.password_reset.failed":
      return "A password reset failed";
    case "security.rate_limit.triggered":
      return "A security rate limit was triggered";
    default:
      return "Business activity was recorded";
  }
}

function normalizeAction(action: string) {
  return eventActionIsUppercase(action)
    ? action.trim().replaceAll(/[-\s]+/g, "_").toUpperCase()
    : action.trim().toLowerCase();
}

function eventActionIsUppercase(action: string) {
  return !action.includes(".");
}

function isAutomaticActor(type?: string) {
  return Boolean(type && /worker|system|service|automation|engine/i.test(type));
}

function changedValue(event: AuditItem, field: string) {
  const value = event.changes?.find((change) => change.field === field)?.after;
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function usefulChanges(changes: AuditItem["changes"]) {
  return (changes ?? []).filter(
    (change) => !isIdentifierField(change.field) && change.before !== change.after,
  );
}

function isIdentifierField(field: string) {
  const normalized = field.replaceAll(/[_-]/g, "").toLowerCase();
  return (
    /(^|[_-])(id|ids|uuid|uuids)$/i.test(field) ||
    /(?:Id|Ids|Uuid|Uuids)$/.test(field) ||
    ["id", "ids", "uuid", "uuids", "businessmemberid", "employeeid"].includes(
      normalized,
    )
  );
}
