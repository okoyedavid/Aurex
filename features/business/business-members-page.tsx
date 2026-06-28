"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

import { useBusinessAccess } from "./business-access-context";
import { useBusinessMembersQuery } from "./business-member-hooks";
import {
  MemberAvatar,
  MembersPageFrame,
  MembersState,
  MemberStatusBadge,
} from "./business-member-ui";
import { normalizePagination } from "./employee-list-display";
import { Pagination } from "./employee-lists-page";
import { BusinessApiError } from "@/lib/business-api";

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
      <MembersPageFrame>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading members…
        </div>
      </MembersPageFrame>
    );
  }

  if (query.error instanceof BusinessApiError && query.error.status === 403) {
    return (
      <MembersPageFrame>
        <MembersState
          title="Permission required"
          detail="The server denied access to this business's members."
        />
      </MembersPageFrame>
    );
  }

  if (query.isError) {
    return (
      <MembersPageFrame>
        <MembersState
          title="Unable to load members"
          detail={query.error.message}
          retry={() => query.refetch()}
        />
      </MembersPageFrame>
    );
  }

  const data = query.data!;
  return (
    <MembersPageFrame>
      <p className="text-sm text-muted-foreground">{access.business.name}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">Members</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        View people with access to this business and their assigned roles.
      </p>

      <div className="mt-7 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
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
    </MembersPageFrame>
  );
}
