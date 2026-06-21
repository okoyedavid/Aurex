import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { SectionHeading } from "@/components/public/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose an Aurex plan for your business payment operations.",
};

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For small teams organizing their first payment workflows.",
    features: ["Payment overview", "Invoice tracking", "Basic reconciliation", "Up to 3 team members"],
    action: "Start Free",
    href: "/register",
  },
  {
    name: "Growth",
    price: "$49",
    description: "For growing teams that need stronger controls and visibility.",
    features: ["Everything in Starter", "Settlement management", "Advanced reconciliation", "Audit logs", "Up to 15 team members"],
    action: "Choose Growth",
    href: "/register",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For businesses with complex operations and security requirements.",
    features: ["Everything in Growth", "Custom roles and controls", "Priority support", "Implementation guidance", "Flexible team access"],
    action: "Contact Sales",
    href: "/contact",
  },
];

const faqs = [
  ["Can I change plans later?", "Yes. Your team can move to a different plan as your workflows and access needs change."],
  ["Is there a transaction fee?", "Plan pricing covers access to Aurex software. Any processing fees would be shown clearly before a payment service is enabled."],
  ["Does Starter require a card?", "No. You can explore the Starter workspace without adding a payment card."],
  ["What is included with Enterprise?", "Enterprise plans are scoped around team size, controls, support, and implementation requirements."],
];

export default function PricingPage() {
  return (
    <main>
      <PageHero
        eyebrow="Simple pricing"
        title="Choose the control your team needs today."
        description="Start with a clear payment workspace and add deeper operational controls as your business grows."
      />

      <section className="bg-background px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative min-w-0 rounded-md py-7 ${plan.featured ? "ring-2 ring-primary" : ""}`}
            >
              {plan.featured && (
                <span className="absolute right-5 top-0 -translate-y-1/2 bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                  Most popular
                </span>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="mt-4 text-4xl font-bold text-foreground">
                  {plan.price}
                  {plan.price.startsWith("$") && <span className="text-sm font-medium text-muted-foreground"> / month</span>}
                </p>
                <p className="mt-4 min-h-12 break-words leading-6 text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.featured ? "default" : "outline"}
                  className="mt-8 h-11 w-full rounded-full"
                >
                  <Link href={plan.href}>{plan.action}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionHeading eyebrow="Pricing FAQ" title="Common questions before you start" align="center" />
          <div className="mt-12 divide-y divide-border border-y border-border">
            {faqs.map(([question, answer]) => (
              <div key={question} className="grid gap-3 py-7 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
                <h3 className="font-bold text-foreground">{question}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
