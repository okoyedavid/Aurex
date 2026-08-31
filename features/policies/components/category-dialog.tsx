"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { businessErrorMessage } from "@/lib/business-api";
import type { CategoryBody, PolicyCategory, PolicyCardinality } from "@/lib/policy-api";
import { cardinalityDescription } from "@/features/policies/policy-helpers";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "@/features/policies/policy-hooks";
import { ConfirmPolicyAction } from "./policy-ui";

export function CategoryDialog({ businessId, category, open, onOpenChange }: { businessId: string; category?: PolicyCategory; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [cardinality, setCardinality] = useState<PolicyCardinality>(category?.cardinality ?? "ONE");
  const [pendingBody, setPendingBody] = useState<CategoryBody>();
  const create = useCreateCategoryMutation(businessId);
  const update = useUpdateCategoryMutation(businessId, category?.id ?? "");
  const pending = create.isPending || update.isPending;
  const save = (body: CategoryBody) => {
    const mutation = category ? update : create;
    mutation.mutate(body, { onSuccess: () => { toast.success(category ? "Policy category updated." : "Policy category created."); onOpenChange(false); }, onError: (error) => toast.error(businessErrorMessage(error)) });
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return toast.error("Enter a category name.");
    const body = { name: name.trim(), description: description.trim() || null, cardinality };
    if (category && category.cardinality !== cardinality) return setPendingBody(body);
    save(body);
  };
  return <><Dialog open={open} onOpenChange={(value) => !pending && onOpenChange(value)}><DialogContent className="max-w-xl"><DialogHeader><DialogTitle>{category ? "Edit policy category" : "Create policy category"}</DialogTitle><DialogDescription>Categories determine whether one or several policies may apply to an employee.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><label className="block space-y-2 text-sm font-medium">Name<Input value={name} disabled={pending} onChange={(event) => setName(event.target.value)} /></label><label className="block space-y-2 text-sm font-medium">Description<Textarea value={description} disabled={pending} onChange={(event) => setDescription(event.target.value)} /></label><fieldset className="space-y-2"><legend className="text-sm font-medium">Cardinality</legend>{(["ONE", "MANY"] as const).map((value) => <label key={value} className="flex cursor-pointer gap-3 rounded-xl border border-border p-3"><input type="radio" name="cardinality" value={value} checked={cardinality === value} disabled={pending} onChange={() => setCardinality(value)} /><span><span className="font-semibold">{value}</span><span className="mt-1 block text-sm text-muted-foreground">{cardinalityDescription(value)}</span></span></label>)}</fieldset><DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null}{category ? "Save changes" : "Create category"}</Button></DialogFooter></form></DialogContent></Dialog>{pendingBody ? <ConfirmPolicyAction open title="Change category cardinality?" description="This change can queue business-wide assignment reconciliation and alter which policies apply to employees." confirmLabel="Change cardinality" pending={pending} onOpenChange={(value) => !value && setPendingBody(undefined)} onConfirm={() => save(pendingBody)} /> : null}</>;
}
