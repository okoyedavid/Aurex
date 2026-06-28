"use client";

import Link from "next/link";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { formatDate, formatNaira } from "@/features/dashboard/format";
import { getBusinessDashboardSummary } from "@/features/dashboard/mock-data";

export function BusinessDashboard({ businessId }: { businessId: string }) {
  const { business, membership } = useBusinessAccess();
  const summary = getBusinessDashboardSummary(businessId);
  const currentUserRole = membership?.role;
  const payments = summary?.payments ?? {
    pending: 0,
    approved: 0,
    failed: 0,
    totalValue: 0,
  };
  const invoices = summary?.invoices ?? {
    draft: 0,
    sent: 0,
    overdue: 0,
  };
  const providers = summary?.providers ?? {
    active: 0,
    pending: 0,
  };
  const members = summary?.members ?? {
    active: membership?.status === "active" ? 1 : 0,
    invited: 0,
  };
  const recentActivity = summary?.recentActivity ?? [];

  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1480px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {currentUserRole?.name ?? "Member"}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {business.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Operational view for payments, invoices, providers, members, and
              audit activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/business/${business.id}/payments`}
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Review payments
            </Link>
            <Link
              href={`/business/${business.id}/settings`}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold"
            >
              Business settings
            </Link>
          </div>
        </div>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Pending payments</p>
            <p className="mt-3 text-3xl font-bold">{payments.pending}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatNaira(payments.totalValue)} total value
            </p>
          </div>
          <div className="border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Invoices</p>
            <p className="mt-3 text-3xl font-bold">{invoices.sent}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {invoices.overdue} overdue - {invoices.draft} draft
            </p>
          </div>
          <div className="border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Providers</p>
            <p className="mt-3 text-3xl font-bold">{providers.active}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {providers.pending} pending review
            </p>
          </div>
          <div className="border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Members</p>
            <p className="mt-3 text-3xl font-bold">{members.active}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {members.invited} invited
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Business health</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="mt-1 font-semibold">{business.status}</p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Verification</p>
                <p className="mt-1 font-semibold">
                  {business.isVerified ? "Verified" : "Incomplete"}
                </p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Currency</p>
                <p className="mt-1 font-semibold">{business.defaultCurrency}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Link
                href={`/business/${business.id}/invoices`}
                className="rounded-md border border-border bg-background p-4 hover:bg-muted/50"
              >
                <p className="font-semibold">Invoices summary</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Draft, sent, and overdue invoices.
                </p>
              </Link>
              <Link
                href={`/business/${business.id}/members`}
                className="rounded-md border border-border bg-background p-4 hover:bg-muted/50"
              >
                <p className="font-semibold">Members summary</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Roles, active members, and invites.
                </p>
              </Link>
              <Link
                href={`/business/${business.id}/audit-logs`}
                className="rounded-md border border-border bg-background p-4 hover:bg-muted/50"
              >
                <p className="font-semibold">Audit and security</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recent security and account events.
                </p>
              </Link>
            </div>
          </section>

          <section className="border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Recent business activity</h2>
            <div className="mt-4 space-y-3">
              {(recentActivity.length > 0 ? recentActivity : []).map(
                (event) => (
                  <div
                    key={event.id}
                    className="rounded-md border border-border bg-background p-4"
                  >
                    <p className="text-sm font-semibold">{event.eventType}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.outcome} - {formatDate(event.createdAt)}
                    </p>
                  </div>
                ),
              )}
              {recentActivity.length === 0 ? (
                <p className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
                  No recent business-specific activity in the dummy data.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
