"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { businessErrorMessage } from "@/lib/business-api";
import {
  useEmployeeListsQuery,
  useEmployeesQuery,
} from "@/features/business/employee-list-hooks";
import { Pagination } from "@/features/business/pagination";
import { PolicyEmpty, PolicyError } from "./policy-ui";

export function EmployeePolicyLookup({ businessId }: { businessId: string }) {
  const [listPage, setListPage] = useState(1);
  const [listId, setListId] = useState("");
  const [employeePage, setEmployeePage] = useState(1);
  const lists = useEmployeeListsQuery(businessId, listPage, 20);
  const employees = useEmployeesQuery(
    businessId,
    listId,
    employeePage,
    20,
  );

  return (
    <section className="mt-8 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-lg font-bold">Employee policies</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a department, then select an employee. Both lists load one
          page at a time.
        </p>
      </div>

      {lists.isLoading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" /> Loading departments…
        </div>
      ) : lists.error ? (
        <div className="mt-4">
          <PolicyError
            message={businessErrorMessage(lists.error)}
            retry={() => void lists.refetch()}
          />
        </div>
      ) : (
        <>
          <label className="mt-4 block max-w-md space-y-2 text-sm font-medium">
            Department / employee list
            <select
              className="h-9 w-full rounded-lg border border-input bg-background px-3"
              value={listId}
              onChange={(event) => {
                setListId(event.target.value);
                setEmployeePage(1);
              }}
            >
              <option value="">Select department</option>
              {lists.data?.items.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </label>
          <Pagination
            page={lists.data?.pagination.page ?? 1}
            totalPages={lists.data?.pagination.totalPages ?? 0}
            total={lists.data?.pagination.total ?? 0}
            limit={20}
            fetching={lists.isFetching}
            showLimit={false}
            onPage={(page) => {
              setListId("");
              setListPage(page);
            }}
            onLimit={() => undefined}
          />
        </>
      )}

      {listId ? (
        employees.isLoading ? (
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" /> Loading employees…
          </div>
        ) : employees.error ? (
          <div className="mt-5">
            <PolicyError
              message={businessErrorMessage(employees.error)}
              retry={() => void employees.refetch()}
            />
          </div>
        ) : employees.data?.items.length ? (
          <>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {employees.data.items.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{employee.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {employee.jobTitle || "No job title"}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/business/${businessId}/employee-lists/${listId}/employees/${employee.id}/policies`}
                    >
                      Policies <ArrowRight />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            <Pagination
              page={employees.data.pagination.page}
              totalPages={employees.data.pagination.totalPages}
              total={employees.data.pagination.total}
              limit={20}
              fetching={employees.isFetching}
              showLimit={false}
              onPage={setEmployeePage}
              onLimit={() => undefined}
            />
          </>
        ) : (
          <div className="mt-5">
            <PolicyEmpty title="No employees in this department." />
          </div>
        )
      ) : null}
    </section>
  );
}
