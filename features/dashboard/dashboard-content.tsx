import { CashFlowCard } from "@/features/dashboard/cash-flow-card";
import { DashboardIntro } from "@/features/dashboard/dashboard-intro";
import { MetricsGrid } from "@/features/dashboard/metrics-grid";
import { ReconciliationCard } from "@/features/dashboard/reconciliation-card";
import { SettlementsCard } from "@/features/dashboard/settlements-card";
import { TransactionsCard } from "@/features/dashboard/transactions-card";
import { WorkspaceHealthCard } from "@/features/dashboard/workspace-health-card";

export function DashboardContent() {
  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto min-w-0 max-w-[1480px]">
        <DashboardIntro />
        <MetricsGrid />

        <div className="mt-5 grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
          <div className="min-w-0 space-y-5">
            <CashFlowCard />
            <TransactionsCard />
          </div>
          <aside className="grid min-w-0 gap-5 md:grid-cols-2 2xl:block 2xl:space-y-5">
            <SettlementsCard />
            <ReconciliationCard />
            <div className="md:col-span-2 2xl:col-span-1">
              <WorkspaceHealthCard />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
