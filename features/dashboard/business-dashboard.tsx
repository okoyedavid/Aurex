"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleAlert,
  ListChecks,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { useBusinessMembersQuery } from "@/features/business/business-member-hooks";
import { useEmployeeListsQuery } from "@/features/business/employee-list-hooks";
import {
  useNotifications,
  usePendingInviteApprovals,
  useSentBusinessInvites,
} from "@/features/access/hooks";
import { Badge, formatDateTime } from "@/features/access/shared";

export function BusinessDashboard({ businessId }: { businessId: string }) {
  const { business, membership, effectivePermissions } = useBusinessAccess();
  const canMembers = effectivePermissions.has("members:view");
  const canLists = effectivePermissions.has("employee_lists:view");
  const canInvites = effectivePermissions.has("members:invite");
  const canApprove = effectivePermissions.has("roles:assign");
  const members = useBusinessMembersQuery(businessId, 1, 5, canMembers);
  const lists = useEmployeeListsQuery(businessId, 1, 4, canLists);
  const invites = useSentBusinessInvites(
    businessId,
    1,
    4,
    "pending",
    canInvites,
  );
  const approvals = usePendingInviteApprovals(businessId, 1, 4, canApprove);
  const notifications = useNotifications(1, 4, false);
  const listItems = lists.data?.items ?? [];
  const employees = listItems.reduce(
    (sum, list) => sum + list.totalEmployeeCount,
    0,
  );
  const verified = listItems.reduce(
    (sum, list) => sum + list.verifiedEmployeeCount,
    0,
  );
  const pendingInvites = invites.data?.pagination.total ?? 0;
  const pendingApprovals = approvals.data?.pagination.total ?? 0;
  const primaryAction = canLists
    ? {
        href: `/business/${businessId}/employees/employee-lists`,
        label: "Open employee lists",
      }
    : canMembers
      ? { href: `/business/${businessId}/members`, label: "View members" }
      : null;

  const metrics = [
    {
      label: "Active members",
      value:
        members.data?.pagination.total ??
        (membership.status === "active" ? 1 : 0),
      detail: canMembers
        ? "People with workspace access"
        : "Permission required",
      icon: Users,
      href: `/business/${businessId}/members`,
      visible: canMembers,
    },
    {
      label: "Employee lists",
      value: lists.data?.pagination.total ?? 0,
      detail: canLists
        ? `${employees} employees in loaded lists`
        : "Permission required",
      icon: ListChecks,
      href: `/business/${businessId}/employees/employee-lists`,
      visible: canLists,
    },
    {
      label: "Pending invites",
      value: pendingInvites,
      detail: canInvites
        ? pendingInvites
          ? "Awaiting a response"
          : "No current invites"
        : "Permission required",
      icon: UserPlus,
      href: `/business/${businessId}/invites`,
      visible: canInvites,
    },
    {
      label: "Unread notifications",
      value: notifications.data?.unreadCount ?? 0,
      detail: "Your personal inbox",
      icon: Bell,
      href: "/dashboard/notifications",
      visible: true,
    },
  ];

  return (
    <div className="min-w-0 px-3 py-5 pb-12 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto min-w-0 max-w-[1360px]">
        <section className="relative overflow-hidden rounded-md border border-border bg-card p-4 shadow-sm sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary/10 text-lg font-bold text-primary sm:h-14 sm:w-14 sm:text-xl">
                {business.profile_img ? (
                  <span
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${business.profile_img})` }}
                  />
                ) : (
                  business.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={business.status === "active" ? "good" : "warn"}>
                    {business.status}
                  </Badge>
                  {business.isVerified ? (
                    <Badge tone="good">verified</Badge>
                  ) : (
                    <Badge tone="warn">verification incomplete</Badge>
                  )}
                </div>
                <h1 className="mt-2 break-words text-2xl font-bold tracking-tight sm:text-4xl">
                  {business.name}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  A live view of your team, employee operations, access
                  requests, and account activity.
                </p>
              </div>
            </div>
            <div className="grid w-full grid-cols-1 gap-2 min-[420px]:flex min-[420px]:w-auto min-[420px]:flex-wrap">
              {primaryAction ? (
                <Button asChild className="w-full min-[420px]:w-auto">
                  <Link href={primaryAction.href}>
                    {primaryAction.label}
                    <ArrowRight />
                  </Link>
                </Button>
              ) : null}
              {effectivePermissions.has("business:update") ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full min-[420px]:w-auto"
                >
                  <Link href={`/business/${businessId}/settings`}>
                    <Settings />
                    Settings
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics
            .filter((m) => m.visible)
            .map(({ label, value, detail, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                className="group rounded-md border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-3 text-3xl font-bold">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {detail}
                    </p>
                  </div>
                  <span className="h-fit rounded-md bg-primary/10 p-2.5 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            ))}
        </section>

        {canApprove && pendingApprovals > 0 ? (
          <section className="mt-5 flex flex-col gap-4 rounded-md border border-amber-500/25 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 gap-3">
              <span className="h-fit rounded-md bg-amber-500/10 p-2.5 text-amber-700 dark:text-amber-300">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">
                  {pendingApprovals} membership approval
                  {pendingApprovals === 1 ? "" : "s"} waiting
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Accepted invitations require an authorized role assignment
                  decision.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/business/${businessId}/invites`}>
                Review approvals <ArrowRight />
              </Link>
            </Button>
          </section>
        ) : null}

        <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
          <div className="min-w-0 space-y-5">
            {canMembers ? (
              <section className="min-w-0 rounded-md border border-border bg-card shadow-sm">
                <div className="flex items-start justify-between gap-3 border-b border-border p-4 sm:items-center sm:p-5">
                  <div className="min-w-0">
                    <h2 className="font-bold">Team members</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      People who can work in this business
                    </p>
                  </div>
                  <Link
                    href={`/business/${businessId}/members`}
                    className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
                  >
                    Manage <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="p-2">
                  {members.isLoading ? (
                    <div className="space-y-2 p-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : members.error ? (
                    <p className="p-5 text-sm text-muted-foreground">
                      Member information is temporarily unavailable.
                    </p>
                  ) : members.data?.items.length ? (
                    members.data.items.slice(0, 5).map((member) => (
                      <Link
                        href={`/business/${businessId}/members/${member.id}`}
                        key={member.id}
                        className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-md p-3 hover:bg-muted/60 sm:flex"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {member.userId.avatar ? (
                            <span
                              className="h-full w-full bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${member.userId.avatar})`,
                              }}
                            />
                          ) : (
                            member.userId.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {member.userId.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {member.userId.email}
                          </p>
                        </div>
                        <div className="col-start-2 flex min-w-0 items-center gap-2 sm:block sm:text-right">
                          <Badge
                            tone={member.status === "active" ? "good" : "warn"}
                          >
                            {member.status}
                          </Badge>
                          <p className="truncate text-xs text-muted-foreground sm:mt-1">
                            {member.roleId.name}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                      No team members found.
                    </p>
                  )}
                </div>
              </section>
            ) : null}

            {canLists ? (
              <section className="min-w-0 rounded-md border border-border bg-card shadow-sm">
                <div className="flex items-start justify-between gap-3 border-b border-border p-4 sm:items-center sm:p-5">
                  <div className="min-w-0">
                    <h2 className="font-bold">Employee lists</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Payroll-ready people and verification health
                    </p>
                  </div>
                  <Link
                    href={`/business/${businessId}/employees/employee-lists`}
                    className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
                  >
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-2">
                  {lists.isLoading ? (
                    [1, 2].map((i) => <Skeleton key={i} className="h-36" />)
                  ) : lists.error ? (
                    <p className="p-2 text-sm text-muted-foreground">
                      Employee lists are temporarily unavailable.
                    </p>
                  ) : listItems.length ? (
                    listItems.map((list) => (
                      <Link
                        href={`/business/${businessId}/employees/employee-lists/${list.id}`}
                        key={list.id}
                        className="min-w-0 rounded-md border border-border p-4 transition hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 flex-col items-start gap-2 min-[400px]:flex-row min-[400px]:justify-between">
                          <div className="min-w-0">
                            <p className="break-words font-semibold">
                              {list.name}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {list.defaultPayFrequency} · {list.currency}
                            </p>
                          </div>
                          <Badge
                            tone={
                              list.validationStatus === "completed"
                                ? "good"
                                : list.invalidEmployeeCount
                                  ? "bad"
                                  : "warn"
                            }
                          >
                            {list.validationStatus.replaceAll("_", " ")}
                          </Badge>
                        </div>
                        <div className="mt-5 flex flex-col gap-2 min-[400px]:flex-row min-[400px]:items-end min-[400px]:justify-between">
                          <div>
                            <p className="text-2xl font-bold">
                              {list.totalEmployeeCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              employees
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {list.verifiedEmployeeCount} verified ·{" "}
                            {list.pendingVerificationCount} pending
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full p-8 text-center">
                      <BriefcaseBusiness className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-3 font-semibold">
                        No employee lists yet
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Create a structured list to prepare employee payments.
                      </p>
                    </div>
                  )}
                </div>
                {listItems.length ? (
                  <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-5">
                    {verified} verified employees across the lists shown
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>

          <aside className="min-w-0 space-y-5">
            <section className="min-w-0 rounded-md border border-border bg-card shadow-sm">
              <div className="flex items-start justify-between gap-3 border-b border-border p-4 sm:items-center sm:p-5">
                <div className="min-w-0">
                  <h2 className="font-bold">Recent notifications</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your personal Aurex notifications
                  </p>
                </div>
                <Link
                  href="/dashboard/notifications"
                  className="shrink-0 text-sm font-semibold text-primary"
                >
                  View all
                </Link>
              </div>
              <div className="p-2">
                {notifications.isLoading ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16" />
                    ))}
                  </div>
                ) : notifications.error ? (
                  <p className="p-5 text-sm text-muted-foreground">
                    Notifications are temporarily unavailable.
                  </p>
                ) : notifications.data?.items.length ? (
                  notifications.data.items.map((n) => (
                    <Link
                      href="/dashboard/notifications"
                      key={n.id}
                      className={`flex gap-3 rounded-md p-3 hover:bg-muted/60 ${n.readAt ? "" : "bg-primary/5"}`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-border" : "bg-primary"}`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {n.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {n.message}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {formatDateTime(n.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-primary" />
                    <p className="mt-3 font-semibold">No new activity</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your personal inbox is clear.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-md border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-primary/10 p-2.5 text-primary">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold">Workspace profile</h2>
                  <p className="text-xs text-muted-foreground">
                    {membership.role.name} access
                  </p>
                </div>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Industry</dt>
                  <dd className="text-right font-medium">
                    {business.industry}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Currency</dt>
                  <dd className="font-medium">{business.defaultCurrency}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Business status</dt>
                  <dd>
                    <Badge
                      tone={business.status === "active" ? "good" : "warn"}
                    >
                      {business.status}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Your membership</dt>
                  <dd>
                    <Badge
                      tone={membership.status === "active" ? "good" : "warn"}
                    >
                      {membership.status}
                    </Badge>
                  </dd>
                </div>
              </dl>
              {!business.isVerified ? (
                <div className="mt-5 flex gap-2 rounded-md bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Business verification is incomplete.</p>
                </div>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
