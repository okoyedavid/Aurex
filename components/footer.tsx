import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FaLinkedinIn,
  FaXTwitter,
  FaGithub,
  FaInstagram,
} from "react-icons/fa6";

const socialLinks = [
  { label: "LinkedIn", href: "#", icon: FaLinkedinIn },
  { label: "X", href: "#", icon: FaXTwitter },
  { label: "GitHub", href: "#", icon: FaGithub },
  { label: "Instagram", href: "#", icon: FaInstagram },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
];

const resourceLinks = [
  { label: "Payments Guide", href: "/resources/payments-guide" },
  { label: "API Docs", href: "/docs" },
  { label: "Security", href: "/security" },
  { label: "Contact Sales", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr_0.8fr_1.4fr]">
          <div>
            <Link href="/" className="text-lg font-bold text-foreground">
              Aurex
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              Secure business payments, invoice tracking, and cash-flow
              management for modern teams.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;

                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="text-primary transition hover:text-primary/70"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground">Company</h3>

            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
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

          <div>
            <h3 className="text-sm font-bold text-foreground">Resources</h3>

            <ul className="mt-5 space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
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

          <div>
            <h3 className="text-sm font-bold text-foreground">
              Join Our Newsletter
            </h3>

            <form className="mt-5 flex max-w-md gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                className="h-11 rounded-none bg-muted"
              />

              <Button type="submit" className="h-11 rounded-none px-6">
                Subscribe
              </Button>
            </form>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Get weekly updates on payments, business finance, and product
              improvements.
            </p>
          </div>
        </div>

        <div className="mt-14 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Copyright © Aurex {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
