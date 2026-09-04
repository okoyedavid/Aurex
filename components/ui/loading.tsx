import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Skeleton } from "./skeleton";

export function Loading({
  label = "Loading...",
  variant = "panels",
  centered = false,
  className,
}: {
  label?: string;
  variant?: "spinner" | "panels";
  centered?: boolean;
  className?: string;
}) {
  if (variant === "spinner") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm text-muted-foreground",
          centered && "min-h-56 justify-center",
          className,
        )}
        role="status"
      >
        <Loader2 className="size-4 animate-spin" />
        {label}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} role="status">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" />
        {label}
      </div>
      <Skeleton className="h-32" />
      <Skeleton className="h-64" />
    </div>
  );
}
