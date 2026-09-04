import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { BusinessEmployeeDetail } from "@/lib/employees-api";
import { EmployeeProfileHeader } from "../employee-profile-header";

const employee: BusinessEmployeeDetail = {
  id: "opaque-employee-id",
  fullName: "Maya Okafor",
  jobTitle: "Engineering Manager",
  status: "active",
  department: { id: "department-1", name: "Engineering" },
  employeeType: { id: "type-1", name: "Full Time", description: null, status: "active" },
  groups: [{ id: "group-1", name: "Remote", description: null, status: "active" }],
  manager: { id: "manager-1", fullName: "Sarah Chen", jobTitle: "VP Engineering" },
  state: "Lagos",
  tenureMonths: 24,
  employmentStartDate: "2024-01-01T00:00:00.000Z",
  account: { linked: true, businessMemberId: "member-1" },
  payroll: { payFrequency: "monthly", amount: 1000, currency: "NGN" },
  bankAccount: { bankName: "Bank", accountName: "Maya", maskedAccountNumber: "******1234", verificationStatus: "verified" },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("employee profile context", () => {
  it("uses the employee name, job, department, and account state as primary context", () => {
    const html = renderToStaticMarkup(<EmployeeProfileHeader businessId="business-1" employee={employee} active="overview" />);
    expect(html).toContain("Maya Okafor");
    expect(html).toContain("Engineering Manager");
    expect(html).toContain("Engineering");
    expect(html).toContain("Linked business account");
    expect(html).not.toContain(">opaque-employee-id<");
  });

  it("keeps employee context and selected tab on the policies route", () => {
    const html = renderToStaticMarkup(<EmployeeProfileHeader businessId="business-1" employee={employee} active="policies" />);
    expect(html).toContain("Maya Okafor");
    expect(html).toContain("aria-selected=\"true\"");
    expect(html).toContain("/business/business-1/employees/opaque-employee-id/policies");
  });
});
