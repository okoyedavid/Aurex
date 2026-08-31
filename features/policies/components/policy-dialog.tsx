"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { businessErrorMessage } from "@/lib/business-api";
import type { Policy, PolicyCategory } from "@/lib/policy-api";
import { validateEffectiveRange } from "@/features/policies/policy-helpers";
import { useCreatePolicyMutation, useUpdatePolicyMutation } from "@/features/policies/policy-hooks";

export function PolicyDialog({ businessId, categories, policy, initialCategoryId, open, onOpenChange }: { businessId: string; categories: PolicyCategory[]; policy?: Policy; initialCategoryId?: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [categoryId, setCategoryId] = useState(policy?.categoryId ?? initialCategoryId ?? "");
  const [name, setName] = useState(policy?.name ?? "");
  const [description, setDescription] = useState(policy?.description ?? "");
  const [effectiveFrom, setEffectiveFrom] = useState(policy?.effectiveFrom?.slice(0, 16) ?? "");
  const [effectiveTo, setEffectiveTo] = useState(policy?.effectiveTo?.slice(0, 16) ?? "");
  const create = useCreatePolicyMutation(businessId);
  const update = useUpdatePolicyMutation(businessId, policy?.id ?? "");
  const pending = create.isPending || update.isPending;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!categoryId || !name.trim()) return toast.error("Choose a category and enter a policy name.");
    const rangeError = validateEffectiveRange(effectiveFrom, effectiveTo);
    if (rangeError) return toast.error(rangeError);
    const body = { categoryId, name: name.trim(), description: description.trim() || null, effectiveFrom: effectiveFrom ? new Date(effectiveFrom).toISOString() : null, effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : null };
    const mutation = policy ? update : create;
    mutation.mutate(body, { onSuccess: () => { toast.success(policy ? "Policy updated." : "Draft policy created."); onOpenChange(false); }, onError: (error) => toast.error(businessErrorMessage(error)) });
  };
  return <Dialog open={open} onOpenChange={(value) => !pending && onOpenChange(value)}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>{policy ? "Edit policy" : "Create policy"}</DialogTitle><DialogDescription>New policies start as drafts. Effective starts are inclusive and effective ends are exclusive.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><label className="block space-y-2 text-sm font-medium">Category<select className="h-9 w-full rounded-lg border border-input bg-background px-3" value={categoryId} disabled={pending} onChange={(event) => setCategoryId(event.target.value)}><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name} · {category.cardinality}</option>)}</select></label><label className="block space-y-2 text-sm font-medium">Name<Input value={name} disabled={pending} onChange={(event) => setName(event.target.value)} /></label><label className="block space-y-2 text-sm font-medium">Description<Textarea value={description} disabled={pending} onChange={(event) => setDescription(event.target.value)} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">Effective start (inclusive)<Input type="datetime-local" value={effectiveFrom} disabled={pending} onChange={(event) => setEffectiveFrom(event.target.value)} /></label><label className="space-y-2 text-sm font-medium">Effective end (exclusive)<Input type="datetime-local" value={effectiveTo} disabled={pending} onChange={(event) => setEffectiveTo(event.target.value)} /></label></div><p className="text-xs text-muted-foreground">Configuration is optional and is not edited here because the application does not provide a schema-safe configuration editor.</p><DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null}{policy ? "Save changes" : "Create draft"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
