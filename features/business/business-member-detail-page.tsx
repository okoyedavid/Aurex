"use client";

import { ArrowLeft, Loader2, Shield, UserCog } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ChangeMemberRoleDialog,
  ChangeMemberStatusDialog,
} from "./components/member-management-dialogs";
import { useBusinessAccess } from "./business-access-context";
import { useBusinessMemberQuery } from "./business-member-hooks";
import {
  MemberAvatar,
  MembersPageFrame,
  MembersState,
  MemberStatusBadge,
} from "./business-member-ui";
import { BusinessApiError } from "@/lib/business-api";
import {
  canUpdateMemberRole,
  canUpdateMemberStatus,
} from "./member-role-options";

export function BusinessMemberDetailPage({
  businessId,
  memberId,
}: {
  businessId: string;
  memberId: string;
}) {
  const access = useBusinessAccess();
  const canView = access.effectivePermissions.has("members:view");
  const canUpdateRole = canUpdateMemberRole(access.effectivePermissions);
  const canUpdateStatus = canUpdateMemberStatus(access.effectivePermissions);
  const query = useBusinessMemberQuery(businessId, memberId, canView);
  const [roleOpen, setRoleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  if (query.isLoading) {
    return (
      <MembersPageFrame>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading member…
        </div>
      </MembersPageFrame>
    );
  }

  if (query.error instanceof BusinessApiError && query.error.status === 403) {
    return (
      <MembersPageFrame>
        <MembersState
          title="Permission required"
          detail="The server denied access to this business member."
        />
      </MembersPageFrame>
    );
  }

  if (query.error instanceof BusinessApiError && query.error.status === 404) {
    return (
      <MembersPageFrame>
        <MembersState
          title="Member not found"
          detail="This membership does not exist in the selected business."
        />
      </MembersPageFrame>
    );
  }

  if (query.isError || !query.data) {
    return (
      <MembersPageFrame>
        <MembersState
          title="Unable to load member"
          detail={query.error?.message ?? "The request could not be completed."}
          retry={() => query.refetch()}
        />
      </MembersPageFrame>
    );
  }

  const member = query.data;
  return (
    <MembersPageFrame>
      <Link
        href={`/business/${businessId}/members`}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Members
      </Link>

      <section className="mt-5 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <MemberAvatar user={member.userId} />
            <div>
              <h1 className="text-2xl font-bold">{member.userId.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {member.userId.email}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MemberStatusBadge status={member.status} />
            {canUpdateRole && member.roleId.key !== "owner" ? (
              <Button variant="outline" onClick={() => setRoleOpen(true)}>
                <UserCog className="h-4 w-4" /> Change role
              </Button>
            ) : null}
            {canUpdateStatus ? (
              <Button variant="outline" onClick={() => setStatusOpen(true)}>
                <Shield className="h-4 w-4" /> Change status
              </Button>
            ) : null}
          </div>
        </div>

        <dl className="mt-7 grid gap-5 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Role" value={member.roleId.name} />
          <Detail label="Role type" value={member.roleId.type} />
          <Detail
            label="Invited by"
            value={
              member.invitedByUserId
                ? `${member.invitedByUserId.name} (${member.invitedByUserId.email})`
                : "Not recorded"
            }
          />
          <Detail label="Member since" value={formatDate(member.createdAt)} />
          <Detail label="Last updated" value={formatDate(member.updatedAt)} />
          <Detail label="Membership ID" value={member.id} />
        </dl>
      </section>
      {roleOpen ? (
        <ChangeMemberRoleDialog
          member={member}
          open
          onOpenChange={setRoleOpen}
        />
      ) : null}
      {statusOpen ? (
        <ChangeMemberStatusDialog
          member={member}
          open
          onOpenChange={setStatusOpen}
        />
      ) : null}
    </MembersPageFrame>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold capitalize">
        {value}
      </dd>
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}
