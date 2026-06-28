import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/features/dashboard/format";
import {
  auditEvents,
  currentUser,
  getUserBusinessSummaries,
  invites,
  pendingActions,
} from "@/features/dashboard/mock-data";

const severityClass = {
  info: "bg-primary/10 text-primary",
  warning: "bg-secondary text-secondary-foreground",
  critical: "bg-destructive/10 text-destructive",
};

export function PersonalDashboard() {
  const businesses = getUserBusinessSummaries();
  const pendingInvites = invites.filter((invite) => invite.status === "pending");
  const pendingPayments = businesses.reduce(
    (total, item) => total + item.pendingPaymentsCount,
    0,
  );
  const securityAlerts = auditEvents.filter(
    (event) => event.category === "authentication" && event.severity !== "info",
  );

  const summaryCards: Array<{
    label: string;
    value: number;
    icon: LucideIcon;
  }> = [
    { label: "Total businesses", value: businesses.length, icon: Building2 },
    { label: "Pending invites", value: pendingInvites.length, icon: UserPlus },
    { label: "Pending approvals", value: pendingPayments, icon: Clock3 },
    { label: "Security alerts", value: securityAlerts.length, icon: AlertTriangle },
  ];

  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Personal dashboard</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              What needs your attention?
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              A calm overview of your businesses, invites, approvals, and account security.
            </p>
          </div>
          <Button asChild className="h-10 rounded-md px-4">
            <Link href="/dashboard/business">Create Business</Link>
          </Button>
        </div>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 text-3xl font-bold text-card-foreground">{value}</p>
            </div>
          ))}
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-bold">My businesses</h2>
              <Link href="/dashboard/business" className="text-sm font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-4 divide-y divide-border">
              {businesses.map(({ business, role, member, pendingPaymentsCount, pendingInvitesCount, lastActivityAt }) => (
                <Link
                  key={business.id}
                  href={`/business/${business.id}`}
                  className="block py-4 transition hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{business.name}</p>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {role.name}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {business.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {business.industry} - member {member.status} - last activity {formatDate(lastActivityAt)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pendingPaymentsCount} payments - {pendingInvitesCount} invites
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-bold">Pending actions</h2>
            <div className="mt-4 space-y-3">
              {pendingActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.href}
                  className="block rounded-md border border-border bg-background p-4 transition hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{action.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${severityClass[action.severity]}`}>
                      {action.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{action.description}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-bold">Recent activity</h2>
            <div className="mt-4 space-y-3">
              {auditEvents.slice(0, 4).map((event) => (
                <div key={event.id} className="flex gap-3 rounded-md border border-border bg-background p-4">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{event.eventType}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.outcome} from {event.deviceName ?? "Unknown device"} - {formatDate(event.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-bold">Account and security snapshot</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Email verified</p>
                <p className="mt-1 font-semibold">{currentUser.emailVerifiedAt ? "Verified" : "Needs verification"}</p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">OTP sign-in</p>
                <p className="mt-1 font-semibold">{currentUser.preferences.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Active sessions</p>
                <p className="mt-1 font-semibold">3 devices</p>
              </div>
              <div className="rounded-md border border-border bg-background p-4">
                <p className="text-xs text-muted-foreground">Last login</p>
                <p className="mt-1 font-semibold">Office workstation</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-md bg-secondary p-4 text-secondary-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="text-sm">Security settings are managed in personal settings, not business settings.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
