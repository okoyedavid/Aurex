"use client";

import { Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { useMeQuery } from "@/features/auth/use-me-query";
import { NotificationBell } from "@/features/access/notification-bell";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "User";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function DashboardHeader({
  mode,
  businessName,
  sidebarCollapsed,
  onMenuOpen,
  onSidebarToggle,
}: {
  mode: "personal" | "business";
  businessName?: string;
  sidebarCollapsed: boolean;
  onMenuOpen: () => void;
  onSidebarToggle: () => void;
}) {
  const { data: user } = useMeQuery();
  const displayName = user?.name || user?.username || "Account user";
  const displayDetail = user?.email || "Signed in";
  const initials = getInitials(user?.name ?? user?.username, user?.email);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={onMenuOpen}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <Image
              src="/icon.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-md object-cover"
              priority
            />
            <span className="font-bold">
              {mode === "business" ? businessName ?? "Business" : "Aurex"}
            </span>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
          <button
            type="button"
            onClick={onSidebarToggle}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground lg:flex"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <label className="relative w-full max-w-sm">
            <span className="sr-only">Search dashboard</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                mode === "business"
                  ? "Search payments, invoices, members"
                  : "Search businesses, invites, activity"
              }
              className="h-10 rounded-md bg-muted pl-9"
            />
          </label>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Search dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
          <NotificationBell />
          <div className="flex items-center gap-3 border-l border-border pl-2 sm:pl-3">
            {user?.avatar ? (
              <span
                aria-hidden="true"
                className="h-9 w-9 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url("${user.avatar}")` }}
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {initials}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="max-w-36 truncate text-sm font-semibold">
                {displayName}
              </p>
              <p className="max-w-40 truncate text-xs text-muted-foreground">
                {displayDetail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
