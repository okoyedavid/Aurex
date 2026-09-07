import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { SelectControl } from "@/components/ui/select";
import type {
  AuditEvent,
  DemoEmployee,
  PolicySummary,
} from "@/lib/warp-demo/types";
import { DemoEmptyState } from "./demo-empty-state";
import {
  formatDemoDate,
  humanAuditAction,
  humanAuditReason,
  humanAuditSummary,
} from "./demo-presentation";

type AuditExplorerProps = {
  events: AuditEvent[];
  employees: DemoEmployee[];
  policies: PolicySummary[];
  employeeId: string;
  policyId: string;
  action: string;
  onEmployeeChange: (value: string) => void;
  onPolicyChange: (value: string) => void;
  onActionChange: (value: string) => void;
  loading: boolean;
  error: Error | null;
};

export function AuditExplorer({
  events,
  employees,
  policies,
  employeeId,
  policyId,
  action,
  onEmployeeChange,
  onPolicyChange,
  onActionChange,
  loading,
  error,
}: AuditExplorerProps) {
  const actions = Array.from(new Set(events.map((event) => event.action)));
  return (
    <div id="audit" className="mt-6 scroll-mt-24">
      <div className="flex flex-wrap gap-3 rounded-md border border-border bg-card p-4">
        <FilterSelect
          value={employeeId}
          onChange={onEmployeeChange}
          label="All employees"
          options={employees.flatMap((item) =>
            item.id ? [[item.id, item.name]] : [],
          )}
        />
        <FilterSelect
          value={policyId}
          onChange={onPolicyChange}
          label="All policies"
          options={policies.map((item) => [item.id, item.name])}
        />
        <FilterSelect
          value={action}
          onChange={onActionChange}
          label="All actions"
          options={actions.map((item) => [item, humanAuditAction(item)])}
        />
        <Button
          variant="ghost"
          onClick={() => {
            onEmployeeChange("");
            onPolicyChange("");
            onActionChange("");
          }}
        >
          <SlidersHorizontal /> Clear
        </Button>
      </div>
      {loading ? (
        <Loading label="Reading audit events" />
      ) : error ? (
        <FeedbackState
          variant="inline"
          title="Unable to load demo data"
          message={error.message}
        />
      ) : events.length ? (
        <ol className="mt-8 space-y-0">
          {events.map((event, index) => (
            <li key={event.id} className="grid grid-cols-[1.5rem_1fr] gap-4">
              <div className="flex flex-col items-center">
                <span className="mt-1 size-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                {index < events.length - 1 ? (
                  <span className="h-full w-px bg-border" />
                ) : null}
              </div>
              <article className="pb-7">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-semibold">{humanAuditSummary(event.summary)}</p>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px]">
                    {humanAuditAction(event.action)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {event.actor.displayName} · {formatDemoDate(event.timestamp)}
                  {event.reason ? ` · ${humanAuditReason(event.reason)}` : ""}
                </p>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <DemoEmptyState label="No audit events match these filters." />
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: string[][];
}) {
  return (
    <SelectControl
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 max-w-56 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="">{label}</option>
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>{optionLabel}</option>
      ))}
    </SelectControl>
  );
}
