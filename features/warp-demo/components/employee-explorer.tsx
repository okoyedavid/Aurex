import type { DemoEmployee, ResolvedPolicy } from "@/lib/warp-demo/types";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { DemoEmptyState } from "./demo-empty-state";

export function EmployeeExplorer({
  employee,
  resolved,
  loading,
  error,
}: {
  employee: DemoEmployee;
  resolved?: ResolvedPolicy[];
  loading: boolean;
  error: Error | null;
}) {
  return (
    <div className="mt-6 min-h-[34rem]">
      <div className="border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
          Employee snapshot
        </p>
        <h3 className="mt-2 text-2xl font-semibold">{employee.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {employee.jobTitle} · {employee.department}
        </p>
      </div>
      {loading ? (
        <Loading label="Resolving policies" />
      ) : error ? (
        <FeedbackState
          variant="inline"
          title="Unable to load demo data"
          message={error.message}
        />
      ) : resolved?.length ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {resolved.map((item) => (
            <article key={item.id} className="rounded-md border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] uppercase text-muted-foreground">
                  {item.category.name}
                </span>
                <span className="font-mono text-[10px] text-primary">P{item.priority}</span>
              </div>
              <h4 className="mt-5 font-semibold">{item.name}</h4>
              <p className="mt-2 text-xs text-muted-foreground">
                via {item.winningRuleName}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <DemoEmptyState label="No effective policies were returned for this employee." />
      )}
    </div>
  );
}
