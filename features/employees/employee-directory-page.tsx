"use client";

import { SelectControl } from "@/components/ui/select";

import { Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { useBusinessAccess } from "@/features/business/business-access-context";
import {
  useEmployeeGroupsQuery,
  useEmployeeTypesQuery,
} from "@/features/business/employee-classification-hooks";
import { useEmployeeListsQuery } from "@/features/business/employee-list-hooks";
import { Pagination } from "@/features/business/pagination";
import { businessErrorMessage } from "@/lib/business-api";
import { EmployeeDirectoryTable } from "./employee-directory-table";
import { employeeDirectoryFilters } from "./employee-directory-utils";
import { useBusinessEmployeesQuery } from "./employee-hooks";

export function EmployeeDirectoryPage({ businessId }: { businessId: string }) {
  const searchParams = useSearchParams();
  return (
    <DirectoryContent key={searchParams.toString()} businessId={businessId} />
  );
}

function DirectoryContent({ businessId }: { businessId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const access = useBusinessAccess();
  const canView = access.effectivePermissions.has("employees:view");
  const filters = employeeDirectoryFilters(
    new URLSearchParams(searchParams.toString()),
  );
  const employees = useBusinessEmployeesQuery(businessId, filters, canView);
  const lists = useEmployeeListsQuery(
    businessId,
    1,
    100,
    canView && access.effectivePermissions.has("employee_lists:view"),
  );
  const types = useEmployeeTypesQuery(businessId, "active", canView);
  const groups = useEmployeeGroupsQuery(businessId, "active", canView);

  const update = (
    patch: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([key, value]) =>
      value ? params.set(key, value) : params.delete(key),
    );
    if (resetPage) params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  if (!canView)
    return (
      <FeedbackState
        tone="neutral"
        variant="empty"
        title="Permission required"
        message="Business-wide employee access requires employees:view."
      />
    );
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search and manage people across this business.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-6">
        <Filter
          label="All departments"
          value={filters.employeeListId}
          onChange={(value) => update({ employeeListId: value })}
          items={lists.data?.items.map((item) => [item.id, item.name]) ?? []}
        />
        <Filter
          label="All types"
          value={filters.employeeTypeId}
          onChange={(value) => update({ employeeTypeId: value })}
          items={types.data?.items.map((item) => [item.id, item.name]) ?? []}
        />
        <Filter
          label="All groups"
          value={filters.groupId}
          onChange={(value) => update({ groupId: value })}
          items={groups.data?.items.map((item) => [item.id, item.name]) ?? []}
        />
        <Filter
          label="All statuses"
          value={filters.status}
          onChange={(value) => update({ status: value })}
          items={[
            ["active", "Active"],
            ["suspended", "Suspended"],
            ["on leave", "On leave"],
            ["archived", "Archived"],
          ]}
        />
        <Input
          aria-label="Filter by state"
          value={filters.state ?? ""}
          onChange={(event) =>
            update({ state: event.target.value.trim() || undefined })
          }
          placeholder="State"
        />
        <Button variant="ghost" onClick={() => router.replace(pathname)}>
          Clear filters
        </Button>
      </div>
      <div className="mt-6">
        {employees.isLoading ? (
          <Loading label="Loading employees…" variant="spinner" centered />
        ) : employees.error ? (
          <FeedbackState
            title="Unable to load employees"
            message={businessErrorMessage(employees.error)}
            retry={() => void employees.refetch()}
          />
        ) : !employees.data?.items.length ? (
          <FeedbackState
            tone="neutral"
            variant="empty"
            icon={<Users className="mx-auto size-7 text-muted-foreground" />}
            title="No employees found"
            message="Try changing the filters or add employees from a department."
          />
        ) : (
          <EmployeeDirectoryTable
            businessId={businessId}
            employees={employees.data.items}
            returnTo={`${pathname}?${searchParams.toString()}`}
          />
        )}
      </div>
      {employees.data ? (
        <Pagination
          page={employees.data.pagination.page}
          totalPages={employees.data.pagination.totalPages}
          total={employees.data.pagination.total}
          limit={filters.limit}
          fetching={employees.isFetching}
          onPage={(page) => update({ page: String(page) }, false)}
          onLimit={(limit) =>
            update({ limit: String(limit), page: "1" }, false)
          }
        />
      ) : null}
    </div>
  );
}

function Filter({
  label,
  value,
  onChange,
  items,
}: {
  label: string;
  value?: string;
  onChange: (value?: string) => void;
  items: string[][];
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <SelectControl
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || undefined)}
      >
        <option value="">{label}</option>
        {items.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </SelectControl>
    </label>
  );
}
