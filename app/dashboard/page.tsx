import type { Metadata } from "next";

import { DashboardContent } from "@/features/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Aurex business payments dashboard.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
