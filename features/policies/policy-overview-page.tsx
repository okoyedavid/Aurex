"use client";

import { Plus, RefreshCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FeedbackState } from "@/components/ui/feedback-state";
import { useBusinessAccess } from "@/features/business/business-access-context";
import { businessErrorMessage } from "@/lib/business-api";
import { PolicyCollection } from "./components/policy-collection";
import { PolicyDialog } from "./components/policy-dialog";
import { ConfirmPolicyAction } from "./components/policy-ui";
import { policyPermissions } from "./policy-helpers";
import {
  usePolicyCategoriesQuery,
  useReconcileBusinessMutation,
} from "./policy-hooks";

export function PolicyOverviewPage({ businessId }: { businessId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const access = policyPermissions(useBusinessAccess().effectivePermissions);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [jobId, setJobId] = useState<string>();
  const categoryOptions = usePolicyCategoriesQuery(
    businessId,
    1,
    100,
    "active",
    access.view,
  );
  const reconcile = useReconcileBusinessMutation(businessId);

  useEffect(() => {
    if (searchParams.get("action") !== "create-policy" || !access.create)
      return;
    const frame = requestAnimationFrame(() => setPolicyOpen(true));
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    return () => cancelAnimationFrame(frame);
  }, [access.create, pathname, router, searchParams]);

  if (!access.view)
    return (
      <FeedbackState
        title="Unable to load policy data"
        message="You do not have permission to view policies."
      />
    );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-bold">Policies</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Define policy categories, effective policies, and assignment rules.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {access.reconcile ? (
            <Button variant="outline" onClick={() => setReconcileOpen(true)}>
              <RefreshCw />
              Reconcile business
            </Button>
          ) : null}
          {access.create ? (
            <Button
              onClick={() => setPolicyOpen(true)}
              disabled={!categoryOptions.data?.items.length}
            >
              <Plus />
              Policy
            </Button>
          ) : null}
        </div>
      </div>

      {jobId ? <ReconciliationQueued /> : null}

      <PolicyCollection businessId={businessId} canView={access.view} />

      {policyOpen ? (
        <PolicyDialog
          businessId={businessId}
          categories={categoryOptions.data?.items ?? []}
          open
          onOpenChange={setPolicyOpen}
        />
      ) : null}
      <ConfirmPolicyAction
        open={reconcileOpen}
        title="Reconcile policies for the entire business?"
        description="This queues asynchronous work for all employees. It does not complete immediately and no progress estimate is available."
        confirmLabel="Queue reconciliation"
        pending={reconcile.isPending}
        onOpenChange={setReconcileOpen}
        onConfirm={() =>
          reconcile.mutate(undefined, {
            onSuccess: (data) => {
              setJobId(data.jobId);
              setReconcileOpen(false);
              toast.success("Reconciliation queued.");
            },
            onError: (error) => toast.error(businessErrorMessage(error)),
          })
        }
      />
    </div>
  );
}

function ReconciliationQueued() {
  return (
    <details className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-4">
      <summary className="cursor-pointer font-medium">
        Reconciliation queued.
      </summary>
      <p className="mt-2 text-xs text-muted-foreground">
        Aurex is processing the request. Refresh employee assignments after
        processing has had time to complete.
      </p>
    </details>
  );
}
