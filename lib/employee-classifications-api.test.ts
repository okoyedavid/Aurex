import { AxiosError, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import {
  createOrResolveEmployeeGroup,
  createOrResolveEmployeeType,
  getEmployeeTypes,
  getSystemEmployeeGroups,
  getSystemEmployeeTypes,
} from "./employee-classifications-api";

const record = {
  id: "business-owned-id",
  businessId: "business-1",
  name: "Full Time",
  sourceTemplateKey: "full_time",
  status: "active",
};

describe("employee classification API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("loads system employee type templates", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValueOnce({
      data: { data: { items: [{ key: "full_time", name: "Full Time" }] } },
    });
    await getSystemEmployeeTypes("business-1");
    expect(get).toHaveBeenCalledWith(
      "/businesses/business-1/employee-types/system",
    );
  });

  it("loads system employee group templates", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValueOnce({
      data: { data: { items: [{ key: "engineering", name: "Engineering" }] } },
    });
    await getSystemEmployeeGroups("business-1");
    expect(get).toHaveBeenCalledWith(
      "/businesses/business-1/employee-groups/system",
    );
  });

  it.each([200, 201])("accepts a %s type resolution response", async (status) => {
    vi.spyOn(api, "post").mockResolvedValueOnce({
      status,
      data: { data: record },
    });
    await expect(
      createOrResolveEmployeeType("business-1", { templateKey: "full_time" }),
    ).resolves.toMatchObject({ id: "business-owned-id" });
  });

  it("sends custom type and group creation bodies unchanged", async () => {
    const post = vi
      .spyOn(api, "post")
      .mockResolvedValue({ data: { data: record } });
    await createOrResolveEmployeeType("business-1", {
      name: "Seasonal",
      description: "Seasonal employees",
    });
    await createOrResolveEmployeeGroup("business-1", {
      name: "Platform Team",
      description: "Platform engineering employees",
    });
    expect(post).toHaveBeenNthCalledWith(
      1,
      "/businesses/business-1/employee-types",
      { name: "Seasonal", description: "Seasonal employees" },
    );
    expect(post).toHaveBeenNthCalledWith(
      2,
      "/businesses/business-1/employee-groups",
      { name: "Platform Team", description: "Platform engineering employees" },
    );
  });

  it.each([400, 403, 404, 409])(
    "preserves a %s backend classification error",
    async (status) => {
      const error = new AxiosError("Request failed");
      error.response = {
        status,
        data: { message: `Backend ${status}` },
      } as AxiosResponse;
      vi.spyOn(api, "get").mockRejectedValueOnce(error);
      await expect(
        getEmployeeTypes("business-1", 1, 20),
      ).rejects.toMatchObject({ status, message: `Backend ${status}` });
    },
  );
});
