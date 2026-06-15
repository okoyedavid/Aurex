"use client";

import { Bell, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { AurexMark } from "@/features/dashboard/aurex-mark";

export function DashboardHeader({
  sidebarCollapsed,
  onMenuOpen,
  onSidebarToggle,
}: {
  sidebarCollapsed: boolean;
  onMenuOpen: () => void;
  onSidebarToggle: () => void;
}) {
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
            <AurexMark />
            <span className="font-bold">Aurex</span>
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
              placeholder="Search payments, invoices, settlements"
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
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
          <div className="flex items-center gap-3 border-l border-border pl-2 sm:pl-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              AO
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">Amara Okoye</p>
              <p className="text-xs text-muted-foreground">Finance admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
