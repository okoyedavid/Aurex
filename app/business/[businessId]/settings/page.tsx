import type { Metadata } from "next";

import { BusinessSettingsPageContent } from "@/features/settings/business-settings-page-content";

export const metadata: Metadata = {
  title: "Business settings",
  description: "Manage business profile and team access settings.",
};

export default function BusinessSettingsPage() {
  return <BusinessSettingsPageContent />;
}
