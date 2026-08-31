import { AxiosError } from "axios";

import { api } from "@/lib/api";
import { BusinessApiError, type BusinessResponse } from "@/lib/business-api";
import type { ApiErrorResponse, Permission } from "@/types/generic";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type UserSummary = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
};

type BusinessSummary = {
  id: string;
  name: string;
  industry: string;
  profile_img?: string | null;
};

export type BusinessRole = {
  id: string;
  businessId: string | null;
  name: string;
  key: string;
  type: "system" | "custom";
  status: "active" | "archived";
  permissions: Permission[];
  deniedPermissions: Permission[];
  createdAt: string;
  updatedAt: string;
};

export type AssignableBusinessRole = BusinessRole & {
  requiresApproval: boolean;
};

export type InvitationType = "MEMBER" | "EMPLOYEE";
export type InviteStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "revoked"
  | "expired";

export type InviteEmployee = {
  id: string;
  fullName: string;
  jobTitle: string | null;
  employeeListId: string | { id: string; name: string };
  status: string;
  accountVerificationStatus: string;
  businessMemberId: string | { id: string } | null;
};

export type InviteMembershipRole = {
  id: string;
  name: string;
  key: string;
  type: string;
  permissions: string[];
  deniedPermissions: string[];
};

export type InviteMembershipContext = {
  membershipId: string | null;
  status: "none" | "active" | "suspended" | "removed";
  currentRole: InviteMembershipRole | null;
  roleOutcome:
    | "apply_requested"
    | "preserve_current"
    | "blocked_suspended"
    | "blocked_existing_member";
};

export type BusinessInvite = {
  id: string;
  businessId: BusinessSummary;
  roleId: BusinessRole;
  email: string;
  type: InvitationType;
  employeeId: InviteEmployee | string | null;
  invitedByUserId: UserSummary;
  acceptedByUserId: UserSummary | null;
  rejectedByUserId: UserSummary | null;
  approvedByUserId: UserSummary | null;
  approvalRejectedByUserId: UserSummary | null;
  status: InviteStatus;
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  emailDeliveryStatus: "pending" | "retrying" | "sent" | "failed";
  emailDeliveryAttempts: number;
  lastEmailAttemptAt: string | null;
  emailDeliveredAt: string | null;
  expiresAt: string;
  acceptedAt: string | null;
  rejectedAt: string | null;
  approvedAt: string | null;
  approvalRejectedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
  emailFailureReason?: string | null;
};

export type PendingApprovalInvite = BusinessInvite & {
  membershipContext: InviteMembershipContext;
};

export type CreateInvitePayload =
  | { type: "MEMBER"; email: string; roleId: string }
  | { type: "EMPLOYEE"; email: string; roleId: string; employeeId?: string };

export type EmployeeApprovalPayload = {
  employeeListId: string;
  fullName: string;
  jobTitle?: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  currency?: string;
  payFrequency?: "weekly" | "bi-weekly" | "monthly" | "one_time";
  employeeTypeId?: string | null;
  employmentStartDate?: string | null;
  state?: string | null;
};

export type ApproveInvitePayload = {
  employee?: EmployeeApprovalPayload;
};

export type AcceptInviteMeta = {
  membershipActivated: boolean;
  membershipCreated: boolean;
  requiresApproval: boolean;
};

export type UserNotification = {
  id: string;
  userId: string;
  auditEventId: string;
  type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "critical";
  readAt: string | null;
  createdAt: string;
};

export type PageData<T> = { items: T[]; pagination: Pagination };
export type NotificationPage = PageData<UserNotification> & {
  unreadCount: number;
};
export type RolePayload = {
  name: string;
  permissions: Permission[];
  deniedPermissions: Permission[];
};

function convert(error: unknown): BusinessApiError {
  if (error instanceof AxiosError && error.response) {
    const data = error.response.data as Partial<ApiErrorResponse>;
    return new BusinessApiError(error.response.status, {
      message: data.message ?? "The request could not be completed.",
      code: data.code,
      errors: data.errors,
      details: data.details,
      requestId: data.requestId,
    });
  }
  return new BusinessApiError(500, {
    message: "Unable to reach Aurex. Check your connection and try again.",
  });
}

