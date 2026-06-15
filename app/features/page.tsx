import type { Metadata } from "next";
import {
  BadgeCheck,
  BanknoteArrowUp,
  ChartNoAxesCombined,
  FileCheck2,
  FileClock,
  History,
  ShieldCheck,
} from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { PublicCta } from "@/components/public/public-cta";
import { SectionHeading } from "@/components/public/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Features",
  description: "Explore Aurex payment, invoice, settlement, and reconciliation tools.",
};

const features = [
  ["Unified payments", "Collect, send, and monitor business payments from one operational view.", BanknoteArrowUp],
  ["Invoice tracking", "Follow every invoice from issue through payment without spreadsheet updates.", FileClock],
  ["Settlement management", "See expected, pending, and completed settlements with clear status history.", BadgeCheck],
  ["Smart reconciliation", "Match transactions, invoices, and settlement records with less manual review.", FileCheck2],
  ["Cash-flow visibility", "Understand incoming and outgoing money with timely operational reporting.", ChartNoAxesCombined],
  ["Audit logs", "Review important account and payment actions in a traceable activity record.", History],
  ["Secure access", "Control sensitive workflows with authentication, sessions, and role-aware access.", ShieldCheck],
] as const;

export default function FeaturesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Platform features"
        title="One system for the work behind every payment."
        description="Aurex gives finance and operations teams the visibility and controls they need to move from fragmented processes to a dependable payment workflow."
        primaryAction={{ label: "Start Free", href: "/signup" }}
        secondaryAction={{ label: "View Pricing", href: "/pricing" }}
      />

      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Built for operations"
            title="Manage the complete payment lifecycle"
            description="Each capability shares the same records and activity history, so teams spend less time joining information across tools."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, description, Icon], index) => (
              <Card
                key={title}
                className={`rounded-md ${index === 0 ? "lg:col-span-2" : ""}`}
              >
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4 text-lg font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="max-w-lg leading-6 text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <SectionHeading
            eyebrow="Connected by design"
            title="Every record stays attached to its context."
            description="Payments remain connected to invoices, settlement status, reconciliation results, and team actions. That shared context makes reviews faster and exceptions easier to resolve."
          />
          <div className="bg-card p-6 shadow-lg ring-1 ring-foreground/10 sm:p-8">
            {["Payment received", "Invoice matched", "Settlement confirmed", "Activity recorded"].map(
              (item, index) => (
                <div key={item} className="flex items-center gap-4 border-b border-border py-4 last:border-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{item}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <PublicCta
        title="Give your payment operation one source of truth."
        description="Start with the workflows your team uses today and scale into a connected financial workspace."
      />
    </main>
  );
}
