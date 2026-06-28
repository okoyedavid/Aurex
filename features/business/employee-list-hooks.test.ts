import { describe, expect, it } from "vitest";
import {
  employeeListKeys,
  verificationPollInterval,
} from "./employee-list-hooks";
describe("employee list query behavior", () => {
  it("scopes routes and pages independently", () => {
    expect(
      employeeListKeys.employees("business-a", "list-a", 2, 20),
    ).not.toEqual(employeeListKeys.employees("business-b", "list-a", 2, 20));
    expect(employeeListKeys.collection("business-a", 1, 20)).not.toEqual(
      employeeListKeys.collection("business-a", 2, 20),
    );
  });
  it("stops polling at completion", () => {
    expect(verificationPollInterval(2)).toBe(3000);
    expect(verificationPollInterval(0)).toBe(false);
    expect(verificationPollInterval()).toBe(false);
  });
  it("provides parent prefixes used for targeted invalidation", () => {
    expect(employeeListKeys.detail("b", "l")).toEqual([
      "businesses",
      "b",
      "employee-lists",
      "l",
    ]);
    expect(employeeListKeys.employeesRoot("b", "l")).toEqual([
      "businesses",
      "b",
      "employee-lists",
      "l",
      "employees",
    ]);
  });
});
