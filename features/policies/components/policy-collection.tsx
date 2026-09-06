"use client";

import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { SelectControl } from "@/components/ui/select";
import { Pagination } from "@/features/business/pagination";
import { businessErrorMessage } from "@/lib/business-api";
import type { PolicyStatus } from "@/lib/policy-api";
import { usePoliciesQuery, usePolicyCategoriesQuery } from "../policy-hooks";
import { PolicyBadge } from "./policy-ui";

export function PolicyCollection({
  businessId,
  canView,
  categoryId: fixedCategoryId,
}: {
  businessId: string;
  canView: boolean;
  categoryId?: string;
}) {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState(fixedCategoryId ?? "");
  const [status, setStatus] = useState<PolicyStatus | "">("");
  const categories = usePolicyCategoriesQuery(
    businessId,
    1,
    100,
    "active",
    canView && !fixedCategoryId,
  );
  const filters = useMemo(
    () => ({
      ...(fixedCategoryId || categoryId
        ? { categoryId: fixedCategoryId ?? categoryId }
        : {}),
      ...(status ? { status } : {}),
    }),
    [categoryId, fixedCategoryId, status],
  );
  const policies = usePoliciesQuery(businessId, page, 20, filters, canView);

  if (policies.isLoading || (!fixedCategoryId && categories.isLoading))
    return <Loading label="Loading policies…" />;

  if (policies.error || (!fixedCategoryId && categories.error))
    return (
      <FeedbackState
        title="Unable to load policy data"
        message={businessErrorMessage(policies.error || categories.error)}
        retry={() => {
          void policies.refetch();
          if (!fixedCategoryId) void categories.refetch();
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
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <PolicyCount label="Draft on this page" value={counts.draft} />
        <PolicyCount label="Active on this page" value={counts.active} />
        <PolicyCount label="Archived on this page" value={counts.archived} />
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
            {!fixedCategoryId ? (
              <label className="text-xs font-medium">
                Category
                <SelectControl
                  className="ml-2 h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All</option>
                  {categories.data?.items.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </SelectControl>
              </label>
            ) : null}
            <label className="text-xs font-medium">
              Status
              <SelectControl
                className="ml-2 h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as PolicyStatus | "");
                  setPage(1);
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
                  <th className="p-4" />
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
          onPage={setPage}
          onLimit={() => undefined}
        />
      </section>
    </>
  );
}

function PolicyCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
