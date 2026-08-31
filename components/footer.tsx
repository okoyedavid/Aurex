"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/lib/public-api";

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
];

const resourceLinks = [
  { label: "Security", href: "/security" },
  { label: "Contact", href: "/contact" },
  { label: "Sign In", href: "/login" },
];

export default function Footer() {
  const pathname = usePathname();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/business"))
    return null;

  return (
    <footer className="bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.7fr_0.7fr_1.4fr]">
          <div>
            <Link href="/" className="text-lg font-bold text-foreground">
              Aurex
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Secure business payments, invoice tracking, and cash-flow
              management for modern teams.
            </p>
          </div>

          <FooterLinks title="Company" links={companyLinks} />
          <FooterLinks title="Resources" links={resourceLinks} />

          <div>
            <h2 className="text-sm font-bold text-foreground">
              Join Our Newsletter
            </h2>
            <form
              method="post"
              className="mt-5 flex max-w-md gap-2"
              onSubmit={async (event) => {
                event.preventDefault();
                setIsSubscribing(true);
                try {
                  toast.success(await subscribeNewsletter(newsletterEmail));
                  setNewsletterEmail("");
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Unable to subscribe right now.",
                  );
                } finally {
                  setIsSubscribing(false);
                }
              }}
            >
              <Input
                type="email"
                name="newsletter-email"
                aria-label="Email address for newsletter"
                required
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                className="h-11 rounded-none bg-muted"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="h-11 rounded-none px-5"
              >
                {isSubscribing ? "Subscribing…" : "Subscribe"}
              </Button>
            </form>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Product updates and practical notes for payment operations teams.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright © Aurex {new Date().getFullYear()}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-primary">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
