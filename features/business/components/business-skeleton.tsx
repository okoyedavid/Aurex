import { Skeleton } from "@/components/ui/skeleton";

export function BusinessSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-2" aria-label="Loading businesses">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-md border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
