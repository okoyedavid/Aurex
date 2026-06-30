export function BusinessLayoutSkeleton() {
  return (
    <main
      className="min-h-screen bg-muted"
      aria-label="Loading business workspace"
    >
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-background p-5 lg:block">
        <div className="h-10 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-20 space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-9 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </aside>
      <section className="min-h-screen lg:ml-64">
        <div className="h-16 animate-pulse border-b border-border bg-background" />
        <div className="space-y-5 p-8">
          <div className="h-10 w-72 animate-pulse rounded bg-card" />
          <div className="h-64 animate-pulse rounded-xl bg-card" />
        </div>
      </section>
    </main>
  );
}
