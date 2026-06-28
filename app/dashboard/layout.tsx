import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { ScopedThemeProvider } from "@/components/theme-provider";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ScopedThemeProvider>
      <DashboardShell>{children}</DashboardShell>
    </ScopedThemeProvider>
  );
}
