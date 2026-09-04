"use client";

import { ClipboardList, ReceiptText, WalletCards } from "lucide-react";
import Link from "next/link";

import {
  BusinessSubnavigation,
  NavigationItem,
} from "@/components/BusinessSubnavigation";
import { useBusinessAccess } from "@/features/business/business-access-context";

const sectionContent = {
  payments: {
    title: "Payments",
    description:
      "Review pending, approved, failed, and cancelled payment workflows.",
    empty: "No payment records are available yet.",
    icon: WalletCards,
  },
  invoices: {
    title: "Invoices",
    description:
      "Track draft, sent, overdue, and paid invoices for this business.",
    empty: "No invoices are available yet.",
    icon: ReceiptText,
  },
  providers: {
    title: "Providers",
    description: "Manage payout providers and operational vendor records.",
    empty: "No payment providers are connected yet.",
    icon: ClipboardList,
  },
} as const;

export function BusinessSectionPage({
  businessId,
  section,
}: {
  businessId: string;
  section: keyof typeof sectionContent;
}) {
  const { business } = useBusinessAccess();
  const content = sectionContent[section];
  const Icon = content.icon;
  const isFinancialSection =
    section === "payments" || section === "invoices" || section === "providers";

  const sectionBody = (
    <>
      <section className="flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed border-border bg-card p-8 text-center shadow-sm">
        <span className="rounded-md bg-primary/10 p-3 text-primary">
          <Icon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-semibold text-foreground">{content.empty}</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          This section is ready for the corresponding backend integration and
          will no longer display sample records from unrelated businesses.
        </p>
      </section>

      <Link
        href={`/business/${businessId}`}
        className="mt-5 inline-block text-sm font-semibold text-primary hover:underline"
      >
        Back to business overview
      </Link>
    </>
  );

  const financialNavigation = [
    {
      label: "Payments",
      href: `/business/${businessId}/payments`,
      icon: WalletCards,
      anyPermission: [
        "payments:view",
        "payments:view_own",
        "invoices:view",
        "providers:view",
      ],
    },
    {
      label: "Invoices",
      href: `/business/${businessId}/invoices`,
      icon: ReceiptText,
      anyPermission: ["invoices:view"],
    },
    {
      label: "Providers",
      href: `/business/${businessId}/providers`,
      icon: ClipboardList,
      anyPermission: ["providers:view"],
    },
  ] satisfies NavigationItem[];

  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        {isFinancialSection ? (
          <BusinessSubnavigation
            ariaLabel="Financial sections"
            items={financialNavigation}
          />
        ) : null}
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {content.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {content.description}
        </p>

        <div className="mt-7">{sectionBody}</div>
      </div>
    </div>
  );
}
