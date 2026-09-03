import type {
  EmployeeDirectoryFilters,
  EmployeeStatus,
} from "@/lib/employees-api";
import type { Permission } from "@/types/generic";

const positiveInteger = (
  value: string | null,
  fallback: number,
  maximum = 100,
) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0
    ? Math.min(parsed, maximum)
    : fallback;
};

export function employeeDirectoryFilters(
  search: URLSearchParams,
  employeeListId?: string,
): EmployeeDirectoryFilters {
  const value = (key: string) => search.get(key)?.trim() || undefined;
  return {
    page: positiveInteger(search.get("page"), 1, Number.MAX_SAFE_INTEGER),
    limit: positiveInteger(search.get("limit"), 20),
    ...(value("search") ? { search: value("search") } : {}),
    ...(employeeListId || value("employeeListId")
      ? { employeeListId: employeeListId ?? value("employeeListId") }
      : {}),
    ...(value("employeeTypeId")
      ? { employeeTypeId: value("employeeTypeId") }
      : {}),
    ...(value("groupId") ? { groupId: value("groupId") } : {}),
    ...(value("state") ? { state: value("state") } : {}),
    ...(value("status") ? { status: value("status") as EmployeeStatus } : {}),
  };
}

export function employeeDetailHref(
  businessId: string,
  employeeId: string,
  returnTo?: string,
) {
  const href = `/business/${businessId}/employees/${employeeId}`;
  return returnTo ? `${href}?returnTo=${encodeURIComponent(returnTo)}` : href;
}

export const canonicalEmployeePoliciesHref = (
  businessId: string,
  employeeId: string,
) => `/business/${businessId}/employees/${employeeId}/policies`;

export function employeePermissions(permissions: ReadonlySet<Permission>) {
  return {
    viewDirectory: permissions.has("employees:view"),
    update: permissions.has("employees:update"),
  };
}
