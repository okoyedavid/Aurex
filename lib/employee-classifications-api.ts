import { AxiosError } from "axios";

import { api } from "@/lib/api";
import { BusinessApiError, type BusinessResponse } from "@/lib/business-api";
import type { ApiErrorResponse } from "@/types/generic";
import type { PaginatedData } from "@/lib/employee-lists-api";

export type DefaultEmployeeTypeKey =
  | "full_time"
  | "part_time"
  | "contractor"
  | "intern";

export type DefaultEmployeeGroupKey =
  | "engineering"
  | "marketing"
  | "finance"
  | "hr";

export type EmployeeClassificationStatus = "active" | "archived";
export type SystemTemplate<TKey extends string> = {
  key: TKey;
  name: string;
};

type ClassificationBase<TKey extends string> = {
  id: string;
  businessId: string;
  name: string;
  description?: string | null;
  sourceTemplateKey: TKey | null;
  status: EmployeeClassificationStatus;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeType = ClassificationBase<DefaultEmployeeTypeKey>;
export type EmployeeGroup = ClassificationBase<DefaultEmployeeGroupKey>;

export type CreateClassificationBody<TKey extends string> =
  | { templateKey: TKey }
  | { name: string; description?: string };

export type UpdateClassificationBody = {
  name?: string;
  description?: string | null;
  status?: EmployeeClassificationStatus;
};

type TemplateData<TKey extends string> = {
  items: SystemTemplate<TKey>[];
};

function normalize(error: unknown): never {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as Partial<ApiErrorResponse>;
    throw new BusinessApiError(error.response.status, {
      message: data.message ?? "The classification request could not be completed.",
      code: data.code,
      errors: data.errors,
      details: data.details,
      requestId: data.requestId,
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

const typePath = (businessId: string, employeeTypeId?: string) =>
  `/businesses/${businessId}/employee-types${employeeTypeId ? `/${employeeTypeId}` : ""}`;

const groupPath = (businessId: string, employeeGroupId?: string) =>
  `/businesses/${businessId}/employee-groups${employeeGroupId ? `/${employeeGroupId}` : ""}`;

export const getSystemEmployeeTypes = (businessId: string) =>
  request<TemplateData<DefaultEmployeeTypeKey>>(() =>
    api.get(`${typePath(businessId)}/system`),
  );

export const getEmployeeTypes = (
  businessId: string,
  page: number,
  limit: number,
  status: EmployeeClassificationStatus = "active",
) =>
  request<PaginatedData<EmployeeType>>(() =>
    api.get(typePath(businessId), { params: { page, limit, status } }),
  );

export const createOrResolveEmployeeType = (
  businessId: string,
  body: CreateClassificationBody<DefaultEmployeeTypeKey>,
) =>
  request<EmployeeType>(() => api.post(typePath(businessId), body));

export const updateEmployeeType = (
  businessId: string,
  employeeTypeId: string,
  body: UpdateClassificationBody,
) =>
  request<EmployeeType>(() =>
    api.patch(typePath(businessId, employeeTypeId), body),
  );

export const getSystemEmployeeGroups = (businessId: string) =>
  request<TemplateData<DefaultEmployeeGroupKey>>(() =>
    api.get(`${groupPath(businessId)}/system`),
  );

export const getEmployeeGroups = (
  businessId: string,
  page: number,
  limit: number,
  status: EmployeeClassificationStatus = "active",
) =>
  request<PaginatedData<EmployeeGroup>>(() =>
    api.get(groupPath(businessId), { params: { page, limit, status } }),
  );

export const createOrResolveEmployeeGroup = (
  businessId: string,
  body: CreateClassificationBody<DefaultEmployeeGroupKey>,
) =>
  request<EmployeeGroup>(() => api.post(groupPath(businessId), body));

export const updateEmployeeGroup = (
  businessId: string,
  employeeGroupId: string,
  body: UpdateClassificationBody,
) =>
  request<EmployeeGroup>(() =>
    api.patch(groupPath(businessId, employeeGroupId), body),
  );
