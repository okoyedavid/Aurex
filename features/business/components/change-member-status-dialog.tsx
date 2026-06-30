"use client";

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
import {
  useRemoveBusinessMember,
  useUpdateBusinessMemberStatus,
} from "../business-member-hooks";

export function ChangeMemberStatusDialog({
  member,
  open,
  onOpenChange,
}: {
  member: BusinessMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useUpdateBusinessMemberStatus(
    member.businessId.id,
    member.id,
  );
  const target = member.status === "active" ? "suspended" : "active";
  const verb = target === "suspended" ? "Suspend" : "Reactivate";
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!mutation.isPending) onOpenChange(value);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {verb} {member.userId.name}?
          </DialogTitle>
          <DialogDescription>
            {target === "suspended"
              ? "They will lose access to this business until reactivated."
              : "They will regain access using their current role."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant={target === "suspended" ? "destructive" : "default"}
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate(target, {
                onSuccess: () => {
                  toast.success(
                    `Membership ${target === "active" ? "reactivated" : "suspended"}.`,
                  );
                  onOpenChange(false);
                },
                onError: (error) => toast.error(error.message),
              })
            }
          >
            {mutation.isPending ? "Updating…" : verb}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RemoveMemberDialog({
  member,
  open,
  onOpenChange,
}: {
  member: BusinessMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useRemoveBusinessMember(member.businessId.id, member.id);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!mutation.isPending) onOpenChange(value);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {member.userId.name}?</DialogTitle>
          <DialogDescription>
            {member.userId.email} will lose access to this business. Their
            membership record remains available for access history.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate(undefined, {
                onSuccess: () => {
                  toast.success("Member removed from the business.");
                  onOpenChange(false);
                },
                onError: (error) => toast.error(error.message),
              })
            }
          >
            {mutation.isPending ? "Removing…" : "Remove member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
