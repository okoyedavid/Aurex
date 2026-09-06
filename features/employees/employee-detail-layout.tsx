"use client";

import Link from "next/link";
import { Link2, Link2Off, Pencil, UserRound, UsersRound } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { businessErrorMessage } from "@/lib/business-api";
import type { BusinessEmployeeDetail } from "@/lib/employees-api";
import { cn } from "@/lib/utils";

import { employeePermissions } from "./employee-directory-utils";
import { EmployeeEditDialog } from "./employee-edit-dialog";
import { useBusinessEmployeeQuery } from "./employee-hooks";

type EmployeeDetailContextValue = {
  businessId: string;
  employee: BusinessEmployeeDetail;
};

const EmployeeDetailContext = createContext<EmployeeDetailContextValue | null>(
  null,
);

export function useEmployeeDetail() {
  const value = useContext(EmployeeDetailContext);
  if (!value) {
    throw new Error("useEmployeeDetail must be used within EmployeeDetailLayout");
  }
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
  const query = useBusinessEmployeeQuery(
    businessId,
    employeeId,
    permissions.viewDirectory,
  );
  const pathname = usePathname();
  const requestedReturn = useSearchParams().get("returnTo");
  const [editOpen, setEditOpen] = useState(false);
  const returnTo = requestedReturn?.startsWith(`/business/${businessId}/`)
    ? requestedReturn
    : undefined;

  if (!permissions.viewDirectory) {
    return (
      <FeedbackState
        tone="neutral"
        variant="empty"
        title="Permission required"
        message="Business-wide employee details require employees:view."
      />
    );
  }

  if (query.isLoading) {
    return <Loading label="Loading employee…" variant="spinner" centered />;
  }

  if (query.error || !query.data) {
    return (
      <FeedbackState
        title="Unable to load employee"
        message={businessErrorMessage(query.error)}
        retry={() => void query.refetch()}
      />
    );
  }

  const employee = query.data;
  const active = pathname.endsWith("/policies") ? "policies" : "overview";

  return (
    <EmployeeDetailContext.Provider value={{ businessId, employee }}>
      <EmployeeProfileShell
        businessId={businessId}
        employee={employee}
        active={active}
        returnTo={returnTo}
        action={
          permissions.update ? (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Edit employee
            </Button>
          ) : null
        }
      >
        {children}
      </EmployeeProfileShell>
      {editOpen ? (
        <EmployeeEditDialog
          businessId={businessId}
          employee={employee}
          open
          onOpenChange={setEditOpen}
        />
      ) : null}
    </EmployeeDetailContext.Provider>
  );
}

export function EmployeeProfileShell({
  businessId,
  employee,
  active,
  returnTo,
  action,
  children,
}: {
  businessId: string;
  employee: BusinessEmployeeDetail;
  active: "overview" | "policies";
  returnTo?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const base = `/business/${businessId}/employees/${employee.id}`;
  const returnSuffix = returnTo
    ? `?returnTo=${encodeURIComponent(returnTo)}`
    : "";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link
            href={returnTo || `/business/${businessId}/employees`}
            className="transition-colors hover:text-foreground"
          >
            Employees
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{employee.fullName}</span>
        </nav>
        {action}
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-12">
        <EmployeeProfileRail employee={employee} />
        <main className="min-w-0">
          <nav
            className="flex gap-6 border-b border-border"
            aria-label="Employee sections"
          >
            <EmployeeTab
              href={`${base}${returnSuffix}`}
              active={active === "overview"}
            >
              Overview
            </EmployeeTab>
            <EmployeeTab
              href={`${base}/policies${returnSuffix}`}
              active={active === "policies"}
            >
              Policies
            </EmployeeTab>
          </nav>
          {children}
        </main>
      </div>
    </>
  );
}

function EmployeeProfileRail({ employee }: { employee: BusinessEmployeeDetail }) {
  return (
    <aside className="min-w-0 md:border-r md:border-border md:pr-7 xl:pr-10">
      <div className="flex flex-col items-center text-center md:items-start md:text-left">
        <div className="relative">
          {employee.account.linked ? (
            <Avatar className="size-24">
              {employee.account.avatar ? (
                <AvatarImage src={employee.account.avatar} alt={employee.fullName} />
              ) : null}
              <AvatarFallback className="text-xl font-semibold">
                {getInitials(employee.fullName)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-9 text-muted-foreground" />
            </div>
          )}
          {!employee.account.linked ? (
            <div className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted">
              <Link2Off className="size-3.5 text-muted-foreground" />
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          <h1 className="text-2xl font-bold tracking-tight">
            {employee.fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {employee.jobTitle || "No job title"}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>{formatLabel(employee.status)}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <SidebarSection icon={<UsersRound />} title="Organization">
          <SidebarField
            label="Department"
            value={employee.department?.name ?? "Unassigned"}
          />
          <SidebarField
            label="Manager"
            value={employee.manager?.fullName ?? "No manager"}
            secondary={employee.manager?.jobTitle || undefined}
          />
        </SidebarSection>

        <SidebarSection icon={<UserRound />} title="Classification">
          <SidebarField
            label="Employee type"
            value={employee.employeeType?.name ?? "Not set"}
          />
          <div>
            <p className="text-xs text-muted-foreground">Groups</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {employee.groups.length ? (
                employee.groups.map((group) => (
                  <span
                    key={group.id}
                    className="rounded-md bg-muted px-2 py-1 text-xs font-medium"
                  >
                    {group.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No groups</span>
              )}
            </div>
          </div>
        </SidebarSection>

        <SidebarSection
          icon={employee.account.linked ? <Link2 /> : <Link2Off />}
          title="Aurex account"
        >
          {employee.account.linked ? (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="size-1.5 rounded-full bg-primary" />
                Linked account
              </div>
              {employee.account.email ? (
                <p className="mt-1 break-all text-sm text-muted-foreground">
                  {employee.account.email}
                </p>
              ) : null}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium">No linked Aurex account</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                This employee record is not connected to a user account.
              </p>
            </div>
          )}
        </SidebarSection>
      </div>
    </aside>
  );
}

function EmployeeTab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function SidebarSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground [&>svg]:size-3.5">
        {icon}
        <h2>{title}</h2>
      </div>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

function SidebarField({
  label,
  value,
  secondary,
}: {
  label: string;
  value: React.ReactNode;
  secondary?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
      {secondary ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{secondary}</p>
      ) : null}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
