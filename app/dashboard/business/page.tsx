import type { Metadata } from "next";

import { BusinessDashboardPage } from "@/features/business/business-dashboard-page";

export const metadata: Metadata = {
  title: "Businesses",
  description: "Manage businesses connected to your Aurex account.",
};

export default function DashboardBusinessPage() {
  return <BusinessDashboardPage />;
}
