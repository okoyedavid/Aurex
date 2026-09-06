"use client";

import { DateInput } from "@/components/ui/date-input";

import { Plus, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { Pagination } from "@/features/business/pagination";
import { AuditActivityTimeline } from "@/features/audit/audit-activity-timeline";
import { businessErrorMessage } from "@/lib/business-api";
import type { EmployeePolicyAssignment } from "@/lib/policy-api";
import { EndManualAssignmentDialog } from "./end-manual-assignment-dialog";
import { ManualAssignmentDialog } from "./manual-assignment-dialog";
import { PolicyExplanationView } from "./policy-explanation-view";
import { ConfirmPolicyAction, PolicyBadge } from "./policy-ui";
import { formatPolicyDate, policyPermissions } from "../policy-helpers";
import {
  useEmployeePoliciesQuery,
  useEmployeePolicyHistoryQuery,
  useReferencedPoliciesQueries,
  usePolicyCategoriesQuery,
  usePolicyExplanationQuery,
  useReconcileEmployeeMutation,
} from "../policy-hooks";

export function EmployeePolicies({
  businessId,
  employeeId,
}: {
  businessId: string;
  employeeId: string;
}) {
  const access = policyPermissions(useBusinessAccess().effectivePermissions);
  const [asOfInput, setAsOfInput] = useState("");
  const [asOf, setAsOf] = useState<string>();
  const [explain, setExplain] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [ending, setEnding] = useState<EmployeePolicyAssignment>();
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [jobId, setJobId] = useState<string>();
  const [historyPage, setHistoryPage] = useState(1);
  const assignments = useEmployeePoliciesQuery(
    businessId,
    employeeId,
    asOf,
    access.view,
  );
  const explanation = usePolicyExplanationQuery(
    businessId,
    employeeId,
    asOf,
    access.view && explain,
  );
  const categories = usePolicyCategoriesQuery(
    businessId,
    1,
    100,
    "active",
    access.view,
  );
  const history = useEmployeePolicyHistoryQuery(
    businessId,
    employeeId,
    historyPage,
    20,
    access.audit,
  );
  const reconcile = useReconcileEmployeeMutation(businessId, employeeId);
  const referencedPolicyIds = useMemo(
    () => {
      const ids = new Set(
        assignments.data?.items.map((assignment) => assignment.policyId) ?? [],
      );
      if (explanation.data) {
        explanation.data.desiredPolicies.forEach((item) => ids.add(item.policyId));
        explanation.data.suppressedCandidates.forEach((item) => ids.add(item.policyId));
        explanation.data.evaluatedRules.forEach((item) => ids.add(item.policyId));
        explanation.data.categoryDecisions.forEach((item) => {
          item.winnerPolicyIds.forEach((id) => ids.add(id));
          item.suppressedPolicyIds.forEach((id) => ids.add(id));
        });
      }
      return [...ids];
    },
    [assignments.data, explanation.data],
  );
  const policyQueries = useReferencedPoliciesQueries(
    businessId,
    referencedPolicyIds,
    access.view,
  );
  const policyNames = new Map(
    policyQueries
      .map((item) => item.data)
      .filter((policy): policy is NonNullable<typeof policy> => Boolean(policy))
      .map((policy) => [policy.id, policy.name] as const),
  );
  if (!access.view)
    return (
      <FeedbackState
        title="Unable to load policy data"
        message="You do not have permission to view employee policies."
        retry={() => undefined}
      />
    );
  if (assignments.isLoading || categories.isLoading)
    return <Loading label="Loading employee policies…" />;
  if (assignments.error || categories.error)
    return (
      <FeedbackState
        title="Unable to load policy data"
        message={businessErrorMessage(
          assignments.error || categories.error,
        )}
        retry={() => {
          void assignments.refetch();
          void categories.refetch();
          policyQueries.forEach((query) => void query.refetch());
        }}
      />
    );
  const refresh = () => {
    void assignments.refetch();
    if (explain) void explanation.refetch();
  };
  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 pt-6">
        <Button variant="outline" onClick={refresh}>
          <RefreshCw />
          Refresh
        </Button>
        {access.reconcile ? (
          <Button variant="outline" onClick={() => setReconcileOpen(true)}>
            <RefreshCw />
            Reconcile
          </Button>
        ) : null}
        {access.assign ? (
          <Button onClick={() => setManualOpen(true)}>
            <Plus />
            Manual assignment
          </Button>
        ) : null}
      </div>
      {jobId ? (
        <details className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-4">
          <summary className="cursor-pointer font-medium">
            Reconciliation queued.
          </summary>
          <p className="mt-2 text-xs text-muted-foreground">
            Aurex is processing the request. Use Refresh later to load updated
            assignments.
          </p>
        </details>
      ) : null}
      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-4">
        <label className="space-y-2 text-sm font-medium">
          Assignments effective as of
          <DateInput
            kind="datetime-local"
            value={asOfInput}
            onChange={(event) => setAsOfInput(event.target.value)}
          />
        </label>
        <Button
          variant="outline"
          onClick={() =>
            setAsOf(asOfInput ? new Date(asOfInput).toISOString() : undefined)
          }
        >
          <Search />
          Apply date
        </Button>
        {asOf ? (
          <Button
            variant="ghost"
            onClick={() => {
              setAsOfInput("");
              setAsOf(undefined);
            }}
          >
            Current
          </Button>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Starts are inclusive; ends are exclusive.
        </p>
      </div>
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Effective assignments</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {assignments.data?.asOf
                ? `As of ${new Date(assignments.data.asOf).toLocaleString()}`
                : "Current assignments"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setExplain((value) => !value)}
          >
            {explain ? "Hide explanation" : "Explain resolution"}
          </Button>
        </div>
        {assignments.data?.items.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {assignments.data.items.map((assignment) => (
              <article
                key={assignment.id}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    {policyNames.get(assignment.policyId) ??
                      "Policy name unavailable"}
                  </h3>
                  <div className="flex gap-2">
                    <PolicyBadge
                      tone={assignment.source === "manual" ? "info" : "success"}
                    >
                      {assignment.source === "manual"
                        ? "Manually assigned"
                        : "Automatic"}
                    </PolicyBadge>
                    <PolicyBadge
                      tone={
                        assignment.status === "active" ? "success" : "neutral"
                      }
                    >
                      {assignment.status}
                    </PolicyBadge>
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Policy version {assignment.policyVersion}
                </p>
                <p className="mt-2 text-sm">
                  {formatPolicyDate(assignment.effectiveFrom)} →{" "}
                  {assignment.effectiveTo
                    ? formatPolicyDate(assignment.effectiveTo)
                    : "No scheduled end"}
                </p>
                {assignment.source === "manual" ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Assigned by{" "}
                      {assignment.createdBy || "an authorized member"}
                    </p>
                    {access.assign && assignment.status === "active" ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setEnding(assignment)}
                      >
                        End manual assignment
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Winning rule: {assignment.winningRule?.name ?? "Unnamed rule"}
                    {assignment.matchedRules?.length ? (
                      <>
                        {" · "}Matched rules: {assignment.matchedRules
                          .map((rule) => rule.name ?? "Unnamed rule")
                          .join(", ")}
                      </>
                    ) : null}
                  </p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <FeedbackState
              title="This employee has no policies effective on this date."
              tone="neutral"
              variant="empty"
            />
          </div>
        )}
      </section>
      {explain ? (
        <section className="mt-8 rounded-md border border-border bg-card p-5">
          {explanation.isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading explanation…
            </p>
          ) : explanation.error ? (
            <FeedbackState
              title="Unable to load policy data"
              message={businessErrorMessage(explanation.error)}
              retry={() => void explanation.refetch()}
            />
          ) : explanation.data ? (
            <PolicyExplanationView
              explanation={explanation.data}
              policies={policyQueries
                .map((query) => query.data)
                .filter((policy): policy is NonNullable<typeof policy> => Boolean(policy))}
            />
          ) : null}
        </section>
      ) : null}
      {access.audit ? (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">Policy activity</h2>
          {history.isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading policy activity…
            </p>
          ) : history.error ? (
            <FeedbackState
              title="Unable to load policy data"
              message={businessErrorMessage(history.error)}
              retry={() => void history.refetch()}
            />
          ) : (
            <>
              <AuditActivityTimeline
                items={history.data?.items ?? []}
                scope="employee-policy"
                emptyTitle="No policy activity yet."
                emptyDescription="Changes to this employee's policy assignments will appear here."
              />
              <Pagination
                page={history.data?.pagination.page ?? 1}
                totalPages={history.data?.pagination.totalPages ?? 0}
                total={history.data?.pagination.total ?? 0}
                limit={20}
                fetching={history.isFetching}
                showLimit={false}
                onPage={setHistoryPage}
                onLimit={() => undefined}
              />
            </>
          )}
        </section>
      ) : null}
      {manualOpen ? (
        <ManualAssignmentDialog
          businessId={businessId}
          employeeId={employeeId}
          categories={categories.data?.items ?? []}
          open
          onOpenChange={setManualOpen}
        />
      ) : null}
      {ending ? (
        <EndManualAssignmentDialog
          businessId={businessId}
          employeeId={employeeId}
          policyId={ending.policyId}
          policyName={policyNames.get(ending.policyId) ?? "Policy name unavailable"}
          open
          onOpenChange={(open) => !open && setEnding(undefined)}
        />
      ) : null}
      <ConfirmPolicyAction
        open={reconcileOpen}
        title="Reconcile this employee's policies?"
        description="This queues an asynchronous evaluation. Existing data may remain visible until processing completes."
        confirmLabel="Queue reconciliation"
        pending={reconcile.isPending}
        onOpenChange={setReconcileOpen}
        onConfirm={() =>
          reconcile.mutate(undefined, {
            onSuccess: (data) => {
              setJobId(data.jobId);
              setReconcileOpen(false);
              toast.success("Reconciliation queued.");
            },
            onError: (error) => toast.error(businessErrorMessage(error)),
          })
        }
      />
    </>
  );
}
