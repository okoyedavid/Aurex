"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";

import {
  accountErrorMessage,
} from "@/features/account/account-errors";
import { useUpdatePreferencesMutation } from "@/features/account/account-hooks";
import { useMeQuery } from "@/features/auth/use-me-query";
import { SettingsSection } from "@/features/settings/settings-section";
import { SettingsToggle } from "@/features/settings/settings-toggle";
import {
  applyTheme,
  getStoredTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/lib/theme";

export function PreferencesSettingsPanel() {
  const userQuery = useMeQuery();
  const updatePreferencesMutation = useUpdatePreferencesMutation();
  const [theme, setTheme] = useState<ThemePreference>(() => getStoredTheme());
  const twoFactorEnabled = updatePreferencesMutation.isPending
    ? Boolean(updatePreferencesMutation.variables?.preferences.twoFactorEnabled)
    : Boolean(userQuery.data?.preferences?.twoFactorEnabled);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);

    if (theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => applyTheme("system");

    media.addEventListener("change", handleSystemThemeChange);

    return () => media.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  return (
    <SettingsSection
      id="preferences"
      title="Preferences"
      description="Choose how Aurex displays account data and handles sign-in security."
      icon={BellRing}
    >
      <div className="divide-y divide-border border-y border-border">
        <SettingsToggle
          label="OTP sign-in on login"
          description="Require an OTP challenge when signing in with your password."
          checked={twoFactorEnabled}
          disabled={userQuery.isLoading || updatePreferencesMutation.isPending}
          onCheckedChange={(checked) => {
            updatePreferencesMutation.mutate(
              {
                preferences: {
                  twoFactorEnabled: checked,
                },
              },
              {
                onSuccess: (result) => toast.success(result.message),
                onError: (error) => {
                  toast.error(
                    accountErrorMessage(
                      error,
                      "Unable to update preferences. Please try again.",
                    ),
                  );
                },
              },
            );
          }}
        />
      </div>

      <div className="mt-7 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
        {(["system", "light", "dark"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={theme === option}
            onClick={() => setTheme(option)}
            className={[
              "rounded-md border px-4 py-3 text-left text-sm font-semibold transition",
              theme === option
                ? "border-primary/20 bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted",
            ].join(" ")}
          >
            <span className="block capitalize">{option}</span>
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              {option === "system"
                ? "Follow your device setting"
                : option === "dark"
                  ? "Use dark mode"
                  : "Use light mode"}
            </span>
          </button>
        ))}
      </div>
    </SettingsSection>
  );
}
