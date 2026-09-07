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
import type { BusinessInvite } from "@/lib/access-api";

import { useRejectInviteApproval } from "../hooks";

export function RejectApprovalDialog({
  businessId,
  invite,
  onClose,
}: {
  businessId: string;
  invite: BusinessInvite | null;
  onClose: () => void;
}) {
  const reject = useRejectInviteApproval(businessId);

  return (
    <Dialog
      open={Boolean(invite)}
      onOpenChange={(open) => {
        if (!open && !reject.isPending) onClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reject this approval?</DialogTitle>
          <DialogDescription>
            {invite?.email} will not receive the requested access or employee
            connection from this invitation.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" disabled={reject.isPending} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={reject.isPending}
            onClick={() =>
              invite &&
              reject.mutate(invite.id, {
                onSuccess: () => {
                  toast.success("Approval rejected.");
                  onClose();
                },
                onError: (error) => toast.error(error.message),
              })
            }
          >
            {reject.isPending ? "Rejecting..." : "Reject approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
