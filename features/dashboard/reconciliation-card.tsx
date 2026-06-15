import { Check, ChevronRight } from "lucide-react";

const reconciliationStats = [
  { label: "Matched", value: "184" },
  { label: "Review", value: "9" },
  { label: "Missing", value: "3" },
];

export function ReconciliationCard() {
  return (
    <section className="border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Reconciliation</p>
          <h2 className="mt-1 text-xl font-bold">94% matched</h2>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        {reconciliationStats.map((item) => (
          <div key={item.label} className="min-w-0 bg-muted p-2 text-center sm:p-3">
            <p className="text-lg font-bold sm:text-xl">{item.value}</p>
            <p className="mt-1 truncate text-[11px] text-muted-foreground sm:text-xs">
              {item.label}
            </p>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-5 flex w-full items-center justify-between border-t border-border pt-4 text-sm font-semibold text-primary"
      >
        Resolve exceptions <ChevronRight className="h-4 w-4" />
      </button>
    </section>
  );
}
