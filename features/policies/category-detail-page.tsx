"use client";

import { useBusinessAccess } from "@/features/business/business-access-context";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { businessErrorMessage } from "@/lib/business-api";
import { policyPermissions } from "./policy-helpers";
import { usePolicyCategoryQuery } from "./policy-hooks";

import { SelectControl } from "@/components/ui/select";

import { Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/features/business/pagination";
import type { PolicyCategory, PolicyStatus } from "@/lib/policy-api";
import { CategoryDialog } from "./components/category-dialog";
import { PolicyDialog } from "./components/policy-dialog";
import {
  ConfirmPolicyAction,
  PolicyBadge,
} from "./components/policy-ui";
import { cardinalityDescription } from "./policy-helpers";
import {
  useArchiveCategoryMutation,
  usePoliciesQuery,
  usePolicyCategoriesQuery,
  useReconcileBusinessMutation,
} from "./policy-hooks";

export function CategoryDetailPage({
  businessId,
  categoryId,
}: {
  businessId: string;
  categoryId: string;
}) {
  const access = policyPermissions(useBusinessAccess().effectivePermissions);
  const category = usePolicyCategoryQuery(businessId, categoryId, access.view);
  if (category.isLoading) return <Loading label="Loading category…" />;
  if (category.error || !category.data)
    return (
      <FeedbackState
        title="Unable to load policy data"
        message={businessErrorMessage(category.error)}
        retry={() => void category.refetch()}
      />
    );
  return (
    <PolicyOverviewPage businessId={businessId} category={category.data} />
  );
}

export function PolicyOverviewPage({
  businessId,
  category,
}: {
  businessId: string;
  category: PolicyCategory;
}) {
  const categoryId = category.id;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { effectivePermissions } = useBusinessAccess();
  const access = policyPermissions(effectivePermissions);
  const [policyPage, setPolicyPage] = useState(1);
  const [status, setStatus] = useState<PolicyStatus | "">("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [archiveCategoryOpen, setArchiveCategoryOpen] = useState(false);
  const [jobId, setJobId] = useState<string>();

  const categoryOptions = usePolicyCategoriesQuery(
    businessId,
    1,
    100,
    "active",
    access.view,
  );
  const policyFilters = useMemo(
    () => ({
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status } : {}),
    }),
    [categoryId, status],
  );
  const policies = usePoliciesQuery(
    businessId,
    policyPage,
    20,
    policyFilters,
    access.view,
  );
  const reconcile = useReconcileBusinessMutation(businessId);
  const archiveCategory = useArchiveCategoryMutation(businessId, category.id);
  useEffect(() => {
    if (searchParams.get("action") !== "create-policy" || !access.create)
      return;
    setPolicyOpen(true);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [access.create, pathname, router, searchParams]);
  if (!access.view)
    return (
      <FeedbackState
        title="Unable to load policy data"
        message="You do not have permission to view policies."
        retry={() => undefined}
      />
    );
  if (policies.isLoading) return <Loading label="Loading policies…" />;
  if (policies.error)
    return (
      <FeedbackState
        title="Unable to load policy data"
        message={businessErrorMessage(policies.error)}
        retry={() => {
          void policies.refetch();
        }}
      />
    );

  const counts = (policies.data?.items ?? []).reduce(
    (result, policy) => ({
      ...result,
      [policy.status]: result[policy.status] + 1,
    }),
    { draft: 0, active: 0, archived: 0 },
  );
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="bg-muted text-primary inline-flex rounded-full py-1 text-xs font-semibold">
            ASSIGNMENT MODE:{" "}
            {category.cardinality === "ONE"
              ? "SINGLE POLICY"
              : "MULTIPLE POLICY"}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{category.name}</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {category.description ||
              cardinalityDescription(category.cardinality)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {access.update && (
            <Button variant="outline" onClick={() => setCategoryOpen(true)}>
              Edit category
            </Button>
          )}
          {access.archive && (
            <Button
              variant="destructive"
              onClick={() => setArchiveCategoryOpen(true)}
            >
              Archive category
            </Button>
          )}

          {access.create ? (
            <>
              <Button
                onClick={() => setPolicyOpen(true)}
                disabled={!categoryOptions.data?.items.length}
              >
                <Plus />
                Policy
              </Button>
            </>
          ) : null}
        </div>
      </div>
      {jobId ? (
        <details className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-4">
          <summary className="cursor-pointer font-medium">
            Reconciliation queued.
          </summary>
          <p className="mt-2 text-xs text-muted-foreground">
            Job ID: {jobId}. Refresh employee assignments after processing has
            had time to complete.
          </p>
        </details>
      ) : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Draft on this page</p>
          <p className="mt-1 text-2xl font-bold">{counts.draft}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active on this page</p>
          <p className="mt-1 text-2xl font-bold">{counts.active}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Archived on this page</p>
          <p className="mt-1 text-2xl font-bold">{counts.archived}</p>
        </div>
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Policies</h2>
            <p className="text-sm text-muted-foreground">
              Higher policy versions reflect meaningful changes.
            </p>
          </div>
          <div className="flex gap-2">
            <label className="text-xs font-medium">
              Status
              <SelectControl
                className="ml-2 h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as PolicyStatus | "");
                  setPolicyPage(1);
                }}
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </SelectControl>
            </label>
          </div>
        </div>
        {policies.data?.items.length ? (
          <div className="mt-3 overflow-x-auto rounded-md border border-border bg-card">
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
                <tr>
                  <th className="p-4">Policy</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Effective dates</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {policies.data.items.map((policy) => (
                  <tr key={policy.id}>
                    <td className="p-4">
                      <p className="font-semibold">{policy.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {policy.description || "No description"}
                      </p>
                    </td>
                    <td className="p-4">
                      <PolicyBadge
                        tone={
                          policy.status === "active"
                            ? "success"
                            : policy.status === "draft"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {policy.status}
                      </PolicyBadge>
                    </td>
                    <td className="p-4">v{policy.version}</td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {policy.effectiveFrom
                        ? new Date(policy.effectiveFrom).toLocaleDateString()
                        : "Immediate"}{" "}
                      →{" "}
                      {policy.effectiveTo
                        ? new Date(policy.effectiveTo).toLocaleDateString()
                        : "No end"}
                    </td>
                    <td className="p-4">
                      <Button asChild size="sm" variant="ghost">
                        <Link
                          href={`/business/${businessId}/policies/${policy.id}`}
                        >
                          <Settings2 />
                          Manage
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-3">
            <FeedbackState
              title="No policies match these filters."
              tone="neutral"
              variant="empty"
            />
          </div>
        )}
        <Pagination
          page={policies.data?.pagination.page ?? 1}
          totalPages={policies.data?.pagination.totalPages ?? 0}
          total={policies.data?.pagination.total ?? 0}
          limit={20}
          fetching={policies.isFetching}
          showLimit={false}
          onPage={setPolicyPage}
          onLimit={() => undefined}
        />
      </section>
      {categoryOpen ? (
        <CategoryDialog
          businessId={businessId}
          category={category}
          open
          onOpenChange={setCategoryOpen}
        />
      ) : null}
      {policyOpen ? (
        <PolicyDialog
          businessId={businessId}
          categories={categoryOptions.data?.items ?? []}
          initialCategoryId={category.id}
          open
          onOpenChange={setPolicyOpen}
        />
      ) : null}
      <ConfirmPolicyAction
        open={reconcileOpen}
        title="Reconcile policies for the entire business?"
        description="This queues asynchronous work for all employees. It does not complete immediately and no progress estimate is available."
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
      <ConfirmPolicyAction
        open={archiveCategoryOpen}
        title="Archive this policy category?"
        description="Archived categories cannot be selected for new policy work. Existing history is preserved."
        confirmLabel="Archive category"
        tone="danger"
        pending={archiveCategory.isPending}
        onOpenChange={setArchiveCategoryOpen}
        onConfirm={() =>
          archiveCategory.mutate(undefined, {
            onSuccess: () => {
              setArchiveCategoryOpen(false);
              toast.success("Policy category archived.");
            },
            onError: (error) => toast.error(businessErrorMessage(error)),
          })
        }
      />
    </div>
  );
}
