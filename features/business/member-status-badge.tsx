import type { BusinessMemberStatus } from "@/lib/business-members-api";
import { cn } from "@/lib/utils";

export function MemberStatusBadge({
  status,
}: {
  status: BusinessMemberStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
        status === "active" && "bg-primary/10 text-primary",
        status === "suspended" && "bg-secondary text-secondary-foreground",
        status === "removed" && "bg-destructive/10 text-destructive",
      )}
    >
      {status}
    </span>
  );
}
