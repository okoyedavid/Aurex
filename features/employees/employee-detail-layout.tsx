"use client";

import { createContext, useContext, useState } from "react";
import { Pencil } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { businessErrorMessage } from "@/lib/business-api";
import type { BusinessEmployeeDetail } from "@/lib/employees-api";
import { EmployeeProfileShell } from "./components/employee-profile-shell";
import { employeePermissions } from "./employee-directory-utils";
import { EmployeeEditDialog } from "./components/employee-edit-dialog";
import { useBusinessEmployeeQuery } from "./employee-hooks";

type EmployeeDetailContextValue = {
  businessId: string;
  employee: BusinessEmployeeDetail;
};

const EmployeeDetailContext = createContext<EmployeeDetailContextValue | null>(null);

export function useEmployeeDetail() {
  const value = useContext(EmployeeDetailContext);
  if (!value) throw new Error("useEmployeeDetail must be used within EmployeeDetailLayout");
  return value;
}

export function EmployeeDetailLayout({
  businessId,
  employeeId,
  children,
}: {
  businessId: string;
  employeeId: string;
  children: React.ReactNode;
}) {
  const access = useBusinessAccess();
  const permissions = employeePermissions(access.effectivePermissions);
  const query = useBusinessEmployeeQuery(businessId, employeeId, permissions.viewDirectory);
  const pathname = usePathname();
  const requestedReturn = useSearchParams().get("returnTo");
  const [editOpen, setEditOpen] = useState(false);
  const returnTo = requestedReturn?.startsWith(`/business/${businessId}/`)
    ? requestedReturn
    : undefined;

  if (!permissions.viewDirectory) {
    return <FeedbackState tone="neutral" variant="empty" title="Permission required" message="Business-wide employee details require employees:view." />;
  }
  if (query.isLoading) return <Loading label="Loading employee…" variant="spinner" centered />;
  if (query.error || !query.data) {
    return <FeedbackState title="Unable to load employee" message={businessErrorMessage(query.error)} retry={() => void query.refetch()} />;
  }

  const employee = query.data;
  return (
    <EmployeeDetailContext.Provider value={{ businessId, employee }}>
      <EmployeeProfileShell
        businessId={businessId}
        employee={employee}
        active={pathname.endsWith("/policies") ? "policies" : "overview"}
        canViewPolicies={access.effectivePermissions.has("policies:view")}
        returnTo={returnTo}
        action={permissions.update ? <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="size-4" />Edit employee</Button> : null}
      >
        {children}
      </EmployeeProfileShell>
      {editOpen ? <EmployeeEditDialog businessId={businessId} employee={employee} open onOpenChange={setEditOpen} /> : null}
    </EmployeeDetailContext.Provider>
  );
}
