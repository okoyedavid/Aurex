import type {
  Employee,
  EmployeeListVerificationStatus,
} from "@/lib/employee-lists-api";

export function maskAccountNumber(value?: string) {
  const digits = value?.replace(/\D/g, "") ?? "";
  return digits ? `•••• ${digits.slice(-4)}` : "—";
}
export function friendlyListStatus(
  status?: EmployeeListVerificationStatus["validationStatus"],
) {
  return (
    {
      not_started: "Not yet verified",
      pending: "Pending verification",
      processing: "Pending verification",
      completed: "Completed",
      completed_with_errors: "Completed with issues",
    } as const
  )[status ?? "not_started"];
}
export function friendlyEmployeeStatus(employee: Employee) {
  const account = employee.accountVerificationStatus;
  if (account === "verified") return "Verified";
  if (account === "failed") return "Verification failed";
  if (account === "stale") return "Needs verification";
  const job = employee.verificationJobStatus;
  if (job === "exhausted") return "Verification unavailable - contact support";
  return "Pending verification";
}
export function safeEmployeeFailure(employee: Employee) {
  if (employee.verificationJobStatus === "exhausted") {
    return "Verification is currently unavailable. Contact support.";
  }

  if (employee.accountVerificationStatus === "failed") {
    return "Account verification failed. Check the bank details.";
  }

  return null;
}
export function normalizePagination(
  value: string | null,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= max
    ? parsed
    : fallback;
}
