"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return <SelectPrimitive.Trigger data-slot="select-trigger" className={cn("inline-flex h-9 max-w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition hover:border-primary/35 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 [&>span]:truncate", className)} {...props}>{children}<SelectPrimitive.Icon asChild><ChevronDown className="size-4 shrink-0 text-muted-foreground" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}

function SelectContent({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content data-slot="select-content" position={position} className={cn("relative z-50 max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1", position === "popper" && "w-[var(--radix-select-trigger-width)]", className)} {...props}><SelectPrimitive.ScrollUpButton className="flex h-7 items-center justify-center text-muted-foreground"><ChevronUp className="size-4" /></SelectPrimitive.ScrollUpButton><SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport><SelectPrimitive.ScrollDownButton className="flex h-7 items-center justify-center text-muted-foreground"><ChevronDown className="size-4" /></SelectPrimitive.ScrollDownButton></SelectPrimitive.Content></SelectPrimitive.Portal>;
}

function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return <SelectPrimitive.Item data-slot="select-item" className={cn("relative flex w-full cursor-default select-none items-center rounded-md py-2 pr-8 pl-2.5 text-sm outline-none focus:bg-primary/10 focus:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><span className="absolute right-2 flex size-4 items-center justify-center text-primary"><SelectPrimitive.ItemIndicator><Check className="size-4" /></SelectPrimitive.ItemIndicator></span></SelectPrimitive.Item>;
}

export type SelectFieldOption = { value: string; label: React.ReactNode; disabled?: boolean };
const emptyValue = "__aurex_empty_value__";

export function normalizeSingleSelectValue(value: string | number | readonly string[] | undefined) {
  return Array.isArray(value) || value == null ? undefined : String(value);
}

export function SelectField({ value, defaultValue, onValueChange, options, placeholder = "Select an option", className, disabled, required, name, ariaLabel }: { value?: string; defaultValue?: string; onValueChange: (value: string) => void; options: SelectFieldOption[]; placeholder?: string; className?: string; disabled?: boolean; required?: boolean; name?: string; ariaLabel?: string }) {
  return <Select value={value || undefined} defaultValue={defaultValue || undefined} onValueChange={(next) => onValueChange(next === emptyValue ? "" : next)} disabled={disabled} required={required} name={name}><SelectTrigger className={className} aria-label={ariaLabel}><SelectValue placeholder={placeholder} /></SelectTrigger><SelectContent><SelectItem value={emptyValue}>{placeholder}</SelectItem>{options.map((option) => <SelectItem key={option.value} value={option.value} disabled={option.disabled}>{option.label}</SelectItem>)}</SelectContent></Select>;
}

export function SelectControl({ children, value, defaultValue, onChange, className, disabled, required, name, multiple, ...props }: Omit<React.ComponentProps<"select">, "ref">) {
  if (multiple) {
    return <select value={value} onChange={onChange} className={cn("min-h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30", className)} disabled={disabled} required={required} name={name} multiple {...props}>{children}</select>;
  }

  const optionElements = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<React.ComponentProps<"option">> =>
      React.isValidElement(child) && child.type === "option",
  );
  const options = optionElements.map((option) => ({
    value: String(option.props.value ?? option.props.children ?? ""),
    label: option.props.children,
    disabled: option.props.disabled,
  }));
  const empty = options.find((option) => option.value === "");
  const normalizedValue = normalizeSingleSelectValue(value);
  const normalizedDefaultValue = normalizeSingleSelectValue(defaultValue);
  return <SelectField value={normalizedValue} defaultValue={normalizedDefaultValue} onValueChange={(next) => onChange?.({ target: { value: next }, currentTarget: { value: next } } as React.ChangeEvent<HTMLSelectElement>)} options={options.filter((option) => option.value !== "")} placeholder={typeof empty?.label === "string" ? empty.label : "Select an option"} className={className} disabled={disabled} required={required} name={name} ariaLabel={props["aria-label"]} />;
}

export { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue };
