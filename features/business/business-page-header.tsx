"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export type BusinessPageTab = {
  label: string;
  active: boolean;
  href?: string;
  onSelect?: () => void;
};

export function BusinessPageHeader({
  eyebrow,
  title,
  description,
  actions,
  tabs = [],
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  tabs?: BusinessPageTab[];
}) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-sm text-muted-foreground">{eyebrow}</p>
          ) : null}
          <h1 className={cn("text-3xl font-bold tracking-tight", eyebrow && "mt-1")}>
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>

      {tabs.length ? (
        <nav
          className="mt-7 flex gap-2 overflow-x-auto border-b border-border"
          aria-label={`${title} sections`}
          role="tablist"
        >
          {tabs.map((tab) => {
            const className = cn(
              "shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition",
              tab.active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            );

            return tab.href ? (
              <Link
                key={tab.label}
                href={tab.href}
                role="tab"
                aria-selected={tab.active}
                className={className}
              >
                {tab.label}
              </Link>
            ) : (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={tab.active}
                onClick={tab.onSelect}
                className={className}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
