import type { Metadata } from "next";

import { formatDate } from "@/features/dashboard/format";
import { auditEvents } from "@/features/dashboard/mock-data";

export const metadata: Metadata = {
  title: "Activity",
  description: "Recent activity across your Aurex account.",
};

export default function DashboardActivityPage() {
  return (
    <div className="px-4 py-5 pb-10 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1280px]">
        <p className="text-sm text-muted-foreground">Personal dashboard</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Activity</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Account, session, security, and business events that need context.
        </p>

        <div className="mt-7 space-y-4">
          {auditEvents.map((event) => (
            <article key={event.id} className="border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{event.eventType}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{event.category}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{event.severity}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.outcome} from {event.deviceName ?? "Unknown device"} in {event.city ?? "Unknown location"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(event.createdAt)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
