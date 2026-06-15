import type { Metadata } from "next";
import { Activity, FileLock2, Gauge, KeyRound, ScanSearch, ScrollText, ShieldCheck } from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { PublicCta } from "@/components/public/public-cta";
import { SectionHeading } from "@/components/public/section-heading";

export const metadata: Metadata = {
  title: "Security",
  description: "Learn how Aurex approaches access, monitoring, and data protection.",
};

const controls = [
  ["Secure authentication", "Account access is designed around verified credentials and protected sign-in workflows.", KeyRound],
  ["Session management", "Active sessions can be governed and reviewed to reduce unintended account access.", ShieldCheck],
  ["Audit logs", "Important actions are recorded so authorized teams can understand what changed and when.", ScrollText],
  ["Suspicious activity detection", "Risk signals help identify unusual access or workflow behavior for review.", ScanSearch],
  ["Rate limiting", "Sensitive endpoints can be protected from excessive or automated requests.", Gauge],
  ["Encrypted workflows", "Sensitive data is protected in transit and handled through controlled application boundaries.", FileLock2],
  ["Operational monitoring", "System activity is monitored to support reliability and incident response.", Activity],
] as const;

export default function SecurityPage() {
  return (
    <main>
      <PageHero
        eyebrow="Security at Aurex"
        title="Trust is part of the payment workflow."
        description="Aurex is designed to help businesses operate sensitive financial processes with controlled access, traceable activity, and responsible data handling."
        primaryAction={{ label: "Contact Security", href: "/contact" }}
      />

      <section className="bg-background px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Layered protection"
            title="Controls across access, activity, and data"
            description="Security is treated as an operating requirement, not an isolated feature. Controls are designed to work together throughout the account lifecycle."
          />
          <div className="mt-12 grid gap-px overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-3">
            {controls.map(([title, description, Icon]) => (
              <article key={title} className="bg-card p-7">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-5 font-bold text-card-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Shared responsibility"
            title="Secure software works best with secure operations."
            description="Aurex provides product controls, while each business remains responsible for managing its users, permissions, devices, and internal approval policies."
          />
          <div className="space-y-4">
            {["Review team access regularly", "Use unique credentials and protected devices", "Investigate unfamiliar account activity", "Keep internal payment approvals documented"].map(
              (item) => (
                <div key={item} className="flex items-center gap-4 bg-card p-5 ring-1 ring-foreground/10">
                  <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{item}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <PublicCta
        eyebrow="Talk to our team"
        title="Have a security or compliance question?"
        description="Share your requirements and we will help you understand how Aurex can fit your operating model."
        actionLabel="Contact Us"
        actionHref="/contact"
      />
    </main>
  );
}
