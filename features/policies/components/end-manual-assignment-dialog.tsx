"use client";

import { DateInput } from "@/components/ui/date-input";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { businessErrorMessage } from "@/lib/business-api";
import { useEndManualAssignmentMutation } from "@/features/policies/policy-hooks";

export function EndManualAssignmentDialog({ businessId, employeeId, policyId, policyName, open, onOpenChange }: { businessId: string; employeeId: string; policyId: string; policyName: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [effectiveTo, setEffectiveTo] = useState("");
  const end = useEndManualAssignmentMutation(businessId, employeeId);
  const submit = (event: FormEvent) => { event.preventDefault(); end.mutate({ policyId, ...(effectiveTo ? { effectiveTo: new Date(effectiveTo).toISOString() } : {}) }, { onSuccess: () => { toast.success("Manual assignment ended."); onOpenChange(false); }, onError: (error) => toast.error(businessErrorMessage(error)) }); };
  return <Dialog open={open} onOpenChange={(value) => !end.isPending && onOpenChange(value)}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>End manual assignment?</DialogTitle><DialogDescription>This ends the manual assignment for {policyName} without deleting its history.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><label className="block space-y-2 text-sm font-medium">Effective end (exclusive, optional)<DateInput kind="datetime-local" value={effectiveTo} disabled={end.isPending} onChange={(event) => setEffectiveTo(event.target.value)} /></label><DialogFooter><Button type="button" variant="outline" disabled={end.isPending} onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={end.isPending}>{end.isPending ? <Loader2 className="animate-spin" /> : null}End assignment</Button></DialogFooter></form></DialogContent></Dialog>;
}
