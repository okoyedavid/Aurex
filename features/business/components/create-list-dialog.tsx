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
import { businessErrorMessage } from "@/lib/business-api";
import { EmployeeListsDraftEditor } from "./employee-lists-draft-editor";
import { newEmployeeList } from "../business-draft-factory";
import type { EmployeeListDraft } from "../business-draft-types";
import { buildEmployeeListPayload } from "../employee-list-form";
import { useCreateEmployeeListMutation } from "../employee-list-hooks";

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
          className="grid gap-4"
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
