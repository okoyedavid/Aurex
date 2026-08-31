"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EmployeeDraft } from "@/features/business/business-draft-types";
import {
  useCreateOrResolveEmployeeGroupMutation,
  useCreateOrResolveEmployeeTypeMutation,
  useEmployeeGroupsQuery,
  useEmployeeTypesQuery,
  useSystemEmployeeGroupsQuery,
  useSystemEmployeeTypesQuery,
} from "@/features/business/employee-classification-hooks";
import {
  addBusinessGroupId,
  classificationOptionValue,
  classificationPermissions,
  mergeClassificationOptions,
} from "@/features/business/employee-classification-options";
import { businessErrorMessage } from "@/lib/business-api";
import type {
  DefaultEmployeeGroupKey,
  DefaultEmployeeTypeKey,
} from "@/lib/employee-classifications-api";
import type { Permission } from "@/types/generic";

type Props = {
  businessId: string;
  employee: EmployeeDraft;
  permissions: ReadonlySet<Permission>;
  showGroups: boolean;
  disabled?: boolean;
  onUpdate: (patch: Partial<EmployeeDraft>) => void;
};

export function EmployeeClassificationFields({
  businessId,
  employee,
  permissions,
  showGroups,
  disabled = false,
  onUpdate,
}: Props) {
  const access = classificationPermissions(permissions);
  const [customTypeName, setCustomTypeName] = useState("");
  const [customTypeDescription, setCustomTypeDescription] = useState("");
  const [customGroupName, setCustomGroupName] = useState("");
  const [customGroupDescription, setCustomGroupDescription] = useState("");
  const systemTypes = useSystemEmployeeTypesQuery(businessId);
  const types = useEmployeeTypesQuery(businessId, "active", access.canView);
  const archivedTypes = useEmployeeTypesQuery(
    businessId,
    "archived",
    access.canView && Boolean(employee.employeeTypeId),
  );
  const systemGroups = useSystemEmployeeGroupsQuery(businessId, showGroups);
  const groups = useEmployeeGroupsQuery(
    businessId,
    "active",
    showGroups && access.canView,
  );
  const archivedGroups = useEmployeeGroupsQuery(
    businessId,
    "archived",
    showGroups && access.canView && Boolean(employee.groupIds?.length),
  );
  const createType = useCreateOrResolveEmployeeTypeMutation(businessId);
  const createGroup = useCreateOrResolveEmployeeGroupMutation(businessId);

  const typeOptions = useMemo(
    () =>
      mergeClassificationOptions(
        systemTypes.data?.items ?? [],
        types.data?.items ?? [],
      ),
    [systemTypes.data, types.data],
  );
  const groupOptions = useMemo(
    () =>
      mergeClassificationOptions(
        systemGroups.data?.items ?? [],
        groups.data?.items ?? [],
      ),
    [systemGroups.data, groups.data],
  );
  const selectedTypeValue = employee.employeeTypeTemplateKey
    ? `template:${employee.employeeTypeTemplateKey}`
    : employee.employeeTypeId
      ? `owned:${employee.employeeTypeId}`
      : "";
  const selectedGroupIds = new Set(employee.groupIds ?? []);
  const archivedSelectedGroups = (archivedGroups.data?.items ?? []).filter(
    (group) => selectedGroupIds.has(group.id),
  );
  const selectedArchivedType = (archivedTypes.data?.items ?? []).find(
    (type) => type.id === employee.employeeTypeId,
  );
  const typeBusy = disabled || createType.isPending;
  const groupBusy = disabled || createGroup.isPending;
  const queryError =
    systemTypes.error ||
    types.error ||
    archivedTypes.error ||
    systemGroups.error ||
    groups.error ||
    archivedGroups.error;

  const toggleOwnedGroup = (id: string, checked: boolean) => {
    onUpdate({
      groupIds: checked
        ? addBusinessGroupId(employee.groupIds, id)
        : (employee.groupIds ?? []).filter((groupId) => groupId !== id),
    });
  };

  const resolveGroup = async (templateKey: DefaultEmployeeGroupKey) => {
    try {
      const group = await createGroup.mutateAsync({ templateKey });
      toggleOwnedGroup(group.id, true);
    } catch (error) {
      toast.error(businessErrorMessage(error));
    }
  };

  return (
    <section className="mt-4 space-y-4 rounded-xl border border-border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2 text-sm font-medium">
          Employee type
          <select
            value={selectedTypeValue}
            disabled={typeBusy || (!access.canView && !access.canCreateTypes)}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            onChange={(event) => {
              const [kind, value] = event.target.value.split(":", 2);
              if (!value) {
                onUpdate({ employeeTypeId: null, employeeTypeTemplateKey: undefined });
              } else if (kind === "template") {
                onUpdate({
                  employeeTypeId: null,
                  employeeTypeTemplateKey: value as DefaultEmployeeTypeKey,
                });
              } else {
                onUpdate({ employeeTypeId: value, employeeTypeTemplateKey: undefined });
              }
            }}
          >
            <option value="">No employee type</option>
            {selectedArchivedType ? (
              <option value={`owned:${selectedArchivedType.id}`}>
                {selectedArchivedType.name} · Archived
              </option>
            ) : null}
            {typeOptions.map((option) => (
              <option key={classificationOptionValue(option)} value={classificationOptionValue(option)}>
                {option.name} · {option.kind === "template" ? "Default" : option.sourceTemplateKey ? "Business" : "Custom"}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          Employment start date
          <Input
            type="date"
            value={employee.employmentStartDate ?? ""}
            disabled={disabled}
            onChange={(event) => onUpdate({ employmentStartDate: event.target.value })}
          />
        </label>
        <label className="space-y-2 text-sm font-medium">
          State
          <Input
            value={employee.state ?? ""}
            disabled={disabled}
            placeholder="e.g. Lagos"
            onChange={(event) => onUpdate({ state: event.target.value })}
          />
        </label>
      </div>

      {queryError ? (
        <p className="text-sm text-destructive">
          {businessErrorMessage(queryError)}
        </p>
      ) : null}

      {access.canCreateTypes ? (
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            aria-label="Custom employee type name"
            value={customTypeName}
            disabled={typeBusy}
            placeholder="Create a custom employee type"
            onChange={(event) => setCustomTypeName(event.target.value)}
          />
          <Input
            aria-label="Custom employee type description"
            value={customTypeDescription}
            disabled={typeBusy}
            placeholder="Description (optional)"
            onChange={(event) => setCustomTypeDescription(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            disabled={typeBusy || !customTypeName.trim()}
            onClick={async () => {
              try {
                const type = await createType.mutateAsync({
                  name: customTypeName.trim(),
                  ...(customTypeDescription.trim()
                    ? { description: customTypeDescription.trim() }
                    : {}),
                });
                onUpdate({ employeeTypeId: type.id, employeeTypeTemplateKey: undefined });
                setCustomTypeName("");
                setCustomTypeDescription("");
              } catch (error) {
                toast.error(businessErrorMessage(error));
              }
            }}
          >
            {createType.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            Add type
          </Button>
        </div>
      ) : null}

      {showGroups ? (
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Employee groups</p>
            {(employee.groupIds?.length ?? 0) > 0 ? (
              <Button type="button" size="sm" variant="ghost" disabled={groupBusy} onClick={() => onUpdate({ groupIds: [] })}>
                <X /> Clear
              </Button>
            ) : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {groupOptions.map((option) => {
              const value = classificationOptionValue(option);
              const checked = option.kind === "owned" && selectedGroupIds.has(option.id);
              return (
                <label key={value} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={groupBusy || !access.canMutateGroups}
                    onChange={(event) => {
                      if (option.kind === "owned") toggleOwnedGroup(option.id, event.target.checked);
                      else if (event.target.checked) void resolveGroup(option.templateKey);
                    }}
                  />
                  <span>{option.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {option.kind === "template" ? "Default" : option.sourceTemplateKey ? "Business" : "Custom"}
                  </span>
                </label>
              );
            })}
            {archivedSelectedGroups.map((group) => (
              <div key={group.id} className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                <span>{group.name}</span><span className="ml-auto text-xs">Archived</span>
              </div>
            ))}
          </div>
          {access.canMutateGroups ? (
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                aria-label="Custom employee group name"
                value={customGroupName}
                disabled={groupBusy}
                placeholder="Create a custom employee group"
                onChange={(event) => setCustomGroupName(event.target.value)}
              />
              <Input
                aria-label="Custom employee group description"
                value={customGroupDescription}
                disabled={groupBusy}
                placeholder="Description (optional)"
                onChange={(event) => setCustomGroupDescription(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={groupBusy || !customGroupName.trim()}
                onClick={async () => {
                  try {
                    const group = await createGroup.mutateAsync({
                      name: customGroupName.trim(),
                      ...(customGroupDescription.trim()
                        ? { description: customGroupDescription.trim() }
                        : {}),
                    });
                    toggleOwnedGroup(group.id, true);
                    setCustomGroupName("");
                    setCustomGroupDescription("");
                  } catch (error) {
                    toast.error(businessErrorMessage(error));
                  }
                }}
              >
                {createGroup.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
                Add group
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
