"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSettings } from "@/features/settings/hooks";
import { SettingsSection } from "@/features/settings/settings-section";
import { SettingsToggle } from "@/features/settings/settings-toggle";
import type { NotificationPreferences } from "@/features/settings/types";

const notificationOptions: Array<{
  key: keyof Pick<NotificationPreferences, "paymentAlerts" | "invoiceReminders" | "providerSpendAlerts" | "securityAlerts" | "weeklySpendSummary" | "aiInsightReports">;
  label: string;
  description: string;
}> = [
  { key: "paymentAlerts", label: "Payment alerts", description: "Updates for incoming, failed, or reversed payments." },
  { key: "invoiceReminders", label: "Invoice reminders", description: "Notifications before and after invoice due dates." },
  { key: "providerSpendAlerts", label: "Provider spend alerts", description: "Warnings when provider spend moves outside normal patterns." },
  { key: "securityAlerts", label: "Security alerts", description: "Important sign-in, access, and account security notices." },
  { key: "weeklySpendSummary", label: "Weekly spend summary", description: "A weekly overview of business spending and cash movement." },
  { key: "aiInsightReports", label: "AI insight reports", description: "Periodic AI-generated observations about spend and cash flow." },
];

export function PreferencesSettingsPanel() {
  const { data } = useSettings();
  const [preferences, setPreferences] = useState(data.notifications);

  function updatePreference<Key extends keyof NotificationPreferences>(key: Key, value: NotificationPreferences[Key]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  return (
    <SettingsSection
      id="preferences"
      title="Notifications and preferences"
      description="Choose which operational updates you receive and how Aurex displays account data."
      icon={BellRing}
    >
      <div className="divide-y divide-border">
        {notificationOptions.map((option) => (
          <SettingsToggle
            key={option.key}
            label={option.label}
            description={option.description}
            checked={preferences[option.key]}
            onCheckedChange={(checked) => updatePreference(option.key, checked)}
          />
        ))}
      </div>

      <div className="mt-7 grid gap-5 border-t border-border pt-6 sm:grid-cols-3">
        <label className="text-sm font-medium text-foreground">
          Theme preference
          <select value={preferences.theme} onChange={(e) => updatePreference("theme", e.target.value as NotificationPreferences["theme"])} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="text-sm font-medium text-foreground">
          Timezone
          <select value={preferences.timezone} onChange={(e) => updatePreference("timezone", e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="Africa/Lagos">Africa/Lagos</option>
            <option value="Europe/London">Europe/London</option>
            <option value="America/New_York">America/New_York</option>
          </select>
        </label>
        <label className="text-sm font-medium text-foreground">
          Default currency
          <select value={preferences.defaultCurrency} onChange={(e) => updatePreference("defaultCurrency", e.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
            <option value="NGN">NGN</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="button" onClick={() => { /* TODO(api): Persist preferences. */ }} className="h-10 rounded-md px-5">Save preferences</Button>
      </div>
    </SettingsSection>
  );
}
