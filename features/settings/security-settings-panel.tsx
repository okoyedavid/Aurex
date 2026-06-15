"use client";

import { useState } from "react";
import { KeyRound, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/features/settings/hooks";
import { SettingsSection } from "@/features/settings/settings-section";
import { SettingsToggle } from "@/features/settings/settings-toggle";

export function SecuritySettingsPanel() {
  const { data } = useSettings();
  const [security, setSecurity] = useState(data.security);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  return (
    <SettingsSection
      id="security"
      title="Security settings"
      description="Strengthen account access and control security notifications."
      icon={KeyRound}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          // TODO(auth): Call the migrated password-change endpoint.
        }}
      >
        <h3 className="text-sm font-bold text-foreground">Change password</h3>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-medium text-foreground sm:col-span-2">
            Current password
            <Input type="password" autoComplete="current-password" value={passwords.currentPassword} onChange={(e) => setPasswords((current) => ({ ...current, currentPassword: e.target.value }))} className="mt-2 h-11 rounded-md bg-background" />
          </label>
          <label className="text-sm font-medium text-foreground">
            New password
            <Input type="password" autoComplete="new-password" value={passwords.newPassword} onChange={(e) => setPasswords((current) => ({ ...current, newPassword: e.target.value }))} className="mt-2 h-11 rounded-md bg-background" />
          </label>
          <label className="text-sm font-medium text-foreground">
            Confirm password
            <Input type="password" autoComplete="new-password" value={passwords.confirmPassword} onChange={(e) => setPasswords((current) => ({ ...current, confirmPassword: e.target.value }))} className="mt-2 h-11 rounded-md bg-background" />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit" className="h-10 rounded-md px-5">Update password</Button>
        </div>
      </form>

      <div className="mt-7 divide-y divide-border border-t border-border pt-2">
        <SettingsToggle
          label="Two-factor authentication"
          description="Require an email OTP after password verification."
          checked={security.twoFactorEnabled}
          onCheckedChange={(checked) => {
            setSecurity((current) => ({ ...current, twoFactorEnabled: checked }));
            // TODO(auth): Enroll or disable the migrated MFA/OTP method.
          }}
        />
        <SettingsToggle
          label="Suspicious login alerts"
          description="Receive an alert when a sign-in appears unusual."
          checked={security.suspiciousLoginAlerts}
          onCheckedChange={(checked) => {
            setSecurity((current) => ({ ...current, suspiciousLoginAlerts: checked }));
            // TODO(api): Persist security alert preferences.
          }}
        />
      </div>

      <div className="mt-5 flex gap-3 bg-secondary p-4 text-secondary-foreground">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-bold">Sensitive account</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Changes to passwords, security methods, and recovery information
            should require recent authentication once your auth backend is connected.
          </p>
        </div>
      </div>
    </SettingsSection>
  );
}
