import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type PublicCtaProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function PublicCta({
  eyebrow = "Move money with clarity",
  title,
  description,
  actionLabel = "Start Free",
  actionHref = "/signup",
}: PublicCtaProps) {
  return (
    <section className="bg-background px-6 py-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden bg-secondary px-6 py-14 text-center sm:px-12">
        <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-secondary-foreground md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          {description}
        </p>
        <Button asChild size="lg" className="mt-8 h-12 rounded-full px-7">
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
