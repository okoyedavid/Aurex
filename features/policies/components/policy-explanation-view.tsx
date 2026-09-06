import type {
  ConditionEvaluation,
  Policy,
  PolicyExplanation,
} from "@/lib/policy-api";
import {
  fieldLabels,
  operatorLabels,
} from "@/features/policies/policy-helpers";
import { FeedbackState } from "@/components/ui/feedback-state";
import { HistoricalDataWarning, PolicyBadge } from "./policy-ui";

function valueLabel(value: string | string[] | number | null) {
  if (value === null) return "Not available";
  return Array.isArray(value) ? value.join(", ") : String(value);
}

function displayValue(
  field: string,
  fallback: string | string[] | number | null,
  display: string | string[] | number | null | undefined,
) {
  if (
    display === undefined &&
    ["department", "employeeType", "group"].includes(field)
  ) {
    return Array.isArray(fallback)
      ? fallback.map(() => "Reference unavailable").join(", ")
      : "Reference unavailable";
  }
  return valueLabel(display ?? fallback);
}

function ConditionRows({ evaluations }: { evaluations: ConditionEvaluation[] }) {
  return (
    <div className="mt-3 space-y-1">
      {evaluations.map((evaluation, index) => (
        <div
          key={index}
          className={`rounded-md px-3 py-2 text-xs ${evaluation.matched ? "bg-emerald-500/10" : "bg-destructive/10"}`}
        >
          <span className="font-semibold">
            {evaluation.matched ? "Matched" : "Failed"}
          </span>{" "}
          · {fieldLabels[evaluation.condition.field]}{" "}
          {operatorLabels[evaluation.condition.operator].toLowerCase()} {" "}
          {displayValue(
            evaluation.condition.field,
            evaluation.condition.value,
            evaluation.expectedDisplayValue,
          )}; actual:{" "}
          {displayValue(
            evaluation.condition.field,
            evaluation.actualValue,
            evaluation.actualDisplayValue,
          )}
        </div>
      ))}
    </div>
  );
}

export function PolicyExplanationView({
  explanation,
  policies,
}: {
  explanation: PolicyExplanation;
  policies: Policy[];
}) {
  const policyName = (id: string) =>
    policies.find((policy) => policy.id === id)?.name ?? "Policy name unavailable";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold">Resolution explanation</h3>
        <p className="text-sm text-muted-foreground">
          Evaluated {new Date(explanation.evaluationDate).toLocaleString()} ·{" "}
          {explanation.intervalSemantics}
        </p>
      </div>

      {!explanation.historicalEmployeeAttributeSnapshotAvailable ? (
        <HistoricalDataWarning />
      ) : null}

      <section>
        <h4 className="mb-3 font-semibold">Winning policies</h4>
        {explanation.desiredPolicies.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {explanation.desiredPolicies.map((resolved) => (
              <article
                key={`${resolved.policyId}-${resolved.source}`}
                className="rounded-md border border-border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{policyName(resolved.policyId)}</p>
                  <PolicyBadge tone={resolved.source === "manual" ? "info" : "success"}>
                    {resolved.source === "manual" ? "Manual override" : "Automatic"}
                  </PolicyBadge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>Priority: {resolved.priority ?? "Manual"}</p>
                  <p>
                    Winning rule: {resolved.winningRuleName ?? "Unnamed rule"}
                  </p>
                </div>
                {Object.entries(resolved.conditionEvaluations).map(
                  ([ruleId, evaluations]) => (
                    <div key={ruleId} className="mt-3">
                      <p className="text-xs font-semibold">Rule evaluation</p>
                      <ConditionRows evaluations={evaluations} />
                    </div>
                  ),
                )}
              </article>
            ))}
          </div>
        ) : (
          <FeedbackState
            title="No winning policies for this evaluation date."
            tone="neutral"
            variant="empty"
          />
        )}
      </section>

      <section>
        <h4 className="mb-3 font-semibold">Evaluated rules</h4>
        {explanation.evaluatedRules.length ? (
          <div className="space-y-3">
            {explanation.evaluatedRules.map((rule) => (
              <article key={rule.ruleId} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{policyName(rule.policyId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {rule.ruleName ?? "Unnamed rule"} · Priority {rule.priority}
                    </p>
                  </div>
                  <PolicyBadge tone={rule.matched ? "success" : "danger"}>
                    {rule.matched ? "Matched" : "Did not match"}
                  </PolicyBadge>
                </div>
                <ConditionRows evaluations={rule.conditionEvaluations} />
              </article>
            ))}
          </div>
        ) : (
          <FeedbackState
            title="No rules were evaluated."
            tone="neutral"
            variant="empty"
          />
        )}
      </section>

      <section>
        <h4 className="mb-3 font-semibold">Suppressed candidates</h4>
        {explanation.suppressedCandidates.length ? (
          <div className="space-y-2">
            {explanation.suppressedCandidates.map((candidate) => (
              <div
                key={`${candidate.policyId}-${candidate.reason}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3"
              >
                <div>
                  <p className="font-medium">{policyName(candidate.policyId)}</p>
                  <p className="text-xs text-muted-foreground">
                  Priority {candidate.priority ?? "Manual"} · evaluated against employee attributes
                  </p>
                </div>
                <PolicyBadge tone="warning">
                  {candidate.reason === "manual_override"
                    ? "Manual override"
                    : "Lower priority/cardinality"}
                </PolicyBadge>
              </div>
            ))}
          </div>
        ) : (
          <FeedbackState
            title="No candidates were suppressed."
            tone="neutral"
            variant="empty"
          />
        )}
      </section>

      <section>
        <h4 className="mb-3 font-semibold">Category decisions</h4>
        <div className="grid gap-3 md:grid-cols-2">
          {explanation.categoryDecisions.map((decision) => (
            <div key={decision.categoryId} className="rounded-md border border-border p-3">
              <div className="flex justify-between gap-2">
                <p className="font-semibold">{decision.name}</p>
                <PolicyBadge tone="info">{decision.cardinality}</PolicyBadge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Winners: {decision.winnerPolicyIds.map(policyName).join(", ") || "none"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Suppressed:{" "}
                {decision.suppressedPolicyIds.map(policyName).join(", ") || "none"}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
