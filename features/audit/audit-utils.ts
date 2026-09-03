import { BusinessApiError } from "@/lib/business-api";
import type { AuditDomain, OrganizationAuditFilters } from "@/lib/audit-api";

export type AuditScope = "organization" | "me";

const positive = (value: string | null, fallback: number, max = 100) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

const value = (search: URLSearchParams, key: string) => search.get(key)?.trim() || undefined;

export function resolveAuditScope(requested: string | null, canViewOrganization: boolean): AuditScope {
  if (!canViewOrganization) return "me";
  return requested === "me" ? "me" : "organization";
}

export function auditQueryAccess(scope: AuditScope, canViewOrganization: boolean) {
  return {
    organization: scope === "organization" && canViewOrganization,
    personal: scope === "me",
  };
}

export function visibleAuditDomains(canViewPolicy: boolean): AuditDomain[] {
  return ["business", "member", "employee", ...(canViewPolicy ? ["policy" as const] : []), "security"];
}

export function updateAuditSearch(
  current: URLSearchParams,
  updates: Record<string, string | undefined>,
  resetPage = true,
) {
  const next = new URLSearchParams(current.toString());
  Object.entries(updates).forEach(([key, nextValue]) => {
    if (nextValue) next.set(key, nextValue);
    else next.delete(key);
  });
  if (resetPage) next.delete("page");
  return next;
}

export function auditFiltersFromSearch(search: URLSearchParams): OrganizationAuditFilters {
  return {
    page: positive(search.get("page"), 1, Number.MAX_SAFE_INTEGER),
    limit: positive(search.get("limit"), 20),
    ...(value(search, "domain") ? { domain: value(search, "domain") as OrganizationAuditFilters["domain"] } : {}),
    ...(value(search, "action") ? { action: value(search, "action") } : {}),
    ...(value(search, "actorId") ? { actorId: value(search, "actorId") } : {}),
    ...(value(search, "employeeId") ? { employeeId: value(search, "employeeId") } : {}),
    ...(value(search, "from") ? { from: value(search, "from") } : {}),
    ...(value(search, "to") ? { to: value(search, "to") } : {}),
  };
}

export function localDateBoundary(value: string, end = false) {
  if (!value) return undefined;
  return new Date(`${value}T${end ? "23:59:59.999" : "00:00:00.000"}`).toISOString();
}

export function humanizeAuditField(field: string) {
  return field
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export function displayAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not set";
  if (value === "[changed]") return "Changed (details redacted)";
  if (["string", "number", "boolean"].includes(typeof value)) return String(value);
  return "Changed (details redacted)";
}

export function retryAuditQuery(failureCount: number, error: unknown) {
  if (error instanceof BusinessApiError && (error.status === 401 || error.status === 403)) return false;
  return failureCount < 2;
}
