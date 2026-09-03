"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { logout } from "@/lib/auth-api";
import type { User } from "@/types/generic";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "User";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AccountMenu({ user }: { user?: User }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const displayName = user?.name || user?.username || "Account user";
  const displayDetail = user?.email || "Signed in";
  const initials = getInitials(user?.name ?? user?.username, user?.email);
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
    onError: () => toast.error("Unable to log out. Please try again."),
  });

  useEffect(() => {
    if (!open) return;

    const closeOnPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative border-l border-border pl-2 sm:pl-3">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-md p-1 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {user?.avatar ? (
          <span
            aria-hidden="true"
            className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url("${user.avatar}")` }}
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {initials}
          </span>
        )}
        <span className="hidden sm:block">
          <span className="block max-w-36 truncate text-sm font-semibold">
            {displayName}
          </span>
          <span className="block max-w-40 truncate text-xs text-muted-foreground">
            {displayDetail}
          </span>
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 overflow-hidden rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
        >
          <div className="border-b border-border px-3 py-2 sm:hidden">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {displayDetail}
            </p>
          </div>
          <Link
            href="/dashboard/settings#profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <UserRound className="size-4 text-muted-foreground" />
            Profile settings
          </Link>
          <button
            type="button"
            role="menuitem"
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <LogOut className="size-4" />
            {logoutMutation.isPending ? "Logging out…" : "Log out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
