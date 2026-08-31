"use client";

import { notFound, usePathname } from "next/navigation";
import { useMemo } from "react";

import { BusinessAccessContextProvider } from "@/features/business/business-access-context";
import { BusinessAccessRedirect } from "@/features/business/business-access-redirect";
import { BusinessForbiddenState } from "@/features/business/business-forbidden-state";
import { useBusinessQuery } from "@/features/business/business-hooks";
import { BusinessLayoutError } from "@/features/business/business-layout-error";
import { BusinessLayoutSkeleton } from "@/features/business/business-layout-skeleton";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import {
  canAccessBusinessNavigationItem,
  getBusinessNavigation,
  getBusinessNavigationItemForPath,
  getEffectivePermissions,
} from "@/features/dashboard/data";
import { BusinessApiError, businessErrorMessage } from "@/lib/business-api";
import type { Permission } from "@/types/generic";

export type BusinessAccessLayoutState =
  | "loading"
  | "ready"
  | "unauthenticated"
  | "not_found"
  | "missing_membership"
  | "suspended"
  | "removed"
  | "server_forbidden"
  | "error";

export function resolveBusinessAccessLayoutState({
  hasData,
  isLoading,
  errorStatus,
  membershipStatus,
}: {
  hasData: boolean;
  isLoading: boolean;
  errorStatus?: number;
  membershipStatus?: "active" | "suspended" | "removed" | null;
}): BusinessAccessLayoutState {
  if (errorStatus === 401) return "unauthenticated";
  if (errorStatus === 404) return "not_found";
  if (hasData && errorStatus === 403) return "server_forbidden";
  if (!hasData && isLoading) return "loading";
  if (!hasData && errorStatus === 403) return "missing_membership";
  if (!hasData) return "error";
  if (!membershipStatus) return "missing_membership";
  if (membershipStatus === "suspended") return "suspended";
  if (membershipStatus === "removed") return "removed";
  return "ready";
}

export function BusinessAccessBoundary({
  businessId,
  children,
}: {
  businessId: string;
  children: React.ReactNode;
}) {
  const query = useBusinessQuery(businessId);
  const pathname = usePathname();
  const errorStatus =
    query.error instanceof BusinessApiError ? query.error.status : undefined;
  const effectivePermissions = useMemo(
    () =>
      query.data?.membership
        ? getEffectivePermissions(query.data.membership.role)
        : new Set<Permission>(),
    [query.data],
  );
  const state = resolveBusinessAccessLayoutState({
    hasData: Boolean(query.data),
    isLoading: query.isLoading,
    errorStatus,
    membershipStatus: query.data?.membership?.status,
  });

  if (state === "loading") return <BusinessLayoutSkeleton />;
  if (state === "not_found") notFound();
  if (state === "unauthenticated")
    return (
      <BusinessAccessRedirect
        href={`/login?next=${encodeURIComponent(pathname)}`}
        message="Please sign in to continue."
      />
    );
  if (
    state === "missing_membership" ||
    state === "suspended" ||
    state === "removed"
  ) {
    const message =
      state === "suspended"
        ? "Your access to this business is suspended."
        : state === "removed"
          ? "You no longer have access to this business."
          : "You are not a member of this business.";
    return (
      <BusinessAccessRedirect href="/dashboard/business" message={message} />
    );
  }
  if (!query.data?.membership)
    return (
      <BusinessLayoutError
        message={businessErrorMessage(
          query.error,
          "Unable to load business access.",
        )}
        onRetry={() => query.refetch()}
      />
    );

  const navigation = getBusinessNavigation(businessId, effectivePermissions);
  const routeItem = getBusinessNavigationItemForPath(businessId, pathname);
  const routeAllowed =
    !routeItem ||
    canAccessBusinessNavigationItem(routeItem, effectivePermissions);
  const accessValue = {
    ...query.data,
    membership: query.data.membership,
    effectivePermissions,
  };
  const content =
    state === "server_forbidden" ? (
      <BusinessForbiddenState
        businessId={businessId}
        title="Business access changed"
        message="The server denied access while refreshing your business membership."
      />
    ) : routeAllowed ? (
      children
    ) : (
      <BusinessForbiddenState businessId={businessId} />
    );

  return (
    <BusinessAccessContextProvider value={accessValue}>
      <DashboardShell
        mode="business"
        businessId={businessId}
        businessName={query.data.business.name}
        businessNavigation={navigation}
        isRefreshing={query.isFetching && !query.isLoading}
      >
        {content}
      </DashboardShell>
    </BusinessAccessContextProvider>
  );
}
