"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { SelectControl } from "@/components/ui/select";
import { useBusinessMembersQuery } from "@/features/business/business-member-hooks";
import { useBusinessEmployeesQuery } from "@/features/employees/employee-hooks";
import type { AuditDomain } from "@/lib/audit-api";
import {
  auditFiltersFromSearch,
  localDateBoundary,
  visibleAuditDomains,
} from "../audit-utils";

const domainOptions: Array<[AuditDomain, string]> = [
  ["business", "Business"], ["member", "Membership"],
  ["employee", "Employees"], ["policy", "Policies"], ["security", "Security"],
];

type OrganizationAuditFiltersProps = {
  businessId: string;
  filters: ReturnType<typeof auditFiltersFromSearch>;
  searchParams: URLSearchParams;
  canViewPolicy: boolean;
  canViewActors: boolean;
  canViewEmployees: boolean;
  updateUrl: (updates: Record<string, string | undefined>, resetPage?: boolean) => void;
};

export function OrganizationAuditFilters({
  businessId, filters, searchParams, canViewPolicy, canViewActors,
  canViewEmployees, updateUrl,
}: OrganizationAuditFiltersProps) {
  const [domain, setDomain] = useState(filters.domain ?? "");
  const [action, setAction] = useState(filters.action ?? "");
  const [from, setFrom] = useState(searchParams.get("fromDate") ?? "");
  const [to, setTo] = useState(searchParams.get("toDate") ?? "");

  function clear() {
    setDomain(""); setAction(""); setFrom(""); setTo("");
    updateUrl({ domain: undefined, action: undefined, actorId: undefined,
      actorName: undefined, employeeId: undefined, employeeName: undefined,
      from: undefined, to: undefined, fromDate: undefined, toDate: undefined });
  }

  return (
    <section className="mt-6 rounded-md border border-border bg-card p-4" aria-label="Organization audit filters">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-xs font-medium">Domain
          <SelectControl className="h-9 w-full" value={domain} onChange={(event) => setDomain(event.target.value as AuditDomain | "")}>
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
        <Button onClick={() => updateUrl({ domain: domain || undefined, action: action.trim() || undefined, from: localDateBoundary(from), to: localDateBoundary(to, true), fromDate: from || undefined, toDate: to || undefined })}>Apply filters</Button>
        <Button variant="ghost" onClick={clear}>Clear filters</Button>
      </div>
    </section>
  );
}

function ActorPicker({ businessId, selectedId, selectedName, onSelect }: { businessId: string; selectedId?: string; selectedName?: string; onSelect: (id?: string, name?: string) => void }) {
  const [page, setPage] = useState(1);
  const query = useBusinessMembersQuery(businessId, page, 10, true);
  const items = query.data?.items ?? [];
  return <div className="rounded-md border border-border p-3"><label className="text-xs font-medium">Actor<SelectControl className="mt-2 h-9 w-full" value={selectedId ?? ""} onChange={(event) => { const member = items.find((item) => item.id === event.target.value); onSelect(member?.id, member?.userId.name); }}><option value="">All actors</option>{selectedId && !items.some((item) => item.id === selectedId) ? <option value={selectedId}>{selectedName ?? "Selected member"}</option> : null}{items.map((member) => <option key={member.id} value={member.id}>{member.userId.name}</option>)}</SelectControl></label><PickerPaging page={page} totalPages={query.data?.pagination.totalPages ?? 1} onPage={setPage} /></div>;
}

function EmployeePicker({ businessId, selectedId, selectedName, onSelect }: { businessId: string; selectedId?: string; selectedName?: string; onSelect: (id?: string, name?: string) => void }) {
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useBusinessEmployeesQuery(businessId, { page, limit: 10, ...(search ? { search } : {}) });
  const items = query.data?.items ?? [];
  return <div className="rounded-md border border-border p-3"><form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); setSearch(draftSearch.trim()); setPage(1); }}><label className="flex-1 text-xs font-medium">Find employee<Input className="mt-2" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search by name" /></label><Button className="mt-7" type="submit" variant="outline">Search</Button></form><label className="mt-3 block text-xs font-medium">Employee<SelectControl className="mt-2 h-9 w-full" value={selectedId ?? ""} onChange={(event) => { const employee = items.find((item) => item.id === event.target.value); onSelect(employee?.id, employee?.fullName); }}><option value="">All employees</option>{selectedId && !items.some((item) => item.id === selectedId) ? <option value={selectedId}>{selectedName ?? "Selected employee"}</option> : null}{items.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</SelectControl></label><PickerPaging page={page} totalPages={query.data?.pagination.totalPages ?? 1} onPage={setPage} /></div>;
}

function PickerPaging({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  return <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground"><span>Page {page} of {Math.max(1, totalPages)}</span><div className="flex gap-1"><Button size="xs" variant="ghost" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button><Button size="xs" variant="ghost" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</Button></div></div>;
}
