"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PolicyAudit } from "@/lib/policy-api";
import { auditInitiatingUser } from "@/features/policies/policy-helpers";

export function PolicyPageFrame({ children }: { children: React.ReactNode }) {
  return <main className="px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1280px]">{children}</div></main>;
}

export function PolicyLoading({ label = "Loading policies…" }: { label?: string }) {
  return <PolicyPageFrame><div className="space-y-4"><div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" />{label}</div><div className="h-32 animate-pulse rounded-md bg-muted" /><div className="h-64 animate-pulse rounded-md bg-muted" /></div></PolicyPageFrame>;
}

export function PolicyError({ message, retry }: { message: string; retry: () => void }) {
  return <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6"><h2 className="font-semibold text-destructive">Unable to load policy data</h2><p className="mt-2 text-sm text-muted-foreground">{message}</p><Button className="mt-4" variant="outline" onClick={retry}>Retry</Button></div>;
}

export function PolicyEmpty({ title, detail }: { title: string; detail?: string }) {
  return <div className="rounded-md border border-dashed border-border p-10 text-center"><h2 className="font-semibold">{title}</h2>{detail ? <p className="mt-2 text-sm text-muted-foreground">{detail}</p> : null}</div>;
}

export function PolicyBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "info" }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tone === "success" && "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", tone === "warning" && "bg-amber-500/10 text-amber-700 dark:text-amber-300", tone === "danger" && "bg-destructive/10 text-destructive", tone === "info" && "bg-primary/10 text-primary", tone === "neutral" && "bg-muted text-muted-foreground")}>{children}</span>;
}

export function ConfirmPolicyAction({ open, title, description, confirmLabel, pending, tone = "default", onConfirm, onOpenChange }: { open: boolean; title: string; description: string; confirmLabel: string; pending?: boolean; tone?: "default" | "danger"; onConfirm: () => void; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={(value) => !pending && onOpenChange(value)}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button><Button variant={tone === "danger" ? "destructive" : "default"} disabled={pending} onClick={onConfirm}>{pending ? <Loader2 className="animate-spin" /> : null}{confirmLabel}</Button></DialogFooter></DialogContent></Dialog>;
}

function JsonDetails({ label, value }: { label: string; value: unknown }) {
  if (value === undefined) return null;
  return <div><p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(value, null, 2)}</pre></div>;
}

export function PolicyAuditTable({ items }: { items: PolicyAudit[] }) {
  const [expanded, setExpanded] = useState<string>();
  if (!items.length) return <PolicyEmpty title="No policy history matches these filters." />;
  return <div className="overflow-x-auto rounded-md border border-border bg-card"><table className="w-full min-w-[920px] text-left text-sm"><thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground"><tr><th className="p-4">Timestamp</th><th className="p-4">Action</th><th className="p-4">Entity</th><th className="p-4">Actor</th><th className="p-4">Context</th><th className="p-4">Changed fields</th><th className="p-4"><span className="sr-only">Details</span></th></tr></thead><tbody className="divide-y divide-border">{items.map((item) => { const technicalId = item.correlationId || item.reconciliationRunId; const initiator = auditInitiatingUser(item.metadata); const isOpen = expanded === item.id; return <tr key={item.id} className="align-top"><td className="p-4 whitespace-nowrap">{new Date(item.occurredAt).toLocaleString()}</td><td className="p-4"><p className="font-medium">{item.action}</p>{item.reason ? <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p> : null}</td><td className="p-4"><PolicyBadge>{item.entityType.replaceAll("_", " ")}</PolicyBadge><p className="mt-1 text-xs text-muted-foreground">{item.entityId}</p></td><td className="p-4"><p>{item.actorType}</p><p className="text-xs text-muted-foreground">{item.actorUserId || initiator || item.actorBusinessMemberId || "Not available"}</p></td><td className="p-4 text-xs text-muted-foreground">{[item.employeeId && `Employee ${item.employeeId}`, item.policyId && `Policy ${item.policyId}`, item.categoryId && `Category ${item.categoryId}`].filter(Boolean).map((value) => <p key={value as string}>{value}</p>)}</td><td className="p-4">{item.changedFields?.length ? item.changedFields.join(", ") : "—"}</td><td className="p-4"><Button size="sm" variant="ghost" aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? undefined : item.id)}>{isOpen ? <ChevronUp /> : <ChevronDown />}Details</Button>{isOpen ? <div className="mt-3 w-[520px] space-y-3"><JsonDetails label="Before" value={item.before} /><JsonDetails label="After" value={item.after} />{technicalId ? <p className="text-xs text-muted-foreground">Technical ID: {technicalId}</p> : null}</div> : null}</td></tr>; })}</tbody></table></div>;
}

export function HistoricalDataWarning() {
  return <div className="flex gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm"><AlertTriangle className="h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" /><p>This result uses the employee record currently available to the resolver. Persisted assignment history is authoritative, but a complete historical employee-attribute snapshot is not available for this date.</p></div>;
}
