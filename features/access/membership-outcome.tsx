import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

import type { PendingApprovalInvite } from "@/lib/access-api";

import { membershipApprovalPresentation } from "./invitation-workflow";

export function MembershipOutcome({
  invite,
}: {
  invite: Pick<PendingApprovalInvite, "membershipContext" | "roleId">;
}) {
  const outcome = membershipApprovalPresentation(invite);

  if (outcome.kind === "apply_requested") {
    return (
      <div className="rounded-md border border-emerald-500/25 bg-emerald-500/10 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="size-4" /> Requested role will be applied
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Approval will create or reactivate the membership and assign the{" "}
          <strong className="text-foreground">{outcome.requestedRole}</strong>{" "}
          role.
        </p>
      </div>
    );
  }

  if (outcome.kind === "preserve_current") {
    return (
      <div className="rounded-md border border-primary/25 bg-primary/5 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <ShieldCheck className="size-4" /> Existing membership preserved
        </p>
        <p className="mt-2 text-sm text-foreground">
          Already a business member. Their current role,{" "}
          <strong>{outcome.currentRole ?? "Unknown role"}</strong>, will be
          preserved.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Requested role: {outcome.requestedRole}. Role changes are managed
          separately.
        </p>
      </div>
    );
  }

  if (outcome.kind === "blocked_suspended") {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
          <AlertTriangle className="size-4" /> Approval blocked: suspended member
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          This membership must be restored separately by an administrator.
          Invitation approval cannot restore it.
        </p>
        {outcome.currentRole ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Existing role: {outcome.currentRole}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <AlertTriangle className="size-4" /> Approval blocked: existing member
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        This member already has active business access
        {outcome.currentRole ? (
          <> with the {outcome.currentRole} role</>
        ) : null}
        . Use the dedicated role-management workflow to change their role.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Requested role: {outcome.requestedRole}
      </p>
    </div>
  );
}
