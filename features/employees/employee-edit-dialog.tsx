"use client";

import { DateInput } from "@/components/ui/date-input";

import { SelectControl } from "@/components/ui/select";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEmployeeGroupsQuery, useEmployeeTypesQuery } from "@/features/business/employee-classification-hooks";
import { useEmployeeListsQuery } from "@/features/business/employee-list-hooks";
import { businessErrorMessage } from "@/lib/business-api";
import type { BusinessEmployeeDetail, UpdateBusinessEmployeeBody } from "@/lib/employees-api";
import { useBusinessEmployeesQuery, useUpdateBusinessEmployeeMutation } from "./employee-hooks";

export function EmployeeEditDialog({ businessId, employee, open, onOpenChange }: { businessId: string; employee: BusinessEmployeeDetail; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [fullName, setFullName] = useState(employee.fullName);
  const [jobTitle, setJobTitle] = useState(employee.jobTitle ?? "");
  const [employeeListId, setEmployeeListId] = useState(employee.department?.id ?? "");
  const [employeeTypeId, setEmployeeTypeId] = useState(employee.employeeType?.id ?? "");
  const [typeSearch, setTypeSearch] = useState("");
  const [state, setState] = useState(employee.state ?? "");
  const [employmentStartDate, setEmploymentStartDate] = useState(employee.employmentStartDate?.slice(0, 10) ?? "");
  const [managerEmployeeId, setManagerEmployeeId] = useState(employee.manager?.id ?? "");
  const [managerSearch, setManagerSearch] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupIds, setGroupIds] = useState(() => new Set(employee.groups.map((group) => group.id)));
  const lists = useEmployeeListsQuery(businessId, 1, 100);
  const types = useEmployeeTypesQuery(businessId);
  const groups = useEmployeeGroupsQuery(businessId);
  const managers = useBusinessEmployeesQuery(businessId, { page: 1, limit: 20, ...(managerSearch.trim() ? { search: managerSearch.trim() } : {}) });
  const update = useUpdateBusinessEmployeeMutation(businessId, employee.id);
  const visibleGroups = useMemo(() => (groups.data?.items ?? []).filter((group) => group.name.toLowerCase().includes(groupSearch.toLowerCase())).slice(0, 20), [groupSearch, groups.data]);
  const visibleTypes = useMemo(() => (types.data?.items ?? []).filter((type) => type.name.toLowerCase().includes(typeSearch.toLowerCase()) || type.id === employeeTypeId).slice(0, 20), [employeeTypeId, typeSearch, types.data]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim()) return toast.error("Employee name is required.");
    const body: UpdateBusinessEmployeeBody = {
      fullName: fullName.trim(),
      jobTitle: jobTitle.trim() || null,
      employeeListId,
      employeeTypeId: employeeTypeId || null,
      state: state.trim() || null,
      employmentStartDate: employmentStartDate || null,
      managerEmployeeId: managerEmployeeId || null,
      groupIds: [...groupIds],
    };
    update.mutate(body, { onSuccess: () => { toast.success("Employee updated."); onOpenChange(false); }, onError: (error) => toast.error(businessErrorMessage(error)) });
  };

  return <Dialog open={open} onOpenChange={(value) => !update.isPending && onOpenChange(value)}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>Edit {employee.fullName}</DialogTitle><DialogDescription>Update employee information. Banking details remain masked and are not edited from this profile.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name"><Input value={fullName} onChange={(event) => setFullName(event.target.value)} disabled={update.isPending} /></Field><Field label="Job title"><Input value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} disabled={update.isPending} /></Field><Field label="Department"><SelectControl className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={employeeListId} onChange={(event) => setEmployeeListId(event.target.value)} disabled={update.isPending}><option value="">Select department</option>{lists.data?.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectControl></Field><Field label="Employee type"><Input value={typeSearch} onChange={(event) => setTypeSearch(event.target.value)} placeholder="Search types" /><SelectControl className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={employeeTypeId} onChange={(event) => setEmployeeTypeId(event.target.value)} disabled={update.isPending}><option value="">No type</option>{visibleTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectControl></Field><Field label="State or location"><Input value={state} onChange={(event) => setState(event.target.value)} disabled={update.isPending} /></Field><Field label="Employment start date"><DateInput kind="date" value={employmentStartDate} onChange={(event) => setEmploymentStartDate(event.target.value)} disabled={update.isPending} /></Field></div><fieldset className="space-y-3"><legend className="text-sm font-medium">Manager</legend><div className="relative"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input value={managerSearch} onChange={(event) => setManagerSearch(event.target.value)} placeholder="Search managers" className="pl-9" /></div><SelectControl aria-label="Manager" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={managerEmployeeId} onChange={(event) => setManagerEmployeeId(event.target.value)}><option value="">No manager</option>{employee.manager ? <option value={employee.manager.id}>{employee.manager.fullName}</option> : null}{managers.data?.items.filter((item) => item.id !== employee.id && item.id !== employee.manager?.id).map((item) => <option key={item.id} value={item.id}>{item.fullName} · {item.jobTitle || "No job title"}</option>)}</SelectControl></fieldset><fieldset className="space-y-3"><legend className="text-sm font-medium">Employee groups</legend><Input value={groupSearch} onChange={(event) => setGroupSearch(event.target.value)} placeholder="Search groups" /><div className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">{visibleGroups.map((group) => <label key={group.id} className="flex items-center gap-2 rounded-md border border-border p-3 text-sm"><input type="checkbox" checked={groupIds.has(group.id)} onChange={(event) => setGroupIds((current) => { const next = new Set(current); if (event.target.checked) next.add(group.id); else next.delete(group.id); return next; })} />{group.name}</label>)}</div></fieldset><DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>Cancel</Button><Button disabled={update.isPending || !employeeListId}>{update.isPending ? <Loader2 className="animate-spin" /> : null}Save changes</Button></DialogFooter></form></DialogContent></Dialog>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="space-y-2 text-sm font-medium">{label}{children}</label>; }
