"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Laptop, MonitorSmartphone, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { setApiAccessToken } from "@/lib/api";
import { SessionApiError } from "@/lib/session-api";
import {
  useMySessionsQuery,
  useRevokeOtherSessionsMutation,
  useRevokeSessionMutation,
} from "@/features/settings/session-hooks";
import { SettingsSection } from "@/features/settings/settings-section";
import type { SessionListItem } from "@/types/generic";

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatLocation(session: SessionListItem) {
  const location = [session.city, session.region, session.country].filter(Boolean);
  return location.length > 0 ? location.join(", ") : "Unknown location";
}

function sessionErrorMessage(error: unknown) {
  if (error instanceof SessionApiError) {
    if (error.status === 404) {
      return "Session not found";
    }

    if (error.status === 429) {
      return "Too many attempts. Please wait a moment before trying again.";
    }

    return error.message;
  }

  return "Unable to update sessions. Please try again.";
}

function getDeviceIcon(session: SessionListItem) {
  const device = `${session.deviceName ?? ""} ${session.userAgent ?? ""}`.toLowerCase();

  if (device.includes("iphone") || device.includes("android")) {
    return Smartphone;
  }

  return Laptop;
}

function clearAuthQueries(queryClient: ReturnType<typeof useQueryClient>) {
  setApiAccessToken(undefined);
  queryClient.removeQueries({
    predicate: (query) => {
      const [scope] = query.queryKey;
      return scope === "auth" || scope === "user" || scope === "me";
    },
  });
}

export function SessionsSettingsPanel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionsQuery = useMySessionsQuery();
  const revokeSessionMutation = useRevokeSessionMutation();
  const revokeOtherSessionsMutation = useRevokeOtherSessionsMutation();
  const [confirmingSessionId, setConfirmingSessionId] = React.useState<string | null>(null);
  const [confirmingOtherSessions, setConfirmingOtherSessions] = React.useState(false);

  const sessions = sessionsQuery.data?.sessions ?? sessionsQuery.data?.data ?? [];
  const hasOtherSessions = sessions.some((session) => !session.isCurrentSession && !session.revokedAt);
  const pendingSessionId = revokeSessionMutation.variables;

  React.useEffect(() => {
    const error = sessionsQuery.error;

    if (error instanceof SessionApiError && error.status === 401) {
      clearAuthQueries(queryClient);
      router.push("/login");
    }
  }, [queryClient, router, sessionsQuery.error]);

  function revokeConfirmedSession(session: SessionListItem) {
    revokeSessionMutation.mutate(session.userSessionId, {
      onSuccess: (result) => {
        setConfirmingSessionId(null);
        toast.success(result.message);

        if (result.revokedCurrentSession) {
          clearAuthQueries(queryClient);
          router.push("/dashboard");
        }
      },
      onError: (error) => {
        setConfirmingSessionId(null);

        if (error instanceof SessionApiError && error.status === 401) {
          clearAuthQueries(queryClient);
          router.push("/login");
          return;
        }

        toast.error(sessionErrorMessage(error));
      },
    });
  }

  function revokeConfirmedOtherSessions() {
    revokeOtherSessionsMutation.mutate(undefined, {
      onSuccess: (result) => {
        setConfirmingOtherSessions(false);
        toast.success(`${result.message}. ${result.revokedCount} revoked.`);
      },
      onError: (error) => {
        setConfirmingOtherSessions(false);

        if (error instanceof SessionApiError && error.status === 401) {
          clearAuthQueries(queryClient);
          router.push("/login");
          return;
        }

        toast.error(sessionErrorMessage(error));
      },
    });
  }

  return (
    <SettingsSection
      id="sessions"
      title="Active sessions"
      description="Review devices with access to your account and revoke unfamiliar sessions."
      icon={MonitorSmartphone}
    >
      {sessionsQuery.isLoading ? (
        <div className="space-y-3 border-y border-border py-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      ) : sessionsQuery.isError ? (
        <div className="border-y border-border py-6">
          <p className="text-sm font-semibold text-foreground">
            Unable to load sessions
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {sessionErrorMessage(sessionsQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 h-9 rounded-md"
            onClick={() => sessionsQuery.refetch()}
          >
            Try again
          </Button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="border-y border-border py-6">
          <p className="text-sm font-semibold text-foreground">
            No active sessions
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            New sign-ins will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session);
            const isConfirming = confirmingSessionId === session.userSessionId;
            const isRevoking =
              revokeSessionMutation.isPending &&
              pendingSessionId === session.userSessionId;

            return (
              <article
                key={session.userSessionId}
                className="flex flex-col gap-4 py-5 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <DeviceIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {session.deviceName || "Unknown device"}
                      </p>
                      {session.isCurrentSession ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Current session
                        </span>
                      ) : null}
                      {session.revokedAt ? (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                          Revoked
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatLocation(session)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      IP {session.ipAddress ?? "Unknown"} - Last seen {formatDate(session.lastSeenAt)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Created {formatDate(session.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 lg:w-[280px] lg:items-end">
                  {isConfirming ? (
                    <div className="rounded-md border border-border bg-background p-3 text-sm">
                      <p className="leading-5 text-foreground">
                        {session.isCurrentSession
                          ? "This is your current session. Revoking it will log you out on this device."
                          : "This will sign out your account on this device."}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          className="h-9 rounded-md"
                          disabled={isRevoking}
                          onClick={() => revokeConfirmedSession(session)}
                        >
                          {isRevoking ? "Revoking..." : "Confirm revoke"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 rounded-md"
                          disabled={isRevoking}
                          onClick={() => setConfirmingSessionId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 self-start rounded-md lg:self-auto"
                      disabled={
                        Boolean(session.revokedAt) ||
                        revokeSessionMutation.isPending ||
                        revokeOtherSessionsMutation.isPending
                      }
                      onClick={() => setConfirmingSessionId(session.userSessionId)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted-foreground">
          Revoking a session requires that device to sign in again.
        </p>
        {confirmingOtherSessions ? (
          <div className="rounded-md border border-border bg-background p-3 text-sm">
            <p className="text-foreground">
              This will sign out your account on every other device.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md"
                disabled={revokeOtherSessionsMutation.isPending}
                onClick={revokeConfirmedOtherSessions}
              >
                {revokeOtherSessionsMutation.isPending
                  ? "Revoking..."
                  : "Sign out other devices"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-9 rounded-md"
                disabled={revokeOtherSessionsMutation.isPending}
                onClick={() => setConfirmingOtherSessions(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setConfirmingOtherSessions(true)}
            disabled={
              !hasOtherSessions ||
              sessionsQuery.isLoading ||
              revokeSessionMutation.isPending ||
              revokeOtherSessionsMutation.isPending
            }
            className="h-10 rounded-md"
          >
            Sign out other devices
          </Button>
        )}
      </div>
    </SettingsSection>
  );
}
