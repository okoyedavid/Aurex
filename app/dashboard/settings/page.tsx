import type { Metadata } from "next";

import { SettingsPageContent } from "@/features/settings/settings-page-content";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage Aurex profile, business, security, and workspace settings.",
};

export default function SettingsPage() {
  return <SettingsPageContent />;
}
