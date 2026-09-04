"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { BusinessEmptyState } from "@/features/business/components/business-empty-state";
import { BusinessLogo } from "@/features/business/components/business-logo";
import { BusinessSkeleton } from "@/features/business/components/business-skeleton";
import { CreateBusinessDialog } from "@/features/business/components/create-business-dialog";
import { StatusBadge } from "@/features/business/components/status-badge";
import { roleLabel } from "@/features/business/business-display-utils";
import { useBusinessesQuery } from "@/features/business/business-hooks";
import { formatDate } from "@/features/dashboard/format";
import { businessErrorMessage } from "@/lib/business-api";

export function BusinessDashboardPage() {
  const businessesQuery = useBusinessesQuery();
  const [createOpen, setCreateOpen] = useState(false);
  const businessItems = businessesQuery.data ?? [];

  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Personal dashboard</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Businesses
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Businesses you own or belong to. Open a workspace to manage
              payments, invoices, members, and providers.
            </p>
          </div>
          <Button
            type="button"
            className="h-10 rounded-md px-4"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create business
          </Button>
        </div>

        <section className="mt-7">
          {businessesQuery.isLoading ? (
            <BusinessSkeleton />
          ) : businessesQuery.isError ? (
            <FeedbackState
              title="Unable to load businesses"
              message={businessErrorMessage(
                businessesQuery.error,
                "Unable to load businesses.",
              )}
              retry={() => void businessesQuery.refetch()}
              retryLabel="Retry"
              className="shadow-sm"
            />
          ) : businessItems.length === 0 ? (
            <BusinessEmptyState onCreate={() => setCreateOpen(true)} />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {businessItems.map((item) => {
                const business = item.business;
                const role = roleLabel(item);

                return (
                  <Link
                    key={business.id}
                    href={`/business/${business.id}`}
                    className="group rounded-md border border-border bg-card p-5 shadow-sm transition hover:bg-muted/40"
                  >
                    <div className="flex gap-4">
                      <BusinessLogo item={item} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-bold text-card-foreground">
                            {business.name}
                          </h2>
                          <StatusBadge item={item} />
                          {!business.isVerified ? (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                              Unverified
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {business.industry}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <span>{role}</span>
                          <span>{business.defaultCurrency}</span>
                          <span>Created {formatDate(business.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <CreateBusinessDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
