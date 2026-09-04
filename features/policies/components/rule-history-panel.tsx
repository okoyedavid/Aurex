"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { businessErrorMessage } from "@/lib/business-api";
import { Pagination } from "@/features/business/pagination";
import { useRuleHistoryQuery } from "@/features/policies/policy-hooks";
import { FeedbackState } from "@/components/ui/feedback-state";
import { PolicyAuditTable } from "./policy-audit-table";

export function RuleHistoryPanel({
  businessId,
  ruleId,
}: {
  businessId: string;
  ruleId: string;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const history = useRuleHistoryQuery(businessId, ruleId, page, 20, open);

  return (
    <div className="mt-3 border-t border-border pt-3">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide rule history" : "View rule history"}
      </Button>
      {open ? (
        <div className="mt-3">
          {history.isLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading rule history…
            </p>
          ) : history.error ? (
            <FeedbackState
              title="Unable to load policy data"
              message={businessErrorMessage(history.error)}
              retry={() => void history.refetch()}
            />
          ) : (
            <>
              <PolicyAuditTable items={history.data?.items ?? []} />
              <Pagination
                page={history.data?.pagination.page ?? 1}
                totalPages={history.data?.pagination.totalPages ?? 0}
                total={history.data?.pagination.total ?? 0}
                limit={20}
                fetching={history.isFetching}
                showLimit={false}
                onPage={setPage}
                onLimit={() => undefined}
              />
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
