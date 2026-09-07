"use client";

import { PageFrame } from "@/components/page-frame";
import { usePathname } from "next/navigation";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { GitHubConnectionPanel } from "@/features/integrations/components/github-connection-panel";
import { BusinessSettingsForm } from "./components/business-settings-form";
import { PreferencesSettingsPanel } from "./components/preferences-settings-panel";
import SettingsNavigation from "./components/settings-navigation";
import { TeamAccessPanel } from "./components/team-access-panel";

export function BusinessSettingsPageContent({
  githubCallback,
}: {
  githubCallback?: { result?: string; reason?: string };
}) {
  const { business } = useBusinessAccess();
  const pathname = usePathname();
  const integrationsOnly = pathname.endsWith("/settings/integrations");

  if (integrationsOnly) {
    return (
      <PageFrame>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          GitHub integration
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Connect GitHub for Aurex-managed application access.
        </p>
        <div className="mt-7">
          <GitHubConnectionPanel
            callbackResult={githubCallback?.result}
            callbackReason={githubCallback?.reason}
          />
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame>
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
          <GitHubConnectionPanel
            callbackResult={githubCallback?.result}
            callbackReason={githubCallback?.reason}
          />
          <PreferencesSettingsPanel />
        </div>
      </div>
    </PageFrame>
  );
}
