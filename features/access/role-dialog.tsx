"use client";

import { ShieldCheck } from "lucide-react";
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
import { permissionLabels } from "@/features/business/member-role-options";
import type { BusinessRole } from "@/lib/access-api";
import type { Permission } from "@/types/generic";

import { useCreateCustomRole, useUpdateCustomRole } from "./hooks";

const permissionGroups = [
  { label: "Business", matches: (permission: Permission) => permission.startsWith("business:") },
  { label: "Team access", matches: (permission: Permission) => permission.startsWith("members:") || permission.startsWith("roles:") },
  { label: "Money movement", matches: (permission: Permission) => permission.startsWith("payments:") || permission.startsWith("providers:") || permission.startsWith("invoices:") },
  { label: "Workforce", matches: (permission: Permission) => permission.startsWith("employee") },
  { label: "Reporting & security", matches: (permission: Permission) => permission.startsWith("reports:") || permission.startsWith("audit_logs:") },
] as const;

function shortPermissionLabel(permission: Permission) {
  const label = permissionLabels[permission].replace(/^Allow this person to /, "");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function RoleDialog({
  businessId,
  open,
  onOpenChange,
  available,
  role,
  onCreated,
}: {
  businessId: string;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  available: Permission[];
  role?: BusinessRole | null;
  onCreated?: (role: BusinessRole) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <RoleForm
          key={role?.id ?? "new"}
          businessId={businessId}
          available={available}
          role={role}
          onCreated={onCreated}
          onClose={() => onOpenChange(false)}
        />
      ) : null}
    </Dialog>
  );
}

function RoleForm({
  businessId,
  available,
  role,
  onCreated,
  onClose,
}: {
  businessId: string;
  available: Permission[];
  role?: BusinessRole | null;
  onCreated?: (role: BusinessRole) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(role?.name ?? "");
  const [grants, setGrants] = useState<Permission[]>(role?.permissions ?? []);
  const [denials, setDenials] = useState<Permission[]>(role?.deniedPermissions ?? []);
  const create = useCreateCustomRole(businessId);
  const update = useUpdateCustomRole(businessId, role?.id ?? "");
  const mutation = role ? update : create;

  const toggleGrant = (permission: Permission) => {
    setGrants((current) => {
      if (!current.includes(permission)) return [...current, permission];
      setDenials((denied) => denied.filter((item) => item !== permission));
      return current.filter((item) => item !== permission);
    });
  };

  const toggleDenial = (permission: Permission) => {
    setDenials((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    );
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return toast.error("Role name is required.");
    if (denials.some((permission) => !grants.includes(permission))) {
      return toast.error(
        "Every explicit denial must also be included in granted permissions.",
      );
    }
    mutation.mutate(
      { name: name.trim(), permissions: grants, deniedPermissions: denials },
      {
        onSuccess: (result) => {
          toast.success(role ? "Role updated." : "Role created.");
          onCreated?.(result);
          onClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:p-0">
      <form onSubmit={submit}>
        <div className="border-b border-border bg-muted/35 px-5 py-5 sm:px-7">
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <DialogTitle className="text-xl">
              {role ? "Edit custom role" : "Create a custom role"}
            </DialogTitle>
            <DialogDescription className="max-w-2xl">
              Build a focused access profile. You can only delegate permissions
              included in your own effective access.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-7">
          <label className="block space-y-2 text-sm font-semibold" htmlFor="role-name">
            Role name
            <Input
              id="role-name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Payroll assistant"
              className="h-10 font-normal"
            />
            <span className="block text-xs font-normal text-muted-foreground">
              Choose a short name that describes this person&apos;s responsibility.
            </span>
          </label>

          <section aria-labelledby="permissions-heading">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
              <div>
                <h3 id="permissions-heading" className="text-sm font-semibold">Permissions</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {grants.length} selected · {denials.length} explicitly denied
                </p>
              </div>
              {grants.length ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => { setGrants([]); setDenials([]); }}>
                  Clear selection
                </Button>
              ) : null}
            </div>

            <div className="mt-4 space-y-5">
              {permissionGroups.map((group) => {
                const permissions = available.filter(group.matches);
                if (!permissions.length) return null;
                return (
                  <fieldset key={group.label}>
                    <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {group.label}
                    </legend>
                    <div className="grid gap-2 md:grid-cols-2">
                      {permissions.map((permission) => {
                        const granted = grants.includes(permission);
                        const denied = denials.includes(permission);
                        return (
                          <div
                            key={permission}
                            className={`rounded-xl border p-3 transition-colors ${granted ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:border-primary/20 hover:bg-muted/30"}`}
                          >
                            <label className="flex cursor-pointer items-start gap-3">
                              <input type="checkbox" className="mt-0.5 size-4 accent-primary" checked={granted} onChange={() => toggleGrant(permission)} />
                              <span className="min-w-0">
                                <span className="block text-sm font-medium leading-5">{shortPermissionLabel(permission)}</span>
                                <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{permission}</span>
                              </span>
                            </label>
                            {granted ? (
                              <label className="mt-3 flex cursor-pointer items-center gap-2 border-t border-border/70 pt-2.5 pl-7 text-xs text-muted-foreground">
                                <input type="checkbox" className="size-3.5 accent-destructive" checked={denied} onChange={() => toggleDenial(permission)} />
                                Explicitly deny this permission
                              </label>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
              {!available.length ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  You do not have any permissions available to delegate.
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <DialogFooter className="bg-muted/25 px-5 py-4 sm:px-7">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : role ? "Save changes" : "Create role"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
