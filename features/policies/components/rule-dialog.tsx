"use client";

import { DateInput } from "@/components/ui/date-input";

import { SelectControl } from "@/components/ui/select";

import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { businessErrorMessage } from "@/lib/business-api";
import type { PolicyRule, PolicyRuleField, PolicyRuleOperator } from "@/lib/policy-api";
import { useEmployeeListsQuery } from "@/features/business/employee-list-hooks";
import { useEmployeeGroupsQuery, useEmployeeTypesQuery } from "@/features/business/employee-classification-hooks";
import { fieldLabels, operatorLabels, operatorsByField, toRuleValue, validateEffectiveRange } from "@/features/policies/policy-helpers";
import { useCreateRuleMutation, useUpdateRuleMutation } from "@/features/policies/policy-hooks";

type ConditionDraft = { field: PolicyRuleField; operator: PolicyRuleOperator; values: string[] };
const newCondition = (): ConditionDraft => ({ field: "department", operator: "equals", values: [""] });
const asDraft = (rule?: PolicyRule): ConditionDraft[] => rule?.conditions.map((condition) => ({ field: condition.field, operator: condition.operator, values: Array.isArray(condition.value) ? condition.value.map(String) : [String(condition.value)] })) ?? [newCondition()];

function ReferenceValue({ multiple, values, options, disabled, onChange }: { multiple: boolean; values: string[]; options: { id: string; name: string }[]; disabled: boolean; onChange: (values: string[]) => void }) {
  return <SelectControl multiple={multiple} value={multiple ? values : values[0] ?? ""} disabled={disabled} className="min-h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" onChange={(event) => onChange(multiple ? Array.from(event.target.selectedOptions, (option) => option.value) : [event.target.value])}><option value="" disabled={multiple}>Select value</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</SelectControl>;
}

export function RuleDialog({ businessId, policyId, rule, open, onOpenChange }: { businessId: string; policyId: string; rule?: PolicyRule; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState(rule?.name ?? "");
  const [priority, setPriority] = useState(String(rule?.priority ?? 0));
  const [effectiveFrom, setEffectiveFrom] = useState(rule?.effectiveFrom?.slice(0, 16) ?? "");
  const [effectiveTo, setEffectiveTo] = useState(rule?.effectiveTo?.slice(0, 16) ?? "");
  const [conditions, setConditions] = useState<ConditionDraft[]>(() => asDraft(rule));
  const lists = useEmployeeListsQuery(businessId, 1, 100);
  const types = useEmployeeTypesQuery(businessId, "active");
  const groups = useEmployeeGroupsQuery(businessId, "active");
  const create = useCreateRuleMutation(businessId, policyId);
  const update = useUpdateRuleMutation(businessId, policyId, rule?.id ?? "");
  const pending = create.isPending || update.isPending;
  const patchCondition = (index: number, patch: Partial<ConditionDraft>) => setConditions((current) => current.map((condition, currentIndex) => currentIndex === index ? { ...condition, ...patch } : condition));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const rangeError = validateEffectiveRange(effectiveFrom, effectiveTo);
    if (rangeError) return toast.error(rangeError);
    if (!conditions.length) return toast.error("Add at least one condition.");
    try {
      const body = { name: name.trim() || null, priority: Number(priority), effectiveFrom: effectiveFrom ? new Date(effectiveFrom).toISOString() : null, effectiveTo: effectiveTo ? new Date(effectiveTo).toISOString() : null, conditions: conditions.map((condition) => ({ field: condition.field, operator: condition.operator, value: toRuleValue(condition.field, condition.operator, condition.values) })) };
      if (!Number.isFinite(body.priority)) return toast.error("Enter a valid numeric priority.");
      const mutation = rule ? update : create;
      mutation.mutate(body, { onSuccess: () => { toast.success(rule ? "Rule updated." : "Rule created."); onOpenChange(false); }, onError: (error) => toast.error(businessErrorMessage(error)) });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Check the rule conditions."); }
  };
  return <Dialog open={open} onOpenChange={(value) => !pending && onOpenChange(value)}><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>{rule ? "Edit assignment rule" : "Create assignment rule"}</DialogTitle><DialogDescription>An employee must satisfy every condition in this rule. Higher numeric priority wins.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">Rule name (optional)<Input value={name} disabled={pending} onChange={(event) => setName(event.target.value)} /></label><label className="space-y-2 text-sm font-medium">Priority<Input type="number" step="1" value={priority} disabled={pending} onChange={(event) => setPriority(event.target.value)} /></label></div><div className="space-y-3"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Conditions</h3><p className="text-xs text-muted-foreground">All conditions use AND semantics.</p></div><Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => setConditions((current) => [...current, newCondition()])}><Plus />Add condition</Button></div>{conditions.map((condition, index) => { const multiple = condition.operator === "in" || condition.operator === "not_in"; const referenceOptions = condition.field === "department" ? (lists.data?.items ?? []).map((item) => ({ id: item.id, name: item.name })) : condition.field === "employeeType" ? (types.data?.items ?? []).map((item) => ({ id: item.id, name: item.name })) : (groups.data?.items ?? []).map((item) => ({ id: item.id, name: item.name })); return <div key={`${index}-${condition.field}`} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[1fr_1fr_1.5fr_auto]"><label className="space-y-1 text-xs font-medium">Field<SelectControl className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={condition.field} disabled={pending} onChange={(event) => { const field = event.target.value as PolicyRuleField; patchCondition(index, { field, operator: operatorsByField[field][0], values: [""] }); }}>{Object.entries(fieldLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</SelectControl></label><label className="space-y-1 text-xs font-medium">Operator<SelectControl className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={condition.operator} disabled={pending} onChange={(event) => patchCondition(index, { operator: event.target.value as PolicyRuleOperator, values: [""] })}>{operatorsByField[condition.field].map((operator) => <option key={operator} value={operator}>{operatorLabels[operator]}</option>)}</SelectControl></label><label className="space-y-1 text-xs font-medium">Value{condition.field === "tenure" ? <Input aria-label="Tenure in completed months" type="number" min="0" value={condition.values[0] ?? ""} disabled={pending} onChange={(event) => patchCondition(index, { values: [event.target.value] })} /> : condition.field === "state" ? <Input aria-label="State values" value={condition.values.join(", ")} disabled={pending} placeholder={multiple ? "Lagos, Abuja" : "Lagos"} onChange={(event) => patchCondition(index, { values: multiple ? event.target.value.split(",") : [event.target.value] })} /> : <ReferenceValue multiple={multiple} values={condition.values} options={referenceOptions} disabled={pending} onChange={(values) => patchCondition(index, { values })} />}</label><Button aria-label="Remove condition" type="button" size="icon" variant="ghost" className="mt-5" disabled={pending || conditions.length === 1} onClick={() => setConditions((current) => current.filter((_, currentIndex) => currentIndex !== index))}><Trash2 /></Button></div>; })}</div><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2 text-sm font-medium">Effective start (inclusive)<DateInput kind="datetime-local" value={effectiveFrom} disabled={pending} onChange={(event) => setEffectiveFrom(event.target.value)} /></label><label className="space-y-2 text-sm font-medium">Effective end (exclusive)<DateInput kind="datetime-local" value={effectiveTo} disabled={pending} onChange={(event) => setEffectiveTo(event.target.value)} /></label></div><DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : null}{rule ? "Save rule" : "Create rule"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
