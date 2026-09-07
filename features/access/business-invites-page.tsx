"use client";

import { BriefcaseBusiness, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { SelectControl } from "@/components/ui/select";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { BusinessPageHeader } from "@/features/business/business-page-header";
import { Pagination } from "@/features/business/pagination";
import type { BusinessInvite, InvitationType, InviteStatus, PendingApprovalInvite } from "@/lib/access-api";

import { ApprovalDialog } from "./components/approval-dialog";
import { ApprovalCard } from "./components/approval-card";
import { RejectApprovalDialog } from "./components/reject-approval-dialog";
import { SentInviteCard } from "./components/sent-invite-card";
import { usePendingInviteApprovals, useSentBusinessInvites } from "./hooks";
import { type InviteManagementView, resolveInviteManagementView } from "./invitation-workflow";
import { InviteDialog } from "./components/invite-dialog";
import { ErrorState } from "./shared";

export function BusinessInvitesPage({ businessId }: { businessId: string }) {
  const { effectivePermissions } = useBusinessAccess();
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
  const [approvalInvite, setApprovalInvite] = useState<PendingApprovalInvite | null>(null);
  const [rejectInvite, setRejectInvite] = useState<BusinessInvite | null>(null);
  const canInvite = effectivePermissions.has("members:invite");
  const canApprove = effectivePermissions.has("roles:assign");
  const activeView = resolveInviteManagementView(view, canInvite, canApprove);
  const sent = useSentBusinessInvites(businessId, sentPage, sentLimit, status, canInvite && activeView === "sent");
  const pending = usePendingInviteApprovals(businessId, approvalPage, approvalLimit, canApprove && activeView === "approvals");

  useEffect(() => {
    if (searchParams.get("action") !== "invite-employee" || !canInvite) return;
    const frame = requestAnimationFrame(() => setInviteType("EMPLOYEE"));
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    return () => cancelAnimationFrame(frame);
  }, [canInvite, pathname, router, searchParams]);

  if (!canInvite && !canApprove) {
    return <ErrorState error={new Error("You do not have permission to manage invitations.")} />;
  }

  return (
    <>
      <BusinessPageHeader
        title="Invitations"
        description="Invite business members, connect employee records, and review access approvals without mixing each workflow together."
        actions={canInvite ? (
          <>
            <Button onClick={() => setInviteType("MEMBER")}><Plus /> Invite member</Button>
            <Button variant="outline" onClick={() => setInviteType("EMPLOYEE")}><BriefcaseBusiness /> Invite employee</Button>
          </>
        ) : null}
        tabs={[
          ...(canInvite ? [{ label: "Sent invites", active: activeView === "sent", onSelect: () => setView("sent") }] : []),
          ...(canApprove ? [{ label: "Pending approvals", active: activeView === "approvals", onSelect: () => setView("approvals") }] : []),
        ]}
      />

      {canApprove && activeView === "approvals" ? (
        <section className="mt-6">
          <div>
            <h2 className="text-xl font-bold">Pending approvals</h2>
            <p className="mt-1 text-sm text-muted-foreground">Review access, membership, and employee changes before approving.</p>
          </div>
          <div className="mt-4 grid gap-4">
            {pending.isLoading ? <Loading label="Loading…" variant="spinner" className="py-12" />
              : pending.error ? <ErrorState error={pending.error} onRetry={() => pending.refetch()} />
              : pending.data?.items.length ? pending.data.items.map((invite) => (
                <ApprovalCard
                  key={invite.id}
                  invite={invite}
                  permissions={effectivePermissions}
                  onApprove={() => setApprovalInvite(invite)}
                  onReject={() => setRejectInvite(invite)}
                />
              )) : <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">No approvals are waiting.</p>}
          </div>
          {pending.data ? (
            <Pagination
              page={approvalPage}
              totalPages={pending.data.pagination.totalPages}
              total={pending.data.pagination.total}
              limit={approvalLimit}
              fetching={pending.isFetching}
              onPage={setApprovalPage}
              onLimit={(value) => { setApprovalLimit(value); setApprovalPage(1); }}
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
                setStatus((event.target.value || undefined) as InviteStatus | undefined);
                setSentPage(1);
              }}
            >
              <option value="">All statuses</option>
              {["pending", "accepted", "rejected", "expired", "revoked"].map((value) => <option key={value}>{value}</option>)}
            </SelectControl>
          </div>
          <div className="mt-4 grid gap-3">
            {sent.isLoading ? <Loading label="Loading…" variant="spinner" className="py-12" />
              : sent.error ? <ErrorState error={sent.error} onRetry={() => sent.refetch()} />
              : sent.data?.items.length ? sent.data.items.map((invite) => (
                <SentInviteCard key={invite.id} invite={invite} onReview={canApprove ? () => setView("approvals") : undefined} />
              )) : <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">No invitations found.</p>}
          </div>
          {sent.data ? (
            <Pagination
              page={sentPage}
              totalPages={sent.data.pagination.totalPages}
              total={sent.data.pagination.total}
              limit={sentLimit}
              fetching={sent.isFetching}
              onPage={setSentPage}
              onLimit={(value) => { setSentLimit(value); setSentPage(1); }}
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
          onOpenChange={(open) => { if (!open) setInviteType(null); }}
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
      <RejectApprovalDialog businessId={businessId} invite={rejectInvite} onClose={() => setRejectInvite(null)} />
    </>
  );
}
