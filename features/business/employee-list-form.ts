import type {
  EmployeeDraft,
  EmployeeListDraft,
  PayFrequency,
} from "./business-draft-types";

export const MAX_LISTS_PER_BUSINESS = 10;
export const MAX_EMPLOYEES_PER_LIST = 50;
export type EmployeePayload = {
  fullName: string;
  jobTitle?: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  currency: string;
  payFrequency: PayFrequency;
  employeeTypeId?: string | null;
  employmentStartDate?: string | null;
  state?: string | null;
};
export type EmployeeUpdatePayload = Omit<
  EmployeePayload,
  | "jobTitle"
  | "employeeTypeId"
  | "employmentStartDate"
  | "state"
> & {
  jobTitle: string | null;
  employeeTypeId: string | null;
  groupIds: string[];
  employmentStartDate: string | null;
  state: string | null;
};
export type EmployeeListPayload = {
  name: string;
  description?: string | null;
  currency: string;
  payFrequency: PayFrequency;
  employees?: EmployeePayload[];
};

export function buildEmployeePayload(
  employee: EmployeeDraft,
  fallbackCurrency = "NGN",
  fallbackFrequency: PayFrequency = "monthly",
): EmployeePayload {
  const required = [
    employee.fullName,
    employee.bankCode,
    employee.bankName,
    employee.accountNumber,
  ];
  if (
    required.some((value) => !value?.trim()) ||
    !employee.amount ||
    employee.amount <= 0
  )
    throw new Error(
      "Complete every employee's name, bank, account number, and positive amount.",
    );
  if (!/^\d{10}$/.test(employee.accountNumber!))
    throw new Error("Employee account numbers must contain 10 digits.");
  return {
    fullName: employee.fullName.trim(),
    ...(employee.jobTitle?.trim()
      ? { jobTitle: employee.jobTitle.trim() }
      : {}),
    bankCode: employee.bankCode!.trim(),
    bankName: employee.bankName!.trim(),
    accountNumber: employee.accountNumber!,
    amount: employee.amount,
    currency: employee.currency || fallbackCurrency,
    payFrequency: employee.payFrequency || fallbackFrequency,
    ...(employee.employeeTypeId
      ? { employeeTypeId: employee.employeeTypeId }
      : {}),
    ...(employee.employmentStartDate?.trim()
      ? { employmentStartDate: employee.employmentStartDate.trim() }
      : {}),
    ...(employee.state?.trim() ? { state: employee.state.trim() } : {}),
  };
}

export function buildEmployeeUpdatePayload(
  employee: EmployeeDraft,
  fallbackCurrency = "NGN",
  fallbackFrequency: PayFrequency = "monthly",
): EmployeeUpdatePayload {
  return {
    ...buildEmployeePayload(employee, fallbackCurrency, fallbackFrequency),
    jobTitle: employee.jobTitle?.trim() || null,
    employeeTypeId: employee.employeeTypeId ?? null,
    groupIds: employee.groupIds ?? [],
    employmentStartDate: employee.employmentStartDate?.trim() || null,
    state: employee.state?.trim() || null,
  };
}

export function buildEmployeeListPayload(
  list: EmployeeListDraft,
): EmployeeListPayload {
  if (!list.name.trim()) throw new Error("Each employee list needs a name.");
  if (list.employees.length > MAX_EMPLOYEES_PER_LIST)
    throw new Error(
      `A list can contain at most ${MAX_EMPLOYEES_PER_LIST} employees.`,
    );
  const currency = list.currency || "NGN";
  const frequency = list.payFrequency || "monthly";
  return {
    name: list.name.trim(),
    ...(list.description?.trim()
      ? { description: list.description.trim() }
      : {}),
    currency,
    payFrequency: frequency,
    ...(list.employees.length
      ? {
          employees: list.employees.map((employee) =>
            buildEmployeePayload(employee, currency, frequency),
          ),
        }
      : {}),
  };
}

export function buildEmployeeListsPayload(lists: EmployeeListDraft[]) {
  if (lists.length > MAX_LISTS_PER_BUSINESS)
    throw new Error(
      `A business can contain at most ${MAX_LISTS_PER_BUSINESS} employee lists.`,
    );
  return lists.map(buildEmployeeListPayload);
}
