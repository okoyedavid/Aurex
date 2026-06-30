import type { MemberUser } from "@/lib/business-members-api";

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
