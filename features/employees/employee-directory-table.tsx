"use client";

import Link from "next/link";
import { Link2, Link2Off } from "lucide-react";

import type { BusinessEmployeeSummary } from "@/lib/employees-api";
import { employeeDetailHref } from "./employee-directory-utils";

export function EmployeeDirectoryTable({ businessId, employees, returnTo }: { businessId: string; employees: BusinessEmployeeSummary[]; returnTo?: string }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-md border border-border bg-card md:block">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground"><tr>{["Employee", "Department", "Type", "Groups", "State", "Status", "Account"].map((label) => <th key={label} className="p-4 font-medium">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {employees.map((employee) => <tr key={employee.id} className="transition hover:bg-muted/40">
              <td className="p-4"><Link href={employeeDetailHref(businessId, employee.id, returnTo)} className="font-semibold text-primary hover:underline">{employee.fullName}</Link><p className="text-xs text-muted-foreground">{employee.jobTitle || "No job title"}</p></td>
              <td className="p-4">{employee.department?.name ?? "Unassigned"}</td>
              <td className="p-4">{employee.employeeType?.name ?? "Not set"}</td>
              <td className="max-w-52 p-4"><span className="line-clamp-2">{employee.groups.map((group) => group.name).join(", ") || "None"}</span></td>
              <td className="p-4">{employee.state ?? "Not set"}</td>
              <td className="p-4"><Status value={employee.status} /></td>
              <td className="p-4"><span className="inline-flex items-center gap-1.5 text-xs">{employee.accountLinked ? <Link2 className="size-3.5 text-primary" /> : <Link2Off className="size-3.5 text-muted-foreground" />}{employee.accountLinked ? "Linked" : "Unlinked"}</span></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {employees.map((employee) => <article key={employee.id} className="rounded-md border border-border bg-card p-4"><div><Link href={employeeDetailHref(businessId, employee.id, returnTo)} className="font-semibold text-primary hover:underline">{employee.fullName}</Link><p className="mt-1 text-sm text-muted-foreground">{employee.jobTitle || "No job title"}</p></div><dl className="mt-4 grid grid-cols-2 gap-3 text-xs"><Info label="Department" value={employee.department?.name ?? "Unassigned"} /><Info label="Type" value={employee.employeeType?.name ?? "Not set"} /><Info label="State" value={employee.state ?? "Not set"} /><Info label="Status" value={employee.status} /></dl></article>)}
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>; }
function Status({ value }: { value: string }) { return <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">{value}</span>; }
