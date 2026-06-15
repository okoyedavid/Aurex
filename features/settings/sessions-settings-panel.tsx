"use client";

import { useState } from "react";
import { Laptop, MonitorSmartphone, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUserSessions } from "@/features/settings/hooks";
import { SettingsSection } from "@/features/settings/settings-section";

export function SessionsSettingsPanel() {
  const { data: initialSessions } = useUserSessions();
  const [sessions, setSessions] = useState(initialSessions);

  function revokeSession(sessionId: string) {
    setSessions((current) => current.filter((session) => session.id !== sessionId));
    // TODO(auth): Call the migrated session revocation endpoint.
  }

  function revokeOtherSessions() {
    setSessions((current) => current.filter((session) => session.isCurrent));
    // TODO(auth): Revoke all sessions except the current session server-side.
  }

  return (
    <SettingsSection
      id="sessions"
      title="Active sessions"
      description="Review devices with access to your account and revoke unfamiliar sessions."
      icon={MonitorSmartphone}
    >
      <div className="divide-y divide-border border-y border-border">
        {sessions.map((session) => {
          const DeviceIcon = session.deviceName.includes("iPhone") ? Smartphone : Laptop;
          return (
            <article key={session.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <DeviceIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{session.deviceName}</p>
                    {session.isCurrent && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Current session</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{session.browser} · {session.location}</p>
                  <p className="mt-1 text-xs text-muted-foreground">IP {session.ipAddress} · {session.lastActiveAt}</p>
                </div>
              </div>
              {!session.isCurrent && (
                <Button type="button" variant="outline" onClick={() => revokeSession(session.id)} className="h-9 self-start rounded-md sm:self-auto">
                  Revoke
                </Button>
              )}
            </article>
          );
        })}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted-foreground">
          Revoking a session requires that device to sign in again.
        </p>
        <Button type="button" variant="destructive" onClick={revokeOtherSessions} disabled={!sessions.some((session) => !session.isCurrent)} className="h-10 rounded-md">
          Revoke all other sessions
        </Button>
      </div>
    </SettingsSection>
  );
}
