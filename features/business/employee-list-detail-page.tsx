"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Plus, Pencil } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BusinessApiError } from "@/lib/business-api";
import type { Employee } from "@/lib/employee-lists-api";
import { getEmployees } from "@/lib/employee-lists-api";
import { useBusinessAccess } from "./business-access-context";
import {
  friendlyEmployeeStatus,
  friendlyListStatus,
  maskAccountNumber,
  normalizePagination,
  safeEmployeeFailure,
} from "./employee-list-display";
import {
  employeeListKeys,
  useEmployeeListQuery,
  useEmployeesQuery,
  useVerificationStatusQuery,
} from "./employee-list-hooks";
import { labelFrequency } from "./employee-lists-page";
import { Pagination } from "./pagination";
import { StatusBadge as Badge } from "./status-badge";
import { EmployeeListDetailFrame as Frame } from "./employee-list-detail-frame";
import { EmployeeListDetailState as State } from "./employee-list-detail-state";
import { EmployeeListMetric as Metric } from "./employee-list-metric";
import { TableHeading as Th } from "./table-heading";
import { EditListDialog } from "./components/edit-list-dialog";
import { EmployeeDialog } from "./components/employee-dialog";

export function EmployeeListDetailPage({
  businessId,
  employeeListId,
}: {
  businessId: string;
  employeeListId: string;
}) {
  const search = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const page = normalizePagination(search.get("page"), 1);
  const limit = normalizePagination(search.get("limit"), 20, 100);
  const access = useBusinessAccess();
  const listQuery = useEmployeeListQuery(businessId, employeeListId);
  const employees = useEmployeesQuery(businessId, employeeListId, page, limit);
  const verification = useVerificationStatusQuery(businessId, employeeListId);
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [editListOpen, setEditListOpen] = useState(false);
  const [editing, setEditing] = useState<Employee>();
  const canCreate = access.effectivePermissions.has("employees:create");
  const canEditList = access.effectivePermissions.has("employee_lists:update");
  const canEditEmployee = access.effectivePermissions.has("employees:update");
  const navigate = useCallback(
    (nextPage: number, nextLimit = limit) => {
      const params = new URLSearchParams(search.toString());
      params.set("page", String(nextPage));
      params.set("limit", String(nextLimit));
      router.push(`?${params}`);
    },
    [limit, router, search],
  );
  useEffect(() => {
    if (
      search.get("page") !== String(page) ||
      search.get("limit") !== String(limit)
    ) {
      const params = new URLSearchParams(search.toString());
      params.set("page", String(page));
      params.set("limit", String(limit));
      router.replace(`?${params}`);
    }
  }, [page, limit, router, search]);
  useEffect(() => {
    const p = employees.data?.pagination;
    if (p && page < p.totalPages)
      void qc.prefetchQuery({
        queryKey: employeeListKeys.employees(
          businessId,
          employeeListId,
          page + 1,
          limit,
        ),
        queryFn: () =>
          getEmployees(businessId, employeeListId, page + 1, limit),
      });
  }, [businessId, employeeListId, page, limit, employees.data?.pagination, qc]);
  useEffect(() => {
    if (
      employees.data &&
      employees.data.items.length === 0 &&
      page > Math.max(1, employees.data.pagination.totalPages)
    )
      navigate(Math.max(1, employees.data.pagination.totalPages));
  }, [employees.data, page, navigate]);

  const error = listQuery.error || employees.error;
  const status = error instanceof BusinessApiError ? error.status : 0;
  if (listQuery.isLoading || employees.isLoading)
    return (
      <Frame>
        <div className="flex gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Loading employee list…
        </div>
      </Frame>
    );
  if (status === 403)
    return (
      <Frame>
        <State
          title="Permission required"
          detail="You do not have permission to view this employee list."
        />
      </Frame>
    );
  if (status === 404)
    return (
      <Frame>
        <State
          title="Employee list not found"
          detail="This list may have been removed or does not belong to this business."
        />
      </Frame>
    );
  if (error || !listQuery.data || !employees.data)
    return (
      <Frame>
        <State
          title="Unable to load employee list"
          detail={error instanceof Error ? error.message : "Try again."}
          retry={() => {
            void listQuery.refetch();
            void employees.refetch();
          }}
        />
      </Frame>
    );
  const list = listQuery.data;
  const progress = verification.data ?? list;
  const data = employees.data;
  return (
    <Frame>
      <Link
        href={`/business/${businessId}/employee-lists`}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft />
        Employee Lists
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
          {canEditList && (
            <Button variant="outline" onClick={() => setEditListOpen(true)}>
              <Pencil />
              Edit list
            </Button>
          )}
          {canCreate && (
            <Button
              onClick={() => {
                setEditing(undefined);
                setEmployeeOpen(true);
              }}
            >
              <Plus />
              Add employee
            </Button>
          )}
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
      <div className="mt-7 overflow-x-auto rounded-xl border border-border bg-card">
        {data.items.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold">No employees in this list</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add an employee when you are ready.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>Employee</Th>
                <Th>Bank account</Th>
                <Th>Pay</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((employee) => (
                <tr key={employee.id}>
                  <td className="p-4">
                    <p className="font-semibold">{employee.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {employee.jobTitle || "No job title"}
                    </p>
                  </td>
                  <td className="p-4">
                    {employee.bankName}
                    {employee.accountName && (
                      <p className="mt-1 font-medium">{employee.accountName}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {maskAccountNumber(employee.accountNumber)}
                    </p>
                  </td>
                  <td className="p-4">
                    {employee.currency}{" "}
                    {Number(employee.amount).toLocaleString()}
                    <p className="text-xs text-muted-foreground">
                      {labelFrequency(employee.payFrequency)}
                    </p>
                  </td>
                  <td className="p-4">
                    <Badge>{friendlyEmployeeStatus(employee)}</Badge>
                    {safeEmployeeFailure(employee) && (
                      <p className="mt-1 max-w-xs text-xs text-destructive">
                        {safeEmployeeFailure(employee)}
                      </p>
                    )}
                  </td>
                  <td className="p-4">
                    {canEditEmployee && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(employee);
                          setEmployeeOpen(true);
                        }}
                      >
                        <Pencil />
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        total={data.pagination.total}
        limit={limit}
        fetching={employees.isFetching}
        onPage={(value) => navigate(value)}
        onLimit={(value) => navigate(1, value)}
      />
      {employeeOpen && (
        <EmployeeDialog
          businessId={businessId}
          listId={employeeListId}
          employee={editing}
          open
          onOpenChange={setEmployeeOpen}
        />
      )}
      {canEditList && editListOpen && (
        <EditListDialog
          businessId={businessId}
          list={list}
          open
          onOpenChange={setEditListOpen}
        />
      )}
    </Frame>
  );
}
