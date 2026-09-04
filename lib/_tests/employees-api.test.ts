import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";
import { getBusinessEmployee, listBusinessEmployees, updateBusinessEmployee } from "../employees-api";

describe("canonical business employee API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends every directory filter to the business-scoped endpoint", async () => {
    const filters = { page: 2, limit: 50, search: "maya", employeeListId: "list-1", employeeTypeId: "type-1", groupId: "group-1", state: "Lagos", status: "active" as const };
    const get = vi.spyOn(api, "get").mockResolvedValue({ data: { data: { items: [], pagination: {} } } });
    await listBusinessEmployees("business-1", filters);
    expect(get).toHaveBeenCalledWith("/businesses/business-1/employees", { params: filters });
  });

  it("loads employee detail without a list ID", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({ data: { data: { id: "employee-1" } } });
    await getBusinessEmployee("business-1", "employee-1");
    expect(get).toHaveBeenCalledWith("/businesses/business-1/employees/employee-1");
  });

  it("updates through the canonical PATCH endpoint", async () => {
    const body = { fullName: "Maya Okafor", employeeListId: "list-2", groupIds: ["group-1"] };
    const patch = vi.spyOn(api, "patch").mockResolvedValue({ data: { data: { id: "employee-1" } } });
    await updateBusinessEmployee("business-1", "employee-1", body);
    expect(patch).toHaveBeenCalledWith("/businesses/business-1/employees/employee-1", body);
  });
});
