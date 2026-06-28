"use client";

import { useBusinessAccess } from "@/features/business/business-access-context";
import { BusinessSettingsForm } from "./business-settings-form";
import SettingsNavigation from "./settings-navigation";
import { TeamAccessPanel } from "./team-access-panel";

export function BusinessSettingsPageContent() {
  const { business } = useBusinessAccess();

  return (
    <PageFrame>
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
    </PageFrame>
  );
}

function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">{children}</div>
    </div>
  );
}