async function request<T>(
  work: () => Promise<{ data: BusinessResponse<T> }>,
): Promise<T> {
  try {
    return (await work()).data.data;
  } catch (error) {
    throw convert(error);
  }
}

const pageParams = (page: number, limit: number, status?: string) => ({
  page,
  limit,
  ...(status ? { status } : {}),
});

export const getAssignableRoles = (id: string, page: number, limit: number) =>
  request<PageData<AssignableBusinessRole>>(() =>
    api.get(`/businesses/${id}/roles/assignable`, {
      params: { page, limit },
    }),
  );

export const getBusinessRoles = (id: string, page: number, limit: number) =>
  request<PageData<BusinessRole>>(() =>
    api.get(`/businesses/${id}/roles`, { params: { page, limit } }),
  );

export const createBusinessRole = (id: string, body: RolePayload) =>
  request<BusinessRole>(() => api.post(`/businesses/${id}/roles`, body));

export const updateBusinessRole = (
  id: string,
  roleId: string,
  body: RolePayload,
) =>
  request<BusinessRole>(() =>
    api.patch(`/businesses/${id}/roles/${roleId}`, body),
  );

export const archiveBusinessRole = (id: string, roleId: string) =>
  request<BusinessRole>(() =>
    api.delete(`/businesses/${id}/roles/${roleId}`),
  );

export const getSentInvites = (
  id: string,
  page: number,
  limit: number,
  status?: InviteStatus,
) =>
  request<PageData<BusinessInvite>>(() =>
    api.get(`/businesses/${id}/invites`, {
      params: pageParams(page, limit, status),
    }),
  );

export const createInvite = (id: string, body: CreateInvitePayload) =>
  request<BusinessInvite>(() =>
    api.post(`/businesses/${id}/invites`, body),
  );

export const getReceivedInvites = (
  page: number,
  limit: number,
  status?: InviteStatus,
) =>
  request<PageData<BusinessInvite>>(() =>
    api.get("/me/business-invites", {
      params: pageParams(page, limit, status),
    }),
  );

export const acceptInvite = async (inviteId: string) => {
  try {
    const response = await api.post<
      BusinessResponse<BusinessInvite> & { meta: AcceptInviteMeta }
    >(`/me/business-invites/${inviteId}/accept`);
    return {
      data: response.data.data,
      meta: response.data.meta,
      message: response.data.message,
    };
  } catch (error) {
    throw convert(error);
  }
};

export const rejectInvite = (inviteId: string) =>
  request<BusinessInvite>(() =>
    api.post(`/me/business-invites/${inviteId}/reject`),
  );

export const getPendingApprovals = (
  id: string,
  page: number,
  limit: number,
) =>
  request<PageData<PendingApprovalInvite>>(() =>
    api.get(`/businesses/${id}/invites/pending-approval`, {
      params: { page, limit },
    }),
  );

export const approveInvite = (
  id: string,
  inviteId: string,
  body: ApproveInvitePayload = {},
) =>
  request<BusinessInvite>(() =>
    api.post(`/businesses/${id}/invites/${inviteId}/approve`, body),
  );

export const rejectInviteApproval = (id: string, inviteId: string) =>
  request<BusinessInvite>(() =>
    api.post(`/businesses/${id}/invites/${inviteId}/reject-approval`),
  );

export const getNotifications = (
  page: number,
  limit: number,
  unreadOnly: boolean,
) =>
  request<NotificationPage>(() =>
    api.get("/me/notifications", { params: { page, limit, unreadOnly } }),
  );

export const markNotificationRead = (id: string) =>
  request<UserNotification>(() => api.patch(`/me/notifications/${id}/read`));

export const markAllNotificationsRead = () =>
  request<unknown>(() => api.patch("/me/notifications/read-all"));
