import type { Metadata } from "next";
import { Clock3, Headphones, Mail, MessagesSquare } from "lucide-react";

import { PageHero } from "@/components/public/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Aurex sales or support.",
};

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Contact Aurex"
        title="Tell us what your payment operation needs."
        description="Speak with our team about product fit, implementation, security, or support. We will route your message to the right person."
      />

      <section className="bg-background px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ["Sales", "Discuss plans, workflows, and team requirements.", MessagesSquare, "sales@aurex.example"],
              ["Support", "Get help with an existing Aurex workspace.", Headphones, "support@aurex.example"],
            ].map(([title, description, Icon, email]) => (
              <Card key={title as string} className="rounded-md">
                <CardHeader>
                  <Icon className="h-6 w-6 text-primary" />
                  <CardTitle className="mt-3 font-bold">{title as string}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="leading-6 text-muted-foreground">{description as string}</p>
                  <p className="mt-4 text-sm font-semibold text-primary">{email as string}</p>
                </CardContent>
              </Card>
            ))}
            <div className="bg-soft p-6">
              <div className="flex items-center gap-3 text-foreground">
                <Clock3 className="h-5 w-5 text-primary" />
                <h2 className="font-bold">Response time</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                We aim to respond to product and sales questions within one business day. Support response times depend on plan and issue severity.
              </p>
            </div>
          </div>

          <form className="bg-card p-6 shadow-lg ring-1 ring-foreground/10 sm:p-10">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">Send a message</h2>
            </div>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-foreground">
                Name
                <Input name="name" autoComplete="name" required className="mt-2 h-11 rounded-sm bg-background" />
              </label>
              <label className="text-sm font-medium text-foreground">
                Work email
                <Input name="email" type="email" autoComplete="email" required className="mt-2 h-11 rounded-sm bg-background" />
              </label>
              <label className="text-sm font-medium text-foreground sm:col-span-2">
                Company
                <Input name="company" autoComplete="organization" className="mt-2 h-11 rounded-sm bg-background" />
              </label>
              <label className="text-sm font-medium text-foreground sm:col-span-2">
                How can we help?
                <Textarea name="message" required className="mt-2 rounded-sm bg-background" />
              </label>
            </div>
            <Button type="submit" className="mt-6 h-12 rounded-full px-7">Send Message</Button>
          </form>
        </div>
      </section>
    </main>
  );
}
