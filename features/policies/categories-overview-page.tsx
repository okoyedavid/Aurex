"use client";
import Link from "next/link";
import { PolicyBadge } from "./components/policy-ui";
import { cardinalityDescription, policyPermissions } from "./policy-helpers";
import { Pagination } from "../business/pagination";
import { usePolicyCategoriesQuery } from "./policy-hooks";
import { useState } from "react";
import { useBusinessAccess } from "../business/business-access-context";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "./components/category-dialog";
import { Loading } from "@/components/ui/loading";
import { FeedbackState } from "@/components/ui/feedback-state";
import { businessErrorMessage } from "@/lib/business-api";

export function CategoriesOverviewPage({ businessId }: { businessId: string }) {
  const { effectivePermissions } = useBusinessAccess();
  const access = policyPermissions(effectivePermissions);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const categories = usePolicyCategoriesQuery(
    businessId,
    categoryPage,
    20,
    "active",
    access.view,
  );

  if (!access.view)
    return (
      <FeedbackState
        message="You do not have permission to view business categories."
        retry={() => undefined}
      />
    );
  if (categories.isLoading) return <Loading label="Loading categories" />;
  if (categories.error)
    return (
      <FeedbackState
        message={businessErrorMessage(categories.error)}
        retry={() => {
          void categories.refetch();
        }}
      />
    );
  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-bold">Categories</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Define business policy categories.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {access.create ? (
            <>
              <Button variant="outline" onClick={() => setCategoryOpen(true)}>
                <Plus />
                Category
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <div className="my-8">
        {categories.data?.items.length ? (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {categories.data.items.map((category) => (
              <Link
                key={category.id}
                href={`/business/${businessId}/policies/categories/${category.id}`}
                className="rounded-md border border-border bg-card p-4 transition hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{category.name}</h3>
                  <PolicyBadge tone="info">{category.cardinality}</PolicyBadge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {category.description ||
                    cardinalityDescription(category.cardinality)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-3">
            <FeedbackState
              title="No policy categories have been created."
              tone="neutral"
              variant="empty"
            />
          </div>
        )}
        <Pagination
          page={categories.data?.pagination.page ?? 1}
          totalPages={categories.data?.pagination.totalPages ?? 0}
          total={categories.data?.pagination.total ?? 0}
          limit={20}
          fetching={categories.isFetching}
          showLimit={false}
          onPage={setCategoryPage}
          onLimit={() => undefined}
        />
      </div>

      {categoryOpen ? (
        <CategoryDialog
          businessId={businessId}
          open
          onOpenChange={setCategoryOpen}
        />
      ) : null}
    </section>
  );
}
