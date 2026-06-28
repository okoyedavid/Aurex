import type { Metadata } from "next";
import Link from "next/link";

import { formatDate } from "@/features/dashboard/format";
import { getUserBusinessSummaries } from "@/features/dashboard/mock-data";

export const metadata: Metadata = {
  title: "Businesses",
  description: "Businesses connected to your Aurex account.",
};

export default function DashboardBusinessesPage() {
  const businesses = getUserBusinessSummaries();

  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <div>
          <p className="text-sm text-muted-foreground">Personal dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Businesses</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Businesses you own or belong to. Open one to manage payments, invoices, members, and providers.
          </p>
        </div>

        <div className="mt-7 grid gap-4">
          {businesses.map(({ business, role, member, pendingPaymentsCount, pendingInvitesCount, lastActivityAt }) => (
            <Link
              key={business.id}
              href={`/business/${business.id}`}
              className="border border-border bg-card p-5 shadow-sm transition hover:bg-muted/40"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{business.name}</h2>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{role.name}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{member.status}</span>
                    {!business.isVerified ? (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">Unverified</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{business.industry} - {business.defaultCurrency}</p>
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3 lg:min-w-[460px]">
                  <span>{pendingPaymentsCount} pending payments</span>
                  <span>{pendingInvitesCount} pending invites</span>
                  <span>Last activity {formatDate(lastActivityAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
