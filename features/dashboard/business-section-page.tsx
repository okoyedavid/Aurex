import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessSectionMetric as Metric } from "./business-section-metric";

import { formatDate } from "@/features/dashboard/format";
import {
  getBusinessById,
  getBusinessDashboardSummary,
  invites,
  roles,
} from "@/features/dashboard/mock-data";

const sectionDescriptions: Record<string, string> = {
  payments:
    "Review pending, approved, failed, and cancelled payment workflows.",
  invoices: "Track draft, sent, overdue, and paid invoices for this business.",
  providers: "Manage payout providers and operational vendor records.",
  members: "Review workspace members, status, and business access.",
  roles: "Inspect system and custom roles mapped to business permissions.",
  invites:
    "Track pending, accepted, expired, and revoked business invitations.",
  "audit-logs": "Review business audit events and security-sensitive changes.",
};

export function BusinessSectionPage({
  businessId,
  section,
}: {
  businessId: string;
  section: keyof typeof sectionDescriptions;
}) {
  const business = getBusinessById(businessId);
  const summary = getBusinessDashboardSummary(businessId);

  if (!business || !summary) {
    notFound();
  }

  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <p className="text-sm text-muted-foreground">{business.name}</p>
        <h1 className="mt-1 text-3xl font-bold capitalize tracking-tight">
          {section.replace("-", " ")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {sectionDescriptions[section]}
        </p>

        <div className="mt-7 border border-border bg-card p-5 shadow-sm">
          {section === "payments" ? (
            <div className="grid gap-4 sm:grid-cols-4">
              <Metric label="Pending" value={summary.payments.pending} />
              <Metric label="Approved" value={summary.payments.approved} />
              <Metric label="Failed" value={summary.payments.failed} />
              <Metric
                label="Total value"
                value={`NGN ${summary.payments.totalValue.toLocaleString("en-NG")}`}
              />
            </div>
          ) : null}
          {section === "invoices" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <Metric label="Draft" value={summary.invoices.draft} />
              <Metric label="Sent" value={summary.invoices.sent} />
              <Metric label="Overdue" value={summary.invoices.overdue} />
            </div>
          ) : null}
          {section === "providers" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Metric
                label="Active providers"
                value={summary.providers.active}
              />
              <Metric
                label="Pending providers"
                value={summary.providers.pending}
              />
            </div>
          ) : null}
          {section === "members" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Metric label="Active members" value={summary.members.active} />
              <Metric label="Invited members" value={summary.members.invited} />
            </div>
          ) : null}
          {section === "roles" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-md border border-border bg-background p-4"
                >
                  <p className="font-semibold">{role.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {role.permissions.length} permissions - {role.type}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {section === "invites" ? (
            <div className="divide-y divide-border">
              {invites
                .filter((invite) => invite.businessId === business.id)
                .map((invite) => (
                  <div key={invite.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{invite.email}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {invite.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Expires {formatDate(invite.expiresAt)}
                    </p>
                  </div>
                ))}
            </div>
          ) : null}
          {section === "audit-logs" ? (
            <div className="space-y-3">
              {summary.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No audit events available for this business.
                </p>
              ) : (
                summary.recentActivity.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-md border border-border bg-background p-4"
                  >
                    <p className="font-semibold">{event.eventType}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.outcome} - {formatDate(event.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>

        <Link
          href={`/business/${business.id}`}
          className="mt-5 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Back to business overview
        </Link>
      </div>
    </div>
  );
}
