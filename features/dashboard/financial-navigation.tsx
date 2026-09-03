"use client";

import { ClipboardList, ReceiptText, WalletCards } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useBusinessAccess } from "@/features/business/business-access-context";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/generic";

const sections = [
  {
    name: "Payments",
    segment: "payments",
    icon: WalletCards,
    anyPermission: [
      "payments:view",
      "payments:view_own",
      "invoices:view",
      "providers:view",
    ] as Permission[],
  },
  {
    name: "Invoices",
    segment: "invoices",
    icon: ReceiptText,
    anyPermission: ["invoices:view"] as Permission[],
  },
  {
    name: "Providers",
    segment: "providers",
    icon: ClipboardList,
    anyPermission: ["providers:view"] as Permission[],
  },
] as const;

export function FinancialNavigation({ businessId }: { businessId: string }) {
  const pathname = usePathname();
  const { effectivePermissions } = useBusinessAccess();
  const visibleSections = sections.filter((section) =>
    section.anyPermission.some((permission) =>
      effectivePermissions.has(permission),
    ),
  );

  return (
    <nav
      aria-label="Financial sections"
      className="mb-7 flex gap-2 overflow-x-auto border-b border-border pb-3"
    >
      {visibleSections.map((section) => {
        const Icon = section.icon;
        const href = `/business/${businessId}/${section.segment}`;
        const isActive =
          pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={section.segment}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {section.name}
          </Link>
        );
      })}
    </nav>
  );
}
