import type {
  ConditionEvaluation,
  Policy,
  PolicyExplanation,
} from "@/lib/policy-api";
import {
  fieldLabels,
  operatorLabels,
} from "@/features/policies/policy-helpers";
import { HistoricalDataWarning, PolicyBadge, PolicyEmpty } from "./policy-ui";

function valueLabel(value: string | string[] | number | null) {
  if (value === null) return "Not available";
  return Array.isArray(value) ? value.join(", ") : String(value);
}

function ConditionRows({ evaluations }: { evaluations: ConditionEvaluation[] }) {
  return (
    <div className="mt-3 space-y-1">
      {evaluations.map((evaluation, index) => (
        <div
          key={index}
          className={`rounded-lg px-3 py-2 text-xs ${evaluation.matched ? "bg-emerald-500/10" : "bg-destructive/10"}`}
        >
          <span className="font-semibold">
            {evaluation.matched ? "Matched" : "Failed"}
          </span>{" "}
          · {fieldLabels[evaluation.condition.field]}{" "}
          {operatorLabels[evaluation.condition.operator].toLowerCase()} {" "}
          {valueLabel(evaluation.condition.value)}; actual:{" "}
          {valueLabel(evaluation.actualValue)}
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
    policies.find((policy) => policy.id === id)?.name ?? id;

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
                className="rounded-xl border border-border p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{policyName(resolved.policyId)}</p>
                  <PolicyBadge tone={resolved.source === "manual" ? "info" : "success"}>
                    {resolved.source === "manual" ? "Manual override" : "Automatic"}
                  </PolicyBadge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>Priority: {resolved.priority ?? "Manual"}</p>
                  <p>Winning rule: {resolved.winningRuleId ?? "None"}</p>
                  <p>Matched rules: {resolved.matchedRuleIds.join(", ") || "None"}</p>
                </div>
                {Object.entries(resolved.conditionEvaluations).map(
                  ([ruleId, evaluations]) => (
                    <div key={ruleId} className="mt-3">
                      <p className="text-xs font-semibold">Rule {ruleId}</p>
                      <ConditionRows evaluations={evaluations} />
                    </div>
                  ),
                )}
              </article>
            ))}
          </div>
        ) : (
          <PolicyEmpty title="No winning policies for this evaluation date." />
        )}
      </section>

      <section>
        <h4 className="mb-3 font-semibold">Evaluated rules</h4>
        {explanation.evaluatedRules.length ? (
          <div className="space-y-3">
            {explanation.evaluatedRules.map((rule) => (
              <article key={rule.ruleId} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{policyName(rule.policyId)}</p>
                    <p className="text-xs text-muted-foreground">
                      Rule {rule.ruleId} · priority {rule.priority}
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
          <PolicyEmpty title="No rules were evaluated." />
        )}
      </section>

      <section>
        <h4 className="mb-3 font-semibold">Suppressed candidates</h4>
        {explanation.suppressedCandidates.length ? (
          <div className="space-y-2">
            {explanation.suppressedCandidates.map((candidate) => (
              <div
                key={`${candidate.policyId}-${candidate.reason}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3"
              >
                <div>
                  <p className="font-medium">{policyName(candidate.policyId)}</p>
                  <p className="text-xs text-muted-foreground">
                    Priority {candidate.priority ?? "Manual"} · matched rules{" "}
                    {candidate.matchedRuleIds.join(", ") || "none"}
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
          <PolicyEmpty title="No candidates were suppressed." />
        )}
      </section>

      <section>
        <h4 className="mb-3 font-semibold">Category decisions</h4>
        <div className="grid gap-3 md:grid-cols-2">
          {explanation.categoryDecisions.map((decision) => (
            <div key={decision.categoryId} className="rounded-xl border border-border p-3">
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
