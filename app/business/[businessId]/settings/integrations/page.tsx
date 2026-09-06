import type { Metadata } from "next";

import { BusinessSettingsPageContent } from "@/features/settings/business-settings-page-content";

export const metadata: Metadata = {
  title: "Business integrations",
  description: "Manage connected services for this business.",
};

export default async function BusinessIntegrationsCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ github?: string; reason?: string }>;
}) {
  const { github, reason } = await searchParams;
  return (
    <BusinessSettingsPageContent
      githubCallback={{ result: github, reason }}
    />
  );
}
