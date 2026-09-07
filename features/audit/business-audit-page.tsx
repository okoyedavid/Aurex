"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useBusinessAccess } from "@/features/business/business-access-context";
import { BusinessPageHeader } from "@/features/business/business-page-header";
import { AuditResults } from "./components/audit-results";
import { OrganizationAuditFilters } from "./components/organization-audit-filters";
import { useOrganizationAuditQuery, usePersonalAuditQuery } from "./audit-hooks";
import {
  auditFiltersFromSearch,
  auditQueryAccess,
  personalAuditClearedFilters,
  resolveAuditScope,
  updateAuditSearch,
} from "./audit-utils";

export function BusinessAuditPage({ businessId }: { businessId: string }) {
  const { effectivePermissions } = useBusinessAccess();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canViewOrganization = effectivePermissions.has("audit_logs:view");
  const canViewPolicy = effectivePermissions.has("policies:view_audit");
  const scope = resolveAuditScope(searchParams.get("scope"), canViewOrganization);
  const queryAccess = auditQueryAccess(scope, canViewOrganization);
  const filters = useMemo(
    () => auditFiltersFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const organization = useOrganizationAuditQuery(businessId, filters, queryAccess.organization);
  const personal = usePersonalAuditQuery(businessId, filters.page, filters.limit, queryAccess.personal);
  const query = scope === "organization" ? organization : personal;

  function updateUrl(updates: Record<string, string | undefined>, resetPage = true) {
    const next = updateAuditSearch(new URLSearchParams(searchParams.toString()), updates, resetPage);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  }

  function selectScope(nextScope: "organization" | "me") {
    updateUrl({ ...(nextScope === "me" ? personalAuditClearedFilters : {}), scope: nextScope }, true);
  }

  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <BusinessPageHeader
          title="Audit & activity"
          description={scope === "organization" ? "Review sanitized business, membership, employee, policy, and security events." : "Review actions you performed and changes directly affecting your membership or linked employee record."}
          tabs={[
            ...(canViewOrganization ? [{ label: "Organization Audit", active: scope === "organization", onSelect: () => selectScope("organization") }] : []),
            { label: "My Activity", active: scope === "me", onSelect: () => selectScope("me") },
          ]}
        />
        {scope === "organization" ? (
          <OrganizationAuditFilters
            key={searchParams.toString()}
            businessId={businessId}
            filters={filters}
            searchParams={new URLSearchParams(searchParams.toString())}
            canViewPolicy={canViewPolicy}
            canViewActors={effectivePermissions.has("members:view")}
            canViewEmployees={effectivePermissions.has("employees:view")}
            updateUrl={updateUrl}
          />
        ) : (
          <div className="mt-6 rounded-md border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
            This feed includes actions you performed, changes where you are the subject, changes to your linked employee record, and sanitized policy assignment effects affecting you. It does not include another member&apos;s activity or organization-wide history.
          </div>
        )}
        <AuditResults
          scope={scope}
          query={query}
          onPersonal={() => selectScope("me")}
          onRetry={() => void query.refetch()}
          onPage={(page) => updateUrl({ page: String(page) }, false)}
          onLimit={(limit) => updateUrl({ limit: String(limit), page: undefined }, false)}
        />
      </div>
    </div>
  );
}
