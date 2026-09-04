"use client";

import { DateInput } from "@/components/ui/date-input";

import { SelectControl } from "@/components/ui/select";

import {
  Building2,
  ChevronDown,
  FileText,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessPageHeader } from "@/features/business/business-page-header";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { useBusinessMembersQuery } from "@/features/business/business-member-hooks";
import { Pagination } from "@/features/business/pagination";
import { useBusinessEmployeesQuery } from "@/features/employees/employee-hooks";
import { Badge } from "@/features/access/shared";
import { BusinessApiError } from "@/lib/business-api";
import type { AuditDomain, AuditItem, AuditPage } from "@/lib/audit-api";

import { useOrganizationAuditQuery, usePersonalAuditQuery } from "./audit-hooks";
import {
  auditFiltersFromSearch,
  auditQueryAccess,
  displayAuditValue,
  humanizeAuditField,
  localDateBoundary,
  resolveAuditScope,
  updateAuditSearch,
  visibleAuditDomains,
} from "./audit-utils";

const domainOptions: Array<[AuditDomain, string]> = [
  ["business", "Business"],
  ["member", "Membership"],
  ["employee", "Employees"],
  ["policy", "Policies"],
  ["security", "Security"],
];

export function BusinessAuditPage({ businessId }: { businessId: string }) {
  const { business, effectivePermissions } = useBusinessAccess();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const canViewOrganization = effectivePermissions.has("audit_logs:view");
  const canViewPolicy = effectivePermissions.has("policies:view_audit");
  const scope = resolveAuditScope(searchParams.get("scope"), canViewOrganization);
  const queryAccess = auditQueryAccess(scope, canViewOrganization);
  const filters = useMemo(
    () => auditFiltersFromSearch(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const organization = useOrganizationAuditQuery(
    businessId,
    filters,
    queryAccess.organization,
  );
  const personal = usePersonalAuditQuery(
    businessId,
    filters.page,
    filters.limit,
    queryAccess.personal,
  );
  const query = scope === "organization" ? organization : personal;

  const updateUrl = (updates: Record<string, string | undefined>, resetPage = true) => {
    const next = updateAuditSearch(new URLSearchParams(searchParams.toString()), updates, resetPage);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const selectScope = (nextScope: "organization" | "me") => {
    const clear = nextScope === "me"
      ? Object.fromEntries([
          "domain", "action", "actorId", "actorName", "employeeId", "employeeName", "from", "to",
        ].map((key) => [key, undefined]))
      : {};
    updateUrl({ ...clear, scope: nextScope }, true);
  };

  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <BusinessPageHeader
          eyebrow={business.name}
          title="Audit & activity"
          description={scope === "organization"
            ? "Review sanitized business, membership, employee, policy, and security events."
            : "Review actions you performed and changes directly affecting your membership or linked employee record."}
          tabs={[
            ...(canViewOrganization ? [{ label: "Organization Audit", active: scope === "organization", onSelect: () => selectScope("organization") }] : []),
            { label: "My Activity", active: scope === "me", onSelect: () => selectScope("me") },
          ]}
        />

        {scope === "organization" ? (
          <OrganizationFilters
            key={searchParams.toString()}
            businessId={businessId}
            filters={filters}
            searchParams={searchParams}
            canViewPolicy={canViewPolicy}
            canViewActors={effectivePermissions.has("members:view")}
            canViewEmployees={effectivePermissions.has("employees:view")}
            updateUrl={updateUrl}
          />
        ) : (
          <div className="mt-6 rounded-md border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
            This feed includes actions you performed, changes where you are the subject, changes to your linked employee record, and sanitized policy assignment effects affecting you. It does not include another member&apos;s activity or organization-wide history.
          </div>
        )}

        <AuditResults
          scope={scope}
          query={query}
          onPersonal={() => selectScope("me")}
          onRetry={() => void query.refetch()}
          onPage={(page) => updateUrl({ page: String(page) }, false)}
          onLimit={(limit) => updateUrl({ limit: String(limit), page: undefined }, false)}
        />
      </div>
    </div>
  );
}

function OrganizationFilters({
  businessId,
  filters,
  searchParams,
  canViewPolicy,
  canViewActors,
  canViewEmployees,
  updateUrl,
}: {
  businessId: string;
  filters: ReturnType<typeof auditFiltersFromSearch>;
  searchParams: URLSearchParams;
  canViewPolicy: boolean;
  canViewActors: boolean;
  canViewEmployees: boolean;
  updateUrl: (updates: Record<string, string | undefined>, resetPage?: boolean) => void;
}) {
  const [domain, setDomain] = useState(filters.domain ?? "");
  const [action, setAction] = useState(filters.action ?? "");
  const [from, setFrom] = useState(searchParams.get("fromDate") ?? "");
  const [to, setTo] = useState(searchParams.get("toDate") ?? "");

  const clear = () => {
    setDomain(""); setAction(""); setFrom(""); setTo("");
    updateUrl({
      domain: undefined, action: undefined, actorId: undefined, actorName: undefined,
      employeeId: undefined, employeeName: undefined, from: undefined, to: undefined,
      fromDate: undefined, toDate: undefined,
    });
  };

  return (
    <section className="mt-6 rounded-md border border-border bg-card p-4" aria-label="Organization audit filters">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-xs font-medium">
          Domain
          <SelectControl className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={domain} onChange={(event) => setDomain(event.target.value as AuditDomain | "")}>
            <option value="">All activity</option>
            {domainOptions.filter(([value]) => visibleAuditDomains(canViewPolicy).includes(value)).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </SelectControl>
        </label>
        <label className="space-y-2 text-xs font-medium">Action<Input value={action} onChange={(event) => setAction(event.target.value)} placeholder="e.g. member updated" /></label>
        <label className="space-y-2 text-xs font-medium">From date<DateInput kind="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
        <label className="space-y-2 text-xs font-medium">To date<DateInput kind="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {canViewActors ? <ActorPicker businessId={businessId} selectedId={filters.actorId} selectedName={searchParams.get("actorName") ?? undefined} onSelect={(id, name) => updateUrl({ actorId: id, actorName: name })} /> : null}
        {canViewEmployees ? <EmployeePicker businessId={businessId} selectedId={filters.employeeId} selectedName={searchParams.get("employeeName") ?? undefined} onSelect={(id, name) => updateUrl({ employeeId: id, employeeName: name })} /> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => updateUrl({
          domain: domain || undefined,
          action: action.trim() || undefined,
          from: localDateBoundary(from),
          to: localDateBoundary(to, true),
          fromDate: from || undefined,
          toDate: to || undefined,
        })}>Apply filters</Button>
        <Button variant="ghost" onClick={clear}>Clear filters</Button>
      </div>
    </section>
  );
}

function ActorPicker({ businessId, selectedId, selectedName, onSelect }: { businessId: string; selectedId?: string; selectedName?: string; onSelect: (id?: string, name?: string) => void }) {
  const [page, setPage] = useState(1);
  const query = useBusinessMembersQuery(businessId, page, 10, true);
  const items = query.data?.items ?? [];
  return (
    <div className="rounded-md border border-border p-3">
      <label className="text-xs font-medium">Actor
        <SelectControl className="mt-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={selectedId ?? ""} onChange={(event) => { const member = items.find((item) => item.id === event.target.value); onSelect(member?.id, member?.userId.name); }}>
          <option value="">All actors</option>
          {selectedId && !items.some((item) => item.id === selectedId) ? <option value={selectedId}>{selectedName ?? "Selected member"}</option> : null}
          {items.map((member) => <option key={member.id} value={member.id}>{member.userId.name}</option>)}
        </SelectControl>
      </label>
      <PickerPaging page={page} totalPages={query.data?.pagination.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}

function EmployeePicker({ businessId, selectedId, selectedName, onSelect }: { businessId: string; selectedId?: string; selectedName?: string; onSelect: (id?: string, name?: string) => void }) {
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useBusinessEmployeesQuery(businessId, { page, limit: 10, ...(search ? { search } : {}) });
  const items = query.data?.items ?? [];
  return (
    <div className="rounded-md border border-border p-3">
      <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); setSearch(draftSearch.trim()); setPage(1); }}>
        <label className="flex-1 text-xs font-medium">Find employee<Input className="mt-2" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search by name" /></label>
        <Button className="mt-7" type="submit" variant="outline">Search</Button>
      </form>
      <label className="mt-3 block text-xs font-medium">Employee
        <SelectControl className="mt-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={selectedId ?? ""} onChange={(event) => { const employee = items.find((item) => item.id === event.target.value); onSelect(employee?.id, employee?.fullName); }}>
          <option value="">All employees</option>
          {selectedId && !items.some((item) => item.id === selectedId) ? <option value={selectedId}>{selectedName ?? "Selected employee"}</option> : null}
          {items.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
        </SelectControl>
      </label>
      <PickerPaging page={page} totalPages={query.data?.pagination.totalPages ?? 1} onPage={setPage} />
    </div>
  );
}

function PickerPaging({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  return <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>Page {page} of {Math.max(1, totalPages)}</span><div className="flex gap-1"><Button size="xs" variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button><Button size="xs" variant="ghost" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button></div></div>;
}

function AuditResults({ scope, query, onPersonal, onRetry, onPage, onLimit }: { scope: "organization" | "me"; query: { data?: AuditPage; error: unknown; isLoading: boolean; isFetching: boolean }; onPersonal: () => void; onRetry: () => void; onPage: (page: number) => void; onLimit: (limit: number) => void }) {
  if (query.isLoading) return <AuditLoading />;
  if (query.error) return <AuditError error={query.error} scope={scope} onPersonal={onPersonal} onRetry={onRetry} />;
  const data = query.data;
  return <section className="mt-6" aria-live="polite">{data?.items.length ? <AuditTimeline items={data.items} /> : <div className="rounded-md border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">{scope === "organization" ? "No organization audit events match these filters." : "No activity affecting you has been recorded yet."}</div>}{data ? <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} limit={data.pagination.limit} fetching={query.isFetching} onPage={onPage} onLimit={onLimit} /> : null}</section>;
}

function AuditLoading() {
  return (
    <div className="mt-6 space-y-3" aria-label="Loading audit activity">
      {[1, 2, 3].map((item) => (
        <Skeleton
          key={item}
          className="h-28 border border-border bg-muted/40"
        />
      ))}
    </div>
  );
}

function AuditError({
  error,
  scope,
  onPersonal,
  onRetry,
}: {
  error: unknown;
  scope: "organization" | "me";
  onPersonal: () => void;
  onRetry: () => void;
}) {
  const status = error instanceof BusinessApiError ? error.status : undefined;
  const message =
    status === 401
      ? "Your session has expired. Please sign in again."
      : status === 403
        ? scope === "organization"
          ? "You do not have permission to view organization audit activity."
          : "An active business membership is required to view your activity."
        : "Audit activity could not be loaded.";
  return (
    <FeedbackState
      className="mt-6"
      variant="inline"
      title={
        status === 403 ? "Permission required" : "Unable to load audit activity"
      }
      message={message}
      action={
        status === 403 && scope === "organization" ? (
          <Button onClick={onPersonal}>View My Activity</Button>
        ) : null
      }
      retry={status !== 401 && status !== 403 ? onRetry : undefined}
    />
  );
}

const domainVisuals = {
  business: { label: "Business", icon: Building2 },
  member: { label: "Membership", icon: Users },
  employee: { label: "Employee", icon: UserRound },
  policy: { label: "Policy", icon: FileText },
  security: { label: "Security", icon: LockKeyhole },
};

export function AuditTimeline({ items }: { items: AuditItem[] }) {
  return <ol className="space-y-3">{items.map((item) => <AuditEventCard key={item.id} item={item} />)}</ol>;
}

function AuditEventCard({ item }: { item: AuditItem }) {
  const [open, setOpen] = useState(false);
  const visual = domainVisuals[item.domain] ?? { label: "Activity", icon: ShieldCheck };
  const Icon = visual.icon;
  const changesId = `audit-${item.id}-changes`;
  return <li><article className="rounded-md border border-border bg-card p-4 shadow-sm sm:p-5"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold">{item.summary}</p><time className="mt-1 block text-xs text-muted-foreground" dateTime={item.occurredAt}>{new Date(item.occurredAt).toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" })}</time></div><Badge>{visual.label}</Badge></div>{item.actor || item.subject ? <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">{item.actor ? <div><dt className="text-xs text-muted-foreground">Actor</dt><dd className="mt-0.5 font-medium">{item.actor.displayName}</dd></div> : null}{item.subject ? <div><dt className="text-xs text-muted-foreground">Subject</dt><dd className="mt-0.5 font-medium">{item.subject.displayName}</dd></div> : null}</dl> : null}{item.reason ? <p className="mt-3 text-sm text-muted-foreground">Reason: {item.reason}</p> : null}{item.changes?.length ? <div className="mt-4 border-t border-border pt-3"><Button size="sm" variant="ghost" aria-expanded={open} aria-controls={changesId} onClick={() => setOpen((value) => !value)}><ChevronDown className={`transition ${open ? "rotate-180" : ""}`} />{open ? "Hide changes" : "View changes"}</Button>{open ? <div id={changesId} className="mt-3 space-y-2"><div className="hidden grid-cols-[1fr_1fr_1fr] gap-3 px-3 text-xs font-semibold text-muted-foreground sm:grid"><span>Field</span><span>Before</span><span>After</span></div>{item.changes.map((change, index) => <div key={`${change.field}-${index}`} className="grid gap-2 rounded-md border border-border p-3 text-sm sm:grid-cols-[1fr_1fr_1fr]"><div><span className="text-xs text-muted-foreground sm:hidden">Field</span><p className="font-medium">{humanizeAuditField(change.field)}</p></div><div><span className="text-xs text-muted-foreground sm:hidden">Before</span><p className="text-muted-foreground">{displayAuditValue(change.before)}</p></div><div><span className="text-xs text-muted-foreground sm:hidden">After</span><p className="font-medium text-foreground">{displayAuditValue(change.after)}</p></div></div>)}</div> : null}</div> : null}</div></div></article></li>;
}
