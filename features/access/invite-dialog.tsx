"use client";

import { SelectControl } from "@/components/ui/select";

import {
  ArrowLeft,
  BriefcaseBusiness,
  FilePlus2,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBusinessAccess } from "@/features/business/business-access-context";
import type { InvitationType } from "@/lib/access-api";

import { ExistingEmployeeSelector } from "./existing-employee-selector";
import { useAssignableRoles, useCreateBusinessInvite } from "./hooks";
import {
  buildInvitationPayload,
  canBrowseExistingEmployees,
  type EmployeeSource,
} from "./invitation-workflow";
import { RoleDialog } from "./role-dialog";
import { ErrorState, LoadingState, PermissionList } from "./shared";

export function InviteDialog({
  businessId,
  open,
  initialType,
  onOpenChange,
}: {
  businessId: string;
  open: boolean;
  initialType?: InvitationType;
  onOpenChange: (value: boolean) => void;
}) {
  const { effectivePermissions } = useBusinessAccess();
  const roles = useAssignableRoles(businessId, 1, 100, open);
  const create = useCreateBusinessInvite(businessId);
  const [type, setType] = useState<InvitationType | null>(initialType ?? null);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [employeeSource, setEmployeeSource] =
    useState<EmployeeSource>("existing");
  const [employeeListId, setEmployeeListId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const selectedRole = roles.data?.items.find((role) => role.id === roleId);
  const canBrowseEmployees =
    canBrowseExistingEmployees(effectivePermissions);

  const resetEmployee = () => {
    setEmployeeSource("existing");
    setEmployeeListId("");
    setEmployeeId("");
  };

  const close = () => {
    setType(null);
    setEmail("");
    setRoleId("");
    resetEmployee();
    onOpenChange(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!type) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return toast.error("Enter a valid email address.");
    }
    if (!roleId) return toast.error("Select a role.");
    if (
      type === "EMPLOYEE" &&
      employeeSource === "existing" &&
      !employeeId
    ) {
      return toast.error("Select an employee.");
    }

    create.mutate(
      {
        payload: buildInvitationPayload({
          type,
          email,
          roleId,
          employeeSource,
          employeeId,
        }),
        ...(type === "EMPLOYEE" &&
        employeeSource === "existing" &&
        employeeListId
          ? { employeeListId }
          : {}),
      },
      {
        onSuccess: () => {
          toast.success("Invitation sent. Email delivery is pending.");
          close();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!value && !create.isPending) close();
        }}
      >
        <DialogContent className="max-w-3xl">
          {!type ? (
            <>
              <DialogHeader>
                <DialogTitle>Create an invitation</DialogTitle>
                <DialogDescription>
                  Choose whether this person needs business access only or an
                  employment and payroll connection.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 sm:grid-cols-2">
                <InvitationTypeButton
                  icon={<Users className="size-5" />}
                  title="Invite member"
                  description="Grant business access with a selected role."
                  onClick={() => setType("MEMBER")}
                />
                <InvitationTypeButton
                  icon={<BriefcaseBusiness className="size-5" />}
                  title="Invite employee"
                  description="Connect business access to an employee record."
                  onClick={() => setType("EMPLOYEE")}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={submit}>
              <DialogHeader>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mb-2 w-fit px-0"
                  onClick={() => {
                    setType(null);
                    resetEmployee();
                  }}
                >
                  <ArrowLeft /> Change invitation type
                </Button>
                <DialogTitle>
                  {type === "MEMBER" ? "Invite member" : "Invite employee"}
                </DialogTitle>
                <DialogDescription>
                  {type === "MEMBER"
                    ? "Choose the role this person will request when accepting."
                    : "Choose a role and decide whether to connect an existing employee record."}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-5 space-y-5">
                <label className="block space-y-2 text-sm font-medium">
                  Email address
                  <Input
                    type="email"
                    value={email}
                    disabled={create.isPending}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="person@example.com"
                  />
                </label>

                {roles.isLoading ? (
                  <LoadingState />
                ) : roles.error ? (
                  <ErrorState error={roles.error} onRetry={() => roles.refetch()} />
                ) : (
                  <label className="block space-y-2 text-sm font-medium">
                    Role
                    <SelectControl
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={roleId}
                      disabled={create.isPending}
                      onChange={(event) => setRoleId(event.target.value)}
                    >
                      <option value="">Select a role</option>
                      {roles.data?.items
                        .filter((role) => role.key !== "owner")
                        .map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name} · {role.type}
                          </option>
                        ))}
                    </SelectControl>
                  </label>
                )}

                {selectedRole ? (
                  <div className="rounded-md border border-border bg-muted/30 p-4">
                    <PermissionList
                      permissions={selectedRole.permissions}
                      denied={selectedRole.deniedPermissions}
                    />
                  </div>
                ) : null}

                {type === "EMPLOYEE" ? (
                  <section className="space-y-4 border-t border-border pt-5">
                    <div>
                      <h3 className="text-sm font-semibold">Employee source</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Link a record now or let an authorized approver create
                        one later.
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <SourceButton
                        active={employeeSource === "existing"}
                        disabled={!canBrowseEmployees}
                        icon={<UserRoundSearch className="size-4" />}
                        title="Existing employee"
                        description="Select from one employee list."
                        onClick={() => {
                          setEmployeeSource("existing");
                          setEmployeeListId("");
                          setEmployeeId("");
                        }}
                      />
                      <SourceButton
                        active={employeeSource === "new"}
                        icon={<FilePlus2 className="size-4" />}
                        title="New employee"
                        description="Details are completed during approval."
                        onClick={() => {
                          setEmployeeSource("new");
                          setEmployeeListId("");
                          setEmployeeId("");
                        }}
                      />
                    </div>

                    {employeeSource === "existing" ? (
                      <ExistingEmployeeSelector
                        businessId={businessId}
                        enabled={canBrowseEmployees}
                        employeeListId={employeeListId}
                        employeeId={employeeId}
                        onEmployeeListChange={setEmployeeListId}
                        onEmployeeChange={setEmployeeId}
                      />
                    ) : (
                      <div className="rounded-md border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                        An authorized approver will choose an employee list and
                        enter the employee&apos;s payroll and banking details.
                        No employee details are collected or sent now.
                      </div>
                    )}
                  </section>
                ) : null}

                {effectivePermissions.has("roles:create") ? (
                  <Button
                    type="button"
                    variant="link"
                    className="justify-start px-0"
                    onClick={() => setRoleOpen(true)}
                  >
                    Create a custom role
                  </Button>
                ) : null}
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  disabled={create.isPending}
                  onClick={close}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    create.isPending ||
                    !selectedRole ||
                    (type === "EMPLOYEE" &&
                      employeeSource === "existing" &&
                      (!canBrowseEmployees || !employeeId))
                  }
                >
                  {create.isPending ? "Sending..." : "Send invitation"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <RoleDialog
        businessId={businessId}
        open={roleOpen}
        onOpenChange={setRoleOpen}
        available={Array.from(effectivePermissions)}
        onCreated={(role) => setRoleId(role.id)}
      />
    </>
  );
}

function InvitationTypeButton({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-border p-5 text-left transition hover:border-primary/35 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="mt-4 block font-semibold">{title}</span>
      <span className="mt-1 block text-sm leading-6 text-muted-foreground">
        {description}
      </span>
    </button>
  );
}

function SourceButton({
  active,
  disabled,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border hover:border-primary/25"
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        {icon} {title}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">
        {description}
      </span>
    </button>
  );
}
