"use client";

import { useState } from "react";
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
import type { BusinessMember } from "@/lib/business-members-api";
import { useBusinessRoles } from "@/features/access/hooks";
import {
  ErrorState,
  LoadingState,
  PermissionList,
} from "@/features/access/shared";
import { useUpdateBusinessMemberRole } from "../business-member-hooks";

export function ChangeMemberRoleDialog({
  member,
  open,
  onOpenChange,
}: {
  member: BusinessMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const businessId = member.businessId.id;
  const roles = useBusinessRoles(businessId, 1, 100, open);
  const mutation = useUpdateBusinessMemberRole(businessId, member.id);
  const [roleId, setRoleId] = useState(member.roleId.id);
  const [confirming, setConfirming] = useState(false);
  const available =
    roles.data?.items.filter(
      (role) => role.status === "active" && role.key !== "owner",
    ) ?? [];
  const selected = available.find((role) => role.id === roleId);
  const unchanged = roleId === member.roleId.id;
  const close = () => {
    if (!mutation.isPending) onOpenChange(false);
  };
  const save = () =>
    mutation.mutate(roleId, {
      onSuccess: () => {
        toast.success(`${member.userId.name}'s role was updated.`);
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message);
        setConfirming(false);
      },
    });

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {confirming ? "Confirm role change" : "Change member role"}
          </DialogTitle>
          <DialogDescription>
            {confirming
              ? `${member.userId.name} will receive the permissions assigned to ${selected?.name}.`
              : "Select an active business role and review its effective access. Owner cannot be assigned here."}
          </DialogDescription>
        </DialogHeader>
        {roles.isLoading ? (
          <LoadingState />
        ) : roles.error ? (
          <ErrorState error={roles.error} onRetry={() => roles.refetch()} />
        ) : confirming && selected ? (
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{selected.name}</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {selected.type}
              </span>
            </div>
            <div className="mt-4">
              <PermissionList
                permissions={selected.permissions}
                denied={selected.deniedPermissions}
              />
            </div>
          </div>
        ) : (
          <>
            <label className="text-sm font-medium">
              Business role
              <select
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                value={roleId}
                onChange={(event) => setRoleId(event.target.value)}
              >
                {available.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} · {role.type}
                  </option>
                ))}
              </select>
            </label>
            {selected ? (
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <PermissionList
                  permissions={selected.permissions}
                  denied={selected.deniedPermissions}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No assignable active roles are available.
              </p>
            )}
          </>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => (confirming ? setConfirming(false) : close())}
          >
            {confirming ? "Back" : "Cancel"}
          </Button>
          <Button
            disabled={mutation.isPending || unchanged || !selected}
            onClick={() => (confirming ? save() : setConfirming(true))}
          >
            {mutation.isPending
              ? "Updating…"
              : confirming
                ? "Confirm role change"
                : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
