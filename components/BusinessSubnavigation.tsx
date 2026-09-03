"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useBusinessAccess } from "@/features/business/business-access-context";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/generic";

export type NavigationItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  anyPermission?: Permission[];
  exact?: boolean;
};

export function BusinessSubnavigation({
  items,
  ariaLabel,
}: {
  items: NavigationItem[];
  ariaLabel: string;
}) {
  const pathname = usePathname();
  const { effectivePermissions } = useBusinessAccess();

  const visibleItems = items.filter(
    (item) =>
      !item.anyPermission?.length ||
      item.anyPermission.some((permission) =>
        effectivePermissions.has(permission),
      ),
  );

  function matchesRoute(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const activeHref = items
    .filter((item) => matchesRoute(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav
      aria-label={ariaLabel}
      className="mb-7 flex gap-2 overflow-x-auto border-b border-border pb-3"
    >
      {visibleItems.map((item) => {
        const Icon = item.icon;

        const isActive = item.href === activeHref;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
