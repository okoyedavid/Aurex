import { AxiosError } from "axios";

import { api } from "@/lib/api";
import type { ApiErrorResponse, Business, Permission } from "@/types/generic";
import type { EmployeeListPayload } from "@/features/business/employee-list-form";

type BusinessListRole = {
  id?: string;
  businessId?: string | null;
  name: string;
  key: string;
  type: "system" | "custom";
  permissions: string[];
  deniedPermissions?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type BusinessRole = {
  id: string;
  name: string;
  key: string;
  type: "system" | "custom";
  permissions: Permission[];
  deniedPermissions: Permission[];
};

export type BusinessAccessResponse = {
  business: Business;
  membership: {
    id: string;
    status: "active" | "suspended" | "removed";
    role: BusinessRole;
  } | null;
};

type BusinessMembership = {
  id: string;
  status: "active" | "suspended" | "removed";
  role: BusinessListRole | null;
};

export type BusinessListItem = {
  business: Business;
  membership: BusinessMembership | null;
};

export type CreateBusinessBody = {
  name: string;
  industry: string;
  profile_img?: string;
  employeeLists?: EmployeeListPayload[];
};

export type BusinessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export class BusinessApiError extends Error {
  status: number;
  response: ApiErrorResponse;

  constructor(status: number, response: ApiErrorResponse) {
    const message = safeBusinessErrorMessage(status, response.message);
    super(message);
    this.name = "BusinessApiError";
    this.status = status;
    this.response = { ...response, message };
  }
}

function safeBusinessErrorMessage(status: number, message?: string) {
  if (status === 401 || /refresh token|access token|authentication required|unauthorized/i.test(message ?? "")) {
    return "Your session has expired. Please sign in again.";
  }
  return message || "Something went wrong. Please try again.";
}
export const businessKeys = {
  all: ["businesses"] as const,
  detail: (businessId: string) => [...businessKeys.all, businessId] as const,
};

const businessesBasePath = "/businesses";

function friendlyMessage(status: number) {
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have access to these businesses.";
  }

  return "Unable to load businesses. Please try again.";
}
export function businessErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (error instanceof BusinessApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return safeBusinessErrorMessage(0, error.message);
  }

  return fallback;
}
function toBusinessApiError(error: unknown): BusinessApiError {
  if (error instanceof AxiosError && error.response) {
    const status = error.response.status;
    const data = error.response.data as Partial<ApiErrorResponse>;

    return new BusinessApiError(status, {
      message: data.message ?? friendlyMessage(status),
      code: data.code,
      errors: data.errors,
      requestId: data.requestId ?? null,
      details: data.details,
      stack: data.stack,
    });
  }

  return new BusinessApiError(500, {
    message: "Unable to reach Aurex. Check your connection and try again.",
  });
}

export async function getBusinesses(): Promise<BusinessListItem[]> {
  return getBusinessList();
}

async function getBusinessList(options?: {
  ownerOnly?: boolean;
}): Promise<BusinessListItem[]> {
  try {
    const response = await api.get<BusinessResponse<BusinessListItem[]>>(
      businessesBasePath,
      {
        params: options?.ownerOnly ? { ownerOnly: true } : undefined,
      },
    );

    return response.data.data;
  } catch (error) {
    throw toBusinessApiError(error);
  }
}

export async function getBusiness(
  businessId: string,
): Promise<BusinessAccessResponse> {
  try {
    const response = await api.get<BusinessResponse<BusinessAccessResponse>>(
      `${businessesBasePath}/${businessId}`,
    );

    return response.data.data;
  } catch (error) {
    throw toBusinessApiError(error);
  }
}

export async function createBusiness(
  body: CreateBusinessBody,
): Promise<Business> {
  try {
    const response = await api.post<BusinessResponse<Business>>(
      businessesBasePath,
      {
        name: body.name.trim(),
        industry: body.industry.trim(),
        ...(body.profile_img ? { profile_img: body.profile_img } : {}),
        ...(body.employeeLists?.length
          ? { employeeLists: body.employeeLists }
          : {}),
      },
    );
    return response.data.data;
  } catch (error) {
    throw toBusinessApiError(error);
  }
}
