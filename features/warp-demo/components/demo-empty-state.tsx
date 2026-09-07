import { DatabaseZap } from "lucide-react";

export function DemoEmptyState({ label }: { label: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-md border border-dashed border-border text-center text-sm text-muted-foreground">
      <span>
        <DatabaseZap className="mx-auto mb-3 size-5" />
        {label}
      </span>
    </div>
  );
}
