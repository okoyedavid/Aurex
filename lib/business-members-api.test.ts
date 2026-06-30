import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import {
  getBusinessMember,
  getBusinessMembers,
  removeBusinessMember,
  updateBusinessMemberRole,
  updateBusinessMemberStatus,
} from "./business-members-api";

describe("business members API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends server pagination to the members endpoint", async () => {
    const data = {
      items: [],
      pagination: { page: 2, limit: 20, total: 21, totalPages: 2 },
    };
    const get = vi.spyOn(api, "get").mockResolvedValueOnce({ data: { data } });

    await expect(getBusinessMembers("business-1", 2, 20)).resolves.toBe(data);
    expect(get).toHaveBeenCalledWith("/businesses/business-1/members", {
      params: { page: 2, limit: 20 },
    });
  });

  it("fetches detail using the membership ID", async () => {
    const member = { id: "membership-1" };
    const get = vi.spyOn(api, "get").mockResolvedValueOnce({
      data: { data: member },
    });

    await getBusinessMember("business-1", "membership-1");
    expect(get).toHaveBeenCalledWith(
      "/businesses/business-1/members/membership-1",
    );
  });

  it("uses the membership ID for role reassignment", async () => {
    const member = { id: "membership-1", roleId: { id: "role-2" } };
    const patch = vi
      .spyOn(api, "patch")
      .mockResolvedValueOnce({ data: { data: member } });
    await expect(
      updateBusinessMemberRole("business-1", "membership-1", "role-2"),
    ).resolves.toBe(member);
    expect(patch).toHaveBeenCalledWith(
      "/businesses/business-1/members/membership-1/role",
      { roleId: "role-2" },
    );
  });

  it.each(["active", "suspended"] as const)(
    "sends the %s membership status",
    async (status) => {
      const member = { id: "membership-1", status };
      const patch = vi
        .spyOn(api, "patch")
        .mockResolvedValueOnce({ data: { data: member } });
      await expect(
        updateBusinessMemberStatus("business-1", "membership-1", status),
      ).resolves.toBe(member);
      expect(patch).toHaveBeenCalledWith(
        "/businesses/business-1/members/membership-1/status",
        { status },
      );
    },
  );

  it("soft-removes using the membership ID", async () => {
    const member = { id: "membership-1", status: "removed" };
    const remove = vi
      .spyOn(api, "delete")
      .mockResolvedValueOnce({ data: { data: member } });
    await expect(
      removeBusinessMember("business-1", "membership-1"),
    ).resolves.toBe(member);
    expect(remove).toHaveBeenCalledWith(
      "/businesses/business-1/members/membership-1",
    );
  });
});
