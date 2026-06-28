import { AxiosError } from "axios";

import { api } from "@/lib/api";
import { BusinessApiError, type BusinessResponse } from "@/lib/business-api";
import type { ApiErrorResponse } from "@/types/generic";

export type BusinessMemberStatus = "active" | "suspended" | "removed";

export type MemberUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
};

export type MemberRole = {
  id: string;
  name: string;
  key: string;
  type: "system" | "custom";
  permissions: string[];
  deniedPermissions: string[];
};

export type MemberBusiness = {
  id: string;
  name: string;
  industry: string;
  profile_img?: string | null;
};

export type BusinessMember = {
  id: string;
  businessId: MemberBusiness;
  userId: MemberUser;
  roleId: MemberRole;
  invitedByUserId: MemberUser | null;
  status: BusinessMemberStatus;
  createdAt: string;
  updatedAt: string;
};

export type MemberPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedBusinessMembers = {
  items: BusinessMember[];
  pagination: MemberPagination;
};

const membersPath = (businessId: string) => `/businesses/${businessId}/members`;

function toBusinessMembersError(error: unknown): BusinessApiError {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as Partial<ApiErrorResponse>;
    return new BusinessApiError(error.response.status, {
      message: data.message ?? "Unable to load business members.",
      code: data.code,
      errors: data.errors,
      requestId: data.requestId ?? null,
      details: data.details,
    });
  }

  return new BusinessApiError(500, {
    message: "Unable to reach Aurex. Check your connection and try again.",
  });
}

export async function getBusinessMembers(
  businessId: string,
  page: number,
  limit: number,
): Promise<PaginatedBusinessMembers> {
  try {
    const response = await api.get<BusinessResponse<PaginatedBusinessMembers>>(
      membersPath(businessId),
      { params: { page, limit } },
    );
    return response.data.data;
  } catch (error) {
    throw toBusinessMembersError(error);
  }
}

export async function getBusinessMember(
  businessId: string,
  memberId: string,
): Promise<BusinessMember> {
  try {
    const response = await api.get<BusinessResponse<BusinessMember>>(
      `${membersPath(businessId)}/${memberId}`,
    );
    return response.data.data;
  } catch (error) {
    throw toBusinessMembersError(error);
  }
}
