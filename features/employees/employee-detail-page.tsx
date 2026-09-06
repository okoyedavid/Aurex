"use client";

import { CalendarDays, Landmark, ShieldCheck, UsersRound } from "lucide-react";

import { GitHubIcon } from "@/components/icons/github-icon";
import { EmployeeExternalAccess } from "@/features/integrations/employee-external-access";
import { EmployeeGitHubIdentity } from "@/features/integrations/employee-github-identity";

import { cn } from "@/lib/utils";

import { useEmployeeDetail } from "./employee-detail-layout";

export function EmployeeDetailPage() {
  const { businessId, employee } = useEmployeeDetail();

  return (
    <div className="divide-y divide-border">
      <ContentSection
        icon={<CalendarDays />}
        title="Employment"
        description="Employment status, dates and workplace information."
      >
        <Details
          items={[
            { label: "Full name", value: employee.fullName },
            { label: "Job title", value: employee.jobTitle || "Not set" },
            { label: "State", value: employee.state || "Not set" },
            {
              label: "Employment status",
              value: formatLabel(employee.status),
            },
            {
              label: "Start date",
              value: formatDate(employee.employmentStartDate),
            },
            {
              label: "Tenure",
              value:
                employee.tenureMonths === null
                  ? "Not available"
                  : formatTenure(employee.tenureMonths),
            },
          ]}
        />
      </ContentSection>

      <ContentSection
        icon={<UsersRound />}
        title="Organization"
        description="Placement within the business and reporting structure."
      >
        <Details
          items={[
            {
              label: "Department",
              value: employee.department?.name ?? "Unassigned",
            },
            {
              label: "Manager",
              value: employee.manager?.fullName ?? "No manager",
              secondary: employee.manager?.jobTitle || undefined,
            },
            {
              label: "Employee type",
              value: employee.employeeType?.name ?? "Not set",
            },
          ]}
        />

        {employee.employeeType?.description ? (
          <div className="mt-6">
            <p className="text-xs text-muted-foreground">Type description</p>
            <p className="mt-1 max-w-2xl text-sm leading-6">
              {employee.employeeType.description}
            </p>
          </div>
        ) : null}
      </ContentSection>

      <ContentSection
        icon={<Landmark />}
        title="Payroll & banking"
        description="Compensation and payment account information."
      >
        <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
          <DetailItem
            label="Pay"
            value={formatPay(
              employee.payroll.currency,
              employee.payroll.amount,
            )}
          />
          <DetailItem
            label="Frequency"
            value={
              employee.payroll.payFrequency
                ? formatLabel(employee.payroll.payFrequency)
                : "Not set"
            }
          />
          <DetailItem
            label="Bank"
            value={employee.bankAccount.bankName ?? "Not returned"}
          />
          <DetailItem
            label="Account name"
            value={employee.bankAccount.accountName ?? "Not returned"}
          />
          <DetailItem
            label="Account number"
            value={employee.bankAccount.maskedAccountNumber ?? "Not returned"}
          />
          <DetailItem
            label="Verification"
            value={
              <VerificationStatus
                status={employee.bankAccount.verificationStatus}
              />
            }
          />
        </div>

        <div className="mt-7 border-t border-border pt-4">
          <p className="text-xs leading-5 text-muted-foreground">
            Aurex displays only the masked account value returned by the
            backend.
          </p>
        </div>
      </ContentSection>

      <ContentSection
        icon={<GitHubIcon />}
        title="GitHub identity"
        description="The GitHub account Aurex uses for policy enforcement."
      >
        <EmployeeGitHubIdentity
          businessId={businessId}
          employeeId={employee.id}
        />
      </ContentSection>

      <ContentSection
        icon={<ShieldCheck />}
        title="Application access"
        description="Desired policy access and the state last verified by the connected provider."
      >
        <EmployeeExternalAccess
          businessId={businessId}
          employeeId={employee.id}
        />
      </ContentSection>
    </div>
  );
}

function ContentSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-8 first:pt-8">
      <div className="mb-7">
        <div className="flex items-center gap-2">
          <span className="text-primary [&>svg]:size-4">{icon}</span>
          <h2 className="text-base font-semibold">{title}</h2>
        </div>
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Details({
  items,
}: {
  items: Array<{
    label: string;
    value: React.ReactNode;
    secondary?: React.ReactNode;
  }>;
}) {
  return (
    <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
      {items.map((item) => (
        <DetailItem
          key={item.label}
          label={item.label}
          value={item.value}
          secondary={item.secondary}
        />
      ))}
    </dl>
  );
}

function DetailItem({
  label,
  value,
  secondary,
}: {
  label: string;
  value: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 break-words text-sm font-medium">{value}</dd>
      {secondary ? (
        <p className="mt-1 text-xs text-muted-foreground">{secondary}</p>
      ) : null}
    </div>
  );
}

function VerificationStatus({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const verified = normalized === "verified" || normalized === "success";

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "size-1.5 rounded-full",
          verified ? "bg-primary" : "bg-muted-foreground",
        )}
      />
      {formatLabel(status)}
    </span>
  );
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTenure(months: number) {
  if (months < 12) {
    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "year" : "years"}`;
  }

  return `${years} ${years === 1 ? "year" : "years"}, ${remainingMonths} ${
    remainingMonths === 1 ? "month" : "months"
  }`;
}

function formatPay(currency: string, amount: string | number) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return `${currency} ${amount}`;

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `${currency} ${numericAmount.toLocaleString()}`;
  }
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
