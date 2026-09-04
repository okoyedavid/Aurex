import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import { getEmployeeLists, getEmployees } from "../employee-lists-api";

describe("employee invitation browsing API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("loads the first employee-list page with the required limit", async () => {
    const data = {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
    const get = vi.spyOn(api, "get").mockResolvedValueOnce({ data: { data } });

    await getEmployeeLists("business-1", 1, 20);

    expect(get).toHaveBeenCalledWith("/businesses/business-1/employee-lists", {
      params: { page: 1, limit: 20 },
    });
  });

  it("loads employees only from the selected list", async () => {
    const data = {
      items: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
    const get = vi.spyOn(api, "get").mockResolvedValueOnce({ data: { data } });

    await getEmployees("business-1", "list-selected", 1, 20);

    expect(get).toHaveBeenCalledWith(
      "/businesses/business-1/employee-lists/list-selected/employees",
      { params: { page: 1, limit: 20 } },
    );
  });

  it("requests one employee page at a time without unsupported search", async () => {
    const data = {
      items: [],
      pagination: { page: 3, limit: 20, total: 75, totalPages: 4 },
    };
    const get = vi.spyOn(api, "get").mockResolvedValueOnce({ data: { data } });

    await getEmployees("business-1", "list-1", 3, 20);

    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith(
      "/businesses/business-1/employee-lists/list-1/employees",
      { params: { page: 3, limit: 20 } },
    );
  });
});
