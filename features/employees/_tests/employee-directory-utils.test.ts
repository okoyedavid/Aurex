import { describe, expect, it } from "vitest";

import { canonicalEmployeePoliciesHref, employeeDetailHref, employeeDirectoryFilters, employeePermissions } from "../employee-directory-utils";
import { employeeKeys } from "../employee-hooks";

describe("employee directory contracts", () => {
  it("forces a department ID into the canonical employee query", () => {
    const filters = employeeDirectoryFilters(new URLSearchParams("page=2&search=maya&status=active"), "list-1");
    expect(filters).toMatchObject({ page: 2, search: "maya", status: "active", employeeListId: "list-1" });
  });

  it("builds canonical employee and policy links while preserving return context", () => {
    expect(employeeDetailHref("business-1", "employee-1", "/business/business-1/employees?page=2")).toBe("/business/business-1/employees/employee-1?returnTo=%2Fbusiness%2Fbusiness-1%2Femployees%3Fpage%3D2");
    expect(canonicalEmployeePoliciesHref("business-1", "employee-1")).toBe("/business/business-1/employees/employee-1/policies");
  });

  it("does not treat employees:view_own as directory or edit access", () => {
    expect(employeePermissions(new Set(["employees:view_own"]))).toEqual({ viewDirectory: false, update: false });
    expect(employeePermissions(new Set(["employees:view", "employees:update"]))).toEqual({ viewDirectory: true, update: true });
  });

  it("isolates query keys by business, employee, and filters", () => {
    const one = employeeKeys.directory("business-1", { page: 1, limit: 20, status: "active" });
    const two = employeeKeys.directory("business-2", { page: 1, limit: 20, status: "active" });
    const filtered = employeeKeys.directory("business-1", { page: 1, limit: 20, status: "archived" });
    expect(one).not.toEqual(two);
    expect(one).not.toEqual(filtered);
    expect(employeeKeys.detail("business-1", "employee-1")).not.toEqual(employeeKeys.detail("business-1", "employee-2"));
  });
});
