"use client";

import Link from "next/link";
import {
  Activity,
  ClipboardList,
  ReceiptText,
  WalletCards,
} from "lucide-react";

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
  "audit-logs": {
    title: "Audit logs",
    description: "Review business audit events and security-sensitive changes.",
    empty: "No business audit events are available yet.",
    icon: Activity,
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

  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <p className="text-sm text-muted-foreground">{business.name}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {content.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {content.description}
        </p>

        <section className="mt-7 flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
          <span className="rounded-xl bg-primary/10 p-3 text-primary">
            <Icon className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-semibold text-foreground">
            {content.empty}
          </h2>
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
      </div>
    </div>
  );
}
