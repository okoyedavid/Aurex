import { Button } from "@/components/ui/button";
import type { PendingApprovalInvite } from "@/lib/access-api";
import type { Permission } from "@/types/generic";

import {
  approvalPermissionGate,
  membershipOutcomeBlocksApproval,
} from "../invitation-workflow";
import { InviteEmployeeSummary } from "./invite-employee-summary";
import { MembershipOutcome } from "./membership-outcome";
import { Badge, formatDateTime, PermissionList } from "../shared";

export function ApprovalCard({
  invite,
  permissions,
  onApprove,
  onReject,
}: {
  invite: PendingApprovalInvite;
  permissions: ReadonlySet<Permission>;
  onApprove: () => void;
  onReject: () => void;
}) {
  const recipient = invite.acceptedByUserId;
  const approvalBlocked = membershipOutcomeBlocksApproval(invite);
  const permissionGate = approvalPermissionGate(invite, permissions);
  const approvalUnavailable = approvalBlocked || !permissionGate.allowed;

  return (
    <article className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{recipient?.name || invite.email}</h3>
            <Badge>{invite.type.toLowerCase()}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {recipient?.email ?? invite.email} · invited by{" "}
            {invite.invitedByUserId.name}
          </p>
        </div>
        <Badge tone="warn">approval pending</Badge>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Requested role
          </p>
          <p className="mt-1 font-semibold">{invite.roleId.name}</p>
          <div className="mt-3">
            <PermissionList
              permissions={invite.roleId.permissions}
              denied={invite.roleId.deniedPermissions}
            />
          </div>
        </section>
        <MembershipOutcome invite={invite} />
      </div>

      {invite.type === "EMPLOYEE" ? (
        <div className="mt-4">
          {invite.employeeId ? (
            <InviteEmployeeSummary employeeId={invite.employeeId} />
          ) : (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
              Employee details still need to be created. The approver must
              choose an employee list and complete the employee form.
            </div>
          )}
        </div>
      ) : null}

      {!permissionGate.allowed ? (
        <p className="mt-4 rounded-md bg-destructive/5 p-3 text-sm text-destructive">
          Approval requires: {permissionGate.missing.join(", ")}.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <p className="text-sm text-muted-foreground">
          Accepted {formatDateTime(invite.acceptedAt)}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReject}>Reject</Button>
          <Button disabled={approvalUnavailable} onClick={onApprove}>
            {approvalBlocked
              ? "Approval blocked"
              : !permissionGate.allowed
                ? "Permission required"
                : "Review and approve"}
          </Button>
        </div>
      </div>
    </article>
  );
}
