"use client";

import { businessErrorMessage } from "@/lib/business-api";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { policyPermissions } from "./policy-helpers";
import { usePolicyCategoryQuery } from "./policy-hooks";
import {
  PolicyError,
  PolicyLoading,
  PolicyPageFrame,
} from "./components/policy-ui";
import { PolicyOverviewPage } from "./policy-overview-page";

export function CategoryDetailPage({
  businessId,
  categoryId,
}: {
  businessId: string;
  categoryId: string;
}) {
  const access = policyPermissions(useBusinessAccess().effectivePermissions);
  const category = usePolicyCategoryQuery(businessId, categoryId, access.view);
  if (category.isLoading)
    return <PolicyLoading label="Loading policy category…" />;
  if (category.error || !category.data)
    return (
      <PolicyPageFrame>
        <PolicyError
          message={businessErrorMessage(category.error)}
          retry={() => void category.refetch()}
        />
      </PolicyPageFrame>
    );
  return (
    <PolicyOverviewPage
      businessId={businessId}
      lockedCategory={category.data}
    />
  );
}
