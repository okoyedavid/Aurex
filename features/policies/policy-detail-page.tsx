"use client";

import Link from "next/link";
import { useState } from "react";
import { Archive, Pencil, Plus, Power } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { businessErrorMessage } from "@/lib/business-api";
import type { PolicyRule } from "@/lib/policy-api";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { Pagination } from "@/features/business/pagination";
import {
  fieldLabels,
  formatPolicyDate,
  operatorLabels,
  policyPermissions,
} from "./policy-helpers";
import {
  useActivatePolicyMutation,
  useArchivePolicyMutation,
  usePolicyCategoriesQuery,
  usePolicyCategoryQuery,
  usePolicyHistoryQuery,
  usePolicyQuery,
  usePolicyRulesQuery,
  useSetRuleEnabledMutation,
} from "./policy-hooks";
import { PolicyDialog } from "./components/policy-dialog";
import { RuleDialog } from "./components/rule-dialog";
import { RuleHistoryPanel } from "./components/rule-history-panel";
import {
  ConfirmPolicyAction,
  PolicyAuditTable,
  PolicyBadge,
  PolicyEmpty,
  PolicyError,
  PolicyLoading,
  PolicyPageFrame,
} from "./components/policy-ui";

export function PolicyDetailPage({
  businessId,
  policyId,
}: {
  businessId: string;
  policyId: string;
}) {
  const access = policyPermissions(useBusinessAccess().effectivePermissions);
  const policy = usePolicyQuery(businessId, policyId, access.view);
  const rules = usePolicyRulesQuery(businessId, policyId, access.view);
  const policyCategory = usePolicyCategoryQuery(
    businessId,
    policy.data?.categoryId ?? "",
    access.view && Boolean(policy.data?.categoryId),
  );
  const categories = usePolicyCategoriesQuery(
    businessId,
    1,
    100,
    "active",
    access.view,
  );
  const [historyPage, setHistoryPage] = useState(1);
  const history = usePolicyHistoryQuery(
    businessId,
    policyId,
    historyPage,
    20,
    access.audit,
  );
  const [policyOpen, setPolicyOpen] = useState(false);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PolicyRule>();
  const [policyAction, setPolicyAction] = useState<"activate" | "archive">();
  const [ruleAction, setRuleAction] = useState<PolicyRule>();
  const activate = useActivatePolicyMutation(businessId, policyId);
  const archive = useArchivePolicyMutation(businessId, policyId);
  const toggleRule = useSetRuleEnabledMutation(
    businessId,
    policyId,
    ruleAction?.id ?? "",
  );

  if (policy.isLoading || rules.isLoading) {
    return <PolicyLoading label="Loading policy…" />;
  }
  if (policy.error || rules.error || !policy.data) {
    return (
      <PolicyPageFrame>
        <PolicyError
          message={businessErrorMessage(policy.error || rules.error)}
          retry={() => {
            void policy.refetch();
            void rules.refetch();
          }}
        />
      </PolicyPageFrame>
    );
  }

  const item = policy.data;
  const category = policyCategory.data;

  return (
    <PolicyPageFrame>
      <Link
        href={`/business/${businessId}/policies`}
        className="text-sm font-medium text-primary"
      >
        ← Policies
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <PolicyBadge
              tone={
                item.status === "active"
                  ? "success"
                  : item.status === "draft"
                    ? "warning"
                    : "neutral"
              }
            >
              {item.status}
            </PolicyBadge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {item.description || "No description"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Version {item.version} · {category?.name ?? item.categoryId}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {access.update ? (
            <>
              <Button variant="outline" onClick={() => setPolicyOpen(true)}>
                <Pencil /> Edit
              </Button>
              {item.status === "draft" ? (
                <Button onClick={() => setPolicyAction("activate")}>
                  <Power /> Activate
                </Button>
              ) : null}
            </>
          ) : null}
          {access.archive && item.status !== "archived" ? (
            <Button
              variant="destructive"
              onClick={() => setPolicyAction("archive")}
            >
              <Archive /> Archive
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            Effective start (inclusive)
          </p>
          <p className="mt-1 font-medium">
            {item.effectiveFrom
              ? formatPolicyDate(item.effectiveFrom)
              : "Immediately"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">
            Effective end (exclusive)
          </p>
          <p className="mt-1 font-medium">
            {formatPolicyDate(item.effectiveTo)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Configuration</p>
          {item.configuration ? (
            <details className="mt-1">
              <summary className="cursor-pointer font-medium">
                View configuration
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted p-2 text-xs">
                {JSON.stringify(item.configuration, null, 2)}
              </pre>
            </details>
          ) : (
            <p className="mt-1 font-medium">None</p>
          )}
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Assignment rules</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              An employee must satisfy every condition in a rule. Higher
              numeric priority wins.
            </p>
          </div>
          {access.update ? (
            <Button
              onClick={() => {
                setEditingRule(undefined);
                setRuleOpen(true);
              }}
            >
              <Plus /> Add rule
            </Button>
          ) : null}
        </div>
        {rules.data?.items.length ? (
          <div className="mt-4 space-y-3">
            {rules.data.items.map((rule) => (
              <article
                key={rule.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {rule.name || "Unnamed rule"}
                      </h3>
                      <PolicyBadge
                        tone={rule.status === "active" ? "success" : "neutral"}
                      >
                        {rule.status}
                      </PolicyBadge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Priority {rule.priority} · Version {rule.version}
                    </p>
                  </div>
                  {access.update ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingRule(rule);
                          setRuleOpen(true);
                        }}
                      >
                        <Pencil /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRuleAction(rule)}
                      >
                        {rule.status === "active" ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 space-y-2">
                  {rule.conditions.map((condition, index) => (
                    <div
                      key={`${rule.id}-${index}`}
                      className="rounded-lg bg-muted/60 px-3 py-2 text-sm"
                    >
                      <span className="font-medium">
                        {fieldLabels[condition.field]}
                      </span>{" "}
                      {operatorLabels[condition.operator].toLowerCase()} {" "}
                      <code className="rounded bg-background px-1.5 py-0.5 text-xs">
                        {Array.isArray(condition.value)
                          ? condition.value.join(", ")
                          : condition.value}
                      </code>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {rule.effectiveFrom
                    ? `Starts ${formatPolicyDate(rule.effectiveFrom)}`
                    : "Effective immediately"}{" "}
                  · {rule.effectiveTo
                    ? `Ends ${formatPolicyDate(rule.effectiveTo)}`
                    : "No scheduled end"}
                </p>
                {access.audit ? (
                  <RuleHistoryPanel businessId={businessId} ruleId={rule.id} />
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <PolicyEmpty title="This policy has no assignment rules." />
          </div>
        )}
      </section>

      {access.audit ? (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">Policy history</h2>
          {history.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading history…</p>
          ) : history.error ? (
            <PolicyError
              message={businessErrorMessage(history.error)}
              retry={() => void history.refetch()}
            />
          ) : (
            <>
              <PolicyAuditTable items={history.data?.items ?? []} />
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

      {policyOpen ? (
        <PolicyDialog
          businessId={businessId}
          categories={categories.data?.items ?? []}
          policy={item}
          open
          onOpenChange={setPolicyOpen}
        />
      ) : null}
      {ruleOpen ? (
        <RuleDialog
          businessId={businessId}
          policyId={policyId}
          rule={editingRule}
          open
          onOpenChange={setRuleOpen}
        />
      ) : null}

      <ConfirmPolicyAction
        open={Boolean(policyAction)}
        title={
          policyAction === "activate"
            ? "Activate this policy?"
            : "Archive this policy?"
        }
        description={
          policyAction === "activate"
            ? "The policy becomes eligible for assignment during reconciliation when its effective interval applies."
            : "The policy will no longer be available for active assignment. Its history remains available."
        }
        confirmLabel={
          policyAction === "activate" ? "Activate policy" : "Archive policy"
        }
        tone={policyAction === "archive" ? "danger" : "default"}
        pending={activate.isPending || archive.isPending}
        onOpenChange={(open) => !open && setPolicyAction(undefined)}
        onConfirm={() => {
          const mutation = policyAction === "activate" ? activate : archive;
          mutation.mutate(undefined, {
            onSuccess: () => {
              toast.success(
                policyAction === "activate"
                  ? "Policy activated."
                  : "Policy archived.",
              );
              setPolicyAction(undefined);
            },
            onError: (error) => toast.error(businessErrorMessage(error)),
          });
        }}
      />
      <ConfirmPolicyAction
        open={Boolean(ruleAction)}
        title={`${ruleAction?.status === "active" ? "Disable" : "Enable"} this rule?`}
        description="This changes whether the rule participates in future policy resolution. Existing audit history is preserved."
        confirmLabel={
          ruleAction?.status === "active" ? "Disable rule" : "Enable rule"
        }
        pending={toggleRule.isPending}
        onOpenChange={(open) => !open && setRuleAction(undefined)}
        onConfirm={() =>
          ruleAction &&
          toggleRule.mutate(ruleAction.status !== "active", {
            onSuccess: () => {
              toast.success(
                ruleAction.status === "active"
                  ? "Rule disabled."
                  : "Rule enabled.",
              );
              setRuleAction(undefined);
            },
            onError: (error) => toast.error(businessErrorMessage(error)),
          })
        }
      />
    </PolicyPageFrame>
  );
}
