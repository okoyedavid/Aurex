import { Archive, ChevronDown, LockKeyhole, Pencil, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { BusinessRole } from "@/lib/access-api";
import { Badge, PermissionList } from "../shared";

export function RoleRow({ role, open, separated, canEdit, canArchive, onToggle, onEdit, onArchive }: { role: BusinessRole; open: boolean; separated: boolean; canEdit: boolean; canArchive: boolean; onToggle: () => void; onEdit: () => void; onArchive: () => void }) {
  const isCustom = role.type === "custom";
  const isActive = role.status === "active";
  const denied = new Set(role.deniedPermissions);
  const effectiveCount = role.permissions.filter((permission) => !denied.has(permission)).length;
  const detailsId = `role-${role.id}-details`;
  return (
    <article className={`${separated ? "border-t border-border" : ""} ${isActive ? "" : "opacity-75"}`}>
      <button type="button" aria-expanded={open} aria-controls={detailsId} onClick={onToggle} className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 sm:px-5">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-md ${isCustom ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{isCustom ? <Sparkles className="size-4" /> : <LockKeyhole className="size-4" />}</span>
        <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="truncate text-sm font-semibold sm:text-base">{role.name}</span><Badge tone={isCustom ? "good" : "neutral"}>{role.type}</Badge>{!isActive ? <Badge tone="bad">archived</Badge> : null}</span><span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"><span>{effectiveCount} effective permissions</span>{role.deniedPermissions.length ? <span className="text-destructive">{role.deniedPermissions.length} denied</span> : null}</span></span>
        <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div id={detailsId} className="border-t border-border bg-muted/20 px-4 py-5 sm:px-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><code className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">{role.key}</code>{isCustom && isActive && (canEdit || canArchive) ? <div className="flex gap-2">{canEdit ? <Button size="sm" variant="outline" onClick={onEdit}><Pencil /> Edit role</Button> : null}{canArchive ? <Button size="sm" variant="destructive" onClick={onArchive}><Archive /> Archive</Button> : null}</div> : <span className="text-xs text-muted-foreground">{isCustom ? "Archived" : "Managed by Aurex"}</span>}</div><PermissionList permissions={role.permissions} denied={role.deniedPermissions} /></div> : null}
    </article>
  );
}
