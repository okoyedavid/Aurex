"use client";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BusinessApiError } from "@/lib/business-api";
import { permissionLabels } from "@/features/business/member-role-options";
import type { Permission } from "@/types/generic";
import { formatDate } from "@/features/dashboard/format";

export const formatDateTime = (value?: string | null) =>
  value ? formatDate(value) : "—";
export const errorStatus = (error: unknown) =>
  error instanceof BusinessApiError ? error.status : undefined;
export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const status = errorStatus(error);
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
        <div>
          <p className="font-semibold">
            {status === 403
              ? "Access denied"
              : status === 404
                ? "Not found"
                : "Unable to load this content"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
          {onRetry ? (
            <Button className="mt-3" variant="outline" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
export function LoadingState() {
  return (
    <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
      <LoaderCircle className="h-4 w-4 animate-spin" />
      Loading…
    </div>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const styles = {
    neutral: "bg-muted text-muted-foreground",
    good: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    warn: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    bad: "bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`inline-flex rounded-full max-h-6 px-2 py-0.5 text-xs font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
export function PermissionList({
  permissions,
  denied = [],
}: {
  permissions: Permission[];
  denied?: Permission[];
}) {
  const deniedSet = new Set(denied);
  const effective = permissions.filter((p) => !deniedSet.has(p));
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Effective access
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {effective.length ? (
            effective.map((p) => <li key={p}>• {permissionLabels[p]}</li>)
          ) : (
            <li className="text-muted-foreground">No effective permissions</li>
          )}
        </ul>
      </div>
      {denied.length ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Explicit denials
          </p>
          <ul className="mt-2 space-y-1 text-sm text-destructive">
            {denied.map((p) => (
              <li key={p}>• {permissionLabels[p]}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
