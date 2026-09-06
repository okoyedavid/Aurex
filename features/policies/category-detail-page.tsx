"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { businessErrorMessage } from "@/lib/business-api";
import { CategoryDialog } from "./components/category-dialog";
import { PolicyCollection } from "./components/policy-collection";
import { PolicyDialog } from "./components/policy-dialog";
import { ConfirmPolicyAction } from "./components/policy-ui";
import { cardinalityDescription, policyPermissions } from "./policy-helpers";
import {
  useArchiveCategoryMutation,
  usePolicyCategoriesQuery,
  usePolicyCategoryQuery,
} from "./policy-hooks";

export function CategoryDetailPage({
  businessId,
  categoryId,
}: {
  businessId: string;
  categoryId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const access = policyPermissions(useBusinessAccess().effectivePermissions);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [archiveCategoryOpen, setArchiveCategoryOpen] = useState(false);
  const category = usePolicyCategoryQuery(businessId, categoryId, access.view);
  const categoryOptions = usePolicyCategoriesQuery(
    businessId,
    1,
    100,
    "active",
    access.view,
  );
  const archiveCategory = useArchiveCategoryMutation(businessId, categoryId);

  useEffect(() => {
    if (searchParams.get("action") !== "create-policy" || !access.create)
      return;
    const frame = requestAnimationFrame(() => setPolicyOpen(true));
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    return () => cancelAnimationFrame(frame);
  }, [access.create, pathname, router, searchParams]);

  if (!access.view)
    return (
      <FeedbackState
        title="Unable to load policy data"
        message="You do not have permission to view policies."
      />
    );
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
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex rounded-full bg-muted py-1 text-xs font-semibold text-primary">
            ASSIGNMENT MODE:{" "}
            {category.data.cardinality === "ONE"
              ? "SINGLE POLICY"
              : "MULTIPLE POLICY"}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{category.data.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {category.data.description ||
              cardinalityDescription(category.data.cardinality)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {access.update ? (
            <Button variant="outline" onClick={() => setCategoryOpen(true)}>
              Edit category
            </Button>
          ) : null}
          {access.archive ? (
            <Button
              variant="destructive"
              onClick={() => setArchiveCategoryOpen(true)}
            >
              Archive category
            </Button>
          ) : null}
          {access.create ? (
            <Button
              onClick={() => setPolicyOpen(true)}
              disabled={!categoryOptions.data?.items.length}
            >
              <Plus />
              Policy
            </Button>
          ) : null}
        </div>
      </div>

      <PolicyCollection
        businessId={businessId}
        canView={access.view}
        categoryId={categoryId}
      />

      {categoryOpen ? (
        <CategoryDialog
          businessId={businessId}
          category={category.data}
          open
          onOpenChange={setCategoryOpen}
        />
      ) : null}
      {policyOpen ? (
        <PolicyDialog
          businessId={businessId}
          categories={categoryOptions.data?.items ?? []}
          initialCategoryId={categoryId}
          open
          onOpenChange={setPolicyOpen}
        />
      ) : null}
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
