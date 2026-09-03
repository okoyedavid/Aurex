"use client";

import { keepPreviousData, useQuery, type QueryClient } from "@tanstack/react-query";

import * as service from "@/lib/audit-api";
import { retryAuditQuery } from "./audit-utils";

export const auditKeys = {
  organizationRoot: (businessId: string) => ["business-audit", businessId] as const,
  organization: (businessId: string, filters: service.OrganizationAuditFilters) =>
    [...auditKeys.organizationRoot(businessId), "organization", filters] as const,
  personalRoot: (businessId: string) => ["business-personal-audit", businessId] as const,
  personal: (businessId: string, page: number, limit: number) =>
    [...auditKeys.personalRoot(businessId), "me", page, limit] as const,
};

export function useOrganizationAuditQuery(
  businessId: string,
  filters: service.OrganizationAuditFilters,
  enabled: boolean,
) {
  return useQuery({
    queryKey: auditKeys.organization(businessId, filters),
    queryFn: () => service.listBusinessAudit(businessId, filters),
    enabled: Boolean(businessId) && enabled,
    placeholderData: keepPreviousData,
    retry: retryAuditQuery,
  });
}

export function usePersonalAuditQuery(businessId: string, page: number, limit: number, enabled: boolean) {
  return useQuery({
    queryKey: auditKeys.personal(businessId, page, limit),
    queryFn: () => service.listMyBusinessActivity(businessId, { page, limit }),
    enabled: Boolean(businessId) && enabled,
    placeholderData: keepPreviousData,
    retry: retryAuditQuery,
  });
}

export function invalidateBusinessAudit(queryClient: QueryClient, businessId: string) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(businessId) }),
    queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(businessId) }),
  ]);
}
