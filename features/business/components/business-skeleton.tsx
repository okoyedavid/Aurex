export function BusinessSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-label="Loading businesses">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex gap-4">
            <div className="h-12 w-12 animate-pulse rounded-md bg-muted" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
