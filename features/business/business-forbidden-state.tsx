import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BusinessForbiddenState({
  businessId,
  title = "Permission required",
  message = "You do not have permission to view this section.",
}: {
  businessId: string;
  title?: string;
  message?: string;
}) {
  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] rounded-xl border border-border bg-card p-8 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-destructive" />
        <h1 className="mt-3 text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <Button asChild className="mt-5">
          <Link href={`/business/${businessId}`}>Back to Overview</Link>
        </Button>
      </div>
    </div>
  );
}
