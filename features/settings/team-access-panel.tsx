"use client";

import { UserPlus, UsersRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { useBusinessMembersQuery } from "@/features/business/business-member-hooks";
import { MemberAvatar } from "@/features/business/member-avatar";
import { MemberStatusBadge } from "@/features/business/member-status-badge";
import { SettingsSection } from "@/features/settings/settings-section";

export function TeamAccessPanel() {
  const { business, effectivePermissions } = useBusinessAccess();
  const canInvite = canInviteBusinessMembers(effectivePermissions);
  const canView = effectivePermissions.has("members:view");
  const membersQuery = useBusinessMembersQuery(business.id, 1, 20, canView);
  const members = membersQuery.data?.items ?? [];

  return (
    <SettingsSection
      id="team"
      title="Team and access"
      description="Preview workspace membership and role assignments."
      icon={UsersRound}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">
            {membersQuery.data?.pagination.total ?? 0} workspace members
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Review the people who can access this business and their roles.
          </p>
        </div>
        {canInvite ? (
          <Button type="button" className="h-10 shrink-0 rounded-md">
            <UserPlus className="h-4 w-4" />
            Invite member
          </Button>
        ) : null}
      </div>

      {!canView ? (
        <p className="mt-6 rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          You do not have permission to view business members.
        </p>
      ) : membersQuery.isLoading ? (
        <Skeleton className="mt-6 h-24" />
      ) : membersQuery.isError ? (
        <FeedbackState
          className="mt-6"
          variant="inline"
          title="Unable to load business members"
          message="The workspace member list is temporarily unavailable."
          retry={() => void membersQuery.refetch()}
        />
      ) : members.length === 0 ? (
        <p className="mt-6 rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          No business members were returned.
        </p>
      ) : (
        <div className="mt-6 divide-y divide-border border-y border-border">
          {members.map((member) => (
            <article
              key={member.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <MemberAvatar user={member.userId} />
                <div className="min-w-0">
                  <Link
                    href={`/business/${business.id}/members/${member.id}`}
                    className="truncate text-sm font-semibold text-primary hover:underline"
                  >
                    {member.userId.name}
                  </Link>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {member.userId.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-[52px] sm:pl-0">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {member.roleId.name}
                </span>
                <MemberStatusBadge status={member.status} />
              </div>
            </article>
          ))}
        </div>
      )}
    </SettingsSection>
  );
}

export function canInviteBusinessMembers(
  permissions: ReadonlySet<import("@/types/generic").Permission>,
) {
  return permissions.has("members:invite");
}
