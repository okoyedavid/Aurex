import { AxiosError } from "axios";

import { api } from "@/lib/api";
import { BusinessApiError, type BusinessResponse } from "@/lib/business-api";
import type {
  EmployeeListPayload,
  EmployeePayload,
} from "@/features/business/employee-list-form";

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export type PaginatedData<T> = { items: T[]; pagination: Pagination };
export type VerificationStatus =
  | "not_started"
  | "pending"
  | "processing"
  | "completed"
  | "completed_with_errors";
export type AccountVerificationStatus =
  | "pending"
  | "verified"
  | "failed"
  | "stale";
export type VerificationJobStatus =
  "pending" | "processing" | "retrying" | "exhausted" | "completed";

export type EmployeeList = {
  id: string;
  businessId: string;
  createdByUserId: string;
  name: string;
  description: string | null;
  currency: string;
  defaultPayFrequency: string;
  status: string;
  validationStatus: VerificationStatus;
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
};
export type Employee = {
  id: string;
  businessId: string;
  employeeListId: string;
  fullName: string;
  jobTitle: string | null;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string | null;
  accountVerificationStatus: AccountVerificationStatus;
  accountVerifiedAt: string | null;
  lastAccountValidationAt: string | null;
  amount: number;
  currency: string;
  payFrequency: string;
  paymentStatus: string;
  totalAmountPaid: number;
  status: string;
  verificationAttemptCount: number;
  verificationJobStatus: VerificationJobStatus;
  verificationMode: string;
  createdAt: string;
  updatedAt: string;
};
export type EmployeeListVerificationStatus = Pick<
  EmployeeList,
  | "id"
  | "validationStatus"
  | "totalEmployeeCount"
  | "pendingVerificationCount"
  | "verifiedEmployeeCount"
  | "invalidEmployeeCount"
  | "verificationErrorCount"
  | "lastValidationAt"
>;
export type UpdateEmployeeListBody = Partial<
  Pick<
    EmployeeListPayload,
    "name" | "description" | "currency" | "payFrequency"
  >
>;
export type UpdateEmployeeBody = Partial<EmployeePayload>;

const root = "/businesses";
const path = (businessId: string, listId?: string) =>
  `${root}/${businessId}/employee-lists${listId ? `/${listId}` : ""}`;

function normalize(error: unknown): never {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as {
      message?: string;
      code?: string;
      errors?: unknown;
      details?: never;
    };
    throw new BusinessApiError(error.response.status, {
      message: data.message ?? "The request could not be completed.",
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
export const getEmployeeLists = (
  businessId: string,
  page: number,
  limit: number,
) =>
  request(() =>
    api.get<BusinessResponse<PaginatedData<EmployeeList>>>(path(businessId), {
      params: { page, limit },
    }),
  );
export const getEmployeeList = (businessId: string, listId: string) =>
  request(() =>
    api.get<BusinessResponse<EmployeeList>>(path(businessId, listId)),
  );
export const createEmployeeList = (
  businessId: string,
  body: EmployeeListPayload,
) =>
  request(() =>
    api.post<BusinessResponse<EmployeeList>>(path(businessId), body),
  );
export const updateEmployeeList = (
  businessId: string,
  listId: string,
  body: UpdateEmployeeListBody,
) =>
  request(() =>
    api.patch<BusinessResponse<EmployeeList>>(path(businessId, listId), body),
  );
export const getEmployees = (
  businessId: string,
  listId: string,
  page: number,
  limit: number,
) =>
  request(() =>
    api.get<BusinessResponse<PaginatedData<Employee>>>(
      `${path(businessId, listId)}/employees`,
      { params: { page, limit } },
    ),
  );
export const getEmployee = (
  businessId: string,
  listId: string,
  employeeId: string,
) =>
  request(() =>
    api.get<BusinessResponse<Employee>>(
      `${path(businessId, listId)}/employees/${employeeId}`,
    ),
  );
export const createEmployee = (
  businessId: string,
  listId: string,
  body: EmployeePayload,
) =>
  request(() =>
    api.post<BusinessResponse<Employee>>(
      `${path(businessId, listId)}/employees`,
      body,
    ),
  );
export const updateEmployee = (
  businessId: string,
  listId: string,
  employeeId: string,
  body: UpdateEmployeeBody,
) =>
  request(() =>
    api.patch<BusinessResponse<Employee>>(
      `${path(businessId, listId)}/employees/${employeeId}`,
      body,
    ),
  );
export const getVerificationStatus = (businessId: string, listId: string) =>
  request(() =>
    api.get<BusinessResponse<EmployeeListVerificationStatus>>(
      `${path(businessId, listId)}/verification-status`,
    ),
  );
