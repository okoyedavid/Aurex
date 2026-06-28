import type { Metadata } from "next";

import { PersonalDashboard } from "@/features/dashboard/personal-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Aurex personal dashboard.",
};

export default function DashboardPage() {
  return <PersonalDashboard />;
}
