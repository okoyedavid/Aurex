"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { GitHubIcon } from "@/components/icons/github-icon";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { PolicyBadge } from "@/features/policies/components/policy-ui";
import { policyKeys } from "@/features/policies/policy-hooks";
import { businessErrorMessage } from "@/lib/business-api";
import type { ExternalAccessActualState } from "@/lib/github-integration-api";
import type { Policy, PolicyPage } from "@/lib/policy-api";

import { useEmployeeExternalAccessQuery } from "./github-hooks";

const stateCopy: Record<
  ExternalAccessActualState,
  {
    label: string;
    detail: string;
    tone: "success" | "neutral" | "warning" | "danger" | "info";
  }
> = {
  unknown: {
    label: "Not checked",
    detail: "Waiting for the first reconciliation.",
    tone: "neutral",
  },
  pending: {
    label: "Reconciling",
    detail: "GitHub reconciliation is queued or in progress.",
    tone: "info",
  },
  granted: {
    label: "Granted",
    detail: "GitHub verification confirmed the desired access.",
    tone: "success",
  },
  revoked: {
    label: "Removed",
    detail: "Aurex-managed access was removed and verified.",
    tone: "success",
  },
  drifted: {
    label: "Drift detected",
    detail:
      "GitHub state differs from the desired state; reconciliation should correct it.",
    tone: "warning",
  },
  needs_configuration: {
    label: "Needs configuration",
    detail: "Connect GitHub, map an identity, or repair the policy target.",
    tone: "danger",
  },
  blocked: {
    label: "Action required",
    detail: "GitHub rejected the change or the installation lacks permission.",
    tone: "danger",
  },
  failed: {
    label: "Retry scheduled",
    detail:
      "A temporary enforcement failure occurred. Aurex retries automatically.",
    tone: "danger",
  },
  pending_acceptance: {
    label: "Invitation pending",
    detail:
      "The GitHub user must accept the invitation before access is granted.",
    tone: "warning",
  },
  retained_external: {
    label: "Access remains through another source",
    detail:
      "Aurex stopped managing its grant without claiming all GitHub access is gone.",
    tone: "warning",
  },
};

export function EmployeeExternalAccess({
  businessId,
  employeeId,
}: {
  businessId: string;
  employeeId: string;
}) {
  const { effectivePermissions } = useBusinessAccess();
  const canView = effectivePermissions.has("policies:view");
  const query = useEmployeeExternalAccessQuery(businessId, employeeId, canView);
  const queryClient = useQueryClient();
  const policyNames = useMemo(
    () => {
      const cachedPages = queryClient.getQueriesData<PolicyPage<Policy>>({
        queryKey: policyKeys.policiesRoot(businessId),
      });
      return new Map(
        cachedPages.flatMap(([, page]) =>
          (page?.items ?? []).map((policy) => [policy.id, policy.name] as const),
        ),
      );
    },
    [businessId, queryClient],
  );

  if (!canView)
    return (
      <FeedbackState
        tone="neutral"
        variant="empty"
        title="Policy access required"
        message="You need policies:view to see external access."
      />
    );
  if (query.isLoading) return <Loading label="Loading external access…" />;
  if (query.error)
    return (
      <FeedbackState
        variant="inline"
        title="Unable to load external access"
        message={businessErrorMessage(query.error)}
        retry={() => void query.refetch()}
      />
    );
  if (!query.data?.items.length)
    return (
      <FeedbackState
        tone="neutral"
        variant="empty"
        title="No external access activity."
        message="GitHub enforcement records will appear when an effective policy has an external target."
      />
    );

  return (
    <div className="space-y-3">
      {query.data.items.map((grant) => {
        const state =
          grant.actualState === "revoked" && grant.desiredState === "granted"
            ? {
                label: "Removed",
                detail:
                  "GitHub access is removed even though the policy still requires it.",
                tone: "warning" as const,
              }
            : stateCopy[grant.actualState];
        return (
          <article
            key={grant.id}
            className="rounded-md border border-border bg-card p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <GitHubIcon />
                  <h3 className="font-semibold break-words">
                    {grant.resourceDisplayName}
                  </h3>
                  <PolicyBadge tone={state.tone}>{state.label}</PolicyBadge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {policyNames.get(grant.policyId) ?? "Policy"} ·{" "}
                  {grant.assignmentSource === "manual" ? "Manual" : "Automatic"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {state.detail}
                </p>
                {grant.lastErrorMessage ? (
                  <p className="mt-2 text-sm text-destructive">
                    {grant.lastErrorMessage}
                  </p>
                ) : null}
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>
                  Desired:{" "}
                  {grant.desiredState === "granted" ? "Granted" : "Removed"}
                </p>
                <p className="mt-1">
                  Verified: {formatDate(grant.lastVerifiedAt)}
                </p>
              </div>
            </div>
            {grant.actualState === "needs_configuration" ? (
              <Link
                className="mt-3 inline-block text-sm font-medium text-primary"
                href={`/business/${businessId}/settings#integrations`}
              >
                Open GitHub integration settings
              </Link>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not yet" : date.toLocaleString();
}

export { stateCopy as externalAccessStateCopy };
