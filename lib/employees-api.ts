import { AxiosError } from "axios";

import { api } from "@/lib/api";
import { BusinessApiError, type BusinessResponse } from "@/lib/business-api";

export type EmployeeStatus = "active" | "suspended" | "on leave" | "archived";

export type EmployeeDirectoryFilters = {
  page: number;
  limit: number;
  search?: string;
  employeeListId?: string;
  employeeTypeId?: string;
  groupId?: string;
  state?: string;
  status?: EmployeeStatus;
};

export type EmployeeRelation = { id: string; name: string };

export type BusinessEmployeeSummary = {
  id: string;
  fullName: string;
  jobTitle: string | null;
  department: EmployeeRelation | null;
  employeeType: EmployeeRelation | null;
  groups: EmployeeRelation[];
  state: string | null;
  tenureMonths: number | null;
  status: EmployeeStatus;
  accountLinked: boolean;
  bank: {
    bankName: string | null;
    maskedAccountNumber: string | null;
    verificationStatus: string;
  };
};

export type BusinessEmployeeDetail = Omit<
  BusinessEmployeeSummary,
  "accountLinked" | "bank"
> & {
  employeeType: (EmployeeRelation & { description: string | null; status: string }) | null;
  groups: Array<EmployeeRelation & { description: string | null; status: string }>;
  manager: { id: string; fullName: string; jobTitle: string | null } | null;
  employmentStartDate: string | null;
  account: { linked: boolean; businessMemberId?: string };
  payroll: { payFrequency: string | null; amount: number; currency: string };
  bankAccount: {
    bankName: string | null;
    accountName: string | null;
    maskedAccountNumber: string | null;
    verificationStatus: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type BusinessEmployeePage = {
  items: BusinessEmployeeSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type UpdateBusinessEmployeeBody = {
  employeeListId?: string;
  fullName?: string;
  jobTitle?: string | null;
  employeeTypeId?: string | null;
  managerEmployeeId?: string | null;
  groupIds?: string[];
  employmentStartDate?: string | null;
  state?: string | null;
};

function normalize(error: unknown): never {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as { message?: string; code?: string; errors?: unknown; details?: never };
    throw new BusinessApiError(error.response.status, {
      message: data.message ?? "The employee request could not be completed.",
      code: data.code,
      errors: data.errors,
      details: data.details,
    });
  }
  throw new BusinessApiError(500, {
    message: "Unable to reach Aurex. Check your connection and try again.",
  });
}

async function request<T>(work: () => Promise<{ data: BusinessResponse<T> }>) {
  try {
    return (await work()).data.data;
  } catch (error) {
    normalize(error);
  }
}

const employeesPath = (businessId: string, employeeId?: string) =>
  `/businesses/${businessId}/employees${employeeId ? `/${employeeId}` : ""}`;

export function listBusinessEmployees(
  businessId: string,
  filters: EmployeeDirectoryFilters,
) {
  return request<BusinessEmployeePage>(() =>
    api.get(employeesPath(businessId), { params: filters }),
  );
}

export function getBusinessEmployee(businessId: string, employeeId: string) {
  return request<BusinessEmployeeDetail>(() =>
    api.get(employeesPath(businessId, employeeId)),
  );
}

export function updateBusinessEmployee(
  businessId: string,
  employeeId: string,
  body: UpdateBusinessEmployeeBody,
) {
  return request<BusinessEmployeeDetail>(() =>
    api.patch(employeesPath(businessId, employeeId), body),
  );
}
