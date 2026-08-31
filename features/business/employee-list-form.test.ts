import { describe, expect, it } from "vitest";
import { newEmployee, newEmployeeList } from "./business-draft-factory";
import {
  buildEmployeePayload,
  buildEmployeeListPayload,
  buildEmployeeUpdatePayload,
  MAX_EMPLOYEES_PER_LIST,
} from "./employee-list-form";

describe("employee list payloads", () => {
  it("constructs the API contract and strips resolved verification fields", () => {
    const list = newEmployeeList();
    list.name = " Payroll ";
    list.employees[0] = {
      ...newEmployee(),
      fullName: " Ada ",
      bankCode: "058",
      bankName: "GTBank",
      accountNumber: "5801017089",
      amount: 250000,
      accountName: "Ada Okafor",
      accountVerified: true,
    };
    expect(buildEmployeeListPayload(list)).toEqual({
      name: "Payroll",
      currency: "NGN",
      payFrequency: "monthly",
      employees: [
        {
          fullName: "Ada",
          bankCode: "058",
          bankName: "GTBank",
          accountNumber: "5801017089",
          amount: 250000,
          currency: "NGN",
          payFrequency: "monthly",
        },
      ],
    });
  });
  it("enforces the 50 employee limit", () => {
    const list = newEmployeeList();
    list.name = "Payroll";
    list.employees = Array.from(
      { length: MAX_EMPLOYEES_PER_LIST + 1 },
      newEmployee,
    );
    expect(() => buildEmployeeListPayload(list)).toThrow("at most 50");
  });
  it("allows a list with no employees", () => {
    const list = newEmployeeList();
    list.name = "Payroll";
    list.employees = [];
    expect(buildEmployeeListPayload(list)).not.toHaveProperty("employees");
  });

  it("creates an employee with type, state, and start date but never groups", () => {
    const employee = {
      ...newEmployee(),
      fullName: " Ada ",
      bankCode: "058",
      bankName: "GTBank",
      accountNumber: "5801017089",
      amount: 250000,
      employeeTypeId: "business-type-id",
      groupIds: ["business-group-id"],
      employmentStartDate: "2026-08-31",
      state: " Lagos ",
    };
    const payload = buildEmployeePayload(employee);
    expect(payload).toMatchObject({
      employeeTypeId: "business-type-id",
      employmentStartDate: "2026-08-31",
      state: "Lagos",
    });
    expect(payload).not.toHaveProperty("groupIds");
  });

  it("updates business-owned groups and sends explicit clears", () => {
    const employee = {
      ...newEmployee(),
      fullName: "Ada",
      bankCode: "058",
      bankName: "GTBank",
      accountNumber: "5801017089",
      amount: 250000,
      employeeTypeId: null,
      groupIds: [],
    };
    expect(buildEmployeeUpdatePayload(employee)).toMatchObject({
      employeeTypeId: null,
      groupIds: [],
      employmentStartDate: null,
      state: null,
    });
    expect(
      buildEmployeeUpdatePayload({
        ...employee,
        groupIds: ["business-group-1", "business-group-2"],
      }).groupIds,
    ).toEqual(["business-group-1", "business-group-2"]);
  });
});
