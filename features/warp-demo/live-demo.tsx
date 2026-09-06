"use client";

import { SelectControl } from "@/components/ui/select";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
import { WarpDemoError, warpDemoApi } from "@/lib/warp-demo/api";
import type { AuditEvent, DemoEmployee, EmployeeExplanation, PolicySummary, ReconciliationRun, ResolvedPolicy, WarpDemoControls, WarpDemoMutation } from "@/lib/warp-demo/types";
import { cn } from "@/lib/utils";

export function LiveDemo() {
  const queryClient = useQueryClient();
  const [sessionGeneration, setSessionGeneration] = useState(0);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [runKind, setRunKind] = useState<"initialization" | "mutation" | "reset">("initialization");
  const [selectedField, setSelectedField] = useState<WarpDemoMutation["field"]>("department");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [previousChange, setPreviousChange] = useState<string | null>(null);
  const requiresReset = false;
  const [expiredSessionId, setExpiredSessionId] = useState<string | null>(null);
  const processedEvents = useRef(new Set<string>());
  const processedTerminalRuns = useRef(new Set<string>());
  const session = useQuery({ queryKey: ["warp-demo", "session", sessionGeneration], queryFn: warpDemoApi.createSession, retry: false, staleTime: Infinity });
  const initRunId = session.data?.initialization.runId;
  const runId = activeRunId ?? initRunId ?? null;
  const run = useQuery({
    queryKey: ["warp-demo", "reconciliation", session.data?.sessionId, runId],
    queryFn: () => warpDemoApi.reconciliationRun(session.data!.sessionId, runId!),
    enabled: Boolean(session.data?.sessionId && runId),
    retry: false,
    refetchInterval: (query) => {
      const value = query.state.data;
      if (!value || value.status === "completed" || value.status === "completed_with_warnings" || value.status === "failed") return false;
      return Math.max(250, value.pollAfterMs || 750);
    },
  });
  const terminal = run.data?.status === "completed" || run.data?.status === "completed_with_warnings" || run.data?.status === "failed";
  const initializationComplete = Boolean(activeRunId || (initRunId && run.data?.id === initRunId && terminal && run.data.status !== "failed"));
  const expired = Boolean(session.data && expiredSessionId === session.data.sessionId);
  const mutation = useMutation({
    mutationFn: (input: WarpDemoMutation) => warpDemoApi.mutate(session.data!.sessionId, input),
    onSuccess: (result) => { setRunKind("mutation"); setActiveRunId(result.runId); },
    onError: (error) => { if (error instanceof WarpDemoError && error.status === 410) setSessionGeneration((value) => value + 1); },
  });
  const reset = useMutation({
    mutationFn: () => warpDemoApi.reset(session.data!.sessionId),
    onSuccess: (result) => { setRunKind("reset"); setActiveRunId(result.runId); },
    onError: (error) => { if (error instanceof WarpDemoError && error.status === 410) setSessionGeneration((value) => value + 1); },
  });
  const employees = useQuery({ queryKey: ["warp-demo", "employees"], queryFn: warpDemoApi.employees, retry: false });
  const categories = useQuery({ queryKey: ["warp-demo", "categories"], queryFn: warpDemoApi.categories, retry: false });
  const policies = useQuery({ queryKey: ["warp-demo", "policies"], queryFn: () => warpDemoApi.policies(), retry: false });
  const [policyId, setPolicyId] = useState("");
  const policy = useQuery({ queryKey: ["warp-demo", "policy", policyId], queryFn: () => warpDemoApi.policy(policyId), enabled: Boolean(policyId), retry: false });
  const mayaId = session.data?.employee.id ?? employees.data?.employees.find((employee) => employee.name.toLowerCase().includes("maya"))?.id ?? "";
  const resolved = useQuery({ queryKey: ["warp-demo", "resolved", mayaId], queryFn: () => warpDemoApi.employeePolicies(mayaId), enabled: Boolean(mayaId), retry: false });
  const explanation = useQuery({ queryKey: ["warp-demo", "explain", mayaId], queryFn: () => warpDemoApi.explainEmployee(mayaId), enabled: Boolean(mayaId), retry: false });
  const audit = useQuery({ queryKey: ["warp-demo", "audit"], queryFn: () => warpDemoApi.audit(), retry: false });

  const invalidateFor = (resources: ReconciliationRun["changedResources"]) => {
    for (const resource of resources) {
      if (resource === "employee") { void queryClient.invalidateQueries({ queryKey: ["warp-demo", "employees"] }); void queryClient.invalidateQueries({ queryKey: ["warp-demo", "employee"] }); }
      if (resource === "assignments") { void queryClient.invalidateQueries({ queryKey: ["warp-demo", "resolved"] }); void queryClient.invalidateQueries({ queryKey: ["warp-demo", "explain"] }); }
      if (resource === "externalAccess") void queryClient.invalidateQueries({ queryKey: ["warp-demo", "external-access"] });
      if (resource === "audit") void queryClient.invalidateQueries({ queryKey: ["warp-demo", "audit"] });
    }
  };
  useEffect(() => {
    const current = run.data;
    if (!current) return;
    for (const event of current.events) {
      if (event.status === "success" && !processedEvents.current.has(event.id)) {
        processedEvents.current.add(event.id);
        if (event.stage === "employee_update") invalidateFor(["employee"]);
        if (event.stage === "assignment_reconciliation" || event.stage === "policy_resolution") invalidateFor(["assignments"]);
        if (event.stage === "external_access") invalidateFor(["externalAccess"]);
        if (event.stage === "audit") invalidateFor(["audit"]);
      }
    }
    if (terminal) {
      if (!processedTerminalRuns.current.has(current.id)) {
        processedTerminalRuns.current.add(current.id);
        invalidateFor(current.changedResources);
      }
    }
  // Invalidation is a local dispatcher whose identity is intentionally stable for this effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.data, terminal, initRunId]);
  useEffect(() => {
    if (!session.data) return;
    const remaining = Date.parse(session.data.expiresAt) - Date.now();
    const timer = window.setTimeout(() => setExpiredSessionId(session.data?.sessionId ?? null), Math.max(0, remaining));
    return () => window.clearTimeout(timer);
  }, [session.data]);
  const employee = employees.data?.employees.find((item) => item.id === mayaId) ?? session.data?.employee;
  const controls = session.data?.controls;
  const activeRun = Boolean(runId && (!run.data || !terminal));
  const canMutate = Boolean(session.data && employee && initializationComplete && !activeRun && !requiresReset && run.data?.status !== "failed" && !expired && selectedValue && selectedValue !== controlValue(employee, selectedField));
  const apply = () => {
    if (!canMutate || !selectedValue) return;
    const current = controlValue(employee!, selectedField);
    setPreviousChange(`${labelFor(selectedField)}: ${humanValue(current)} → ${humanValue(selectedValue)}`);
    mutation.mutate({ employee: "maya", field: selectedField, value: selectedValue } as WarpDemoMutation);
  };
  const busyError = session.error instanceof WarpDemoError && session.error.status === 423;
  const foundationalError = session.error && !busyError ? session.error : null;
  const retry = () => { setSessionGeneration((value) => value + 1); };

  return (
    <section id="demo" className="scroll-mt-20 border-y border-primary/25 bg-primary/10 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div><p className="font-mono text-xs uppercase tracking-[.2em] text-primary">04 · Live reconciliation</p><h2 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Change the organization. Watch policy follow.</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Modify one constrained employee attribute and watch the same resolver, reconciliation pipeline, assignment store and audit trail converge.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-4 py-2 font-mono text-xs"><CircleDot className={cn("size-3", activeRun ? "animate-pulse text-primary" : "text-primary")} />Live · controlled sandbox</div>
        </div>
        {foundationalError ? <FeedbackState title={busyError ? "Live demo currently in use" : "Unable to prepare the live demo."} message={busyError ? "Another visitor is changing the demo scenario. Try again shortly." : foundationalError.message} retry={retry} /> : (
          <div data-reveal className="mt-12 overflow-hidden rounded-md border border-border bg-card shadow-2xl shadow-primary/10">
            <div className="grid gap-6 p-4 sm:p-7 lg:grid-cols-[minmax(18rem,.8fr)_minmax(0,1.2fr)]">
              <EmployeePanel employee={employee} controls={controls} selectedField={selectedField} selectedValue={selectedValue} setSelectedField={(value) => { setSelectedField(value); setSelectedValue(""); }} setSelectedValue={setSelectedValue} onApply={apply} onReset={() => reset.mutate()} canApply={canMutate && !mutation.isPending} disabled={!initializationComplete || activeRun || reset.isPending || mutation.isPending || expired} previousChange={previousChange} error={mutation.error ?? reset.error} />
              <ReconciliationTimeline run={run.data} preparing={!initializationComplete && !run.data?.status?.includes("failed")} runKind={runKind} onReset={() => reset.mutate()} canReset={Boolean(session.data && (requiresReset || run.data?.status === "failed")) && !activeRun && !reset.isPending} />
            </div>
            {employee && initializationComplete ? <div className="border-t border-border p-4 sm:p-7"><Tabs defaultValue="assignments"><TabsList><TabsTrigger value="assignments">Current assignments</TabsTrigger><TabsTrigger value="explanation">Why this applies</TabsTrigger><TabsTrigger value="audit">Audit evidence</TabsTrigger><TabsTrigger value="policies">Policy explorer</TabsTrigger></TabsList><TabsContent value="assignments"><EmployeeExplorer employees={[employee]} employeeId={employee.id ?? ""} onEmployeeChange={() => undefined} resolved={resolved.data?.policies} explanation={undefined} loading={resolved.isPending} error={resolved.error} /></TabsContent><TabsContent value="explanation">{explanation.data ? <ExplanationDialog explanation={explanation.data} /> : <Loading label="Loading explanation" />}</TabsContent><TabsContent value="audit"><AuditExplorer events={audit.data?.events ?? []} employees={[employee]} policies={policies.data?.policies ?? []} employeeId={employee.id ?? ""} policyId="" action="" onEmployeeChange={() => undefined} onPolicyChange={() => undefined} onActionChange={() => undefined} loading={audit.isPending} error={audit.error} /></TabsContent><TabsContent value="policies"><PolicyExplorer policies={policies.data?.policies ?? []} categories={categories.data?.categories ?? []} policyId={policyId} onPolicyChange={setPolicyId} detail={policy.data} loading={policy.isPending && Boolean(policyId)} /></TabsContent></Tabs></div> : null}
          </div>
        )}
      </div>
    </section>
  );
}

function EmployeePanel({ employee, controls, selectedField, selectedValue, setSelectedField, setSelectedValue, onApply, onReset, canApply, disabled, previousChange, error }: { employee?: DemoEmployee; controls?: WarpDemoControls; selectedField: WarpDemoMutation["field"]; selectedValue: string; setSelectedField: (value: WarpDemoMutation["field"]) => void; setSelectedValue: (value: string) => void; onApply: () => void; onReset: () => void; canApply: boolean; disabled: boolean; previousChange: string | null; error: Error | null }) {
  if (!employee) return <Loading label="Preparing live demo" />;
  const fields = (Object.keys(controls ?? {}) as WarpDemoMutation["field"][]).filter((field) => (controls?.[field] ?? []).length);
  return <div className="space-y-6"><div><p className="font-mono text-[10px] uppercase tracking-wider text-primary">Employee snapshot</p><h3 className="mt-2 text-2xl font-semibold">{employee.name}</h3><p className="mt-1 text-sm text-muted-foreground">{employee.jobTitle ?? "Employee"}</p></div><dl className="grid grid-cols-2 gap-4 text-sm"><Fact label="Department" value={employee.department} /><Fact label="Employee type" value={employee.employeeType ?? "Unassigned"} /><Fact label="State" value={employee.state ?? "Unassigned"} /><Fact label="Tenure" value={`${employee.tenureMonths} months`} /><Fact label="Groups" value={employee.groups.length ? employee.groups.join(", ") : "None"} /></dl><div className="border-t border-border pt-5"><p className="text-sm font-semibold">Try a change</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium">Attribute<SelectControl value={selectedField} disabled={disabled} onChange={(event) => setSelectedField(event.target.value as WarpDemoMutation["field"])}>{fields.map((field) => <option key={field} value={field}>{labelFor(field)}</option>)}</SelectControl></label><label className="text-xs font-medium">New value<SelectControl value={selectedValue} disabled={disabled} onChange={(event) => setSelectedValue(event.target.value)}><option value="">Choose a value</option>{(controls?.[selectedField] ?? []).map((value) => <option key={value} value={value}>{humanValue(value)}</option>)}</SelectControl></label></div>{previousChange ? <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs">{previousChange}{disabled ? " · Applying…" : ""}</p> : null}<div className="mt-4 flex flex-wrap gap-3"><Button onClick={onApply} disabled={!canApply}>Apply change</Button><Button variant="outline" onClick={onReset} disabled={disabled}>Reset demo <RotateCcw /></Button></div>{error ? <p className="text-sm text-destructive">{error.message}</p> : null}{disabled && !previousChange ? <p className="text-xs text-muted-foreground">Preparing the live demo before controls become available.</p> : null}</div></div>;
}

function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>; }
function controlValue(employee: DemoEmployee, field: WarpDemoMutation["field"]) { if (field === "department") return employee.department.toLowerCase() === "engineering" ? "engineering" : "finance"; if (field === "employeeType") return employee.employeeType?.toLowerCase().replace(" ", "_") ?? ""; if (field === "state") return employee.state?.toLowerCase().replace(" ", "_") ?? ""; return employee.groups.some((group) => group.toLowerCase() === "remote") ? "member" : "not_member"; }
function labelFor(value: string) { return value === "employeeType" ? "Employee type" : value === "remoteGroup" ? "Remote group membership" : value[0].toUpperCase() + value.slice(1); }
function humanValue(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()).replace("Full Time", "Full-time").replace("Not Member", "Not a member"); }

