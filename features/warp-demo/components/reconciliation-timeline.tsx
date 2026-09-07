import { Check, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import type { ReconciliationRun } from "@/lib/warp-demo/types";
import { cn } from "@/lib/utils";
import { timelineEventCopy } from "./demo-presentation";

export function ReconciliationTimeline({
  run,
  preparing,
  runKind,
  onReset,
  canReset,
}: {
  run?: ReconciliationRun;
  preparing: boolean;
  runKind: string;
  onReset: () => void;
  canReset: boolean;
}) {
  const title = preparing
    ? "Preparing live demo"
    : run?.status === "queued"
      ? "Reconciliation queued"
      : run?.status === "running"
        ? "Reconciling"
        : run?.status === "completed_with_warnings"
          ? "Completed with warnings"
          : run?.status === "failed"
            ? "Failed"
            : "Completed";

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
            {runKind === "initialization" ? "Initialization" : "Live reconciliation"}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{title}</h3>
        </div>
        {run?.durationMs != null ? (
          <span className="text-xs text-muted-foreground">
            Completed in {run.durationMs} ms
          </span>
        ) : null}
      </div>
      <p aria-live="polite" className="sr-only">{title}</p>
      {run ? (
        <ol className="mt-6 space-y-0">
          {run.events.map((event, index) => {
            const copy = timelineEventCopy(event);
            return (
              <li key={event.id} className="grid grid-cols-[1.5rem_1fr] gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "mt-1 grid size-3 place-items-center rounded-full ring-4",
                      event.status === "success"
                        ? "bg-primary ring-primary/10"
                        : event.status === "failed"
                          ? "bg-destructive ring-destructive/10"
                          : "bg-muted-foreground ring-muted/40",
                    )}
                  >
                    {event.status === "success" ? (
                      <Check className="size-2 text-primary-foreground" />
                    ) : null}
                  </span>
                  {index < run.events.length - 1 ? (
                    <span className="h-full w-px bg-border" />
                  ) : null}
                </div>
                <div className="pb-6">
                  <p className="font-medium">{copy.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {copy.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <Loading label="Preparing live demo" />
      )}
      {canReset ? (
        <Button variant="outline" onClick={onReset} className="mt-3">
          Reset demo <RotateCcw />
        </Button>
      ) : null}
    </div>
  );
}
