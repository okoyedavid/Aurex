import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import { getBusinessMember, getBusinessMembers } from "./business-members-api";

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
});
