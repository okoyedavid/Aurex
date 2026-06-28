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
import { Input } from "@/components/ui/input";
import { EmployeeListsDraftEditor } from "./employee-lists-draft-editor";
import { EmployeeDraftRow } from "./employee-draft-row";
import { newEmployee, newEmployeeList } from "../business-draft-factory";
import type {
  EmployeeDraft,
  EmployeeListDraft,
  PayFrequency,
} from "../business-draft-types";
import {
  buildEmployeeListPayload,
  buildEmployeePayload,
} from "../employee-list-form";
import { usePaystackBanksQuery } from "../business-hooks";
import {
  useCreateEmployeeListMutation,
  useCreateEmployeeMutation,
  useUpdateEmployeeListMutation,
  useUpdateEmployeeMutation,
} from "../employee-list-hooks";
import { businessErrorMessage } from "@/lib/business-api";
import type { Employee, EmployeeList } from "@/lib/employee-lists-api";

export function CreateListDialog({
  businessId,
  open,
  onOpenChange,
}: {
  businessId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [lists, setLists] = useState<EmployeeListDraft[]>([newEmployeeList()]);
  const mutation = useCreateEmployeeListMutation(businessId);
  const close = () => {
    setLists([newEmployeeList()]);
    onOpenChange(false);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(value) =>
        !mutation.isPending && (value ? onOpenChange(true) : close())
      }
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create employee list</DialogTitle>
          <DialogDescription>
            Add list details and up to 50 optional employees in one request.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            try {
              mutation.mutate(buildEmployeeListPayload(lists[0]), {
                onSuccess: () => {
                  toast.success("Employee list created.");
                  close();
                },
                onError: (error) => toast.error(businessErrorMessage(error)),
              });
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Check the form fields.",
              );
            }
          }}
          className="grid gap-4"
        >
          <EmployeeListsDraftEditor
            employeeLists={lists}
            setEmployeeLists={setLists}
            disabled={mutation.isPending}
            maxLists={1}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={close}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button disabled={mutation.isPending || !lists.length}>
              {mutation.isPending && <Loader2 className="animate-spin" />}Create
              list
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
          accountVerified:
            employee.accountVerificationStatus === "verified",
          accountVerifiedAt: employee.accountVerifiedAt ?? undefined,
          amount: employee.amount,
          currency: employee.currency,
          payFrequency: employee.payFrequency as PayFrequency,
        }
      : newEmployee();
  const [draft, setDraft] = useState<EmployeeDraft>(toDraft);
  const banks = usePaystackBanksQuery();
  const create = useCreateEmployeeMutation(businessId, listId);
  const update = useUpdateEmployeeMutation(
    businessId,
    listId,
    employee?.id ?? "",
  );
  const pending = create.isPending || update.isPending;
  const close = () => onOpenChange(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !pending && onOpenChange(value)}
    >
      <DialogContent className="sm:max-w-3xl">
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
          onSubmit={(event) => {
            event.preventDefault();
            try {
              const payload = buildEmployeePayload(draft);
              const action = employee ? update : create;
              action.mutate(payload, {
                onSuccess: () => {
                  toast.success(
                    employee ? "Employee updated." : "Employee added.",
                  );
                  close();
                },
                onError: (error) => toast.error(businessErrorMessage(error)),
              });
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

export function EditListDialog({
  businessId,
  list,
  open,
  onOpenChange,
}: {
  businessId: string;
  list: EmployeeList;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const [form, setForm] = useState({
    name: list.name,
    description: list.description ?? "",
    currency: list.currency,
    defaultPayFrequency: list.defaultPayFrequency,
  });
  const mutation = useUpdateEmployeeListMutation(businessId, list.id);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !mutation.isPending && onOpenChange(value)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit employee list</DialogTitle>
          <DialogDescription>
            Update list defaults. Existing employees are not changed.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.name.trim()) return toast.error("List name is required.");
            mutation.mutate(
              {
                name: form.name.trim(),
                description: form.description.trim() || null,
                currency: form.currency,
                payFrequency: form.defaultPayFrequency as PayFrequency,
              },
              {
                onSuccess: () => {
                  toast.success("Employee list updated.");
                  onOpenChange(false);
                },
                onError: (error) => toast.error(businessErrorMessage(error)),
              },
            );
          }}
        >
          <label className="text-sm font-medium">
            Name
            <Input
              className="mt-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="text-sm font-medium">
            Description
            <Input
              className="mt-2"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Currency
              <Input
                className="mt-2"
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value.toUpperCase() })
                }
              />
            </label>
            <label className="text-sm">
              Pay frequency
              <select
                className="mt-2 h-8 w-full rounded-lg border border-input bg-background px-2"
                value={form.defaultPayFrequency}
                onChange={(e) =>
                  setForm({ ...form, defaultPayFrequency: e.target.value })
                }
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="one_time">One time</option>
              </select>
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={mutation.isPending}>Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
