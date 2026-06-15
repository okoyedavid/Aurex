import { Building2, ChevronRight } from "lucide-react";

export function WorkspaceHealthCard() {
  return (
    <section className="bg-primary p-5 text-primary-foreground shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-primary-foreground/70">Workspace health</p>
          <h2 className="mt-1 text-xl font-bold">Operations are on track</h2>
        </div>
        <Building2 className="h-6 w-6 shrink-0" />
      </div>
      <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
        No unusual payment activity detected. Two team access reviews are due
        this month.
      </p>
      <button type="button" className="mt-5 flex items-center gap-2 text-sm font-bold">
        Open activity log <ChevronRight className="h-4 w-4" />
      </button>
    </section>
  );
}
