"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ retry }: { retry: () => void }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-primary">Unexpected error</p>
        <h1 className="mt-2 text-3xl font-bold">
          We could not load this page.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Try the request again. If the problem continues, return later or
          contact Aurex support.
        </p>
        <Button className="mt-6" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
