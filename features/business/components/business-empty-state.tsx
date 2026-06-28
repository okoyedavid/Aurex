import { Building2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BusinessEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="rounded-xl border border-border shadow-sm">
      <CardHeader>
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Building2 className="h-6 w-6" />
        </div>
        <CardTitle className="mt-2">No businesses yet</CardTitle>
        <CardDescription>
          Create a business workspace before inviting members, preparing
          employee payroll lists, or managing bills and payables.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          className="h-10 rounded-md px-4"
          onClick={onCreate}
        >
          <Plus className="h-4 w-4" />
          Create business
        </Button>
      </CardContent>
    </Card>
  );
}
