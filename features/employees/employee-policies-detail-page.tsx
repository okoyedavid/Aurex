"use client";

import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { EmployeePoliciesPage } from "@/features/policies/employee-policies-page";
import { businessErrorMessage } from "@/lib/business-api";
import { useBusinessEmployeeQuery } from "./employee-hooks";
import { EmployeeDetailFrame } from "./employee-detail-page";
import { EmployeeProfileHeader } from "./employee-profile-header";

export function EmployeePoliciesDetailPage({ businessId, employeeId }: { businessId: string; employeeId: string }) {
  const access = useBusinessAccess();
  const canViewEmployee = access.effectivePermissions.has("employees:view");
  const query = useBusinessEmployeeQuery(businessId, employeeId, canViewEmployee);
  const requestedReturn = useSearchParams().get("returnTo");
  const returnTo = requestedReturn?.startsWith(`/business/${businessId}/`) ? requestedReturn : undefined;
  if (!canViewEmployee) return <EmployeeDetailFrame><State title="Permission required" detail="Business-wide employee details require employees:view." /></EmployeeDetailFrame>;
  if (query.isLoading) return <EmployeeDetailFrame><div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" />Loading employee policies…</div></EmployeeDetailFrame>;
  if (query.error || !query.data) return <EmployeeDetailFrame><State title="Unable to load employee" detail={businessErrorMessage(query.error)} retry={() => void query.refetch()} /></EmployeeDetailFrame>;
  return <EmployeeDetailFrame><EmployeeProfileHeader businessId={businessId} employee={query.data} active="policies" returnTo={returnTo} /><div className="mt-8"><EmployeePoliciesPage businessId={businessId} employeeId={employeeId} employeeName={query.data.fullName} jobTitle={query.data.jobTitle} embedded /></div></EmployeeDetailFrame>;
}

function State({ title, detail, retry }: { title: string; detail: string; retry?: () => void }) { return <div className="rounded-md border border-dashed border-border p-10 text-center"><h1 className="font-semibold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{detail}</p>{retry ? <Button className="mt-5" variant="outline" onClick={retry}>Try again</Button> : null}</div>; }
