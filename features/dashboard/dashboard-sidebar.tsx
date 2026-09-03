"use client";

import Image from "next/image";
import Link from "next/link";
import { LifeBuoy, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  type BusinessNavigationItem,
  isNavigationItemActive,
  personalNavigation,
} from "@/features/dashboard/data";

type DashboardSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  mode: "personal" | "business";
  businessId?: string;
  businessName?: string;
  businessNavigation?: BusinessNavigationItem[];
  onMobileClose: () => void;
};

export function DashboardSidebar({
  collapsed,
  mobileOpen,
  mode,
  businessId,
  businessName,
  businessNavigation,
  onMobileClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const allNavigation =
    mode === "business" ? businessNavigation ?? [] : personalNavigation;
  const settingsItem = allNavigation.find((item) => item.name === "Settings");
  const SettingsIcon = settingsItem?.icon;
  const navigation = allNavigation.filter((item) => item.name !== "Settings");

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
            href={
              mode === "business" ? `/business/${businessId}` : "/dashboard"
            }
            className="flex min-w-0 items-center gap-3"
            aria-label="Aurex dashboard"
            onClick={onMobileClose}
          >
            <Image
              src="/icon.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-md object-cover"
              priority
            />
            <div className={cn("min-w-0", collapsed && "lg:hidden")}>
              <p className="truncate text-lg font-bold tracking-tight">
                {mode === "business" ? (businessName ?? "Business") : "Aurex"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {mode === "business"
                  ? "Business workspace"
                  : "Personal dashboard"}
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
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationItemActive(pathname, item);

            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                onClick={onMobileClose}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition",
                  collapsed && "lg:justify-center lg:gap-0 lg:px-0",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn(collapsed && "lg:hidden")}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-border pt-5">
          {settingsItem && SettingsIcon ? (
            <Link
              href={settingsItem.href}
              title={collapsed ? settingsItem.name : undefined}
              onClick={onMobileClose}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
                collapsed && "lg:justify-center lg:gap-0 lg:px-0",
                isNavigationItemActive(pathname, settingsItem)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <SettingsIcon className="h-4 w-4 shrink-0" />
              <span className={cn(collapsed && "lg:hidden")}>
                {settingsItem.name}
              </span>
            </Link>
          ) : null}
          <Link
            href="/contact"
            onClick={onMobileClose}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
              collapsed && "lg:justify-center lg:gap-0 lg:px-0",
            )}
          >
            <LifeBuoy className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Help center</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
