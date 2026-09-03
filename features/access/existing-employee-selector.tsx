"use client";

import { SelectControl } from "@/components/ui/select";

import { Check, Link2, UserRound } from "lucide-react";
import { useState } from "react";

import { Pagination } from "@/features/business/pagination";
import {
  useEmployeeListsQuery,
  useEmployeesQuery,
} from "@/features/business/employee-list-hooks";
import { friendlyEmployeeStatus } from "@/features/business/employee-list-display";
import { cn } from "@/lib/utils";
import type { Employee } from "@/lib/employee-lists-api";

import { ErrorState, LoadingState } from "./shared";
import { changeEmployeeList, isEmployeeLinked } from "./invitation-workflow";

const pageLimit = 20;

export function ExistingEmployeeSelector({
  businessId,
  enabled,
  employeeListId,
  employeeId,
  onEmployeeListChange,
  onEmployeeChange,
}: {
  businessId: string;
  enabled: boolean;
  employeeListId: string;
  employeeId: string;
  onEmployeeListChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
}) {
  const [employeePage, setEmployeePage] = useState(1);
  const lists = useEmployeeListsQuery(businessId, 1, 20, enabled);
  const employees = useEmployeesQuery(
    businessId,
    employeeListId,
    employeePage,
    pageLimit,
  );
  const selectedList = lists.data?.items.find(
    (list) => list.id === employeeListId,
  );

  if (!enabled) {
    return (
      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
        Browsing existing employees requires members:invite,
        employee_lists:view, and employees:view.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lists.isLoading ? (
        <LoadingState />
      ) : lists.error ? (
        <ErrorState error={lists.error} onRetry={() => lists.refetch()} />
      ) : lists.data?.items.length ? (
        <label className="block space-y-2 text-sm font-medium">
          Employee list
          <SelectControl
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={employeeListId}
            onChange={(event) => {
              const next = changeEmployeeList(event.target.value);
              onEmployeeListChange(next.employeeListId);
              onEmployeeChange(next.employeeId);
              setEmployeePage(next.employeePage);
            }}
          >
            <option value="">Select an employee list</option>
            {lists.data.items.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name} · {list.totalEmployeeCount} employees
              </option>
            ))}
          </SelectControl>
        </label>
      ) : (
        <div className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
          No employee lists are available.
        </div>
      )}

      {employeeListId ? (
        <section aria-labelledby="employee-choice-heading">
          <div className="mb-3">
            <h3 id="employee-choice-heading" className="text-sm font-semibold">
              Select an employee
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Showing only employees from{" "}
              {selectedList?.name ?? "the selected list"}.
            </p>
          </div>
          {employees.isLoading ? (
            <LoadingState />
          ) : employees.error ? (
            <ErrorState
              error={employees.error}
              onRetry={() => employees.refetch()}
            />
          ) : employees.data?.items.length ? (
            <>
              <div className="grid gap-2">
                {employees.data.items.map((employee) => (
                  <EmployeeChoice
                    key={employee.id}
                    employee={employee}
                    listName={selectedList?.name ?? "Selected list"}
                    selected={employee.id === employeeId}
                    onSelect={() => onEmployeeChange(employee.id)}
                  />
                ))}
              </div>
              <Pagination
                page={employeePage}
                totalPages={employees.data.pagination.totalPages}
                total={employees.data.pagination.total}
                limit={pageLimit}
                fetching={employees.isFetching}
                showLimit={false}
                onPage={(value) => {
                  setEmployeePage(value);
                  onEmployeeChange("");
                }}
                onLimit={() => undefined}
              />
            </>
          ) : (
            <div className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
              This employee list has no employees.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

function EmployeeChoice({
  employee,
  listName,
  selected,
  onSelect,
}: {
  employee: Employee;
  listName: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const linked = isEmployeeLinked(employee);
  return (
    <button
      type="button"
      disabled={linked}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-md border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-55",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:border-primary/25 hover:bg-muted/30",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md",
          selected ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {selected ? (
          <Check className="size-4" />
        ) : (
          <UserRound className="size-4" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{employee.fullName}</span>
        <span className="mt-1 block text-xs text-muted-foreground">
          {employee.jobTitle || "No job title"} · {listName}
        </span>
        <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Employment: {employee.status}</span>
          <span>Account: {friendlyEmployeeStatus(employee)}</span>
        </span>
        {linked ? (
          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            <Link2 className="size-3" /> Already linked to a business member
          </span>
        ) : null}
      </span>
    </button>
  );
}
