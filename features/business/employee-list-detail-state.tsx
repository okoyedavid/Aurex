import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EmployeeListDetailState({
  title,
  detail,
  retry,
}: {
  title: string;
  detail: string;
  retry?: () => void;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-8 text-center">
      <AlertCircle className="mx-auto" />
      <h1 className="mt-3 font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      {retry && (
        <Button className="mt-4" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
