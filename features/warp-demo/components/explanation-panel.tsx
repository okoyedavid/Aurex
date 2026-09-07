import { Check, X } from "lucide-react";

import type { EmployeeExplanation } from "@/lib/warp-demo/types";
import { cn } from "@/lib/utils";
import {
  explanationRuleLabel,
  formatDisplayValue,
  humanField,
  humanOperator,
  rulesForCandidate,
} from "./demo-presentation";

export function ExplanationPanel({
  explanation,
}: {
  explanation: EmployeeExplanation;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold">Why these policies apply</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Every policy candidate is evaluated against {explanation.employee.name}&apos;s
          current employee facts.
        </p>
      </div>
      {explanation.categories.map((group) => (
        <section key={group.category.id} className="rounded-md border border-border bg-card">
          <div className="border-b border-border p-4">
            <h4 className="font-semibold">{group.category.name}</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              {group.selectedPolicies.length
                ? `Selected: ${group.selectedPolicies.map((policy) => policy.name).join(", ")}`
                : "No policy selected"}
            </p>
          </div>
          <div className="space-y-3 p-4">
            {group.candidates.map((candidate) => {
              const rules = rulesForCandidate(explanation, candidate);
              return (
                <article
                  key={candidate.policyId}
                  className={cn(
                    "rounded-md border p-4",
                    candidate.selected
                      ? "border-primary/30 bg-primary/10"
                      : "border-border bg-muted/30",
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{candidate.policyName}</span>
                    <span className="text-xs text-muted-foreground">
                      {candidate.selected
                        ? "Applied"
                        : candidate.suppressedReason
                          ? "Not selected"
                          : candidate.matched
                            ? "Matches"
                            : "Does not match"}
                    </span>
                  </div>
                  {rules.length ? (
                    <div className="mt-3 space-y-2">
                      {rules.map((rule) => (
                        <div key={rule.ruleId}>
                          <p className="text-xs font-medium text-muted-foreground">
                            {explanationRuleLabel(rule.matched, rule.ruleName)}
                          </p>
                          {rule.conditions.map((condition, index) => (
                            <p
                              key={`${condition.field}-${index}`}
                              className="mt-1 flex items-start gap-2 text-sm"
                            >
                              {condition.matched ? (
                                <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                              ) : (
                                <X className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                              )}
                              <span>
                                <strong>{humanField(condition.field)}</strong>{" "}
                                {humanOperator(condition.operator)}{" "}
                                <span className="font-medium">
                                  {formatDisplayValue(condition.expectedValue)}
                                </span>
                                <span className="text-muted-foreground">
                                  {` (${explanation.employee.name}: ${formatDisplayValue(condition.actualValue)})`}
                                </span>
                              </span>
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No policy rules were available for this candidate.
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
