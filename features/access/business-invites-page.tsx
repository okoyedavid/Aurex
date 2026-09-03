"use client";

import { SelectControl } from "@/components/ui/select";

import { BriefcaseBusiness, Plus, UserRoundCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { useBusinessAccess } from "@/features/business/business-access-context";
import { BusinessPageHeader } from "@/features/business/business-page-header";
import { MembersPageFrame } from "@/features/business/members-page-frame";
import { Pagination } from "@/features/business/pagination";
import type {
  BusinessInvite,
  InvitationType,
  InviteStatus,
  PendingApprovalInvite,
} from "@/lib/access-api";
import type { Permission } from "@/types/generic";

import { ApprovalDialog } from "./approval-dialog";
import {
  usePendingInviteApprovals,
  useRejectInviteApproval,
  useSentBusinessInvites,
} from "./hooks";
import { InviteDialog } from "./invite-dialog";
import { InviteEmployeeSummary } from "./invite-employee-summary";
import {
  approvalPermissionGate,
  type InviteManagementView,
  membershipOutcomeBlocksApproval,
  resolveInviteManagementView,
  sentInvitationPresentation,
} from "./invitation-workflow";
import { MembershipOutcome } from "./membership-outcome";
import {
  Badge,
  ErrorState,
  formatDateTime,
  LoadingState,
  PermissionList,
} from "./shared";

export function BusinessInvitesPage({ businessId }: { businessId: string }) {
  const { business, effectivePermissions } = useBusinessAccess();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sentPage, setSentPage] = useState(1);
  const [sentLimit, setSentLimit] = useState(20);
  const [approvalPage, setApprovalPage] = useState(1);
  const [approvalLimit, setApprovalLimit] = useState(20);
  const [view, setView] = useState<InviteManagementView>("sent");
  const [status, setStatus] = useState<InviteStatus | undefined>("pending");
  const [inviteType, setInviteType] = useState<InvitationType | null>(null);
  const [approvalInvite, setApprovalInvite] =
    useState<PendingApprovalInvite | null>(null);
  const [rejectInvite, setRejectInvite] = useState<BusinessInvite | null>(null);
  const canInvite = effectivePermissions.has("members:invite");
  const canApprove = effectivePermissions.has("roles:assign");
  const activeView = resolveInviteManagementView(
    view,
    canInvite,
    canApprove,
  );
  const sent = useSentBusinessInvites(
    businessId,
    sentPage,
    sentLimit,
    status,
    canInvite && activeView === "sent",
  );
  const pending = usePendingInviteApprovals(
    businessId,
    approvalPage,
    approvalLimit,
    canApprove && activeView === "approvals",
  );
  const reject = useRejectInviteApproval(businessId);

  useEffect(() => {
    if (searchParams.get("action") !== "invite-employee" || !canInvite) return;
    setInviteType("EMPLOYEE");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [canInvite, pathname, router, searchParams]);

  if (!canInvite && !canApprove) {
    return (
      <MembersPageFrame>
        <ErrorState
          error={new Error("You do not have permission to manage invitations.")}
        />
      </MembersPageFrame>
    );
  }

  return (
    <MembersPageFrame>
      <BusinessPageHeader
        eyebrow={business.name}
        title="Invitations"
        description="Invite business members, connect employee records, and review access approvals without mixing each workflow together."
        actions={
          canInvite ? (
            <>
            <Button onClick={() => setInviteType("MEMBER")}>
              <Plus /> Invite member
            </Button>
            <Button
              variant="outline"
              onClick={() => setInviteType("EMPLOYEE")}
            >
              <BriefcaseBusiness /> Invite employee
            </Button>
            </>
          ) : null
        }
        tabs={[
          ...(canInvite
            ? [
                {
                  label: "Sent invites",
                  active: activeView === "sent",
                  onSelect: () => setView("sent"),
                },
              ]
            : []),
          ...(canApprove
            ? [
                {
                  label: "Pending approvals",
                  active: activeView === "approvals",
                  onSelect: () => setView("approvals"),
                },
              ]
            : []),
        ]}
      />

      {canApprove && activeView === "approvals" ? (
        <section className="mt-6">
          <div>
            <h2 className="text-xl font-bold">Pending approvals</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review access, membership, and employee changes before approving.
            </p>
          </div>
          <div className="mt-4 grid gap-4">
            {pending.isLoading ? (
              <LoadingState />
            ) : pending.error ? (
              <ErrorState error={pending.error} onRetry={() => pending.refetch()} />
            ) : pending.data?.items.length ? (
              pending.data.items.map((invite) => (
                <ApprovalCard
                  key={invite.id}
                  invite={invite}
                  permissions={effectivePermissions}
                  onApprove={() => setApprovalInvite(invite)}
                  onReject={() => setRejectInvite(invite)}
                />
              ))
            ) : (
              <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                No approvals are waiting.
              </p>
            )}
          </div>
          {pending.data ? (
            <Pagination
              page={approvalPage}
              totalPages={pending.data.pagination.totalPages}
              total={pending.data.pagination.total}
              limit={approvalLimit}
              fetching={pending.isFetching}
              onPage={setApprovalPage}
              onLimit={(value) => {
                setApprovalLimit(value);
                setApprovalPage(1);
              }}
            />
          ) : null}
        </section>
      ) : null}

      {canInvite && activeView === "sent" ? (
        <section className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Sent invitations</h2>
            <SelectControl
              aria-label="Invitation status"
              className="h-9 w-40 rounded-md border border-input bg-background px-3 text-sm"
              value={status ?? ""}
              onChange={(event) => {
                setStatus(
                  (event.target.value || undefined) as InviteStatus | undefined,
                );
                setSentPage(1);
              }}
            >
              <option value="">All statuses</option>
              {["pending", "accepted", "rejected", "expired", "revoked"].map(
                (value) => (
                  <option key={value}>{value}</option>
                ),
              )}
            </SelectControl>
          </div>
          <div className="mt-4 grid gap-3">
            {sent.isLoading ? (
              <LoadingState />
            ) : sent.error ? (
              <ErrorState error={sent.error} onRetry={() => sent.refetch()} />
            ) : sent.data?.items.length ? (
              sent.data.items.map((invite) => (
                <SentInviteCard
                  key={invite.id}
                  invite={invite}
                  onReview={canApprove ? () => setView("approvals") : undefined}
                />
              ))
            ) : (
              <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No invitations found.
              </p>
            )}
          </div>
          {sent.data ? (
            <Pagination
              page={sentPage}
              totalPages={sent.data.pagination.totalPages}
              total={sent.data.pagination.total}
              limit={sentLimit}
              fetching={sent.isFetching}
              onPage={setSentPage}
              onLimit={(value) => {
                setSentLimit(value);
                setSentPage(1);
              }}
            />
          ) : null}
        </section>
      ) : null}

      {canInvite && inviteType ? (
        <InviteDialog
          key={inviteType}
          businessId={businessId}
          open
          initialType={inviteType}
          onOpenChange={(open) => {
            if (!open) setInviteType(null);
          }}
        />
      ) : null}

      {approvalInvite ? (
        <ApprovalDialog
          businessId={businessId}
          invite={approvalInvite}
          permissions={effectivePermissions}
          onClose={() => setApprovalInvite(null)}
        />
      ) : null}

      <Dialog
        open={Boolean(rejectInvite)}
        onOpenChange={(open) => {
          if (!open && !reject.isPending) setRejectInvite(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject this approval?</DialogTitle>
            <DialogDescription>
              {rejectInvite?.email} will not receive the requested access or
              employee connection from this invitation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={reject.isPending}
              onClick={() => setRejectInvite(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={reject.isPending}
              onClick={() =>
                rejectInvite &&
                reject.mutate(rejectInvite.id, {
                  onSuccess: () => {
                    toast.success("Approval rejected.");
                    setRejectInvite(null);
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
    </MembersPageFrame>
  );
}

function ApprovalCard({
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
            <h3 className="font-semibold">
              {recipient?.name || invite.email}
            </h3>
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
          <Button variant="outline" onClick={onReject}>
            Reject
          </Button>
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

export function SentInviteCard({
  invite,
  onReview,
}: {
  invite: BusinessInvite;
  onReview?: () => void;
}) {
  const presentation = sentInvitationPresentation(invite);
  const typeLabel =
    invite.type === "EMPLOYEE" ? "Employee invitation" : "Member invitation";
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
            {invite.type === "EMPLOYEE" ? (
              <BriefcaseBusiness className="size-4" />
            ) : (
              <UserRoundCheck className="size-4" />
            )}
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
        <div className="mt-4">
          <InviteEmployeeSummary employeeId={invite.employeeId} />
        </div>
      ) : null}

      {presentation.approvalRequired ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-primary/20 bg-primary/5 p-4">
          <p className="max-w-2xl text-sm text-muted-foreground">
            The recipient accepted this invitation. {invite.type === "EMPLOYEE"
              ? "Employee setup and access must be reviewed before membership is activated."
              : "The requested access must be reviewed before membership is activated."}
          </p>
          {onReview ? (
            <Button size="sm" onClick={onReview}>
              {invite.type === "EMPLOYEE" ? "Review employee" : "Review approval"}
            </Button>
          ) : null}
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
