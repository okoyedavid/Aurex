import { ArrowDown } from "lucide-react";
import type { ReactNode } from "react";

export function SectionLead({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div data-reveal className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <p className="font-mono text-xs uppercase tracking-[.2em] text-primary">{eyebrow}</p>
      <div>
        <h2 className="text-balance text-4xl font-semibold tracking-[-.045em] sm:text-5xl">{title}</h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-full border border-border bg-card/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide">{children}</span>;
}

export function OrderItem({ number, title, copy }: { number: string; title: string; copy: string }) {
  return <li className="grid grid-cols-[2.5rem_1fr] gap-3"><span className="font-mono text-xs">{number}</span><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm opacity-80">{copy}</p></div></li>;
}

export function CardinalityRow({ title, description, selected }: { title: string; description: string; selected: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-semibold">{title}</h4><span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase text-primary">selected · {selected}</span></div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export function FlowNode({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <div className="rounded-md bg-muted p-5"><div className="mb-5 text-primary [&>svg]:size-5">{icon}</div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-muted-foreground">{copy}</p></div>;
}

export function FlowArrow() {
  return <ArrowDown className="mx-auto size-5 text-primary md:-rotate-90" />;
}

export function ArchitectureNode({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <div className="rounded-md border border-border bg-card p-4"><div className="text-primary [&>svg]:size-4">{icon}</div><p className="mt-5 text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{copy}</p></div>;
}

export function Decision({ title, copy }: { title: string; copy: string }) {
  return <article data-reveal className="rounded-md border border-border p-6"><h3 className="font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p></article>;
}
