"use client";

import { SelectControl } from "@/components/ui/select";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeDirectoryTable } from "@/features/employees/employee-directory-table";
import { employeeDirectoryFilters } from "@/features/employees/employee-directory-utils";
import { EmployeeSubnavigation } from "@/features/employees/employee-subnavigation";
import { useBusinessEmployeesQuery } from "@/features/employees/employee-hooks";
import { BusinessApiError } from "@/lib/business-api";
import { useBusinessAccess } from "./business-access-context";
import {
  useEmployeeGroupsQuery,
  useEmployeeTypesQuery,
} from "./employee-classification-hooks";
import { friendlyListStatus } from "./employee-list-display";
import {
  useEmployeeListQuery,
  useVerificationStatusQuery,
} from "./employee-list-hooks";
import { labelFrequency } from "./employee-lists-page";
import { Pagination } from "./pagination";
import { EmployeeListDetailState as State } from "./employee-list-detail-state";
import { EmployeeListMetric as Metric } from "./employee-list-metric";
import { EditListDialog } from "./components/edit-list-dialog";
import { EmployeeDialog } from "./components/employee-dialog";

export function EmployeeListDetailPage({
  businessId,
  employeeListId,
}: {
  businessId: string;
  employeeListId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const access = useBusinessAccess();
  const canViewEmployees = access.effectivePermissions.has("employees:view");
  const canCreate = access.effectivePermissions.has("employees:create");
  const canEditList = access.effectivePermissions.has("employee_lists:update");
  const filters = employeeDirectoryFilters(
    new URLSearchParams(searchParams.toString()),
    employeeListId,
  );
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [editListOpen, setEditListOpen] = useState(false);
  const listQuery = useEmployeeListQuery(businessId, employeeListId);
  const employees = useBusinessEmployeesQuery(
    businessId,
    filters,
    canViewEmployees,
  );
  const verification = useVerificationStatusQuery(businessId, employeeListId);
  const types = useEmployeeTypesQuery(businessId, "active", canViewEmployees);
  const groups = useEmployeeGroupsQuery(businessId, "active", canViewEmployees);
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
  const error = listQuery.error || employees.error;
  const status = error instanceof BusinessApiError ? error.status : 0;
  if (listQuery.isLoading || employees.isLoading)
    return (
      <>
        <div className="flex gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Loading department…
        </div>
      </>
    );
  if (!canViewEmployees || status === 403)
    return (
      <>
        <State
          title="Permission required"
          detail="Viewing a department directory requires employees:view."
        />
      </>
    );
  if (status === 404)
    return (
      <>
        <State
          title="Department not found"
          detail="This department may have been removed or does not belong to this business."
        />
      </>
    );
  if (error || !listQuery.data || !employees.data)
    return (
      <>
        <State
          title="Unable to load department"
          detail={error instanceof Error ? error.message : "Try again."}
          retry={() => {
            void listQuery.refetch();
            void employees.refetch();
          }}
        />
      </>
    );
  const list = listQuery.data;
  const progress = verification.data ?? list;
  return (
    <>
      <Link
        href={`/business/${businessId}/employees/employee-lists`}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft />
        Departments
      </Link>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{list.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {list.description || "No description"} · {list.currency} ·{" "}
            {labelFrequency(list.defaultPayFrequency)}
          </p>
        </div>
        <div className="flex gap-2">
          {canEditList ? (
            <Button variant="outline" onClick={() => setEditListOpen(true)}>
              <Pencil />
              Edit department
            </Button>
          ) : null}
          {canCreate ? (
            <Button onClick={() => setEmployeeOpen(true)}>
              <Plus />
              Add employee
            </Button>
          ) : null}
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        <Metric
          label="Status"
          value={friendlyListStatus(progress.validationStatus)}
        />
        <Metric label="Total" value={progress.totalEmployeeCount} />
        <Metric label="Pending" value={progress.pendingVerificationCount} />
        <Metric label="Verified" value={progress.verifiedEmployeeCount} />
        <Metric
          label="Failed / error"
          value={
            progress.invalidEmployeeCount + progress.verificationErrorCount
          }
        />
      </div>
      <div className="mt-7 grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
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
        {employees.data.items.length ? (
          <EmployeeDirectoryTable
            businessId={businessId}
            employees={employees.data.items}
            returnTo={`${pathname}?${searchParams.toString()}`}
          />
        ) : (
          <State
            title="No employees found"
            detail="Try changing the filters or add an employee to this department."
          />
        )}
      </div>
      <Pagination
        page={employees.data.pagination.page}
        totalPages={employees.data.pagination.totalPages}
        total={employees.data.pagination.total}
        limit={filters.limit}
        fetching={employees.isFetching}
        onPage={(page) => update({ page: String(page) }, false)}
        onLimit={(limit) => update({ limit: String(limit), page: "1" }, false)}
      />
      {employeeOpen ? (
        <EmployeeDialog
          businessId={businessId}
          listId={employeeListId}
          open
          onOpenChange={setEmployeeOpen}
        />
      ) : null}
      {canEditList && editListOpen ? (
        <EditListDialog
          businessId={businessId}
          list={list}
          open
          onOpenChange={setEditListOpen}
        />
      ) : null}
    </>
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
