"use client";

import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { EmployeePoliciesPage } from "@/features/policies/employee-policies-page";
import { businessErrorMessage } from "@/lib/business-api";
import { useSearchParams } from "next/navigation";
import { useBusinessEmployeeQuery } from "./employee-hooks";
import { EmployeeProfileHeader } from "./employee-profile-header";

export function EmployeePoliciesDetailPage({
  businessId,
  employeeId,
}: {
  businessId: string;
  employeeId: string;
}) {
  const access = useBusinessAccess();
  const canViewEmployee = access.effectivePermissions.has("employees:view");
  const query = useBusinessEmployeeQuery(
    businessId,
    employeeId,
    canViewEmployee,
  );
  const requestedReturn = useSearchParams().get("returnTo");
  const returnTo = requestedReturn?.startsWith(`/business/${businessId}/`)
    ? requestedReturn
    : undefined;
  if (!canViewEmployee)
    return (
      <FeedbackState
        tone="neutral"
        variant="empty"
        title="Permission required"
        message="Business-wide employee details require employees:view."
      />
    );
  if (query.isLoading)
    return (
      <Loading label="Loading employee policies…" variant="spinner" centered />
    );
  if (query.error || !query.data)
    return (
      <FeedbackState
        title="Unable to load employee"
        message={businessErrorMessage(query.error)}
        retry={() => void query.refetch()}
      />
    );
  return (
    <>
      <EmployeeProfileHeader
        businessId={businessId}
        employee={query.data}
        active="policies"
        returnTo={returnTo}
      />
      <div className="mt-8">
        <EmployeePoliciesPage
          businessId={businessId}
          employeeId={employeeId}
          employeeName={query.data.fullName}
          jobTitle={query.data.jobTitle}
          embedded
        />
      </div>
    </>
  );
}
