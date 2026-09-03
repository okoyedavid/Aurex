"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Image from "next/image";

import { useMeQuery } from "@/features/auth/use-me-query";
import { NotificationBell } from "@/features/access/notification-bell";
import { AccountMenu } from "@/features/dashboard/account-menu";
import { DesktopHeaderSearch, MobileHeaderSearch } from "@/features/dashboard/header-search";
import type { HeaderCommand, HeaderSearchMetadata } from "@/features/dashboard/data";

export function DashboardHeader({
  mode,
  businessName,
  searchMetadata,
  commands,
  sidebarCollapsed,
  onMenuOpen,
  onSidebarToggle,
}: {
  mode: "personal" | "business";
  businessName?: string;
  searchMetadata: HeaderSearchMetadata;
  commands: HeaderCommand[];
  sidebarCollapsed: boolean;
  onMenuOpen: () => void;
  onSidebarToggle: () => void;
}) {
  const { data: user } = useMeQuery();

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
          <DesktopHeaderSearch metadata={searchMetadata} commands={commands} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <MobileHeaderSearch metadata={searchMetadata} commands={commands} />
          <NotificationBell />
          <AccountMenu user={user} />
        </div>
      </div>
    </header>
  );
}
