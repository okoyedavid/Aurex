"use client";

import { SelectControl } from "@/components/ui/select";

import { Archive, Loader2, Pencil, Plus } from "lucide-react";
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
import { useBusinessAccess } from "@/features/business/business-access-context";
import {
  useCreateOrResolveEmployeeGroupMutation,
  useCreateOrResolveEmployeeTypeMutation,
  useEmployeeGroupsPageQuery,
  useEmployeeTypesPageQuery,
  useSystemEmployeeGroupsQuery,
  useSystemEmployeeTypesQuery,
  useUpdateEmployeeGroupMutation,
  useUpdateEmployeeTypeMutation,
} from "@/features/business/employee-classification-hooks";
import { Pagination } from "@/features/business/pagination";
import { businessErrorMessage } from "@/lib/business-api";
import type {
  EmployeeClassificationStatus,
  EmployeeGroup,
  EmployeeType,
} from "@/lib/employee-classifications-api";

type ClassificationRecord = EmployeeType | EmployeeGroup;

export function EmployeeClassificationPage({
  businessId,
  kind,
}: {
  businessId: string;
  kind: "types" | "groups";
}) {
  const access = useBusinessAccess();
  const canView = access.effectivePermissions.has("employees:view");
  const canCreate =
    kind === "types"
      ? access.effectivePermissions.has("employees:create")
      : access.effectivePermissions.has("employees:update");
  const canUpdate = access.effectivePermissions.has("employees:update");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EmployeeClassificationStatus>("active");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClassificationRecord>();
  const types = useEmployeeTypesPageQuery(
    businessId,
    page,
    20,
    status,
    canView && kind === "types",
  );
  const groups = useEmployeeGroupsPageQuery(
    businessId,
    page,
    20,
    status,
    canView && kind === "groups",
  );
  const typeTemplates = useSystemEmployeeTypesQuery(
    businessId,
    canView && kind === "types",
  );
  const groupTemplates = useSystemEmployeeGroupsQuery(
    businessId,
    canView && kind === "groups",
  );
  const createType = useCreateOrResolveEmployeeTypeMutation(businessId);
  const createGroup = useCreateOrResolveEmployeeGroupMutation(businessId);
  const updateType = useUpdateEmployeeTypeMutation(businessId);
  const updateGroup = useUpdateEmployeeGroupMutation(businessId);
  const query = kind === "types" ? types : groups;
  const title = kind === "types" ? "Employee types" : "Employee groups";
  if (!canView)
    return (
      <>
        <State
          title="Permission required"
          detail={`${title} require employees:view.`}
        />
      </>
    );
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage business-owned classifications used by employees and policy
            rules.
          </p>
        </div>
        {canCreate ? (
          <Button
            onClick={() => {
              setEditing(undefined);
              setDialogOpen(true);
            }}
          >
            <Plus />
            Create {kind === "types" ? "type" : "group"}
          </Button>
        ) : null}
      </div>
      <div className="mt-6 flex gap-2">
        <Button
          size="sm"
          variant={status === "active" ? "default" : "outline"}
          onClick={() => {
            setStatus("active");
            setPage(1);
          }}
        >
          Active
        </Button>
        <Button
          size="sm"
          variant={status === "archived" ? "default" : "outline"}
          onClick={() => {
            setStatus("archived");
            setPage(1);
          }}
        >
          <Archive />
          Archived
        </Button>
      </div>
      {query.isLoading ? (
        <div className="flex min-h-56 items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" />
          Loading {title.toLowerCase()}…
        </div>
      ) : query.error ? (
        <State
          title={`Unable to load ${title.toLowerCase()}`}
          detail={businessErrorMessage(query.error)}
          retry={() => void query.refetch()}
        />
      ) : query.data?.items.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {query.data.items.map((item) => (
            <article
              key={item.id}
              className="rounded-md border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description || "No description"}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-medium uppercase">
                  {item.status}
                </span>
              </div>
              {item.sourceTemplateKey ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  System default · {item.sourceTemplateKey.replaceAll("_", " ")}
                </p>
              ) : (
                <p className="mt-4 text-xs text-muted-foreground">
                  Custom business record
                </p>
              )}
              {canUpdate ? (
                <Button
                  className="mt-4"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(item);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil />
                  Edit
                </Button>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <State
          title={`No ${status} ${title.toLowerCase()}`}
          detail={
            status === "active"
              ? "Create a custom record or add a system default."
              : "Archived records will appear here."
          }
        />
      )}
      {query.data ? (
        <Pagination
          page={query.data.pagination.page}
          totalPages={query.data.pagination.totalPages}
          total={query.data.pagination.total}
          limit={20}
          fetching={query.isFetching}
          showLimit={false}
          onPage={setPage}
          onLimit={() => undefined}
        />
      ) : null}
      {dialogOpen ? (
        <ClassificationDialog
          kind={kind}
          item={editing}
          templates={
            kind === "types"
              ? (typeTemplates.data?.items ?? [])
              : (groupTemplates.data?.items ?? [])
          }
          pending={
            createType.isPending ||
            createGroup.isPending ||
            updateType.isPending ||
            updateGroup.isPending
          }
          open
          onOpenChange={setDialogOpen}
          onSave={(body) => {
            const options = {
              onSuccess: () => {
                toast.success(
                  `${kind === "types" ? "Employee type" : "Employee group"} saved.`,
                );
                setDialogOpen(false);
              },
              onError: (error: unknown) =>
                toast.error(businessErrorMessage(error)),
            };
            if (editing) {
              const updateBody =
                body.mode === "custom"
                  ? {
                      name: body.name,
                      description: body.description || null,
                      status: body.status,
                    }
                  : { status: body.status };
              if (kind === "types")
                updateType.mutate(
                  { id: editing.id, body: updateBody },
                  options,
                );
              else
                updateGroup.mutate(
                  { id: editing.id, body: updateBody },
                  options,
                );
            } else if (body.mode === "template") {
              if (kind === "types")
                createType.mutate(
                  {
                    templateKey: body.templateKey as
                      | "full_time"
                      | "part_time"
                      | "contractor"
                      | "intern",
                  },
                  options,
                );
              else
                createGroup.mutate(
                  {
                    templateKey: body.templateKey as
                      | "engineering"
                      | "marketing"
                      | "finance"
                      | "hr",
                  },
                  options,
                );
            } else if (kind === "types")
              createType.mutate(
                { name: body.name, description: body.description },
                options,
              );
            else
              createGroup.mutate(
                { name: body.name, description: body.description },
                options,
              );
          }}
        />
      ) : null}
    </>
  );
}

type SaveBody =
  | {
      mode: "custom";
      name: string;
      description: string;
      status: EmployeeClassificationStatus;
    }
  | {
      mode: "template";
      templateKey: string;
      status: EmployeeClassificationStatus;
    };
function ClassificationDialog({
  kind,
  item,
  templates,
  pending,
  open,
  onOpenChange,
  onSave,
}: {
  kind: "types" | "groups";
  item?: ClassificationRecord;
  templates: Array<{ key: string; name: string }>;
  pending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (body: SaveBody) => void;
}) {
  const [mode, setMode] = useState<"custom" | "template">("custom");
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [templateKey, setTemplateKey] = useState("");
  const [status, setStatus] = useState<EmployeeClassificationStatus>(
    item?.status ?? "active",
  );
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !pending && onOpenChange(value)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit" : "Create"} employee{" "}
            {kind === "types" ? "type" : "group"}
          </DialogTitle>
          <DialogDescription>
            Records remain available for referenced employees. Archive them
            instead of deleting.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!item && mode === "template")
              onSave({ mode, templateKey, status });
            else
              onSave({
                mode: "custom",
                name: name.trim(),
                description: description.trim(),
                status,
              });
          }}
          className="space-y-4"
        >
          {!item ? (
            <label className="space-y-2 text-sm font-medium">
              Source
              <SelectControl
                value={mode}
                onChange={(event) =>
                  setMode(event.target.value as "custom" | "template")
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3"
              >
                <option value="custom">Custom business record</option>
                <option value="template">System default</option>
              </SelectControl>
            </label>
          ) : null}
          {!item && mode === "template" ? (
            <label className="space-y-2 text-sm font-medium">
              System default
              <SelectControl
                required
                value={templateKey}
                onChange={(event) => setTemplateKey(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3"
              >
                <option value="">Select a default</option>
                {templates.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.name}
                  </option>
                ))}
              </SelectControl>
            </label>
          ) : (
            <>
              <label className="space-y-2 text-sm font-medium">
                Name
                <Input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                Description
                <Input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
            </>
          )}
          {item ? (
            <label className="space-y-2 text-sm font-medium">
              Status
              <SelectControl
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as EmployeeClassificationStatus)
                }
                className="h-9 w-full rounded-md border border-input bg-background px-3"
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </SelectControl>
            </label>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : null}Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function State({
  title,
  detail,
  retry,
}: {
  title: string;
  detail: string;
  retry?: () => void;
}) {
  return (
    <div className="mt-6 rounded-md border border-dashed border-border p-10 text-center">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
      {retry ? (
        <Button className="mt-5" variant="outline" onClick={retry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
