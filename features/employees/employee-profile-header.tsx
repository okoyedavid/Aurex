import Link from "next/link";
import { Link2, Link2Off } from "lucide-react";

import type { BusinessEmployeeDetail } from "@/lib/employees-api";
import { cn } from "@/lib/utils";

export function EmployeeProfileHeader({ businessId, employee, active, returnTo, action }: { businessId: string; employee: BusinessEmployeeDetail; active: "overview" | "policies"; returnTo?: string; action?: React.ReactNode }) {
  const base = `/business/${businessId}/employees/${employee.id}`;
  const returnSuffix = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link href={returnTo || `/business/${businessId}/employees`} className="hover:text-primary">Employees</Link><span className="px-2">/</span><span className="text-foreground">{employee.fullName}</span>{active === "policies" ? <><span className="px-2">/</span><span className="text-foreground">Policies</span></> : null}</nav>
      <div className="mt-5 flex flex-wrap items-start justify-between gap-5"><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold">{employee.fullName}</h1><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">{employee.status}</span></div><p className="mt-2 text-sm text-muted-foreground">{employee.jobTitle || "No job title"} · {employee.department?.name ?? "No department"}</p><p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">{employee.account.linked ? <Link2 className="size-3.5 text-primary" /> : <Link2Off className="size-3.5" />}{employee.account.linked ? "Linked business account" : "No linked business account"}</p></div>{action}</div>
      <div className="mt-7 flex gap-2 border-b border-border" role="tablist" aria-label="Employee sections">
        <Link role="tab" aria-selected={active === "overview"} href={`${base}${returnSuffix}`} className={cn("border-b-2 px-3 py-3 text-sm font-medium", active === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>Overview</Link>
        <Link role="tab" aria-selected={active === "policies"} href={`${base}/policies${returnSuffix}`} className={cn("border-b-2 px-3 py-3 text-sm font-medium", active === "policies" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>Policies</Link>
      </div>
    </>
  );
}
