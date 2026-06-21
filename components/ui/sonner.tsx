"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      closeButton
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-card text-card-foreground shadow-xl font-sans",
          title: "text-sm font-semibold text-foreground",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
