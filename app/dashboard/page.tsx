import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileText,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Aurex business payments dashboard.",
};

const navigation = [
  { name: "Overview", icon: LayoutDashboard, active: true },
  { name: "Payments", icon: WalletCards },
  { name: "Invoices", icon: ReceiptText },
  { name: "Settlements", icon: Landmark },
  { name: "Reconciliation", icon: ListChecks },
  { name: "Team", icon: Users },
];

const metrics = [
  { label: "Available balance", value: "$84,240.60", detail: "+12.8% this month", icon: CircleDollarSign },
  { label: "Pending settlements", value: "$18,420.00", detail: "4 expected this week", icon: Clock3 },
  { label: "Open invoices", value: "$32,890.20", detail: "12 awaiting payment", icon: FileText },
];

const transactions = [
  { company: "Northstar Retail", reference: "INV-2048", date: "Today, 10:42", amount: "+$8,420.00", status: "Received", incoming: true },
  { company: "Atlas Logistics", reference: "PAY-8371", date: "Today, 09:18", amount: "-$2,750.00", status: "Processing" },
  { company: "Kora Systems", reference: "INV-2045", date: "Yesterday, 16:05", amount: "+$4,980.00", status: "Received", incoming: true },
  { company: "Cedar Workspace", reference: "PAY-8362", date: "Yesterday, 11:30", amount: "-$1,280.00", status: "Completed" },
];

const settlements = [
  { label: "Card collections", date: "June 16", amount: "$12,480.00", progress: 82 },
  { label: "Bank transfers", date: "June 17", amount: "$4,820.00", progress: 58 },
  { label: "Invoice payouts", date: "June 18", amount: "$1,120.00", progress: 34 },
];

