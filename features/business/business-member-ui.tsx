import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type {
  BusinessMemberStatus,
  MemberUser,
} from "@/lib/business-members-api";
import { cn } from "@/lib/utils";

export function MemberAvatar({ user }: { user: MemberUser }) {
  if (user.avatar) {
    return (
      <span
        aria-hidden="true"
        className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
        style={{ backgroundImage: `url("${user.avatar}")` }}
      />
    );
  }

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
      {initials || "?"}
    </span>
  );
}

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

export function MembersState({
  title,
  detail,
  retry,
}: {
  title: string;
  detail: string;
  retry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <AlertCircle className="mx-auto h-6 w-6 text-muted-foreground" />
      <h1 className="mt-3 font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      {retry ? (
        <Button className="mt-4" variant="outline" onClick={retry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function MembersPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">{children}</div>
    </div>
  );
}
