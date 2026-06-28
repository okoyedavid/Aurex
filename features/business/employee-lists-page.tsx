"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CreateListDialog } from "./components/employee-list-dialogs";
import { useBusinessAccess } from "./business-access-context";
import { employeeListKeys, useEmployeeListsQuery } from "./employee-list-hooks";
import {
  friendlyListStatus,
  normalizePagination,
} from "./employee-list-display";
import { getEmployeeLists } from "@/lib/employee-lists-api";
import { BusinessApiError } from "@/lib/business-api";

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
      <PageFrame>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Loading employee lists…
        </div>
      </PageFrame>
    );
  if (
    query.error instanceof BusinessApiError && query.error.status === 403
  )
    return (
      <PageFrame>
        <State
          title="Permission required"
          detail="You do not have permission to view employee lists for this business."
        />
      </PageFrame>
    );
  if (query.isError)
    return (
      <PageFrame>
        <State
          title="Unable to load employee lists"
          detail={
            query.error instanceof Error ? query.error.message : "Try again."
          }
          retry={() => query.refetch()}
        />
      </PageFrame>
    );
  const data = query.data!;
  return (
    <PageFrame>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {access.business.name}
          </p>
          <h1 className="mt-1 text-3xl font-bold">Employee Lists</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage payroll groups and employee verification.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setOpen(true)}>
            <Plus />
            Create list
          </Button>
        )}
      </div>
      <div className="mt-7 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        {data.items.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold">No employee lists</h2>
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
                      href={`/business/${businessId}/employee-lists/${item.id}`}
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
                      {item.description || "No description"}
                    </p>
                  </td>
                  <td className="p-4">
                    {item.currency} · {labelFrequency(item.defaultPayFrequency)}
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
    </PageFrame>
  );
}
function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">{children}</div>
    </div>
  );
}
function State({
  title,
  detail,
  retry,
}: {
  title: string;
  detail: string;
  retry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <AlertCircle className="mx-auto text-muted-foreground" />
      <h1 className="mt-3 font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      {retry && (
        <Button className="mt-4" variant="outline" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-4 font-medium">{children}</th>;
}
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {children}
    </span>
  );
}
export function labelFrequency(value: string) {
  return value.replace("_", " ").replace(/^./, (c) => c.toUpperCase());
}
export function Pagination({
  page,
  totalPages,
  total,
  limit,
  fetching,
  onPage,
  onLimit,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  fetching: boolean;
  onPage: (page: number) => void;
  onLimit: (limit: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="text-muted-foreground">
        Page {page} of {Math.max(1, totalPages)} · {total} items{" "}
        {fetching && <span className="ml-2">Updating…</span>}
      </div>
      <div className="flex items-center gap-2">
        <label>
          Rows{" "}
          <select
            className="h-8 rounded-md border border-input bg-background px-2"
            value={limit}
            onChange={(e) => onLimit(Number(e.target.value))}
          >
            <option>20</option>
            <option>50</option>
            <option>100</option>
          </select>
        </label>
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={page >= totalPages || fetching}
          onClick={() => onPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
