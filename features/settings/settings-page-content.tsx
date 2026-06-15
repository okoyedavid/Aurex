import {
  BellRing,
  Building2,
  KeyRound,
  MonitorSmartphone,
  UserRound,
  UsersRound,
} from "lucide-react";

import { BusinessSettingsForm } from "@/features/settings/business-settings-form";
import { PreferencesSettingsPanel } from "@/features/settings/preferences-settings-panel";
import { ProfileSettingsForm } from "@/features/settings/profile-settings-form";
import { SecuritySettingsPanel } from "@/features/settings/security-settings-panel";
import { SessionsSettingsPanel } from "@/features/settings/sessions-settings-panel";
import { TeamAccessPanel } from "@/features/settings/team-access-panel";

const settingsNavigation = [
  { label: "Profile", href: "#profile", icon: UserRound },
  { label: "Business", href: "#business", icon: Building2 },
  { label: "Security", href: "#security", icon: KeyRound },
  { label: "Sessions", href: "#sessions", icon: MonitorSmartphone },
  { label: "Preferences", href: "#preferences", icon: BellRing },
  { label: "Team access", href: "#team", icon: UsersRound },
];

export function SettingsPageContent() {
  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <div>
          <p className="text-sm text-muted-foreground">Workspace administration</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage your personal account, business profile, security controls,
            active sessions, notifications, and team access.
          </p>
        </div>

        <div className="mt-7 grid min-w-0 gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
          <nav
            aria-label="Settings sections"
            className="flex gap-2 overflow-x-auto pb-2 xl:sticky xl:top-24 xl:block xl:self-start xl:overflow-visible xl:pb-0"
          >
            {settingsNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex shrink-0 items-center gap-2 rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground xl:mb-1 xl:w-full xl:border-transparent xl:bg-transparent"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </a>
              );
            })}
          </nav>

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
