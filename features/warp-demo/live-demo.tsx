"use client";

import { SelectControl } from "@/components/ui/select";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  ChevronDown,
  CircleDot,
  DatabaseZap,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Loading } from "@/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { warpDemoApi } from "@/lib/warp-demo/api";
import type { AuditEvent, DemoEmployee, EmployeeExplanation, PolicySummary, ResolvedPolicy } from "@/lib/warp-demo/types";
import { cn } from "@/lib/utils";

export function LiveDemo() {
  const overview = useQuery({ queryKey: ["warp-demo", "overview"], queryFn: warpDemoApi.overview, retry: false });
  const employees = useQuery({ queryKey: ["warp-demo", "employees"], queryFn: warpDemoApi.employees, retry: false });
  const categories = useQuery({ queryKey: ["warp-demo", "categories"], queryFn: warpDemoApi.categories, retry: false });
  const policies = useQuery({ queryKey: ["warp-demo", "policies"], queryFn: () => warpDemoApi.policies(), retry: false });
  const [employeeId, setEmployeeId] = useState("");
  const [auditEmployeeId, setAuditEmployeeId] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [auditAction, setAuditAction] = useState("");
  const defaultEmployee = employees.data?.employees.find((employee) => employee.name.toLowerCase().includes("sarah")) ?? employees.data?.employees[0];
  const resolvedEmployeeId = employeeId || defaultEmployee?.id || "";

  const resolved = useQuery({
    queryKey: ["warp-demo", "resolved", resolvedEmployeeId],
    queryFn: () => warpDemoApi.employeePolicies(resolvedEmployeeId),
    enabled: Boolean(resolvedEmployeeId), retry: false,
  });
  const explanation = useQuery({
    queryKey: ["warp-demo", "explain", resolvedEmployeeId],
    queryFn: () => warpDemoApi.explainEmployee(resolvedEmployeeId),
    enabled: Boolean(resolvedEmployeeId), retry: false,
  });
  const policy = useQuery({
    queryKey: ["warp-demo", "policy", policyId],
    queryFn: () => warpDemoApi.policy(policyId),
    enabled: Boolean(policyId), retry: false,
  });
  const audit = useQuery({
    queryKey: ["warp-demo", "audit", auditEmployeeId, policyId, auditAction],
    queryFn: () => warpDemoApi.audit({ employeeId: auditEmployeeId || undefined, policyId: policyId || undefined, action: auditAction || undefined }),
    retry: false,
  });

  const retryAll = () => {
    void overview.refetch(); void employees.refetch(); void categories.refetch(); void policies.refetch();
  };
  const foundationalError = overview.error ?? employees.error ?? categories.error ?? policies.error;

  return (
    <section id="demo" className="scroll-mt-20 border-y border-primary/25 bg-primary/10 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.2em] text-primary">04 · Live system</p>
            <h2 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Interrogate the resolver.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">This surface reads from Aurex’s public demo contract. Choose an employee, inspect effective policies, and open the evidence behind the result.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-4 py-2 font-mono text-xs text-foreground">
            <CircleDot className={cn("size-3", foundationalError ? "text-destructive" : "text-primary")} />
            {foundationalError ? "API unavailable" : overview.isPending ? "Connecting…" : "Live · read only"}
          </div>
        </div>

        {foundationalError ? (
          <div data-reveal className="mt-12 rounded-md border border-destructive/25 bg-card p-8 sm:p-12">
            <AlertCircle className="size-8 text-destructive" />
            <h3 className="mt-6 text-2xl font-semibold">The public demo API is not responding.</h3>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{foundationalError.message} The system-design case study above remains available while the service is offline.</p>
            <Button onClick={retryAll} className="mt-6 rounded-full"><RotateCcw /> Retry connection</Button>
          </div>
        ) : (
          <div data-reveal className="mt-12 overflow-hidden rounded-md border border-border bg-card shadow-2xl shadow-primary/10">
            <div className="grid grid-cols-2 border-b border-border sm:grid-cols-5">
              <Stat label="Employees" value={overview.data?.stats.employees} />
              <Stat label="Categories" value={overview.data?.stats.policyCategories} />
              <Stat label="Policies" value={overview.data?.stats.policies} />
              <Stat label="Active rules" value={overview.data?.stats.activeRules} />
              <Stat label="Assignments" value={overview.data?.stats.activeAssignments} className="col-span-2 sm:col-span-1" />
            </div>

            <Tabs defaultValue="employees" className="p-4 sm:p-7">
              <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-md !bg-muted p-1.5 sm:w-auto">
                <TabsTrigger value="employees" className="h-9 rounded-md px-4">Employees</TabsTrigger>
                <TabsTrigger value="policies" className="h-9 rounded-md px-4">Policy explorer</TabsTrigger>
                <TabsTrigger value="audit" className="h-9 rounded-md px-4">Audit timeline</TabsTrigger>
              </TabsList>
              <TabsContent value="employees">
                <EmployeeExplorer employees={employees.data?.employees ?? []} employeeId={resolvedEmployeeId} onEmployeeChange={setEmployeeId} resolved={resolved.data?.policies} explanation={explanation.data} loading={resolved.isPending || explanation.isPending} error={resolved.error ?? explanation.error} />
              </TabsContent>
              <TabsContent value="policies">
                <PolicyExplorer policies={policies.data?.policies ?? []} categories={categories.data?.categories ?? []} policyId={policyId} onPolicyChange={setPolicyId} detail={policy.data} loading={policy.isPending && Boolean(policyId)} />
              </TabsContent>
              <TabsContent value="audit">
                <AuditExplorer events={audit.data?.events ?? []} employees={employees.data?.employees ?? []} policies={policies.data?.policies ?? []} employeeId={auditEmployeeId} policyId={policyId} action={auditAction} onEmployeeChange={setAuditEmployeeId} onPolicyChange={setPolicyId} onActionChange={setAuditAction} loading={audit.isPending} error={audit.error} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </section>
  );
}

function EmployeeExplorer({ employees, employeeId, onEmployeeChange, resolved, explanation, loading, error }: { employees: DemoEmployee[]; employeeId: string; onEmployeeChange: (id: string) => void; resolved?: ResolvedPolicy[]; explanation?: EmployeeExplanation; loading: boolean; error: Error | null }) {
  const [search, setSearch] = useState("");
  const visible = employees.filter((employee) => `${employee.name} ${employee.department} ${employee.jobTitle}`.toLowerCase().includes(search.toLowerCase()));
  const selected = employees.find((employee) => employee.id === employeeId);
  return (
    <div className="mt-6 grid min-h-[34rem] gap-6 lg:grid-cols-[20rem_1fr]">
      <aside className="rounded-md border border-border bg-card p-4">
        <label className="relative block"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find an employee" className="pl-9" /></label>
        <div className="mt-4 max-h-[28rem] space-y-1 overflow-y-auto pr-1">
          {visible.map((employee) => <button key={employee.id} onClick={() => onEmployeeChange(employee.id)} className={cn("w-full rounded-md p-3 text-left transition", employee.id === employeeId ? "bg-primary/10" : "hover:bg-muted")}><span className="block text-sm font-semibold">{employee.name}</span><span className="mt-1 block text-xs text-muted-foreground">{employee.jobTitle} · {employee.department}</span></button>)}
        </div>
      </aside>
      <div>
        {selected && <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-start"><div><p className="font-mono text-[10px] uppercase tracking-wider text-primary">Employee snapshot</p><h3 className="mt-2 text-2xl font-semibold">{selected.name}</h3><p className="mt-1 text-sm text-muted-foreground">{selected.jobTitle} · {selected.state} · {selected.tenureMonths} months</p></div>{explanation && <ExplanationDialog explanation={explanation} />}</div>}
        {loading ? <Loading label="Resolving policies" /> : error ? <FeedbackState variant="inline" title="Unable to load demo data" message={error.message} /> : resolved?.length ? <div className="mt-6 grid gap-3 sm:grid-cols-2">{resolved.map((item) => <article key={item.id} className="rounded-md border border-border bg-card p-5"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] uppercase text-muted-foreground">{item.category.name}</span><span className="font-mono text-[10px] text-primary">P{item.priority}</span></div><h4 className="mt-5 font-semibold">{item.name}</h4><p className="mt-2 text-xs text-muted-foreground">via {item.winningRuleName}</p></article>)}</div> : <Empty label="No effective policies were returned for this employee." />}
      </div>
    </div>
  );
}

function ExplanationDialog({ explanation }: { explanation: EmployeeExplanation }) {
  return <Dialog><DialogTrigger asChild><Button variant="outline" className="rounded-full bg-card">Why these policies? <Sparkles /></Button></DialogTrigger><DialogContent className="max-w-4xl rounded-md border-border"><DialogHeader><DialogTitle className="text-2xl">Resolution evidence for {explanation.employee.name}</DialogTitle><DialogDescription>Evaluated {formatDate(explanation.evaluationDate)}. Every candidate stays visible, including failed and suppressed paths.</DialogDescription></DialogHeader><div className="mt-4 space-y-4">{explanation.categories.map((group) => <details key={group.category.id} className="group rounded-md border border-border bg-muted/40" open={group.candidates.some((candidate) => candidate.selected)}><summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5"><div><p className="font-semibold">{group.category.name}</p><p className="mt-1 text-xs text-muted-foreground">{group.category.cardinality} · {group.selectedPolicies.length} selected</p></div><ChevronDown className="size-4 transition group-open:rotate-180" /></summary><div className="space-y-3 border-t border-border p-4">{group.candidates.map((candidate) => <div key={candidate.policyId} className={cn("rounded-md border p-4", candidate.selected ? "border-primary/30 bg-primary/10" : "border-border bg-card")}><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">{candidate.policyName}</span><span className="font-mono text-[10px] uppercase">{candidate.selected ? "selected" : candidate.suppressedReason ?? (candidate.matched ? "matched" : "not matched")}</span></div>{candidate.matchedRules.map((rule) => <div key={rule.ruleId} className="mt-3"><p className="text-xs text-muted-foreground">{rule.ruleName} · priority {rule.priority}</p><div className="mt-2 space-y-1">{rule.conditions.map((condition, index) => <p key={`${condition.field}-${index}`} className="flex items-start gap-2 text-xs">{condition.matched ? <Check className="mt-0.5 size-3 shrink-0 text-primary" /> : <X className="mt-0.5 size-3 shrink-0 text-destructive" />}<span><strong>{condition.field}</strong> {condition.operator} {String(condition.expectedValue)} <span className="text-muted-foreground">(actual: {String(condition.actualValue)})</span></span></p>)}</div></div>)}</div>)}</div></details>)}</div></DialogContent></Dialog>;
}

function PolicyExplorer({ policies, categories, policyId, onPolicyChange, detail, loading }: { policies: PolicySummary[]; categories: Array<{ id: string; name: string; cardinality: string; policyCount: number }>; policyId: string; onPolicyChange: (id: string) => void; detail?: PolicySummary & { rules: Array<{ id: string; name: string; priority: number; status: string; conditions: Array<{ field: string; operator: string; value: unknown }> }> }; loading: boolean }) {
  const grouped = useMemo(() => categories.map((category) => ({ category, policies: policies.filter((item) => item.category.id === category.id) })), [categories, policies]);
  return <div className="mt-6 grid min-h-[34rem] gap-6 lg:grid-cols-[22rem_1fr]"><aside className="space-y-3">{grouped.map(({ category, policies: groupPolicies }) => <details key={category.id} className="group rounded-md border border-border bg-card" open><summary className="flex cursor-pointer list-none items-center justify-between p-4"><div><p className="text-sm font-semibold">{category.name}</p><p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">{category.cardinality} · {category.policyCount} policies</p></div><ChevronDown className="size-4 transition group-open:rotate-180" /></summary><div className="border-t border-border p-2">{groupPolicies.map((item) => <button key={item.id} onClick={() => onPolicyChange(item.id)} className={cn("w-full rounded-md p-2.5 text-left text-sm", item.id === policyId ? "bg-primary/10 font-semibold" : "hover:bg-muted")}>{item.name}</button>)}</div></details>)}</aside><div className="rounded-md border border-border bg-card p-6">{loading ? <Loading label="Loading policy rules" /> : detail ? <><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-[10px] uppercase text-primary">{detail.category.name} · v{detail.version}</p><h3 className="mt-2 text-2xl font-semibold">{detail.name}</h3></div><span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase text-primary">{detail.status}</span></div><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{detail.description}</p><div className="mt-8 space-y-3">{detail.rules.map((rule) => <article key={rule.id} className="rounded-md bg-muted p-4"><div className="flex justify-between gap-3"><p className="text-sm font-semibold">{rule.name}</p><span className="font-mono text-[10px]">priority {rule.priority}</span></div><div className="mt-3 flex flex-wrap gap-2">{rule.conditions.map((condition, index) => <span key={`${condition.field}-${index}`} className="rounded-md border border-border bg-card px-2 py-1 font-mono text-[10px]">{condition.field} {condition.operator} {String(condition.value)}</span>)}</div></article>)}</div></> : <Empty label="Choose a policy to inspect its rule set." />}</div></div>;
}

function AuditExplorer({ events, employees, policies, employeeId, policyId, action, onEmployeeChange, onPolicyChange, onActionChange, loading, error }: { events: AuditEvent[]; employees: DemoEmployee[]; policies: PolicySummary[]; employeeId: string; policyId: string; action: string; onEmployeeChange: (value: string) => void; onPolicyChange: (value: string) => void; onActionChange: (value: string) => void; loading: boolean; error: Error | null }) {
  const actions = Array.from(new Set(events.map((event) => event.action)));
  return <div id="audit" className="scroll-mt-24 mt-6"><div className="flex flex-wrap gap-3 rounded-md border border-border bg-card p-4"><FilterSelect value={employeeId} onChange={onEmployeeChange} label="All employees" options={employees.map((item) => [item.id, item.name])} /><FilterSelect value={policyId} onChange={onPolicyChange} label="All policies" options={policies.map((item) => [item.id, item.name])} /><FilterSelect value={action} onChange={onActionChange} label="All actions" options={actions.map((item) => [item, item])} /><Button variant="ghost" onClick={() => { onEmployeeChange(""); onPolicyChange(""); onActionChange(""); }}><SlidersHorizontal /> Clear</Button></div>{loading ? <Loading label="Reading audit events" /> : error ? <FeedbackState variant="inline" title="Unable to load demo data" message={error.message} /> : events.length ? <ol className="mt-8 space-y-0">{events.map((event, index) => <li key={event.id} className="grid grid-cols-[1.5rem_1fr] gap-4"><div className="flex flex-col items-center"><span className="mt-1 size-2.5 rounded-full bg-primary ring-4 ring-primary/10" />{index < events.length - 1 && <span className="h-full w-px bg-border" />}</div><article className="pb-7"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><p className="font-semibold">{event.summary}</p><span className="rounded-full bg-muted px-2 py-1 font-mono text-[9px] uppercase">{event.action}</span></div><p className="mt-2 text-sm text-muted-foreground">{event.actor.displayName} · {formatDate(event.timestamp)}{event.reason ? ` · ${event.reason}` : ""}</p></article></li>)}</ol> : <Empty label="No audit events match these filters." />}</div>;
}

function FilterSelect({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: string[][] }) { return <SelectControl value={value} onChange={(event) => onChange(event.target.value)} className="h-10 max-w-56 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"><option value="">{label}</option>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</SelectControl>; }
function Stat({ label, value, className }: { label: string; value?: number; className?: string }) { return <div className={cn("border-r border-border p-5 last:border-r-0", className)}><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value ?? "—"}</p></div>; }
function Empty({ label }: { label: string }) { return <div className="grid min-h-64 place-items-center rounded-md border border-dashed border-border text-center text-sm text-muted-foreground"><span><DatabaseZap className="mx-auto mb-3 size-5" />{label}</span></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