const cashFlowBars = [44, 58, 48, 72, 66, 84, 76, 92, 70, 88, 78, 96];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-muted text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-background px-4 py-5 lg:flex lg:flex-col">
          <Link href="/" className="flex items-center gap-3 px-2" aria-label="Aurex home">
            <AurexMark />
            <div>
              <p className="text-lg font-bold tracking-tight">Aurex</p>
              <p className="text-xs text-muted-foreground">Business payments</p>
            </div>
          </Link>

          <nav className="mt-8 space-y-1" aria-label="Dashboard navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition",
                    item.active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-border pt-5">
            {[{ name: "Settings", icon: Settings }, { name: "Help center", icon: LifeBuoy }].map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.name} type="button" className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="mt-auto bg-secondary p-4 text-secondary-foreground">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-bold">Security center</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Review access, sessions, and recent account activity.
            </p>
            <Button variant="outline" className="mt-4 h-9 w-full rounded-md bg-background">
              Review security
            </Button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <AurexMark />
                <span className="font-bold">Aurex</span>
              </div>

              <label className="relative hidden w-full max-w-sm md:block">
                <span className="sr-only">Search dashboard</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search payments, invoices, settlements" className="h-10 rounded-md bg-muted pl-9" />
              </label>

              <div className="ml-auto flex items-center gap-2">
                <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                </button>
                <div className="flex items-center gap-3 border-l border-border pl-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">AO</div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold">Amara Okoye</p>
                    <p className="text-xs text-muted-foreground">Finance admin</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[1480px]">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monday, June 15</p>
                  <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Good morning, Amara</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Here is what is happening across your payment operation.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="h-10 rounded-md">
                    <FileText className="h-4 w-4" />
                    Create invoice
                  </Button>
                  <Button className="h-10 rounded-md">
                    <Plus className="h-4 w-4" />
                    New payment
                  </Button>
                </div>
              </div>

              <section className="mt-7 grid gap-4 md:grid-cols-3" aria-label="Account metrics">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <article key={metric.label} className="border border-border bg-card p-5 text-card-foreground shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                          <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{metric.value}</p>
                          <p className="mt-2 text-xs font-medium text-primary">{metric.detail}</p>
                        </div>
                        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </section>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">
                <div className="space-y-5">
                  <section className="border border-border bg-card p-5 shadow-sm sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Cash-flow activity</p>
                        <div className="mt-1 flex items-baseline gap-3">
                          <h2 className="text-2xl font-bold">$126,940</h2>
                          <span className="text-xs font-semibold text-primary">+14.2%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-2 w-2 rounded-full bg-primary" /> Inflow
                        <span className="ml-2 h-2 w-2 rounded-full bg-border" /> Outflow
                        <button type="button" className="ml-3 rounded-md border border-border px-3 py-2 font-medium text-foreground">Last 30 days</button>
                      </div>
                    </div>

                    <div className="mt-8 grid h-64 grid-cols-12 items-end gap-2 border-b border-l border-border px-3 pt-4 sm:gap-3">
                      {cashFlowBars.map((height, index) => (
                        <div key={height + index} className="flex h-full items-end gap-1">
                          <div className="w-1/2 bg-primary/20" style={{ height: `${Math.max(20, height - 22)}%` }} />
                          <div className="w-1/2 bg-primary" style={{ height: `${height}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                      <span>May 16</span><span>May 23</span><span>May 30</span><span>Jun 6</span><span>Jun 15</span>
                    </div>
                  </section>

                  <section className="border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                      <div>
                        <h2 className="font-bold">Recent transactions</h2>
                        <p className="mt-1 text-xs text-muted-foreground">Latest money movement across your workspace</p>
                      </div>
                      <button type="button" className="flex items-center gap-1 text-sm font-semibold text-primary">View all <ChevronRight className="h-4 w-4" /></button>
                    </div>
                    <div className="divide-y divide-border">
                      {transactions.map((transaction) => (
                        <article key={transaction.reference} className="grid gap-3 px-5 py-4 sm:grid-cols-[1.5fr_0.8fr_0.7fr] sm:items-center sm:px-6">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", transaction.incoming ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground")}>
                              {transaction.incoming ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{transaction.company}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{transaction.reference} · {transaction.date}</p>
                            </div>
                          </div>
                          <span className={cn("w-fit rounded-full px-2.5 py-1 text-xs font-medium", transaction.status === "Processing" ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary")}>{transaction.status}</span>
                          <p className="text-sm font-bold sm:text-right">{transaction.amount}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>

                <aside className="space-y-5">
                  <section className="border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Next settlements</p>
                        <h2 className="mt-1 text-xl font-bold">$18,420 expected</h2>
                      </div>
                      <button type="button" aria-label="Settlement options" className="text-muted-foreground"><MoreHorizontal className="h-5 w-5" /></button>
                    </div>
                    <div className="mt-6 space-y-5">
                      {settlements.map((settlement) => (
                        <div key={settlement.label}>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold">{settlement.label}</p>
                              <p className="mt-1 text-xs text-muted-foreground">Expected {settlement.date}</p>
                            </div>
                            <p className="text-sm font-bold">{settlement.amount}</p>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${settlement.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-6 h-10 w-full rounded-md">View settlement schedule</Button>
                  </section>

                  <section className="border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Reconciliation</p>
                        <h2 className="mt-1 text-xl font-bold">94% matched</h2>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-5 w-5" /></span>
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      {[{ label: "Matched", value: "184" }, { label: "Review", value: "9" }, { label: "Missing", value: "3" }].map((item) => (
                        <div key={item.label} className="bg-muted p-3 text-center">
                          <p className="text-xl font-bold">{item.value}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="mt-5 flex w-full items-center justify-between border-t border-border pt-4 text-sm font-semibold text-primary">
                      Resolve exceptions <ChevronRight className="h-4 w-4" />
                    </button>
                  </section>

                  <section className="bg-primary p-5 text-primary-foreground shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-primary-foreground/70">Workspace health</p>
                        <h2 className="mt-1 text-xl font-bold">Operations are on track</h2>
                      </div>
                      <Building2 className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-primary-foreground/75">No unusual payment activity detected. Two team access reviews are due this month.</p>
                    <button type="button" className="mt-5 flex items-center gap-2 text-sm font-bold">Open activity log <ChevronRight className="h-4 w-4" /></button>
                  </section>
                </aside>
              </div>

              <nav className="fixed inset-x-4 bottom-4 z-30 flex items-center justify-around rounded-md border border-border bg-background p-2 shadow-xl lg:hidden" aria-label="Mobile dashboard navigation">
                {[LayoutDashboard, WalletCards, ReceiptText, CalendarDays, Settings].map((Icon, index) => (
                  <button key={index} type="button" aria-label={["Overview", "Payments", "Invoices", "Schedule", "Settings"][index]} className={cn("flex h-10 w-10 items-center justify-center rounded-md", index === 0 ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AurexMark() {
  return (
    <span className="grid h-10 w-10 grid-cols-2 gap-1 rounded-md bg-primary p-2" aria-hidden="true">
      <span className="rounded-sm bg-primary-foreground" />
      <span className="rounded-sm bg-primary-foreground/55" />
      <span className="rounded-sm bg-primary-foreground/55" />
      <span className="rounded-sm bg-primary-foreground" />
    </span>
  );
}
