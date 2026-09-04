"use client";

import { ArrowLeft, Shield, Trash2, UserCog } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { PermissionList } from "@/features/access/shared";
import { useMeQuery } from "@/features/auth/use-me-query";
import { formatDate } from "@/features/dashboard/format";
import { BusinessApiError } from "@/lib/business-api";
import { useBusinessAccess } from "./business-access-context";
import { useBusinessMemberQuery } from "./business-member-hooks";
import {
  ChangeMemberStatusDialog,
  RemoveMemberDialog,
} from "./components/change-member-status-dialog";
import { ChangeMemberRoleDialog } from "./components/member-management-dialogs";
import { MemberAvatar } from "./member-avatar";
import { MemberDetailItem } from "./member-detail-item";
import {
  canUpdateMemberRole,
  canUpdateMemberStatus,
} from "./member-role-options";
import { MemberStatusBadge } from "./member-status-badge";
import { MembersState } from "./members-state";

export function BusinessMemberDetailPage({
  businessId,
  memberId,
}: {
  businessId: string;
  memberId: string;
}) {
  const access = useBusinessAccess();
  const me = useMeQuery();
  const canView = access.effectivePermissions.has("members:view");
  const canUpdateRole = canUpdateMemberRole(access.effectivePermissions);
  const canUpdateStatus = canUpdateMemberStatus(access.effectivePermissions);
  const canRemove = access.effectivePermissions.has("members:remove");
  const query = useBusinessMemberQuery(businessId, memberId, canView);
  const [roleOpen, setRoleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  if (query.isLoading) {
    return (
      <Loading label="Loading member…" variant="spinner" />
    );
  }

  if (query.error instanceof BusinessApiError && query.error.status === 403) {
    return (
      <MembersState
        title="Permission required"
        detail="The server denied access to this business member."
      />
    );
  }

  if (query.error instanceof BusinessApiError && query.error.status === 404) {
    return (
      <MembersState
        title="Member not found"
        detail="This membership does not exist in the selected business."
      />
    );
  }

  if (query.isError || !query.data) {
    return (
      <MembersState
        title="Unable to load member"
        detail={query.error?.message ?? "The request could not be completed."}
        retry={() => query.refetch()}
      />
    );
  }

  const member = query.data;
  const protectedMember =
    member.status === "removed" ||
    member.roleId.key === "owner" ||
    me.data?.id === member.userId.id;
  return (
    <>
      <Link
        href={`/business/${businessId}/members`}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Members
      </Link>

      <section className="mt-5 rounded-md border border-border bg-card p-6 shadow-sm">
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
            {canUpdateRole && !protectedMember ? (
              <Button variant="outline" onClick={() => setRoleOpen(true)}>
                <UserCog className="h-4 w-4" /> Change role
              </Button>
            ) : null}
            {canUpdateStatus && !protectedMember ? (
              <Button variant="outline" onClick={() => setStatusOpen(true)}>
                <Shield className="h-4 w-4" />
                {member.status === "active" ? "Suspend" : "Reactivate"}
              </Button>
            ) : null}
            {canRemove && !protectedMember ? (
              <Button variant="destructive" onClick={() => setRemoveOpen(true)}>
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            ) : null}
          </div>
        </div>

        <dl className="mt-7 grid gap-5 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <MemberDetailItem label="Role" value={member.roleId.name} />
          <MemberDetailItem label="Role type" value={member.roleId.type} />
          <MemberDetailItem
            label="Invited by"
            value={
              member.invitedByUserId
                ? `${member.invitedByUserId.name} (${member.invitedByUserId.email})`
                : "Not recorded"
            }
          />
          <MemberDetailItem
            label="Member since"
            value={formatDate(member.createdAt)}
          />
          <MemberDetailItem
            label="Last updated"
            value={formatDate(member.updatedAt)}
          />
          <MemberDetailItem label="Membership ID" value={member.id} />
          {member.roleUpdatedByUserId && member.roleUpdatedAt ? (
            <MemberDetailItem
              label="Role last updated"
              value={`${member.roleUpdatedByUserId.name} · ${formatDate(member.roleUpdatedAt)}`}
            />
          ) : null}
          {member.statusUpdatedByUserId && member.statusUpdatedAt ? (
            <MemberDetailItem
              label="Status last updated"
              value={`${member.statusUpdatedByUserId.name} · ${formatDate(member.statusUpdatedAt)}`}
            />
          ) : null}
          {member.removedByUserId && member.removedAt ? (
            <MemberDetailItem
              label="Removed"
              value={`${member.removedByUserId.name} · ${formatDate(member.removedAt)}`}
            />
          ) : null}
        </dl>
        <div className="mt-6 border-t border-border pt-6">
          <h2 className="font-semibold">Current role access</h2>
          <div className="mt-4 rounded-md bg-muted/30 p-4">
            <PermissionList
              permissions={member.roleId.permissions}
              denied={member.roleId.deniedPermissions}
            />
          </div>
        </div>
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
      {removeOpen ? (
        <RemoveMemberDialog member={member} open onOpenChange={setRemoveOpen} />
      ) : null}
    </>
  );
}
