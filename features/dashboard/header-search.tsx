"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import type { HeaderCommand, HeaderSearchMetadata } from "@/features/dashboard/data";
import { cn } from "@/lib/utils";

function useHeaderSearchValue(metadata: HeaderSearchMetadata) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get("search") ?? "";
  const [value, setValue] = useState(urlValue);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => setValue(urlValue), [urlValue]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const update = (nextValue: string) => {
    setValue(nextValue);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const normalized = nextValue.trim();
      if (normalized) params.set("search", normalized);
      else params.delete("search");
      if (metadata.mode === "list") params.delete("page");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 300);
  };

  return { value, update };
}

function CommandResults({ commands, query, onSelect }: { commands: HeaderCommand[]; query: string; onSelect: () => void }) {
  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return commands
      .filter((command) => !normalized || `${command.label} ${command.description}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [commands, query]);

  return (
    <div role="listbox" className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-md border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
      {visible.length ? visible.map((command) => {
        const Icon = command.icon;
        return (
          <Link key={`${command.href}-${command.label}`} href={command.href} role="option" onClick={onSelect} className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-muted">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="size-4" /></span>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold">{command.label}</span><span className="block truncate text-xs text-muted-foreground">{command.description}</span></span>
          </Link>
        );
      }) : <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matching page or action.</p>}
    </div>
  );
}

function SearchField({ metadata, commands, autoFocus, onSelect }: { metadata: HeaderSearchMetadata; commands: HeaderCommand[]; autoFocus?: boolean; onSelect: () => void }) {
  const { value, update } = useHeaderSearchValue(metadata);
  const [focused, setFocused] = useState(false);
  const showCommands = metadata.mode === "commands" && focused;

  return (
    <div className="relative w-full max-w-sm">
      <label>
        <span className="sr-only">{metadata.placeholder}</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" value={value} autoFocus={autoFocus} placeholder={metadata.placeholder} aria-expanded={showCommands} aria-autocomplete={metadata.mode === "commands" ? "list" : undefined} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 100)} onChange={(event) => update(event.target.value)} className="h-10 bg-muted pl-9 pr-9" />
      </label>
      {value ? <button type="button" aria-label="Clear search" onMouseDown={(event) => event.preventDefault()} onClick={() => update("")} className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"><X className="size-3.5" /></button> : null}
      {showCommands ? <CommandResults commands={commands} query={value} onSelect={onSelect} /> : null}
    </div>
  );
}

export function DesktopHeaderSearch({ metadata, commands }: { metadata: HeaderSearchMetadata; commands: HeaderCommand[] }) {
  return <SearchField metadata={metadata} commands={commands} onSelect={() => undefined} />;
}

export function MobileHeaderSearch({ metadata, commands }: { metadata: HeaderSearchMetadata; commands: HeaderCommand[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button type="button" aria-label="Search dashboard" aria-expanded={open} onClick={() => setOpen((current) => !current)} className={cn("flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground", open && "bg-muted text-foreground")}>
        {open ? <X className="size-4" /> : <Search className="size-4" />}
      </button>
      {open ? <div className="absolute inset-x-4 top-[calc(100%+0.5rem)] z-50 rounded-md border border-border bg-background p-3 shadow-lg"><SearchField metadata={metadata} commands={commands} autoFocus onSelect={() => setOpen(false)} /></div> : null}
    </div>
  );
}
