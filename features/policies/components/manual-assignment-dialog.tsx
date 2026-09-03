"use client";

import { DateInput } from "@/components/ui/date-input";

import { SelectControl } from "@/components/ui/select";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { businessErrorMessage } from "@/lib/business-api";
import type { PolicyCategory } from "@/lib/policy-api";
import { cardinalityDescription } from "@/features/policies/policy-helpers";
import { useCreateManualAssignmentMutation, usePoliciesQuery } from "@/features/policies/policy-hooks";

export function ManualAssignmentDialog({ businessId, employeeId, categories, open, onOpenChange }: { businessId: string; employeeId: string; categories: PolicyCategory[]; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [categoryId, setCategoryId] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const policies = usePoliciesQuery(businessId, 1, 100, { categoryId, status: "active" }, Boolean(categoryId));
  const assign = useCreateManualAssignmentMutation(businessId, employeeId);
  const category = categories.find((item) => item.id === categoryId);
  const policy = policies.data?.items.find((item) => item.id === policyId);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!policyId) return toast.error("Select an active policy.");
    assign.mutate({ policyId, ...(effectiveFrom ? { effectiveFrom: new Date(effectiveFrom).toISOString() } : {}) }, { onSuccess: () => { toast.success("Policy manually assigned."); onOpenChange(false); }, onError: (error) => toast.error(businessErrorMessage(error)) });
  };
  return <Dialog open={open} onOpenChange={(value) => !assign.isPending && onOpenChange(value)}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>Assign policy manually</DialogTitle><DialogDescription>Choose a category first, then an active policy. The assignment is recorded separately from automatic rule matches.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><label className="block space-y-2 text-sm font-medium">Category<SelectControl className="h-9 w-full rounded-md border border-input bg-background px-3" value={categoryId} disabled={assign.isPending} onChange={(event) => { setCategoryId(event.target.value); setPolicyId(""); }}><option value="">Select category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.cardinality}</option>)}</SelectControl></label>{category ? <div className="rounded-md bg-muted p-3 text-sm"><p>{cardinalityDescription(category.cardinality)}</p>{category.cardinality === "ONE" ? <p className="mt-2 font-semibold text-amber-700 dark:text-amber-300">A manual assignment takes precedence over automatic candidates in this ONE category.</p> : null}</div> : null}<label className="block space-y-2 text-sm font-medium">Active policy<SelectControl className="h-9 w-full rounded-md border border-input bg-background px-3" value={policyId} disabled={!categoryId || policies.isLoading || assign.isPending} onChange={(event) => setPolicyId(event.target.value)}><option value="">{policies.isLoading ? "Loading policies…" : "Select policy"}</option>{policies.data?.items.map((item) => <option key={item.id} value={item.id}>{item.name} · v{item.version}</option>)}</SelectControl></label>{policies.error ? <p className="text-sm text-destructive">{businessErrorMessage(policies.error)}</p> : null}{policy ? <div className="rounded-md border border-border p-3 text-sm"><p className="font-semibold">{policy.name}</p><p className="mt-1 text-muted-foreground">{policy.description || "No description"}</p><p className="mt-2 text-xs text-muted-foreground">Policy interval: {policy.effectiveFrom ? new Date(policy.effectiveFrom).toLocaleString() : "immediate"} to {policy.effectiveTo ? new Date(policy.effectiveTo).toLocaleString() : "no scheduled end"}</p></div> : null}<label className="block space-y-2 text-sm font-medium">Assignment effective start (inclusive, optional)<DateInput kind="datetime-local" value={effectiveFrom} disabled={assign.isPending} onChange={(event) => setEffectiveFrom(event.target.value)} /></label><DialogFooter><Button type="button" variant="outline" disabled={assign.isPending} onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={assign.isPending || !policyId}>{assign.isPending ? <Loader2 className="animate-spin" /> : null}Assign policy</Button></DialogFooter></form></DialogContent></Dialog>;
}
