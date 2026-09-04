"use client";

import { MoreHorizontal, Shield, Trash2, UserCog } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Loading } from "@/components/ui/loading";
import { useMeQuery } from "@/features/auth/use-me-query";
import { BusinessApiError, businessErrorMessage } from "@/lib/business-api";
import type { BusinessMember } from "@/lib/business-members-api";
import { useBusinessAccess } from "./business-access-context";
import { useBusinessMembersQuery } from "./business-member-hooks";
import { BusinessPageHeader } from "./business-page-header";
import {
  ChangeMemberStatusDialog,
  RemoveMemberDialog,
} from "./components/change-member-status-dialog";
import { ChangeMemberRoleDialog } from "./components/member-management-dialogs";
import { normalizePagination } from "./employee-list-display";
import { MemberAvatar } from "./member-avatar";
import {
  canUpdateMemberRole,
  canUpdateMemberStatus,
} from "./member-role-options";
import { MemberStatusBadge } from "./member-status-badge";
import { MembersState } from "./members-state";
import { Pagination } from "./pagination";

export function BusinessMembersPage({ businessId }: { businessId: string }) {
  const access = useBusinessAccess();
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = normalizePagination(searchParams.get("page"), 1);
  const limit = normalizePagination(searchParams.get("limit"), 20, 100);
  const canView = access.effectivePermissions.has("members:view");
  const query = useBusinessMembersQuery(businessId, page, limit, canView);

  const navigate = useCallback(
    (nextPage: number, nextLimit = limit) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPage));
      params.set("limit", String(nextLimit));
      router.push(`?${params}`);
    },
    [limit, router, searchParams],
  );

  useEffect(() => {
    if (
      searchParams.get("page") !== String(page) ||
      searchParams.get("limit") !== String(limit)
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));
      params.set("limit", String(limit));
      router.replace(`?${params}`);
    }
  }, [limit, page, router, searchParams]);

  useEffect(() => {
    if (
      query.data &&
      query.data.items.length === 0 &&
      page > Math.max(1, query.data.pagination.totalPages)
    ) {
      navigate(Math.max(1, query.data.pagination.totalPages));
    }
  }, [navigate, page, query.data]);

  if (query.isLoading) {
    return (
      <Loading label="Loading members…" variant="spinner" />
    );
  }

  if (query.error instanceof BusinessApiError && query.error.status === 403) {
    return (
      <MembersState
        title="Permission required"
        detail="The server denied access to this business's members."
      />
    );
  }

  if (query.isError) {
    return (
      <MembersState
        title="Unable to load members"
        detail={businessErrorMessage(query.error)}
        retry={() => query.refetch()}
      />
    );
  }

  const data = query.data!;
  return (
    <>
      <BusinessPageHeader
        title="Members"
        description="View people with access to this business and their assigned roles."
      />

      <div className="mt-7 overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        {data.items.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold">No business members</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No memberships were returned for this business.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Member</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Invited by</th>
                <th className="p-4 font-medium">Joined</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((member) => (
                <tr key={member.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <Link
                      href={`/business/${businessId}/members/${member.id}`}
                      className="flex items-center gap-3"
                    >
                      <MemberAvatar user={member.userId} />
                      <span>
                        <span className="block font-semibold text-primary hover:underline">
                          {member.userId.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {member.userId.email}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="p-4">{member.roleId.name}</td>
                  <td className="p-4">
                    <MemberStatusBadge status={member.status} />
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {member.invitedByUserId?.name ?? "Not recorded"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <MemberRowActions member={member} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        page={data.pagination.page}
        totalPages={data.pagination.totalPages}
        total={data.pagination.total}
        limit={limit}
        fetching={query.isFetching}
        onPage={(value) => navigate(value)}
        onLimit={(value) => navigate(1, value)}
      />
    </>
  );
}

function MemberRowActions({ member }: { member: BusinessMember }) {
  const { effectivePermissions } = useBusinessAccess();
  const me = useMeQuery();
  const [roleOpen, setRoleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const protectedMember =
    member.status === "removed" ||
    member.roleId.key === "owner" ||
    me.data?.id === member.userId.id;
  const role = !protectedMember && canUpdateMemberRole(effectivePermissions);
  const status =
    !protectedMember && canUpdateMemberStatus(effectivePermissions);
  const remove = !protectedMember && effectivePermissions.has("members:remove");
  if (!role && !status && !remove)
    return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <>
      <details className="relative inline-block text-left">
        <summary
          className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-md border border-border hover:bg-muted"
          aria-label={`Actions for ${member.userId.name}`}
        >
          <MoreHorizontal className="h-4 w-4" />
        </summary>
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-md border border-border bg-popover p-1 shadow-lg">
          {role ? (
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => setRoleOpen(true)}
            >
              <UserCog className="h-4 w-4" /> Change role
            </button>
          ) : null}
          {status ? (
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => setStatusOpen(true)}
            >
              <Shield className="h-4 w-4" />{" "}
              {member.status === "active" ? "Suspend" : "Reactivate"}
            </button>
          ) : null}
          {remove ? (
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
              onClick={() => setRemoveOpen(true)}
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          ) : null}
        </div>
      </details>
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
