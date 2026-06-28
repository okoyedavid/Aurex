"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  BusinessMember,
  BusinessMemberStatus,
} from "@/lib/business-members-api";
import type { Permission } from "@/types/generic";
import {
  assignableSystemRoles,
  customRolePermissions,
  permissionLabels,
} from "../member-role-options";

export function ChangeMemberRoleDialog({
  member,
  open,
  onOpenChange,
}: {
  member: BusinessMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const initialRole = assignableSystemRoles.some(
    (role) => role.key === member.roleId.key,
  )
    ? member.roleId.key
    : "custom";
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [customPermissions, setCustomPermissions] = useState<Set<Permission>>(
    () => new Set(member.roleId.permissions as Permission[]),
  );
  const selectedSystemRole = assignableSystemRoles.find(
    (role) => role.key === selectedRole,
  );
  const visiblePermissions = useMemo(
    () =>
      selectedSystemRole?.permissions ?? Array.from(customPermissions).sort(),
    [customPermissions, selectedSystemRole],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change member role</DialogTitle>
          <DialogDescription>
            Review the access {member.userId.name} would receive. Owner cannot
            be assigned from this screen.
          </DialogDescription>
        </DialogHeader>

        <label className="text-sm font-medium">
          Role
          <select
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
          >
            {assignableSystemRoles.map((role) => (
              <option key={role.key} value={role.key}>
                {role.name}
              </option>
            ))}
            <option value="custom">Custom role</option>
          </select>
        </label>

        {selectedRole === "custom" ? (
          <div className="mt-4">
            <p className="text-sm font-semibold">Custom permissions</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {customRolePermissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-start gap-2 rounded-md border border-border p-3 text-sm"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={customPermissions.has(permission)}
                    onChange={(event) => {
                      setCustomPermissions((current) => {
                        const next = new Set(current);
                        if (event.target.checked) next.add(permission);
                        else next.delete(permission);
                        return next;
                      });
                    }}
                  />
                  {permissionLabels[permission]}
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-border bg-muted/40 p-4">
            <p className="text-sm font-semibold">Included access</p>
            <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {visiblePermissions.map((permission) => (
                <li key={permission}>• {permissionLabels[permission]}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Role updates are preview-only until the backend update endpoint is
          available.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled>Save role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ChangeMemberStatusDialog({
  member,
  open,
  onOpenChange,
}: {
  member: BusinessMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [status, setStatus] = useState<BusinessMemberStatus>(member.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change member status</DialogTitle>
          <DialogDescription>
            Update access for {member.userId.name}. Removed memberships remain
            available for audit history.
          </DialogDescription>
        </DialogHeader>
        <label className="text-sm font-medium">
          Status
          <select
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 capitalize"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as BusinessMemberStatus)
            }
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="removed">Removed</option>
          </select>
        </label>
        <p className="text-xs text-muted-foreground">
          Status updates are preview-only until the backend update endpoint is
          available.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled>Save status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
