"use client";

import * as React from "react";
import { CalendarDays, Clock3 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DateInput({ kind = "date", className, ...props }: Omit<React.ComponentProps<"input">, "type"> & { kind?: "date" | "datetime-local" }) {
  const Icon = kind === "date" ? CalendarDays : Clock3;
  return <span className="relative block"><Input type={kind} className={cn("appearance-none bg-background pr-9 text-foreground [color-scheme:light] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 dark:[color-scheme:dark] dark:bg-input/30", className)} {...props} /><Icon aria-hidden="true" className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-primary" /></span>;
}