function ReconciliationTimeline({ run, preparing, runKind, onReset, canReset }: { run?: ReconciliationRun; preparing: boolean; runKind: string; onReset: () => void; canReset: boolean }) {
  const title = preparing ? "Preparing live demo" : run?.status === "queued" ? "Reconciliation queued" : run?.status === "running" ? "Reconciling" : run?.status === "completed_with_warnings" ? "Completed with warnings" : run?.status === "failed" ? "Failed" : "Completed";
  return <div><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-wider text-primary">{runKind === "initialization" ? "Initialization" : "Live reconciliation"}</p><h3 className="mt-2 text-xl font-semibold">{title}</h3></div>{run?.durationMs != null ? <span className="text-xs text-muted-foreground">Completed in {run.durationMs} ms</span> : null}</div><p aria-live="polite" className="sr-only">{title}</p>{run ? <ol className="mt-6 space-y-0">{run.events.map((event, index) => <li key={event.id} className="grid grid-cols-[1.5rem_1fr] gap-3"><div className="flex flex-col items-center"><span className={cn("mt-1 grid size-3 place-items-center rounded-full ring-4", event.status === "success" ? "bg-primary ring-primary/10" : event.status === "failed" ? "bg-destructive ring-destructive/10" : "bg-muted-foreground ring-muted/40")}>{event.status === "success" ? <Check className="size-2 text-primary-foreground" /> : null}</span>{index < run.events.length - 1 ? <span className="h-full w-px bg-border" /> : null}</div><div className="pb-6"><p className="font-medium">{event.title}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{event.description}</p></div></li>)}</ol> : <Loading label="Preparing live demo" />}{canReset ? <Button variant="outline" onClick={onReset} className="mt-3">Reset demo <RotateCcw /></Button> : null}</div>;
}

