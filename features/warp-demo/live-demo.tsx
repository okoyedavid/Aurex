"use client";

import { CircleDot } from "lucide-react";

import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AuditExplorer } from "./components/audit-explorer";
import { EmployeeExplorer } from "./components/employee-explorer";
import { EmployeePanel } from "./components/employee-panel";
import { ExplanationPanel } from "./components/explanation-panel";
import { PolicyExplorer } from "./components/policy-explorer";
import { ReconciliationTimeline } from "./components/reconciliation-timeline";
import { useLiveDemo } from "./use-live-demo";

export function LiveDemo() {
  const demo = useLiveDemo();
  const controlsDisabled =
    !demo.initializationComplete ||
    demo.activeRun ||
    demo.reset.isPending ||
    demo.mutation.isPending ||
    demo.expired;

  return (
    <section id="demo" className="scroll-mt-20 border-y border-primary/25 bg-primary/10 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.2em] text-primary">04 · Live demo</p>
            <h2 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-[-.045em] sm:text-6xl">
              Change an employee attribute. Watch policies follow.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Change one employee attribute and watch the resolver, assignments and audit trail update.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-4 py-2 font-mono text-xs">
            <CircleDot className={cn("size-3 text-primary", demo.activeRun && "animate-pulse")} />
            Live · demo system
          </div>
        </div>

        {demo.foundationalError ? (
          <FeedbackState
            title={demo.busyError ? "Live demo currently in use" : "Unable to prepare the live demo."}
            message={demo.busyError ? "Another visitor is changing the demo scenario. Try again shortly." : demo.foundationalError.message}
            retry={demo.retrySession}
          />
        ) : (
          <div data-reveal className="mt-12 overflow-hidden rounded-md border border-border bg-card shadow-2xl shadow-primary/10">
            <div className="grid gap-6 p-4 sm:p-7 lg:grid-cols-[minmax(18rem,.8fr)_minmax(0,1.2fr)]">
              <EmployeePanel
                employee={demo.employee}
                controls={demo.controls}
                selectedField={demo.selectedField}
                selectedValue={demo.selectedValue}
                setSelectedField={demo.setSelectedField}
                setSelectedValue={demo.setSelectedValue}
                onApply={demo.apply}
                onReset={demo.resetDemo}
                canApply={demo.canMutate && !demo.mutation.isPending}
                disabled={controlsDisabled}
                previousChange={demo.previousChange}
                error={demo.mutation.error ?? demo.reset.error}
              />
              <ReconciliationTimeline
                run={demo.run.data}
                preparing={!demo.initializationComplete && !demo.run.data?.status?.includes("failed")}
                runKind={demo.runKind}
                onReset={demo.resetDemo}
                canReset={Boolean(demo.session.data && demo.run.data?.status === "failed") && !demo.activeRun && !demo.reset.isPending}
              />
            </div>
            {demo.employee && demo.initializationComplete ? (
              <div className="border-t border-border p-4 sm:p-7">
                <Tabs defaultValue="assignments">
                  <TabsList>
                    <TabsTrigger value="assignments">Current assignments</TabsTrigger>
                    <TabsTrigger value="explanation">Why this applies</TabsTrigger>
                    <TabsTrigger value="audit">Audit evidence</TabsTrigger>
                    <TabsTrigger value="policies">Policy explorer</TabsTrigger>
                  </TabsList>
                  <TabsContent value="assignments">
                    <EmployeeExplorer employee={demo.employee} resolved={demo.resolved.data?.policies} loading={demo.resolved.isPending} error={demo.resolved.error} />
                  </TabsContent>
                  <TabsContent value="explanation">
                    {demo.explanation.data ? <ExplanationPanel explanation={demo.explanation.data} /> : <Loading label="Loading explanation" />}
                  </TabsContent>
                  <TabsContent value="audit">
                    <AuditExplorer
                      events={demo.audit.data?.events ?? []}
                      employees={[demo.employee]}
                      policies={demo.policies.data?.policies ?? []}
                      employeeId={demo.employee.id ?? "maya"}
                      policyId=""
                      action=""
                      onEmployeeChange={() => undefined}
                      onPolicyChange={() => undefined}
                      onActionChange={() => undefined}
                      loading={demo.audit.isPending}
                      error={demo.audit.error}
                    />
                  </TabsContent>
                  <TabsContent value="policies">
                    <PolicyExplorer
                      policies={demo.policies.data?.policies ?? []}
                      categories={demo.categories.data?.categories ?? []}
                      policyId={demo.policyId}
                      onPolicyChange={demo.setPolicyId}
                      detail={demo.policy.data}
                      explanation={demo.explanation.data}
                      loading={demo.policy.isPending && Boolean(demo.policyId)}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
