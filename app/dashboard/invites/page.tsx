import type { Metadata } from "next";
import Link from "next/link";

import { formatDate } from "@/features/dashboard/format";
import { businesses, invites, roles } from "@/features/dashboard/mock-data";

export const metadata: Metadata = {
  title: "Invites",
  description: "Business invites connected to your account.",
};

export default function DashboardInvitesPage() {
  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <p className="text-sm text-muted-foreground">Personal dashboard</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Invites</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Pending, accepted, expired, and revoked invitations across your businesses.
        </p>

        <div className="mt-7 divide-y divide-border border-y border-border bg-card">
          {invites.map((invite) => {
            const business = businesses.find((item) => item.id === invite.businessId);
            const role = roles.find((item) => item.id === invite.roleId);

            return (
              <article key={invite.id} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{business?.name ?? "Unknown business"}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{invite.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {invite.email} invited as {role?.name ?? "Member"} - expires {formatDate(invite.expiresAt)}
                    </p>
                  </div>
                  {business ? (
                    <Link href={`/business/${business.id}/invites`} className="text-sm font-semibold text-primary hover:underline">
                      Open invites
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
