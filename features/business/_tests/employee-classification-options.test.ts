import { describe, expect, it, vi } from "vitest";

import type { Permission } from "@/types/generic";

import {
  addBusinessGroupId,
  classificationPermissions,
  mergeClassificationOptions,
  resolveSelectedEmployeeType,
} from "../employee-classification-options";

const templates = [
  { key: "full_time" as const, name: "Full Time" },
  { key: "intern" as const, name: "Intern" },
];

describe("employee classification options", () => {
  it("does not duplicate materialized templates", () => {
    const options = mergeClassificationOptions(templates, [
      {
        id: "owned-full-time",
        name: "Full Time",
        sourceTemplateKey: "full_time" as const,
        status: "active" as const,
      },
    ]);
    expect(options).toHaveLength(2);
    expect(options.filter((option) => option.name === "Full Time")).toHaveLength(1);
  });

  it("excludes archived business records from active options", () => {
    const options = mergeClassificationOptions(templates, [
      {
        id: "archived-intern",
        name: "Old Intern",
        sourceTemplateKey: "intern" as const,
        status: "archived" as const,
      },
    ]);
    expect(options).not.toContainEqual(expect.objectContaining({ id: "archived-intern" }));
    expect(options).toContainEqual(expect.objectContaining({ templateKey: "intern" }));
  });

  it("uses the returned business-owned ID when resolving a template", async () => {
    const resolve = vi.fn().mockResolvedValue({ id: "owned-type-id" });
    await expect(
      resolveSelectedEmployeeType(
        { employeeTypeTemplateKey: "full_time" },
        resolve,
      ),
    ).resolves.toBe("owned-type-id");
    expect(resolve).toHaveBeenCalledWith({ templateKey: "full_time" });
  });

  it("stores returned group IDs without template keys or duplicates", () => {
    expect(addBusinessGroupId(["group-1"], "group-2")).toEqual([
      "group-1",
      "group-2",
    ]);
    expect(addBusinessGroupId(["group-1"], "group-1")).toEqual(["group-1"]);
  });

  it("matches the backend permission contract", () => {
    const permissions = new Set<Permission>([
      "employees:view",
      "employees:create",
    ]);
    expect(classificationPermissions(permissions)).toEqual({
      canView: true,
      canCreateTypes: true,
      canMutateGroups: false,
    });
  });
});
