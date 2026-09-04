"use client";

import { SelectControl } from "@/components/ui/select";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { Pagination } from "@/features/business/pagination";
import type { InviteStatus } from "@/lib/access-api";

import {
  useAcceptBusinessInvite,
  useReceivedBusinessInvites,
  useRejectBusinessInvite,
} from "./hooks";
import { InviteEmployeeSummary } from "./invite-employee-summary";
import { invitationAcceptanceMessage } from "./invitation-workflow";
import {
  Badge,
  ErrorState,
  formatDateTime,
  PermissionList,
} from "./shared";

export function ReceivedInvitesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<InviteStatus | undefined>("pending");
  const query = useReceivedBusinessInvites(page, limit, status);
  const accept = useAcceptBusinessInvite();
  const reject = useRejectBusinessInvite();
  const pendingId = accept.variables ?? reject.variables;

  const act = (id: string, kind: "accept" | "reject") => {
    const mutation = kind === "accept" ? accept : reject;
    mutation.mutate(id, {
      onSuccess: (result) => {
        if (kind === "accept" && "meta" in result) {
          toast.success(invitationAcceptanceMessage(result.meta));
        } else {
          toast.success("Invitation rejected.");
        }
      },
      onError: (error) => {
        toast.error(error.message);
        void query.refetch();
      },
    });
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Personal dashboard</p>
            <h1 className="mt-1 text-3xl font-bold">Business invitations</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review pending access and employee invitations.
            </p>
          </div>
          <SelectControl
            aria-label="Invitation status"
            className="h-9 w-40 shrink-0 rounded-md border border-input bg-background px-3 text-sm"
            value={status ?? ""}
            onChange={(event) => {
              setStatus(
                (event.target.value || undefined) as InviteStatus | undefined,
              );
              setPage(1);
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

        <div className="mt-7 grid gap-4">
          {query.isLoading ? (
            <Loading label="Loading…" variant="spinner" className="py-12" />
          ) : query.error ? (
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          ) : query.data?.items.length ? (
            query.data.items.map((invite) => (
              <article
                key={invite.id}
                className="rounded-md border border-border bg-card p-5"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div className="flex gap-3">
                    {invite.businessId.profile_img ? (
                      <span
                        className="h-11 w-11 rounded-md bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${invite.businessId.profile_img})`,
                        }}
                      />
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 font-bold text-primary">
                        {invite.businessId.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">
                          {invite.businessId.name}
                        </h2>
                        <Badge>{invite.type.toLowerCase()}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Invited by {invite.invitedByUserId.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      tone={
                        invite.status === "accepted"
                          ? "good"
                          : invite.status === "pending"
                            ? "warn"
                            : "neutral"
                      }
                    >
                      {invite.status}
                    </Badge>
                    {invite.status === "accepted" &&
                    invite.approvalStatus === "pending" ? (
                      <Badge tone="warn">awaiting approval</Badge>
                    ) : null}
                  </div>
                </div>

                <section className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Requested role
                  </p>
                  <p className="mt-1 font-semibold">{invite.roleId.name}</p>
                  <div className="mt-3 rounded-md bg-muted/40 p-4">
                    <PermissionList
                      permissions={invite.roleId.permissions}
                      denied={invite.roleId.deniedPermissions}
                    />
                  </div>
                </section>

                {invite.type === "EMPLOYEE" && invite.employeeId ? (
                  <div className="mt-4">
                    <InviteEmployeeSummary employeeId={invite.employeeId} />
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">
                    Expires {formatDateTime(invite.expiresAt)}
                  </p>
                  {invite.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={Boolean(pendingId)}
                        onClick={() => act(invite.id, "reject")}
                      >
                        Reject
                      </Button>
                      <Button
                        disabled={Boolean(pendingId)}
                        onClick={() => act(invite.id, "accept")}
                      >
                        Accept
                      </Button>
                    </div>
                  ) : invite.status === "accepted" &&
                    invite.approvalStatus !== "pending" ? (
                    <Button asChild>
                      <Link href={`/business/${invite.businessId.id}`}>
                        Open business
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
              No invitations found.
            </p>
          )}
        </div>

        {query.data ? (
          <Pagination
            page={page}
            totalPages={query.data.pagination.totalPages}
            total={query.data.pagination.total}
            limit={limit}
            fetching={query.isFetching}
            onPage={setPage}
            onLimit={(value) => {
              setLimit(value);
              setPage(1);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
