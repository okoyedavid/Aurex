import { Skeleton } from "@/components/ui/skeleton";

export function BusinessLayoutSkeleton() {
  return (
    <main
      className="min-h-screen bg-muted"
      aria-label="Loading business workspace"
    >
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-background p-5 lg:block">
        <Skeleton className="h-10 w-40" />
        <div className="mt-20 space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-9" />
          ))}
        </div>
      </aside>
      <section className="min-h-screen lg:ml-64">
        <Skeleton className="h-16 rounded-none border-b border-border bg-background" />
        <div className="space-y-5 p-8">
          <Skeleton className="h-10 w-72 bg-card" />
          <Skeleton className="h-64 bg-card" />
        </div>
      </section>
    </main>
  );
}