/* Legacy implementation retained temporarily for reference while the live
 * reconciliation surface above uses the mutable session contract.
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
            <h2 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Change the organization. Watch policy follow.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">This surface reads from Aurex’s public demo contract. Choose an employee, inspect effective policies, and open the evidence behind the result.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-4 py-2 font-mono text-xs text-foreground">
            <CircleDot className={cn("size-3", foundationalError ? "text-destructive" : "text-primary")} />
            {foundationalError ? "API unavailable" : overview.isPending ? "Connecting…" : "Live · controlled sandbox"}
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

*/
function EmployeeExplorer({ employees, employeeId, onEmployeeChange, resolved, explanation, loading, error }: { employees: DemoEmployee[]; employeeId: string; onEmployeeChange: (id: string) => void; resolved?: ResolvedPolicy[]; explanation?: EmployeeExplanation; loading: boolean; error: Error | null }) {
  const [search, setSearch] = useState("");
  const visible = employees.filter((employee) => `${employee.name} ${employee.department} ${employee.jobTitle}`.toLowerCase().includes(search.toLowerCase()));
  const selected = employees.find((employee) => employee.id === employeeId);
  return (
    <div className="mt-6 grid min-h-[34rem] gap-6 lg:grid-cols-[20rem_1fr]">
      <aside className="rounded-md border border-border bg-card p-4">
        <label className="relative block"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find an employee" className="pl-9" /></label>
        <div className="mt-4 max-h-[28rem] space-y-1 overflow-y-auto pr-1">
          {visible.map((employee) => <button key={employee.id ?? employee.name} onClick={() => onEmployeeChange(employee.id ?? "")} className={cn("w-full rounded-md p-3 text-left transition", employee.id === employeeId ? "bg-primary/10" : "hover:bg-muted")}><span className="block text-sm font-semibold">{employee.name}</span><span className="mt-1 block text-xs text-muted-foreground">{employee.jobTitle} · {employee.department}</span></button>)}
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
  return <div id="audit" className="scroll-mt-24 mt-6"><div className="flex flex-wrap gap-3 rounded-md border border-border bg-card p-4"><FilterSelect value={employeeId} onChange={onEmployeeChange} label="All employees" options={employees.flatMap((item) => item.id ? [[item.id, item.name]] : [])} /><FilterSelect value={policyId} onChange={onPolicyChange} label="All policies" options={policies.map((item) => [item.id, item.name])} /><FilterSelect value={action} onChange={onActionChange} label="All actions" options={actions.map((item) => [item, item])} /><Button variant="ghost" onClick={() => { onEmployeeChange(""); onPolicyChange(""); onActionChange(""); }}><SlidersHorizontal /> Clear</Button></div>{loading ? <Loading label="Reading audit events" /> : error ? <FeedbackState variant="inline" title="Unable to load demo data" message={error.message} /> : events.length ? <ol className="mt-8 space-y-0">{events.map((event, index) => <li key={event.id} className="grid grid-cols-[1.5rem_1fr] gap-4"><div className="flex flex-col items-center"><span className="mt-1 size-2.5 rounded-full bg-primary ring-4 ring-primary/10" />{index < events.length - 1 && <span className="h-full w-px bg-border" />}</div><article className="pb-7"><div className="flex flex-wrap items-center gap-x-3 gap-y-1"><p className="font-semibold">{event.summary}</p><span className="rounded-full bg-muted px-2 py-1 font-mono text-[9px] uppercase">{event.action}</span></div><p className="mt-2 text-sm text-muted-foreground">{event.actor.displayName} · {formatDate(event.timestamp)}{event.reason ? ` · ${event.reason}` : ""}</p></article></li>)}</ol> : <Empty label="No audit events match these filters." />}</div>;
}

function FilterSelect({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: string[][] }) { return <SelectControl value={value} onChange={(event) => onChange(event.target.value)} className="h-10 max-w-56 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"><option value="">{label}</option>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</SelectControl>; }
function Empty({ label }: { label: string }) { return <div className="grid min-h-64 place-items-center rounded-md border border-dashed border-border text-center text-sm text-muted-foreground"><span><DatabaseZap className="mx-auto mb-3 size-5" />{label}</span></div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
