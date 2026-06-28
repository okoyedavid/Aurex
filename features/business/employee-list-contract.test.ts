import { describe, expectTypeOf, it } from "vitest";

import type { EmployeeList } from "@/lib/employee-lists-api";

describe("employee list API contract", () => {
  it("matches the backend response", () => {
    expectTypeOf<EmployeeList>().toEqualTypeOf<{
      id: string;
      businessId: string;
      createdByUserId: string;
      name: string;
      description: string | null;
      currency: string;
      defaultPayFrequency: string;
      status: string;
      validationStatus:
        | "not_started"
        | "pending"
        | "processing"
        | "completed"
        | "completed_with_errors";
      paymentStatus: string;
      paymentBlockedReason: string | null;
      totalEmployeeCount: number;
      pendingVerificationCount: number;
      verifiedEmployeeCount: number;
      invalidEmployeeCount: number;
      verificationErrorCount: number;
      lastValidationAt: string | null;
      createdAt: string;
      updatedAt: string;
    }>();
  });
});
