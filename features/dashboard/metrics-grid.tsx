import { dashboardMetrics } from "@/features/dashboard/data";
import { MetricCard } from "@/features/dashboard/metric-card";

export function MetricsGrid() {
  return (
    <section
      className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="Account metrics"
    >
      {dashboardMetrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </section>
  );
}
