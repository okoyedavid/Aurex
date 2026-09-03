"use client";

import { Button } from "@/components/ui/button";
import { BusinessApiError } from "@/lib/business-api";
import { getEmployeeLists } from "@/lib/employee-lists-api";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useBusinessAccess } from "./business-access-context";
import { CreateListDialog } from "./components/create-list-dialog";
import {
  friendlyListStatus,
  normalizePagination,
} from "./employee-list-display";
import { employeeListKeys, useEmployeeListsQuery } from "./employee-list-hooks";
import { EmployeeListsState as State } from "./employee-lists-state";
import { Pagination } from "./pagination";
import { StatusBadge as Badge } from "./status-badge";
import { TableHeading as Th } from "./table-heading";

export function EmployeeListsPage({ businessId }: { businessId: string }) {
  const search = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const page = normalizePagination(search.get("page"), 1);
  const limit = normalizePagination(search.get("limit"), 20, 100);
  const query = useEmployeeListsQuery(businessId, page, limit);
  const access = useBusinessAccess();
  const [open, setOpen] = useState(false);
  const canCreate = access.effectivePermissions.has("employee_lists:create");
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
    const p = query.data?.pagination;
    if (p && page < p.totalPages)
      void qc.prefetchQuery({
        queryKey: employeeListKeys.collection(businessId, page + 1, limit),
        queryFn: () => getEmployeeLists(businessId, page + 1, limit),
      });
  }, [businessId, page, limit, query.data?.pagination, qc]);
  useEffect(() => {
    if (
      query.data &&
      query.data.items.length === 0 &&
      page > 1 &&
      page > Math.max(1, query.data.pagination.totalPages)
    )
      navigate(Math.max(1, query.data.pagination.totalPages));
  }, [query.data, page, navigate]);

  if (query.isLoading)
    return (
      <>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Loading employee lists
        </div>
      </>
    );
  if (query.error instanceof BusinessApiError && query.error.status === 403)
    return (
      <>
        <State
          title="Permission required"
          detail="You do not have permission to view employee lists for this business."
        />
      </>
    );

  if (query.isError)
    return (
      <>
        <State
          title="Unable to load employee lists"
          detail={
            query.error instanceof Error ? query.error.message : "Try again."
          }
          retry={() => query.refetch()}
        />
      </>
    );
  const data = query.data!;
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {access.business.name}
          </p>
          <h1 className="mt-1 text-3xl font-bold">Departments</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Organize employees into departments and manage payroll verification.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setOpen(true)}>
            <Plus />
            Create list
          </Button>
        )}
      </div>
      <div className="mt-7 overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        {data.items.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold">No departments</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a list to organize payroll employees.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <Th>List</Th>
                <Th>Defaults</Th>
                <Th>Employees</Th>
                <Th>Verification</Th>
                <Th>Last checked</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <Link
                      className="font-semibold text-primary hover:underline"
                      href={`/business/${businessId}/employees/employee-lists/${item.id}`}
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                      {item.description || "No description"}
                    </p>
                  </td>
                  <td className="p-4">
                    {item.currency}·{labelFrequency(item.defaultPayFrequency)}
                  </td>
                  <td className="p-4">
                    {item.totalEmployeeCount} total
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {item.pendingVerificationCount} pending ·{" "}
                      {item.verifiedEmployeeCount} verified ·{" "}
                      {item.invalidEmployeeCount + item.verificationErrorCount}{" "}
                      failed/error
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge>{friendlyListStatus(item.validationStatus)}</Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {item.lastValidationAt
                      ? new Date(item.lastValidationAt).toLocaleString()
                      : "Never"}
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
        fetching={query.isFetching}
        onPage={(value) => navigate(value)}
        onLimit={(value) => navigate(1, value)}
      />
      <CreateListDialog
        businessId={businessId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
export function labelFrequency(value: string) {
  return value.replace("_", " ").replace(/^./, (c) => c.toUpperCase());
}
