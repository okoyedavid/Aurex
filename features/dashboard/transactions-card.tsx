import { ArrowDownLeft, ArrowUpRight, ChevronRight } from "lucide-react";

import { dashboardTransactions } from "@/features/dashboard/data";
import { cn } from "@/lib/utils";

export function TransactionsCard() {
  return (
    <section className="min-w-0 border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="font-bold">Recent transactions</h2>
          <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
            Latest money movement across your workspace
          </p>
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary"
        >
          View all <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="divide-y divide-border">
        {dashboardTransactions.map((transaction) => (
          <article
            key={transaction.reference}
            className="grid min-w-0 gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1.5fr)_auto_auto] sm:items-center sm:px-6"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                  transaction.incoming
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {transaction.incoming ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {transaction.company}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {transaction.reference} · {transaction.date}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pl-[52px] sm:contents sm:pl-0">
              <span
                className={cn(
                  "w-fit rounded-full px-2.5 py-1 text-xs font-medium",
                  transaction.status === "Processing"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                {transaction.status}
              </span>
              <p className="text-sm font-bold sm:text-right">
                {transaction.amount}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
