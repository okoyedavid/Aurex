"use client";

import { CalendarDays, Landmark, ShieldCheck, UsersRound } from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { EmployeeExternalAccess } from "@/features/integrations/components/employee-external-access";
import { EmployeeGitHubIdentity } from "@/features/integrations/components/employee-github-identity";
import {
  EmployeeDetailSection,
  EmployeeDetails,
  EmployeeDetailValue,
  EmployeeVerificationStatus,
} from "./components/employee-detail-section";
import {
  employeeDate,
  employeeLabel,
  employeePay,
  employeeTenure,
} from "./employee-display-utils";
import { useEmployeeDetail } from "./employee-detail-layout";

export function EmployeeDetailPage() {
  const { businessId, employee } = useEmployeeDetail();
  return (
    <div className="space-y-6">
      <EmployeeDetailSection icon={<CalendarDays />} title="Employment" description="Employment status, dates and workplace information.">
        <EmployeeDetails items={[
          { label: "Full name", value: employee.fullName },
          { label: "Job title", value: employee.jobTitle || "Not set" },
          { label: "State", value: employee.state || "Not set" },
          { label: "Employment status", value: employeeLabel(employee.status) },
          { label: "Start date", value: employeeDate(employee.employmentStartDate) },
          { label: "Tenure", value: employee.tenureMonths === null ? "Not available" : employeeTenure(employee.tenureMonths) },
        ]} />
      </EmployeeDetailSection>

      <EmployeeDetailSection icon={<UsersRound />} title="Organization" description="Placement within the business and reporting structure.">
        <EmployeeDetails items={[
          { label: "Department", value: employee.department?.name ?? "Unassigned" },
          { label: "Manager", value: employee.manager?.fullName ?? "No manager", secondary: employee.manager?.jobTitle || undefined },
          { label: "Employee type", value: employee.employeeType?.name ?? "Not set" },
        ]} />
        {employee.employeeType?.description ? <div className="mt-6"><p className="text-xs text-muted-foreground">Type description</p><p className="mt-1 max-w-2xl text-sm leading-6">{employee.employeeType.description}</p></div> : null}
      </EmployeeDetailSection>

      <EmployeeDetailSection icon={<Landmark />} title="Payroll & banking" description="Compensation and payment account information.">
        <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          <EmployeeDetailValue label="Pay" value={employeePay(employee.payroll.currency, employee.payroll.amount)} />
          <EmployeeDetailValue label="Frequency" value={employee.payroll.payFrequency ? employeeLabel(employee.payroll.payFrequency) : "Not set"} />
          <EmployeeDetailValue label="Bank" value={employee.bankAccount.bankName ?? "Not returned"} />
          <EmployeeDetailValue label="Account name" value={employee.bankAccount.accountName ?? "Not returned"} />
          <EmployeeDetailValue label="Account number" value={employee.bankAccount.maskedAccountNumber ?? "Not returned"} />
          <EmployeeDetailValue label="Verification" value={<EmployeeVerificationStatus status={employee.bankAccount.verificationStatus} />} />
        </div>
        <div className="mt-7 border-t border-border pt-4"><p className="text-xs leading-5 text-muted-foreground">Aurex displays only the masked account value returned by the backend.</p></div>
      </EmployeeDetailSection>

      <EmployeeDetailSection icon={<GitHubIcon />} title="GitHub identity" description="The GitHub account Aurex uses for policy enforcement.">
        <EmployeeGitHubIdentity businessId={businessId} employeeId={employee.id} />
      </EmployeeDetailSection>
      <EmployeeDetailSection icon={<ShieldCheck />} title="Application access" description="Desired policy access and the state last verified by the connected provider.">
        <EmployeeExternalAccess businessId={businessId} employeeId={employee.id} />
      </EmployeeDetailSection>
    </div>
  );
}
