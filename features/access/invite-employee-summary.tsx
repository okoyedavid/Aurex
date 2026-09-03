import { BriefcaseBusiness, Link2 } from "lucide-react";

import type { BusinessInvite, InviteEmployee } from "@/lib/access-api";

import {
  employeeListIdentity,
  populatedEmployee,
} from "./invitation-workflow";

export function InviteEmployeeSummary({
  employeeId,
}: {
  employeeId: BusinessInvite["employeeId"];
}) {
  const employee = populatedEmployee(employeeId);
  if (!employeeId) return null;
  if (!employee) {
    return (
      <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
        The invitation references an employee, but the backend response did not
        populate the employee details.
      </div>
    );
  }
  return <EmployeeDetails employee={employee} />;
}

function EmployeeDetails({ employee }: { employee: InviteEmployee }) {
  const list = employeeListIdentity(employee);
  return (
    <div className="rounded-md border border-border bg-muted/30 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <BriefcaseBusiness className="size-4" />
        </span>
        <div>
          <p className="font-semibold">{employee.fullName}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {employee.jobTitle || "No job title"}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Detail label="Department" value={list.name ?? "Name unavailable"} />
        <Detail label="Employment status" value={employee.status} />
        <Detail
          label="Account"
          value={employee.businessMemberId ? "Linked" : "Not linked"}
          linked={Boolean(employee.businessMemberId)}
        />
      </dl>
    </div>
  );
}

function Detail({
  label,
  value,
  linked = false,
}: {
  label: string;
  value: string;
  linked?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1 font-medium capitalize">
        {linked ? <Link2 className="size-3.5 text-primary" /> : null}
        {value.replaceAll("_", " ")}
      </dd>
    </div>
  );
}
