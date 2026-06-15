import { cashFlowBars } from "@/features/dashboard/data";

export function CashFlowCard() {
  return (
    <section className="min-w-0 border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Cash-flow activity</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl font-bold">$126,940</h2>
            <span className="text-xs font-semibold text-primary">+14.2%</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" /> Inflow
          <span className="ml-1 h-2 w-2 rounded-full bg-border" /> Outflow
          <button
            type="button"
            className="ml-auto rounded-md border border-border px-3 py-2 font-medium text-foreground sm:ml-3"
          >
            Last 30 days
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto pb-1">
        <div className="grid h-56 min-w-[520px] grid-cols-12 items-end gap-2 border-b border-l border-border px-3 pt-4 sm:h-64 sm:gap-3">
          {cashFlowBars.map((height, index) => (
            <div key={height + index} className="flex h-full items-end gap-1">
              <div
                className="w-1/2 bg-primary/20"
                style={{ height: `${Math.max(20, height - 22)}%` }}
              />
              <div
                className="w-1/2 bg-primary"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex min-w-[520px] justify-between text-xs text-muted-foreground">
          <span>May 16</span>
          <span>May 23</span>
          <span>May 30</span>
          <span>Jun 6</span>
          <span>Jun 15</span>
        </div>
      </div>
    </section>
  );
}
