import { FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DashboardIntro() {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Monday, June 15</p>
        <h1 className="mt-1 break-words text-3xl font-bold tracking-tight sm:text-4xl">
          Good morning, Amara
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Here is what is happening across your payment operation.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button variant="outline" className="h-10 min-w-0 rounded-md px-3 sm:px-4">
          <FileText className="h-4 w-4" />
          <span className="truncate">Create invoice</span>
        </Button>
        <Button className="h-10 min-w-0 rounded-md px-3 sm:px-4">
          <Plus className="h-4 w-4" />
          <span className="truncate">New payment</span>
        </Button>
      </div>
    </div>
  );
}
