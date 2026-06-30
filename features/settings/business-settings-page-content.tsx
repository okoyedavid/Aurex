"use client";

import { useBusinessAccess } from "@/features/business/business-access-context";
import { BusinessSettingsForm } from "./business-settings-form";
import SettingsNavigation from "./settings-navigation";
import { TeamAccessPanel } from "./team-access-panel";
import { BusinessSettingsPageFrame } from "./business-settings-page-frame";

export function BusinessSettingsPageContent() {
  const { business } = useBusinessAccess();

  return (
    <BusinessSettingsPageFrame>
      <p className="text-sm text-muted-foreground">{business.name}</p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight">
        Business settings
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Manage this business&apos;s profile and team access.
      </p>

      <div className="mt-7 grid min-w-0 gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
        <SettingsNavigation scope="business" />
        <div className="min-w-0 space-y-6">
          <BusinessSettingsForm business={business} />
          <TeamAccessPanel />
        </div>
      </div>
    </BusinessSettingsPageFrame>
  );
}
