"use client";

import { DateInput } from "@/components/ui/date-input";

import { SelectControl } from "@/components/ui/select";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { Pagination } from "@/features/business/pagination";
import { businessErrorMessage } from "@/lib/business-api";
import type { AuditFilters } from "@/lib/policy-api";
import { policyPermissions } from "./policy-helpers";
import { usePolicyAuditQuery } from "./policy-hooks";
import { PolicyAuditTable } from "./components/policy-audit-table";
import { AuditType } from "@/lib/audit-api";

const entityTypes: AuditType[] = [
  "business",
  "membership",
  "employee",
  "policy",
  "personal",
  "security",
];

export function PolicyAuditPage({ businessId }: { businessId: string }) {
  const access = policyPermissions(useBusinessAccess().effectivePermissions);
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState<AuditType | "">("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applied, setApplied] = useState<Omit<AuditFilters, "page" | "limit">>(
    {},
  );
  const filters: AuditFilters = { page, limit: 20, ...applied };
  const audit = usePolicyAuditQuery(businessId, filters, access.audit);
  if (!access.audit)
    return (
      <FeedbackState
        title="Unable to load policy data"
        message="You do not have permission to view policy audit history."
        retry={() => undefined}
      />
    );
  if (audit.isLoading) return <Loading label="Loading policy audit…" />;
  return (
    <>
      <Link
        href={`/business/${businessId}/policies`}
        className="text-sm font-medium text-primary"
      >
        ← Policies
      </Link>
      <div className="mt-4">
        <h1 className="text-3xl font-bold">Policy audit</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Immutable policy, rule, assignment, and reconciliation history.
        </p>
      </div>
      <form
        className="mt-6 grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setApplied({
            ...(entityType ? { entityType } : {}),
            ...(action.trim() ? { action: action.trim() } : {}),
            ...(from ? { from: new Date(from).toISOString() } : {}),
            ...(to ? { to: new Date(to).toISOString() } : {}),
          });
        }}
      >
        <label className="space-y-2 text-xs font-medium">
          Entity type
          <SelectControl
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={entityType}
            onChange={(event) =>
              setEntityType(event.target.value as AuditType | "")
            }
          >
            <option value="">All entities</option>
            {entityTypes.map((value) => (
              <option key={value} value={value}>
                {/* {value.replaceAll("_", " ")} */}
              </option>
            ))}
          </SelectControl>
        </label>
        <label className="space-y-2 text-xs font-medium">
          Action
          <Input
            value={action}
            onChange={(event) => setAction(event.target.value)}
          />
        </label>
        <label className="space-y-2 text-xs font-medium">
          From
          <DateInput
            kind="datetime-local"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="space-y-2 text-xs font-medium">
          To
          <DateInput
            kind="datetime-local"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit">Apply filters</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setEntityType("");
              setAction("");
              setFrom("");
              setTo("");
              setApplied({});
              setPage(1);
            }}
          >
            Clear
          </Button>
        </div>
      </form>
      <div className="mt-5">
        {audit.error ? (
          <FeedbackState
            title="Unable to load policy data"
            message={businessErrorMessage(audit.error)}
            retry={() => void audit.refetch()}
          />
        ) : (
          <>
            <PolicyAuditTable items={audit.data?.items ?? []} />
            <Pagination
              page={audit.data?.pagination.page ?? 1}
              totalPages={audit.data?.pagination.totalPages ?? 0}
              total={audit.data?.pagination.total ?? 0}
              limit={20}
              fetching={audit.isFetching}
              showLimit={false}
              onPage={setPage}
              onLimit={() => undefined}
            />
          </>
        )}
      </div>
    </>
  );
}
