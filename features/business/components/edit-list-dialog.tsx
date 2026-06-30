"use client";
import { useState } from "react";
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
import { businessErrorMessage } from "@/lib/business-api";
import type { EmployeeList } from "@/lib/employee-lists-api";
import type { PayFrequency } from "../business-draft-types";
import { useUpdateEmployeeListMutation } from "../employee-list-hooks";

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
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </label>
          <label className="text-sm font-medium">
            Description
            <Input
              className="mt-2"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              Currency
              <Input
                className="mt-2"
                value={form.currency}
                onChange={(event) =>
                  setForm({
                    ...form,
                    currency: event.target.value.toUpperCase(),
                  })
                }
              />
            </label>
            <label className="text-sm">
              Pay frequency
              <select
                className="mt-2 h-8 w-full rounded-lg border border-input bg-background px-2"
                value={form.defaultPayFrequency}
                onChange={(event) =>
                  setForm({ ...form, defaultPayFrequency: event.target.value })
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
