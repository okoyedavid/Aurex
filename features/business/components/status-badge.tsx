import type { BusinessListItem } from "@/lib/business-api";
import { cn } from "@/lib/utils";

export function StatusBadge({ item }: { item: BusinessListItem }) {
  const status = item.business.status;

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
        status === "active"
          ? "bg-primary/10 text-primary"
          : "bg-destructive/10 text-destructive",
      )}
    >
      {status}
    </span>
  );
}
