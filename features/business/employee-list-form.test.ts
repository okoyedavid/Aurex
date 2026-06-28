import { describe, expect, it } from "vitest";
import { newEmployee, newEmployeeList } from "./business-draft-factory";
import {
  buildEmployeeListPayload,
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
});
