import { BusinessSettingsForm } from "@/features/settings/business-settings-form";
import { PreferencesSettingsPanel } from "@/features/settings/preferences-settings-panel";
import { ProfileSettingsForm } from "@/features/settings/profile-settings-form";
import { SecuritySettingsPanel } from "@/features/settings/security-settings-panel";
import { SessionsSettingsPanel } from "@/features/settings/sessions-settings-panel";
import { TeamAccessPanel } from "@/features/settings/team-access-panel";
import SettingsNavigation from "./settings-navigation";

export function SettingsPageContent() {
  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <div>
          <p className="text-sm text-muted-foreground">
            Workspace administration
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage your personal account, business profile, security controls,
            active sessions, notifications, and team access.
          </p>
        </div>

        <div className="mt-7 grid min-w-0 gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <SettingsNavigation />

          <div className="min-w-0 space-y-6">
            <ProfileSettingsForm />
            <BusinessSettingsForm />
            <SecuritySettingsPanel />
            <SessionsSettingsPanel />
            <PreferencesSettingsPanel />
            <TeamAccessPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
