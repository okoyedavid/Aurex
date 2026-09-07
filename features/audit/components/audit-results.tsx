import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/features/business/pagination";
import type { AuditPage } from "@/lib/audit-api";
import { BusinessApiError } from "@/lib/business-api";
import { AuditActivityTimeline } from "../audit-activity-timeline";

export function AuditResults({ scope, query, onPersonal, onRetry, onPage, onLimit }: { scope: "organization" | "me"; query: { data?: AuditPage; error: unknown; isLoading: boolean; isFetching: boolean }; onPersonal: () => void; onRetry: () => void; onPage: (page: number) => void; onLimit: (limit: number) => void }) {
  if (query.isLoading) return <AuditLoading />;
  if (query.error) return <AuditError error={query.error} scope={scope} onPersonal={onPersonal} onRetry={onRetry} />;
  const data = query.data;
  return <section className="mt-6" aria-live="polite">{data?.items.length ? <AuditActivityTimeline items={data.items} scope={scope === "organization" ? "organization" : "personal"} /> : <div className="rounded-md border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">{scope === "organization" ? "No organization audit events match these filters." : "No activity affecting you has been recorded yet."}</div>}{data ? <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} limit={data.pagination.limit} fetching={query.isFetching} onPage={onPage} onLimit={onLimit} /> : null}</section>;
}

function AuditLoading() {
  return <div className="mt-6 space-y-3" aria-label="Loading audit activity">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-28 border border-border bg-muted/40" />)}</div>;
}

function AuditError({ error, scope, onPersonal, onRetry }: { error: unknown; scope: "organization" | "me"; onPersonal: () => void; onRetry: () => void }) {
  const status = error instanceof BusinessApiError ? error.status : undefined;
  const message = status === 401 ? "Your session has expired. Please sign in again." : status === 403 ? scope === "organization" ? "You do not have permission to view organization audit activity." : "An active business membership is required to view your activity." : "Audit activity could not be loaded.";
  return <FeedbackState className="mt-6" variant="inline" title={status === 403 ? "Permission required" : "Unable to load audit activity"} message={message} action={status === 403 && scope === "organization" ? <Button onClick={onPersonal}>View My Activity</Button> : null} retry={status !== 401 && status !== 403 ? onRetry : undefined} />;
}
