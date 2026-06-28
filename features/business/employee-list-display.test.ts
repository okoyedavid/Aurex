import { describe, expect, it } from "vitest";
import {
  friendlyEmployeeStatus,
  friendlyListStatus,
  maskAccountNumber,
  normalizePagination,
} from "./employee-list-display";
import type { Employee } from "@/lib/employee-lists-api";
const employee = (values: Partial<Employee> = {}): Employee => ({
  id: "e",
  businessId: "business-1",
  employeeListId: "list-1",
  fullName: "Ada",
  jobTitle: null,
  bankCode: "058",
  bankName: "Bank",
  accountNumber: "5801017089",
  accountName: "Ada Okafor",
  accountVerificationStatus: "pending",
  accountVerifiedAt: null,
  lastAccountValidationAt: null,
  amount: 1,
  currency: "NGN",
  payFrequency: "monthly",
  paymentStatus: "payable",
  totalAmountPaid: 0,
  status: "active",
  verificationAttemptCount: 0,
  verificationJobStatus: "pending",
  verificationMode: "demo",
  createdAt: "2026-06-27T23:34:16.560Z",
  updatedAt: "2026-06-27T23:34:18.701Z",
  ...values,
});
describe("employee list display", () => {
  it("masks accounts and maps technical statuses", () => {
    expect(maskAccountNumber("5801017089")).toBe("•••• 7089");
    expect(
      friendlyEmployeeStatus(
        employee({
          accountVerificationStatus: "verified",
          verificationJobStatus: "retrying",
        }),
      ),
    ).toBe("Verified");
    expect(
      friendlyEmployeeStatus(
        employee({ verificationJobStatus: "exhausted" }),
      ),
    ).toContain("contact support");
    expect(friendlyListStatus("processing")).toBe("Pending verification");
  });
  it("normalizes invalid pagination", () => {
    expect(normalizePagination("-2", 1)).toBe(1);
    expect(normalizePagination("101", 20, 100)).toBe(20);
    expect(normalizePagination("50", 20, 100)).toBe(50);
  });
});
