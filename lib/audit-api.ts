import { AxiosError } from "axios";

import { api } from "@/lib/api";
import { BusinessApiError, type BusinessResponse } from "@/lib/business-api";

export type AuditDomain =
  | "business"
  | "member"
  | "employee"
  | "policy"
  | "security";
export type AuditPrimitive = string | number | boolean | null;

export type AuditItem = {
  id: string;
  occurredAt: string;
  domain: AuditDomain;
  auditType:
    | "business"
    | "membership"
    | "employee"
    | "policy"
    | "personal"
    | "security";
  action: string;
  actor: { type: string; displayName: string } | null;
  subject: { type: string; displayName: string } | null;
  summary: string;
  changes?: Array<{
    field: string;
    before: AuditPrimitive;
    after: AuditPrimitive;
  }>;
  reason?: string;
};

export type AuditType = AuditItem["auditType"];

export type AuditPage = {
  items: AuditItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type OrganizationAuditFilters = {
  page: number;
  limit: number;
  domain?: AuditDomain;
  action?: string;
  actorId?: string;
  employeeId?: string;
  from?: string;
  to?: string;
};

function normalizeAuditError(error: unknown, personal: boolean): never {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    const message =
      status === 401
        ? "Your session has expired. Please sign in again."
        : status === 403
          ? personal
            ? "An active business membership is required to view your activity."
            : "You do not have permission to view organization audit activity."
          : "Audit activity could not be loaded. Please try again.";
    throw new BusinessApiError(status, { message });
  }
  throw new BusinessApiError(500, {
    message:
      "Audit activity could not be loaded. Check your connection and try again.",
  });
}

export async function listBusinessAudit(
  businessId: string,
  filters: OrganizationAuditFilters,
) {
  try {
    const response = await api.get<BusinessResponse<AuditPage>>(
      `/businesses/${businessId}/audit`,
      { params: filters },
    );
    return response.data.data;
  } catch (error) {
    normalizeAuditError(error, false);
  }
}

export async function listMyBusinessActivity(
  businessId: string,
  pagination: { page: number; limit: number },
) {
  try {
    const response = await api.get<BusinessResponse<AuditPage>>(
      `/businesses/${businessId}/audit/me`,
      { params: pagination },
    );
    return response.data.data;
  } catch (error) {
    normalizeAuditError(error, true);
  }
}
