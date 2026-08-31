import type {
  DefaultEmployeeTypeKey,
  EmployeeClassificationStatus,
  SystemTemplate,
} from "@/lib/employee-classifications-api";
import type { Permission } from "@/types/generic";

export type ClassificationOption<TKey extends string> =
  | {
      kind: "owned";
      id: string;
      name: string;
      sourceTemplateKey: TKey | null;
    }
  | {
      kind: "template";
      templateKey: TKey;
      name: string;
    };

export function mergeClassificationOptions<
  TKey extends string,
  TRecord extends {
    id: string;
    name: string;
    sourceTemplateKey: TKey | null;
    status: EmployeeClassificationStatus;
  },
>(
  templates: SystemTemplate<TKey>[],
  records: TRecord[],
): ClassificationOption<TKey>[] {
  const active = records.filter((record) => record.status === "active");
  const materialized = new Set(
    active.flatMap((record) =>
      record.sourceTemplateKey ? [record.sourceTemplateKey] : [],
    ),
  );
  return [
    ...active.map((record) => ({
      kind: "owned" as const,
      id: record.id,
      name: record.name,
      sourceTemplateKey: record.sourceTemplateKey,
    })),
    ...templates
      .filter((template) => !materialized.has(template.key))
      .map((template) => ({
        kind: "template" as const,
        templateKey: template.key,
        name: template.name,
      })),
  ];
}

export function classificationOptionValue<TKey extends string>(
  option: ClassificationOption<TKey>,
) {
  return option.kind === "owned"
    ? `owned:${option.id}`
    : `template:${option.templateKey}`;
}

export function classificationPermissions(permissions: ReadonlySet<Permission>) {
  return {
    canView: permissions.has("employees:view"),
    canCreateTypes: permissions.has("employees:create"),
    canMutateGroups: permissions.has("employees:update"),
  };
}

export async function resolveSelectedEmployeeType(
  selection: {
    employeeTypeId?: string | null;
    employeeTypeTemplateKey?: DefaultEmployeeTypeKey;
  },
  resolve: (body: { templateKey: DefaultEmployeeTypeKey }) => Promise<{ id: string }>,
) {
  if (selection.employeeTypeTemplateKey) {
    return (await resolve({ templateKey: selection.employeeTypeTemplateKey })).id;
  }
  return selection.employeeTypeId ?? null;
}

export function addBusinessGroupId(groupIds: string[] | undefined, id: string) {
  return [...new Set([...(groupIds ?? []), id])];
}
