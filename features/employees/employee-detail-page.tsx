"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Copy,
  Landmark,
  Pencil,
  UserRound,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { businessErrorMessage } from "@/lib/business-api";
import { useBusinessEmployeeQuery } from "./employee-hooks";
import { EmployeeEditDialog } from "./employee-edit-dialog";
import { EmployeeProfileHeader } from "./employee-profile-header";
import { employeePermissions } from "./employee-directory-utils";

export function EmployeeDetailPage({
  businessId,
  employeeId,
}: {
  businessId: string;
  employeeId: string;
}) {
  const access = useBusinessAccess();
  const permissions = employeePermissions(access.effectivePermissions);
  const canView = permissions.viewDirectory;
  const canUpdate = permissions.update;
  const query = useBusinessEmployeeQuery(businessId, employeeId, canView);
  const [editOpen, setEditOpen] = useState(false);
  const requestedReturn = useSearchParams().get("returnTo");
  const returnTo = requestedReturn?.startsWith(`/business/${businessId}/`)
    ? requestedReturn
    : undefined;
  if (!canView)
    return (
      <FeedbackState
        tone="neutral"
        variant="empty"
        title="Permission required"
        message="Business-wide employee details require employees:view."
      />
    );
  if (query.isLoading)
    return <Loading label="Loading employee…" variant="spinner" centered />;
  if (query.error || !query.data)
    return (
      <FeedbackState
        title="Unable to load employee"
        message={businessErrorMessage(query.error)}
        retry={() => void query.refetch()}
      />
    );
  const employee = query.data;
  return (
    <>
      <EmployeeProfileHeader
        businessId={businessId}
        employee={employee}
        active="overview"
        returnTo={returnTo}
        action={
          canUpdate ? (
            <Button onClick={() => setEditOpen(true)}>
              <Pencil />
              Edit employee
            </Button>
          ) : undefined
        }
      />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Section icon={<UserRound />} title="Overview">
          <Details
            items={[
              ["Full name", employee.fullName],
              ["Job title", employee.jobTitle || "Not set"],
              ["State", employee.state || "Not set"],
              [
                "Manager",
                employee.manager
                  ? `${employee.manager.fullName}${employee.manager.jobTitle ? ` · ${employee.manager.jobTitle}` : ""}`
                  : "No manager",
              ],
              ["Account", employee.account.linked ? "Linked" : "Unlinked"],
            ]}
          />
        </Section>
        <Section icon={<CalendarDays />} title="Employment">
          <Details
            items={[
              ["Department", employee.department?.name ?? "Unassigned"],
              ["Employee type", employee.employeeType?.name ?? "Not set"],
              ["Start date", formatDate(employee.employmentStartDate)],
              [
                "Tenure",
                employee.tenureMonths === null
                  ? "Not available"
                  : `${employee.tenureMonths} months`,
              ],
              ["Employment status", employee.status],
            ]}
          />
        </Section>
        <Section icon={<UsersRound />} title="Groups and type">
          <p className="text-sm font-medium">
            {employee.employeeType?.name ?? "No employee type"}
          </p>
          {employee.employeeType?.description ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {employee.employeeType.description}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {employee.groups.length ? (
              employee.groups.map((group) => (
                <span
                  key={group.id}
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium"
                >
                  {group.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                No groups assigned.
              </span>
            )}
          </div>
        </Section>
        <Section icon={<Landmark />} title="Payroll and banking">
          <Details
            items={[
              [
                "Pay",
                `${employee.payroll.currency} ${Number(employee.payroll.amount).toLocaleString()}`,
              ],
              ["Frequency", employee.payroll.payFrequency ?? "Not set"],
              ["Bank", employee.bankAccount.bankName ?? "Not returned"],
              [
                "Account name",
                employee.bankAccount.accountName ?? "Not returned",
              ],
              [
                "Account number",
                employee.bankAccount.maskedAccountNumber ?? "Not returned",
              ],
              ["Verification", employee.bankAccount.verificationStatus],
            ]}
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Aurex displays only the masked account value returned by the
            backend.
          </p>
        </Section>
      </div>
      <details className="mt-6 rounded-md border border-border bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Technical metadata
        </summary>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <code>{employee.id}</code>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(employee.id);
              toast.success("Employee ID copied.");
            }}
          >
            <Copy />
            Copy ID
          </Button>
          <span>Updated {new Date(employee.updatedAt).toLocaleString()}</span>
        </div>
      </details>
      {editOpen ? (
        <EmployeeEditDialog
          businessId={businessId}
          employee={employee}
          open
          onOpenChange={setEditOpen}
        />
      ) : null}
    </>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-primary [&>svg]:size-4">
        <span>{icon}</span>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
function Details({ items }: { items: string[][] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-sm font-medium capitalize">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "Not set";
}
