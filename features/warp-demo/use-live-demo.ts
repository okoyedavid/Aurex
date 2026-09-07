"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { WarpDemoError, warpDemoApi } from "@/lib/warp-demo/api";
import type { ReconciliationRun, WarpDemoMutation } from "@/lib/warp-demo/types";
import { controlValue, fieldLabel, humanValue } from "./components/demo-presentation";

export function useLiveDemo() {
  const queryClient = useQueryClient();
  const [sessionGeneration, setSessionGeneration] = useState(0);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [runKind, setRunKind] = useState<"initialization" | "mutation" | "reset">("initialization");
  const [selectedField, setSelectedFieldState] = useState<WarpDemoMutation["field"]>("department");
  const [selectedValue, setSelectedValue] = useState("");
  const [previousChange, setPreviousChange] = useState<string | null>(null);
  const [expiredSessionId, setExpiredSessionId] = useState<string | null>(null);
  const processedEvents = useRef(new Set<string>());
  const processedTerminalRuns = useRef(new Set<string>());
  const expiredReadSession = useRef<string | null>(null);

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
      if (!value || ["completed", "completed_with_warnings", "failed"].includes(value.status)) return false;
      return Math.max(250, value.pollAfterMs || 750);
    },
  });
  const terminal = Boolean(run.data && ["completed", "completed_with_warnings", "failed"].includes(run.data.status));
  const initializationComplete = Boolean(activeRunId || (initRunId && run.data?.id === initRunId && terminal && run.data.status !== "failed"));

  const mutation = useMutation({
    mutationFn: (input: WarpDemoMutation) => warpDemoApi.mutate(session.data!.sessionId, input),
    onSuccess: (result) => { setRunKind("mutation"); setActiveRunId(result.runId); },
    onError: renewExpiredSession,
  });
  const reset = useMutation({
    mutationFn: () => warpDemoApi.reset(session.data!.sessionId),
    onSuccess: (result) => { setRunKind("reset"); setActiveRunId(result.runId); },
    onError: renewExpiredSession,
  });

  const categories = useQuery({ queryKey: ["warp-demo", "categories"], queryFn: warpDemoApi.categories, retry: false });
  const policies = useQuery({ queryKey: ["warp-demo", "policies"], queryFn: () => warpDemoApi.policies(), retry: false });
  const [policyId, setPolicyId] = useState("");
  const policy = useQuery({ queryKey: ["warp-demo", "policy", policyId], queryFn: () => warpDemoApi.policy(policyId), enabled: Boolean(policyId), retry: false });
  const sessionId = session.data?.sessionId;
  const employeeQuery = useQuery({ queryKey: ["warp-demo", "session", sessionId, "employee"], queryFn: () => warpDemoApi.sessionEmployee(sessionId!), enabled: Boolean(sessionId), retry: false });
  const resolved = useQuery({ queryKey: ["warp-demo", "session", sessionId, "policies"], queryFn: () => warpDemoApi.sessionEmployeePolicies(sessionId!), enabled: Boolean(sessionId), retry: false });
  const explanation = useQuery({ queryKey: ["warp-demo", "session", sessionId, "explain"], queryFn: () => warpDemoApi.sessionExplainEmployee(sessionId!), enabled: Boolean(sessionId), retry: false });
  const audit = useQuery({ queryKey: ["warp-demo", "session", sessionId, "audit"], queryFn: () => warpDemoApi.sessionAudit(sessionId!), enabled: Boolean(sessionId), retry: false });
  const expiredRead = [employeeQuery.error, resolved.error, explanation.error, audit.error].find((error) => error instanceof WarpDemoError && error.status === 410);

  function renewExpiredSession(error: Error) {
    if (error instanceof WarpDemoError && error.status === 410) setSessionGeneration((value) => value + 1);
  }

  function invalidateFor(resources: ReconciliationRun["changedResources"]) {
    for (const resource of resources) {
      if (resource === "employee") void queryClient.invalidateQueries({ queryKey: ["warp-demo", "session", sessionId, "employee"] });
      if (resource === "assignments") {
        void queryClient.invalidateQueries({ queryKey: ["warp-demo", "session", sessionId, "policies"] });
        void queryClient.invalidateQueries({ queryKey: ["warp-demo", "session", sessionId, "explain"] });
      }
      if (resource === "audit") void queryClient.invalidateQueries({ queryKey: ["warp-demo", "session", sessionId, "audit"] });
    }
  }

  useEffect(() => {
    const current = run.data;
    if (!current) return;
    for (const event of current.events) {
      if (event.status !== "success" || processedEvents.current.has(event.id)) continue;
      processedEvents.current.add(event.id);
      if (event.stage === "employee_update") invalidateFor(["employee"]);
      if (["assignment_reconciliation", "policy_resolution"].includes(event.stage)) invalidateFor(["assignments"]);
      if (event.stage === "audit") invalidateFor(["audit"]);
    }
    if (terminal && !processedTerminalRuns.current.has(current.id)) {
      processedTerminalRuns.current.add(current.id);
      invalidateFor(current.changedResources);
    }
    // The dispatcher uses stable query keys for this active session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.data, terminal, initRunId]);

  useEffect(() => {
    if (!session.data) return;
    const remaining = Date.parse(session.data.expiresAt) - Date.now();
    const timer = window.setTimeout(() => setExpiredSessionId(session.data?.sessionId ?? null), Math.max(0, remaining));
    return () => window.clearTimeout(timer);
  }, [session.data]);

  useEffect(() => {
    if (!(expiredRead instanceof WarpDemoError) || expiredRead.status !== 410 || !sessionId || expiredReadSession.current === sessionId) return;
    expiredReadSession.current = sessionId;
    const timer = window.setTimeout(() => {
      processedEvents.current.clear();
      processedTerminalRuns.current.clear();
      setActiveRunId(null);
      setExpiredSessionId(null);
      setSessionGeneration((value) => value + 1);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [expiredRead, sessionId]);

  const employee = employeeQuery.data ?? session.data?.employee;
  const activeRun = Boolean(runId && (!run.data || !terminal));
  const expired = Boolean(session.data && expiredSessionId === session.data.sessionId);
  const canMutate = Boolean(session.data && employee && initializationComplete && !activeRun && run.data?.status !== "failed" && !expired && selectedValue && selectedValue !== controlValue(employee, selectedField));

  function setSelectedField(value: WarpDemoMutation["field"]) {
    setSelectedFieldState(value);
    setSelectedValue("");
    setPreviousChange(null);
  }

  function apply() {
    if (!canMutate || !selectedValue || !employee) return;
    const current = controlValue(employee, selectedField);
    setPreviousChange(`${fieldLabel(selectedField)}: ${humanValue(current)} → ${humanValue(selectedValue)}`);
    mutation.mutate({ employee: "maya", field: selectedField, value: selectedValue } as WarpDemoMutation);
  }

  function resetDemo() {
    setSelectedFieldState("department");
    setSelectedValue("");
    setPreviousChange(null);
    reset.mutate();
  }

  const busyError = session.error instanceof WarpDemoError && session.error.status === 423;
  return {
    session, run, runKind, initializationComplete, activeRun, employee,
    controls: session.data?.controls, categories, policies, policyId, setPolicyId,
    policy, resolved, explanation, audit, selectedField, selectedValue,
    setSelectedField, setSelectedValue, previousChange, apply, resetDemo,
    canMutate, mutation, reset, expired, busyError,
    foundationalError: session.error && !busyError ? session.error : null,
    retrySession: () => setSessionGeneration((value) => value + 1),
  };
}
