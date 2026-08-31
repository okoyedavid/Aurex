"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import type { Employee } from "@/lib/employee-lists-api";
import { businessErrorMessage } from "@/lib/business-api";
import { EmployeeDraftRow } from "./employee-draft-row";
import { EmployeeClassificationFields } from "./employee-classification-fields";
import { newEmployee } from "../business-draft-factory";
import type { EmployeeDraft, PayFrequency } from "../business-draft-types";
import {
  buildEmployeePayload,
  buildEmployeeUpdatePayload,
} from "../employee-list-form";
import { usePaystackBanksQuery } from "../business-hooks";
import { useBusinessAccess } from "../business-access-context";
import { useCreateOrResolveEmployeeTypeMutation } from "../employee-classification-hooks";
import { resolveSelectedEmployeeType } from "../employee-classification-options";
import {
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../employee-list-hooks";

export function EmployeeDialog({
  businessId,
  listId,
  employee,
  open,
  onOpenChange,
}: {
  businessId: string;
  listId: string;
  employee?: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const toDraft = (): EmployeeDraft =>
    employee
      ? {
          tempId: employee.id,
          fullName: employee.fullName,
          jobTitle: employee.jobTitle ?? "",
          bankCode: employee.bankCode,
          bankName: employee.bankName,
          accountNumber: employee.accountNumber,
          accountName: employee.accountName ?? "",
          accountVerified: employee.accountVerificationStatus === "verified",
          accountVerifiedAt: employee.accountVerifiedAt ?? undefined,
          amount: employee.amount,
          currency: employee.currency,
          payFrequency: employee.payFrequency as PayFrequency,
          employeeTypeId: employee.employeeTypeId ?? null,
          groupIds: employee.groupIds ?? [],
          employmentStartDate: employee.employmentStartDate ?? "",
          state: employee.state ?? "",
        }
      : newEmployee();
  const [draft, setDraft] = useState<EmployeeDraft>(toDraft);
  const banks = usePaystackBanksQuery();
  const { effectivePermissions } = useBusinessAccess();
  const create = useCreateEmployeeMutation(businessId, listId);
  const resolveType = useCreateOrResolveEmployeeTypeMutation(businessId);
  const update = useUpdateEmployeeMutation(
    businessId,
    listId,
    employee?.id ?? "",
  );
  const pending = create.isPending || update.isPending || resolveType.isPending;
  const close = () => onOpenChange(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !pending && onOpenChange(value)}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Edit employee" : "Add employee"}
          </DialogTitle>
          <DialogDescription>
            Bank details are verified after submission. A bank detail change
            will require verification again.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              const employeeTypeId = await resolveSelectedEmployeeType(
                draft,
                resolveType.mutateAsync,
              );
              const submission = {
                ...draft,
                employeeTypeId,
                employeeTypeTemplateKey: undefined,
              };
              const mutationOptions = {
                onSuccess: () => {
                  toast.success(
                    employee ? "Employee updated." : "Employee added.",
                  );
                  close();
                },
                onError: (error: unknown) =>
                  toast.error(businessErrorMessage(error)),
              };
              if (employee) {
                update.mutate(
                  buildEmployeeUpdatePayload(submission),
                  mutationOptions,
                );
              } else {
                create.mutate(buildEmployeePayload(submission), mutationOptions);
              }
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Check the form fields.",
              );
            }
          }}
        >
          <EmployeeDraftRow
            employee={draft}
            banks={banks.data ?? []}
            banksLoading={banks.isLoading}
            banksError={banks.isError ? "Unable to load banks." : undefined}
            disabled={pending}
            onUpdate={(patch) =>
              setDraft((current) => ({ ...current, ...patch }))
            }
            onRemove={() => {}}
          />
          <EmployeeClassificationFields
            businessId={businessId}
            employee={draft}
            permissions={effectivePermissions}
            showGroups={Boolean(employee)}
            disabled={pending}
            onUpdate={(patch) =>
              setDraft((current) => ({ ...current, ...patch }))
            }
          />
          <DialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              {employee ? "Save changes" : "Add employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
