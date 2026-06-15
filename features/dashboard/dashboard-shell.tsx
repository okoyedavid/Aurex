"use client";

import { useEffect, useState } from "react";

import { DashboardHeader } from "@/features/dashboard/dashboard-header";
import { DashboardSidebar } from "@/features/dashboard/dashboard-sidebar";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  return (
    <main className="min-h-screen min-w-0 bg-muted text-foreground">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <section
        className={cn(
          "min-h-screen min-w-0 transition-[margin] duration-300",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
        )}
      >
        <DashboardHeader
          sidebarCollapsed={sidebarCollapsed}
          onMenuOpen={() => setMobileOpen(true)}
          onSidebarToggle={() =>
            setSidebarCollapsed((current) => !current)
          }
        />
        {children}
      </section>
    </main>
  );
}
