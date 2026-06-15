import type { Metadata } from "next";
import { Eye, Scale, ShieldCheck, Workflow } from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { PublicCta } from "@/components/public/public-cta";
import { SectionHeading } from "@/components/public/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "Learn why Aurex is building simpler business payment operations.",
};

const values = [
  {
    title: "Clarity first",
    description: "Financial operations should be easy to understand, review, and act on.",
    icon: Eye,
  },
  {
    title: "Security by default",
    description: "Controls, permissions, and auditability belong in every workflow.",
    icon: ShieldCheck,
  },
  {
    title: "Reliable operations",
    description: "Teams need predictable systems that reduce manual work and payment errors.",
    icon: Workflow,
  },
  {
    title: "Responsible growth",
    description: "Better financial visibility helps businesses make confident decisions.",
    icon: Scale,
  },
];

export default function AboutPage() {
  return (
    <main>
      <PageHero
        eyebrow="About Aurex"
        title="Business payments should be easier to operate."
        description="Aurex brings payments, invoices, settlements, reconciliation, and cash-flow visibility into one secure workspace for growing businesses."
        primaryAction={{ label: "Explore Features", href: "/features" }}
        secondaryAction={{ label: "Contact Us", href: "/contact" }}
      />

      <section className="bg-background px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="Our mission"
            title="Reduce the operational weight behind every transaction."
            description="Growing teams often manage payments across disconnected tools, spreadsheets, and inboxes. Aurex is designed to replace that fragmentation with a dependable operating layer for business money movement."
          />
          <div className="grid grid-cols-2 gap-4 bg-soft p-6 sm:p-10">
            {[
              ["One view", "Payments and invoices"],
              ["Real time", "Settlement visibility"],
              ["Traceable", "Team activity"],
              ["Less manual", "Reconciliation work"],
            ].map(([value, label]) => (
              <div key={label} className="bg-card p-5 ring-1 ring-foreground/10">
                <p className="text-lg font-bold text-primary">{value}</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="How we build"
            title="Principles that shape the product"
            description="Aurex is built around the needs of finance and operations teams that require speed without losing control."
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="h-full rounded-md">
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-4 font-bold">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-6 text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <PublicCta
        title="Build a clearer payment operation."
        description="Bring your team, transactions, and financial workflows together in Aurex."
      />
    </main>
  );
}
