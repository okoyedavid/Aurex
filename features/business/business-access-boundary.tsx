"use client";

import { AlertCircle, Building2 } from "lucide-react";
import Link from "next/link";
import { notFound, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useBusinessQuery } from "@/features/business/business-hooks";
import { BusinessAccessContextProvider } from "@/features/business/business-access-context";
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

export function BusinessAccessBoundary({ businessId, children }: { businessId: string; children: React.ReactNode }) {
  const query = useBusinessQuery(businessId);
  const pathname = usePathname();
  const errorStatus = query.error instanceof BusinessApiError ? query.error.status : undefined;
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
  if (state === "unauthenticated") return <AccessRedirect href={`/signin?next=${encodeURIComponent(pathname)}`} message="Please sign in to continue." />;
  if (state === "missing_membership" || state === "suspended" || state === "removed") {
    const message = state === "suspended" ? "Your access to this business is suspended." : state === "removed" ? "You no longer have access to this business." : "You are not a member of this business.";
    return <AccessRedirect href="/dashboard/business" message={message} />;
  }
  if (!query.data?.membership) {
    return <BusinessLayoutError message={businessErrorMessage(query.error, "Unable to load business access.")} onRetry={() => query.refetch()} />;
  }

  const navigation = getBusinessNavigation(businessId, effectivePermissions);
  const routeItem = getBusinessNavigationItemForPath(businessId, pathname);
  const routeAllowed = !routeItem || canAccessBusinessNavigationItem(routeItem, effectivePermissions);
  const accessValue = { ...query.data, membership: query.data.membership, effectivePermissions };
  const content = state === "server_forbidden" ? <BusinessForbiddenState businessId={businessId} title="Business access changed" message="The server denied access while refreshing your business membership." /> : routeAllowed ? children : <BusinessForbiddenState businessId={businessId} />;

  return (
    <BusinessAccessContextProvider value={accessValue}>
      <DashboardShell mode="business" businessId={businessId} businessName={query.data.business.name} businessNavigation={navigation} isRefreshing={query.isFetching && !query.isLoading}>
        {content}
      </DashboardShell>
    </BusinessAccessContextProvider>
  );
}

export function BusinessLayoutSkeleton() {
  return <main className="min-h-screen bg-muted" aria-label="Loading business workspace"><aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-background p-5 lg:block"><div className="h-10 w-40 animate-pulse rounded bg-muted"/><div className="mt-20 space-y-3">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="h-9 animate-pulse rounded bg-muted"/>)}</div></aside><section className="min-h-screen lg:ml-64"><div className="h-16 animate-pulse border-b border-border bg-background"/><div className="space-y-5 p-8"><div className="h-10 w-72 animate-pulse rounded bg-card"/><div className="h-64 animate-pulse rounded-xl bg-card"/></div></section></main>;
}

export function BusinessForbiddenState({ businessId, title = "Permission required", message = "You do not have permission to view this section." }: { businessId: string; title?: string; message?: string }) {
  return <div className="px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1280px] rounded-xl border border-border bg-card p-8 text-center"><AlertCircle className="mx-auto h-6 w-6 text-destructive"/><h1 className="mt-3 text-xl font-bold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{message}</p><Button asChild className="mt-5"><Link href={`/business/${businessId}`}>Back to Overview</Link></Button></div></div>;
}

function AccessRedirect({ href, message }: { href: string; message: string }) {
  const router = useRouter();
  const notified = useRef(false);
  useEffect(() => { if (!notified.current) { notified.current = true; toast.error(message); } router.replace(href); }, [href, message, router]);
  return <div className="flex min-h-screen items-center justify-center bg-muted text-sm text-muted-foreground"><Building2 className="mr-2 h-4 w-4"/>Redirecting…</div>;
}

function BusinessLayoutError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="flex min-h-screen items-center justify-center bg-muted p-6"><div className="rounded-xl border border-border bg-card p-6 text-center"><AlertCircle className="mx-auto text-destructive"/><h1 className="mt-3 font-bold">Unable to load business</h1><p className="mt-2 text-sm text-muted-foreground">{message}</p><Button className="mt-4" variant="outline" onClick={onRetry}>Try again</Button></div></div>;
}
