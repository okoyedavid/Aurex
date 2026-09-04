"use client";

import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

const variants = {
  inline: "rounded-md border p-5",
  panel: "rounded-md border p-6",
  empty: "rounded-md border border-dashed p-10 text-center",
  page: "flex min-h-[70vh] items-center justify-center px-6",
};

export function FeedbackState({
  title = "Unable to load data",
  message,
  retry,
  retryLabel = "Try again",
  action,
  icon,
  tone = "error",
  variant = "panel",
  centered = variant === "page",
  className,
}: {
  title?: string;
  message?: string;
  retry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  icon?: ReactNode;
  tone?: "error" | "neutral";
  variant?: keyof typeof variants;
  centered?: boolean;
  className?: string;
}) {
  const content = (
    <div className={cn(centered && "max-w-md text-center")}>
      {icon ??
        (tone === "error" ? (
          <AlertCircle
            className={cn("size-5 text-destructive", centered && "mx-auto")}
          />
        ) : null)}
      <h2
        className={cn(
          "font-semibold",
          (Boolean(icon) || tone === "error") && "mt-3",
          tone === "error" && "text-destructive",
          variant === "page" && "text-3xl font-bold text-foreground",
        )}
      >
        {title}
      </h2>
      {message ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {message}
        </p>
      ) : null}
      {retry || action ? (
        <div className={cn("mt-4 flex gap-2", centered && "justify-center")}>
          {action}
          {retry ? (
            <Button variant="outline" onClick={retry}>
              {retryLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  if (variant === "page") {
    return <main className={cn(variants.page, className)}>{content}</main>;
  }

  return (
    <div
      className={cn(
        variants[variant],
        tone === "error"
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-card",
        className,
      )}
    >
      {content}
    </div>
  );
}
