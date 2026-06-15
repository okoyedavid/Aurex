import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dashboardSettlements } from "@/features/dashboard/data";

export function SettlementsCard() {
  return (
    <section className="border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Next settlements</p>
          <h2 className="mt-1 text-xl font-bold">$18,420 expected</h2>
        </div>
        <button
          type="button"
          aria-label="Settlement options"
          className="text-muted-foreground"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-6 space-y-5">
        {dashboardSettlements.map((settlement) => (
          <div key={settlement.label}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {settlement.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Expected {settlement.date}
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold">{settlement.amount}</p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${settlement.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-6 h-10 w-full rounded-md">
        View settlement schedule
      </Button>
    </section>
  );
}
