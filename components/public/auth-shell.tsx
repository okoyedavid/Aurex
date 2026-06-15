import Link from "next/link";
import { ShieldCheck } from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 pb-20 pt-32">
      <div className="absolute inset-x-0 top-0 h-[480px] bg-soft" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <Link href="/" className="text-3xl font-bold text-foreground">
            Aurex
          </Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-widest text-primary">
            Secure business payments
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-bold tracking-tight text-foreground">
            One workspace for every payment workflow.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">
            Track invoices, settlements, reconciliation, and cash flow without
            losing operational visibility.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm font-medium text-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            Protected workflows and auditable activity
          </div>
        </div>

        <section className="bg-card p-6 text-card-foreground shadow-xl ring-1 ring-foreground/10 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
          <div className="mt-8">{children}</div>
          <div className="mt-7 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </section>
      </div>
    </main>
  );
}
