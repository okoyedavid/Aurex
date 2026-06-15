"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LifeBuoy,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AurexMark } from "@/features/dashboard/aurex-mark";
import { dashboardNavigation } from "@/features/dashboard/data";

type DashboardSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function DashboardSidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={onMobileClose}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh flex-col overflow-y-auto border-r border-border bg-background px-3 py-5 transition-[width,transform] duration-300",
          collapsed ? "lg:w-20" : "lg:w-64",
          mobileOpen
            ? "visible w-72 translate-x-0"
            : "invisible w-72 -translate-x-full lg:visible lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-1">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            aria-label="Aurex home"
            onClick={onMobileClose}
          >
            <AurexMark />
            <div className={cn("min-w-0", collapsed && "lg:hidden")}>
              <p className="text-lg font-bold tracking-tight">Aurex</p>
              <p className="truncate text-xs text-muted-foreground">
                Business payments
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onMobileClose}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-8 space-y-1" aria-label="Dashboard navigation">
          {dashboardNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.href ? pathname === item.href : false;
            const itemClassName = cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition",
              collapsed && "lg:justify-center lg:gap-0 lg:px-0",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            );
            const content = (
              <>
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn(collapsed && "lg:hidden")}>{item.name}</span>
              </>
            );

            return item.href ? (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                onClick={onMobileClose}
                className={itemClassName}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.name}
                type="button"
                title={collapsed ? item.name : undefined}
                className={itemClassName}
              >
                {content}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 border-t border-border pt-5">
          {[
            {
              name: "Settings",
              icon: Settings,
              href: "/dashboard/settings",
            },
            { name: "Help center", icon: LifeBuoy, href: "/contact" },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                onClick={onMobileClose}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  collapsed && "lg:justify-center lg:gap-0 lg:px-0",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn(collapsed && "lg:hidden")}>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div
          className={cn(
            "mt-auto bg-secondary text-secondary-foreground",
            collapsed
              ? "p-4 lg:flex lg:justify-center lg:p-3"
              : "p-4",
          )}
        >
          {collapsed ? (
            <>
              <ShieldCheck className="hidden h-5 w-5 text-primary lg:block" />
              <div className="lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-bold">Security center</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Review access, sessions, and recent account activity.
                </p>
              </div>
            </>
          ) : (
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-bold">Security center</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Review access, sessions, and recent account activity.
              </p>
              <Button
                variant="outline"
                className="mt-4 h-9 w-full rounded-md bg-background"
              >
                Review security
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
