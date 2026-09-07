import { useMemo } from "react";
import { ChevronDown } from "lucide-react";

import { Loading } from "@/components/ui/loading";
import type {
  EmployeeExplanation,
  PolicyDetail,
  PolicySummary,
} from "@/lib/warp-demo/types";
import { cn } from "@/lib/utils";
import { DemoEmptyState } from "./demo-empty-state";
import {
  displayValueForRule,
  formatDisplayValue,
  humanField,
  humanOperator,
} from "./demo-presentation";

type PolicyExplorerProps = {
  policies: PolicySummary[];
  categories: Array<{
    id: string;
    name: string;
    cardinality: string;
    policyCount: number;
  }>;
  policyId: string;
  onPolicyChange: (id: string) => void;
  detail?: PolicyDetail;
  explanation?: EmployeeExplanation;
  loading: boolean;
};

export function PolicyExplorer({
  policies,
  categories,
  policyId,
  onPolicyChange,
  detail,
  explanation,
  loading,
}: PolicyExplorerProps) {
  const grouped = useMemo(
    () =>
      categories.map((category) => ({
        category,
        policies: policies.filter((item) => item.category.id === category.id),
      })),
    [categories, policies],
  );

  return (
    <div className="mt-6 grid min-h-[34rem] gap-6 lg:grid-cols-[22rem_1fr]">
      <aside className="space-y-3">
        {grouped.map(({ category, policies: groupPolicies }) => (
          <details key={category.id} className="group rounded-md border border-border bg-card" open>
            <summary className="flex cursor-pointer list-none items-center justify-between p-4">
              <div>
                <p className="text-sm font-semibold">{category.name}</p>
                <p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">
                  {category.cardinality} · {category.policyCount} policies
                </p>
              </div>
              <ChevronDown className="size-4 transition group-open:rotate-180" />
            </summary>
            <div className="border-t border-border p-2">
              {groupPolicies.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onPolicyChange(item.id)}
                  className={cn(
                    "w-full rounded-md p-2.5 text-left text-sm",
                    item.id === policyId
                      ? "bg-primary/10 font-semibold"
                      : "hover:bg-muted",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </details>
        ))}
      </aside>
      <div className="rounded-md border border-border bg-card p-6">
        {loading ? (
          <Loading label="Loading policy rules" />
        ) : detail ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase text-primary">
                  {detail.category.name} · v{detail.version}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">{detail.name}</h3>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase text-primary">
                {detail.status}
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
              {detail.description}
            </p>
            <div className="mt-8 space-y-3">
              {detail.rules.map((rule) => (
                <article key={rule.id} className="rounded-md bg-muted p-4">
                  <div className="flex justify-between gap-3">
                    <p className="text-sm font-semibold">{rule.name}</p>
                    <span className="font-mono text-[10px]">priority {rule.priority}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rule.conditions.map((condition, index) => (
                      <span
                        key={`${condition.field}-${index}`}
                        className="rounded-md border border-border bg-card px-2 py-1 font-mono text-[10px]"
                      >
                        {humanField(condition.field)} {humanOperator(condition.operator)}{" "}
                        {formatDisplayValue(
                          condition.displayValue ??
                            displayValueForRule(
                              explanation,
                              rule.id,
                              condition.field,
                              condition.value,
                            ),
                        )}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <DemoEmptyState label="Choose a policy to inspect its rule set." />
        )}
      </div>
    </div>
  );
}
