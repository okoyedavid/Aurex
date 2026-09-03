import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BusinessLayoutError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6">
      <div className="rounded-md border border-border bg-card p-6 text-center">
        <AlertCircle className="mx-auto text-destructive" />
        <h1 className="mt-3 font-bold">Unable to load business</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}
