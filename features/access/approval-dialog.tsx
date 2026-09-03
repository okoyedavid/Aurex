"use client";

import { SelectControl } from "@/components/ui/select";

import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { newEmployee } from "@/features/business/business-draft-factory";
import type { EmployeeDraft } from "@/features/business/business-draft-types";
import { usePaystackBanksQuery } from "@/features/business/business-hooks";
import { EmployeeDraftRow } from "@/features/business/components/employee-draft-row";
import { EmployeeClassificationFields } from "@/features/business/components/employee-classification-fields";
import { useCreateOrResolveEmployeeTypeMutation } from "@/features/business/employee-classification-hooks";
import { resolveSelectedEmployeeType } from "@/features/business/employee-classification-options";
import { useEmployeeListsQuery } from "@/features/business/employee-list-hooks";
import { buildEmployeePayload } from "@/features/business/employee-list-form";
import type { PendingApprovalInvite } from "@/lib/access-api";
import { businessErrorMessage } from "@/lib/business-api";
import type { Permission } from "@/types/generic";

import { useApproveBusinessInvite } from "./hooks";
import { InviteEmployeeSummary } from "./invite-employee-summary";
import {
  approvalPermissionGate,
  employeeListIdentity,
  membershipOutcomeBlocksApproval,
  needsEmployeeCreation,
  populatedEmployee,
} from "./invitation-workflow";
import { MembershipOutcome } from "./membership-outcome";

export function ApprovalDialog({
  businessId,
  invite,
  permissions,
  onClose,
}: {
  businessId: string;
  invite: PendingApprovalInvite;
  permissions: ReadonlySet<Permission>;
  onClose: () => void;
}) {
  const existingEmployee = populatedEmployee(invite.employeeId);
  const shouldCreateEmployee = needsEmployeeCreation(invite);
  const permissionGate = approvalPermissionGate(invite, permissions);
  const outcomeBlocked = membershipOutcomeBlocksApproval(invite);
  const [employeeListId, setEmployeeListId] = useState("");
  const [draft, setDraft] = useState<EmployeeDraft>(newEmployee);
  const lists = useEmployeeListsQuery(
    businessId,
    1,
    20,
    shouldCreateEmployee && permissionGate.allowed && !outcomeBlocked,
  );
  const banks = usePaystackBanksQuery(
    shouldCreateEmployee && permissionGate.allowed && !outcomeBlocked,
  );
  const approve = useApproveBusinessInvite(businessId);
  const resolveType = useCreateOrResolveEmployeeTypeMutation(businessId);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!permissionGate.allowed || outcomeBlocked) return;

    if (shouldCreateEmployee) {
      if (!employeeListId) return toast.error("Select an employee list.");
      try {
        const employeeTypeId = await resolveSelectedEmployeeType(
          draft,
          resolveType.mutateAsync,
        );
        const employee = buildEmployeePayload({ ...draft, employeeTypeId });
        approve.mutate(
          {
            inviteId: invite.id,
            payload: { employee: { employeeListId, ...employee } },
            employeeListId,
          },
          {
            onSuccess: () => {
              toast.success("Invitation approved and employee created.");
              onClose();
            },
            onError: (error) =>
              toast.error(businessErrorMessage(error, "Unable to approve invitation.")),
          },
        );
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Check the employee details.",
        );
      }
      return;
    }

    const list = existingEmployee
      ? employeeListIdentity(existingEmployee)
      : null;
    approve.mutate(
      {
        inviteId: invite.id,
        payload: {},
        ...(list ? { employeeListId: list.id, employeeId: existingEmployee?.id } : {}),
      },
      {
        onSuccess: () => {
          toast.success("Invitation approved.");
          onClose();
        },
        onError: (error) =>
          toast.error(businessErrorMessage(error, "Unable to approve invitation.")),
      },
    );
  };

  return (
    <Dialog
      open
      onOpenChange={(open) =>
        !open && !approve.isPending && !resolveType.isPending && onClose()
      }
    >
      <DialogContent
        className={
          shouldCreateEmployee
            ? "max-h-[90vh] max-w-3xl overflow-y-auto"
            : "max-w-xl"
        }
      >
        <DialogHeader>
          <DialogTitle>
            {shouldCreateEmployee
              ? "Create employee and approve"
              : "Approve invitation"}
          </DialogTitle>
          <DialogDescription>
            {shouldCreateEmployee
              ? "Choose the employee list and complete the required employment details."
              : "Review the invitation details before approving."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit}>
          <div className="mb-5">
            <MembershipOutcome invite={invite} />
          </div>

          {!permissionGate.allowed ? (
            <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              You do not have the required permissions:{" "}
              {permissionGate.missing.join(", ")}.
            </div>
          ) : null}

          {invite.employeeId ? (
            <InviteEmployeeSummary employeeId={invite.employeeId} />
          ) : null}

          {shouldCreateEmployee ? (
            <div className="space-y-4">
              {lists.isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading employee lists...
                </p>
              ) : lists.error ? (
                <p className="text-sm text-destructive">
                  {businessErrorMessage(lists.error)}
                </p>
              ) : (
                <label className="block space-y-2 text-sm font-medium">
                  Employee list
                  <SelectControl
                    value={employeeListId}
                    disabled={approve.isPending || resolveType.isPending}
                    onChange={(event) => {
                      setEmployeeListId(event.target.value);
                      setDraft(newEmployee());
                    }}
                    className="h-10 w-full rounded-md border border-input bg-background px-3"
                  >
                    <option value="">Select an employee list</option>
                    {lists.data?.items.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ))}
                  </SelectControl>
                </label>
              )}
              {employeeListId ? (
                <EmployeeDraftRow
                  employee={draft}
                  banks={banks.data ?? []}
                  banksLoading={banks.isLoading}
                  banksError={banks.isError ? "Unable to load banks." : undefined}
                  disabled={approve.isPending || resolveType.isPending}
                  showRemove={false}
                  onUpdate={(patch) =>
                    setDraft((current) => ({ ...current, ...patch }))
                  }
                  onRemove={() => undefined}
                />
              ) : (
                <p className="rounded-md border border-dashed border-border p-5 text-sm text-muted-foreground">
                  Select an employee list to enter employee details.
                </p>
              )}
              {employeeListId ? (
                <EmployeeClassificationFields
                  businessId={businessId}
                  employee={draft}
                  permissions={permissions}
                  showGroups={false}
                  disabled={approve.isPending || resolveType.isPending}
                  onUpdate={(patch) =>
                    setDraft((current) => ({ ...current, ...patch }))
                  }
                />
              ) : null}
            </div>
          ) : null}

          <DialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              disabled={approve.isPending || resolveType.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                approve.isPending ||
                resolveType.isPending ||
                !permissionGate.allowed ||
                outcomeBlocked ||
                (shouldCreateEmployee && !employeeListId)
              }
            >
              {approve.isPending || resolveType.isPending ? (
                <Loader2 className="animate-spin" />
              ) : null}
              {shouldCreateEmployee ? "Create and approve" : "Approve"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
