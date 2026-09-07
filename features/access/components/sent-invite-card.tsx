import { BriefcaseBusiness, UserRoundCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BusinessInvite } from "@/lib/access-api";

import { InviteEmployeeSummary } from "./invite-employee-summary";
import { sentInvitationPresentation } from "../invitation-workflow";
import { Badge, formatDateTime } from "../shared";

export function SentInviteCard({
  invite,
  onReview,
}: {
  invite: BusinessInvite;
  onReview?: () => void;
}) {
  const presentation = sentInvitationPresentation(invite);
  const typeLabel = invite.type === "EMPLOYEE" ? "Employee invitation" : "Member invitation";
  const event =
    invite.status === "accepted" && invite.acceptedAt
      ? { label: "Accepted", date: invite.acceptedAt }
      : invite.status === "rejected" && invite.rejectedAt
        ? { label: "Rejected", date: invite.rejectedAt }
        : invite.status === "revoked" && invite.revokedAt
          ? { label: "Revoked", date: invite.revokedAt }
          : invite.status === "expired"
            ? { label: "Expired", date: invite.expiresAt }
            : { label: "Invited", date: invite.createdAt };

  return (
    <article className="rounded-md border border-border bg-card p-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {invite.type === "EMPLOYEE" ? <BriefcaseBusiness className="size-4" /> : <UserRoundCheck className="size-4" />}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold">{invite.email}</h3>
              <Badge>{typeLabel}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {invite.roleId.name} · invited by {invite.invitedByUserId.name}
            </p>
          </div>
        </div>
        <Badge tone={presentation.tone}>{presentation.label}</Badge>
      </div>

      {invite.type === "EMPLOYEE" && invite.employeeId ? (
        <div className="mt-4"><InviteEmployeeSummary employeeId={invite.employeeId} /></div>
      ) : null}

      {presentation.approvalRequired ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 p-4">
          <p className="max-w-2xl text-sm text-muted-foreground">
            The recipient accepted this invitation. {invite.type === "EMPLOYEE"
              ? "Employee setup and access must be reviewed before membership is activated."
              : "The requested access must be reviewed before membership is activated."}
          </p>
          {onReview ? <Button size="sm" onClick={onReview}>{invite.type === "EMPLOYEE" ? "Review employee" : "Review approval"}</Button> : null}
        </div>
      ) : null}

      <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
        {event.label} {formatDateTime(event.date)}
      </p>
      {invite.emailDeliveryStatus === "failed" ? (
        <p className="mt-3 text-sm text-destructive">
          Delivery failed{invite.emailFailureReason ? `: ${invite.emailFailureReason}` : "."}
        </p>
      ) : null}
    </article>
  );
}
