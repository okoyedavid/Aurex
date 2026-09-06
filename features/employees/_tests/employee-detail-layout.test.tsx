import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { BusinessEmployeeDetail } from "@/lib/employees-api";

import { EmployeeProfileShell } from "../employee-detail-layout";

const employee: BusinessEmployeeDetail = {
  id: "opaque-employee-id",
  fullName: "Maya Okafor",
  jobTitle: "Engineering Manager",
  status: "active",
  department: { id: "department-1", name: "Engineering" },
  employeeType: {
    id: "type-1",
    name: "Full Time",
    description: null,
    status: "active",
  },
  groups: [
    {
      id: "group-1",
      name: "Remote",
      description: null,
      status: "active",
    },
  ],
  manager: {
    id: "manager-1",
    fullName: "Sarah Chen",
    jobTitle: "VP Engineering",
  },
  state: "Lagos",
  tenureMonths: 24,
  employmentStartDate: "2024-01-01T00:00:00.000Z",
  account: { linked: true, businessMemberId: "member-1" },
  payroll: { payFrequency: "monthly", amount: 1000, currency: "NGN" },
  bankAccount: {
    bankName: "Bank",
    accountName: "Maya",
    maskedAccountNumber: "******1234",
    verificationStatus: "verified",
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("employee detail layout", () => {
  it("keeps the employee profile rail around overview content", () => {
    const html = renderToStaticMarkup(
      <EmployeeProfileShell
        businessId="business-1"
        employee={employee}
        active="overview"
      >
        <section>Overview content</section>
      </EmployeeProfileShell>,
    );

    expect(html).toContain("Maya Okafor");
    expect(html).toContain("Engineering Manager");
    expect(html).toContain("Engineering");
    expect(html).toContain("Linked account");
    expect(html).toContain("Overview content");
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain(">opaque-employee-id<");
  });

  it("keeps the same profile rail and selects policies for policy content", () => {
    const html = renderToStaticMarkup(
      <EmployeeProfileShell
        businessId="business-1"
        employee={employee}
        active="policies"
        returnTo="/business/business-1/employees?page=2"
      >
        <section>Policy content</section>
      </EmployeeProfileShell>,
    );

    expect(html).toContain("Maya Okafor");
    expect(html).toContain("Policy content");
    expect(html).toContain(
      "/business/business-1/employees/opaque-employee-id/policies?returnTo=",
    );
    expect(html).toMatch(
      /aria-current="page"[^>]+href="[^"]+\/policies[^"]*"/,
    );
  });

  it("hides the policies tab when policy viewing is not allowed", () => {
    const html = renderToStaticMarkup(
      <EmployeeProfileShell
        businessId="business-1"
        employee={employee}
        active="overview"
        canViewPolicies={false}
      >
        <section>Overview content</section>
      </EmployeeProfileShell>,
    );

    expect(html).not.toContain(">Policies<");
  });
});
