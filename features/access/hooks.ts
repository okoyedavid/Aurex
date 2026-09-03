"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { businessMemberKeys } from "@/features/business/business-member-hooks";
import { employeeListKeys } from "@/features/business/employee-list-hooks";
import { auditKeys } from "@/features/audit/audit-hooks";
import * as service from "@/lib/access-api";
import { BusinessApiError, businessKeys } from "@/lib/business-api";

export const roleKeys = {
  root: (id: string) => ["businesses", id, "roles"] as const,
  all: (id: string) => [...roleKeys.root(id), "all"] as const,
  list: (id: string, page: number, limit: number) =>
    [...roleKeys.root(id), "list", { page, limit }] as const,
  assignable: (id: string, page: number, limit: number) =>
    [...roleKeys.root(id), "assignable", { page, limit }] as const,
  detail: (id: string, roleId: string) =>
    [...roleKeys.root(id), roleId] as const,
};

export const inviteKeys = {
  root: ["invites"] as const,
  received: (page: number, limit: number, status?: string) =>
    [...inviteKeys.root, "received", { page, limit, status }] as const,
  businessRoot: (id: string) =>
    [...inviteKeys.root, "business", id] as const,
  sent: (id: string, page: number, limit: number, status?: string) =>
    [
      ...inviteKeys.businessRoot(id),
      "sent",
      { page, limit, status },
    ] as const,
  approvals: (id: string, page: number, limit: number) =>
    [
      ...inviteKeys.businessRoot(id),
      "approvals",
      { page, limit },
    ] as const,
};

export const notificationKeys = {
  root: ["notifications"] as const,
  list: (page: number, limit: number, unreadOnly: boolean) =>
    [...notificationKeys.root, { page, limit, unreadOnly }] as const,
};

const previous = { placeholderData: keepPreviousData };
const isConflict = (error: unknown) =>
  error instanceof BusinessApiError && error.status === 409;

export const useAssignableRoles = (
  id: string,
  page = 1,
  limit = 100,
  enabled = true,
) =>
  useQuery({
    queryKey: roleKeys.assignable(id, page, limit),
    queryFn: () => service.getAssignableRoles(id, page, limit),
    enabled: Boolean(id) && enabled,
    ...previous,
  });

export const useBusinessRoles = (
  id: string,
  page: number,
  limit: number,
  enabled = true,
) =>
  useQuery({
    queryKey: roleKeys.list(id, page, limit),
    queryFn: () => service.getBusinessRoles(id, page, limit),
    enabled: Boolean(id) && enabled,
    ...previous,
  });

export const useAllBusinessRoles = (id: string, enabled = true) =>
  useQuery({
    queryKey: roleKeys.all(id),
    queryFn: async () => {
      const firstPage = await service.getBusinessRoles(id, 1, 100);
      if (firstPage.pagination.totalPages <= 1) return firstPage.items;
      const remainingPages = await Promise.all(
        Array.from(
          { length: firstPage.pagination.totalPages - 1 },
          (_, index) => service.getBusinessRoles(id, index + 2, 100),
        ),
      );
      return [firstPage, ...remainingPages].flatMap((result) => result.items);
    },
    enabled: Boolean(id) && enabled,
  });

function useRoleMutation(
  id: string,
  mutationFn: (body: service.RolePayload) => Promise<service.BusinessRole>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (role) => {
      queryClient.setQueryData(roleKeys.detail(id, role.id), role);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: roleKeys.root(id) }),
        queryClient.invalidateQueries({
          queryKey: roleKeys.assignable(id, 1, 100),
        }),
        queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(id) }),
        queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(id) }),
      ]);
    },
  });
}

export const useCreateCustomRole = (id: string) =>
  useRoleMutation(id, (body) => service.createBusinessRole(id, body));

export const useUpdateCustomRole = (id: string, roleId: string) =>
  useRoleMutation(id, (body) =>
    service.updateBusinessRole(id, roleId, body),
  );

export const useArchiveCustomRole = (id: string, roleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => service.archiveBusinessRole(id, roleId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: roleKeys.root(id) }),
        queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(id) }),
        queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(id) }),
      ]),
  });
};

export const useSentBusinessInvites = (
  id: string,
  page: number,
  limit: number,
  status?: service.InviteStatus,
  enabled = true,
) =>
  useQuery({
    queryKey: inviteKeys.sent(id, page, limit, status),
    queryFn: () => service.getSentInvites(id, page, limit, status),
    enabled: Boolean(id) && enabled,
    ...previous,
  });

export const useReceivedBusinessInvites = (
  page: number,
  limit: number,
  status?: service.InviteStatus,
) =>
  useQuery({
    queryKey: inviteKeys.received(page, limit, status),
    queryFn: () => service.getReceivedInvites(page, limit, status),
    ...previous,
  });

export const usePendingInviteApprovals = (
  id: string,
  page: number,
  limit: number,
  enabled = true,
) =>
  useQuery({
    queryKey: inviteKeys.approvals(id, page, limit),
    queryFn: () => service.getPendingApprovals(id, page, limit),
    enabled: Boolean(id) && enabled,
    ...previous,
  });

export type CreateInviteMutationVariables = {
  payload: service.CreateInvitePayload;
  employeeListId?: string;
};

export const useCreateBusinessInvite = (id: string) => {
  const queryClient = useQueryClient();
  const refresh = (variables: CreateInviteMutationVariables) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: inviteKeys.root }),
      queryClient.invalidateQueries({
        queryKey: businessMemberKeys.root(id),
      }),
      queryClient.invalidateQueries({ queryKey: employeeListKeys.root(id) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(id) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(id) }),
      ...(variables.employeeListId
        ? [
            queryClient.invalidateQueries({
              queryKey: employeeListKeys.employeesRoot(
                id,
                variables.employeeListId,
              ),
            }),
          ]
        : []),
      ...(variables.employeeListId &&
      variables.payload.type === "EMPLOYEE" &&
      variables.payload.employeeId
        ? [
            queryClient.invalidateQueries({
              queryKey: employeeListKeys.employee(
                id,
                variables.employeeListId,
                variables.payload.employeeId,
              ),
            }),
          ]
        : []),
    ]);

  return useMutation({
    mutationFn: (variables: CreateInviteMutationVariables) =>
      service.createInvite(id, variables.payload),
    onSuccess: (_result, variables) => refresh(variables),
    onError: (error, variables) => {
      if (isConflict(error)) void refresh(variables);
    },
  });
};

export const useAcceptBusinessInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: service.acceptInvite,
    onSuccess: async (result) => {
      const businessId = result.data.businessId.id;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inviteKeys.root }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.root }),
        queryClient.invalidateQueries({
          queryKey: businessMemberKeys.root(businessId),
        }),
        queryClient.invalidateQueries({
          queryKey: employeeListKeys.root(businessId),
        }),
        queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(businessId) }),
        queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(businessId) }),
        ...(result.meta.membershipActivated || result.meta.membershipCreated
          ? [
              queryClient.invalidateQueries({
                queryKey: businessKeys.all,
              }),
            ]
          : []),
      ]);
    },
    onError: (error) => {
      if (isConflict(error)) {
        void queryClient.invalidateQueries({ queryKey: inviteKeys.root });
      }
    },
  });
};

export const useRejectBusinessInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: service.rejectInvite,
    onSettled: (data, error) => {
      if (!error || isConflict(error)) {
        const businessId = data?.businessId.id;
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: inviteKeys.root }),
          ...(businessId ? [
            queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(businessId) }),
            queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(businessId) }),
          ] : []),
        ]);
      }
    },
  });
};

export type ApprovalMutationVariables = {
  inviteId: string;
  payload?: service.ApproveInvitePayload;
  employeeListId?: string;
  employeeId?: string;
};

export const useApproveBusinessInvite = (id: string) => {
  const queryClient = useQueryClient();
  const refresh = (variables: ApprovalMutationVariables) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: inviteKeys.root }),
      queryClient.invalidateQueries({
        queryKey: businessMemberKeys.root(id),
      }),
      queryClient.invalidateQueries({ queryKey: employeeListKeys.root(id) }),
      queryClient.invalidateQueries({ queryKey: notificationKeys.root }),
      queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(id) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(id) }),
      ...(variables.employeeListId
        ? [
            queryClient.invalidateQueries({
              queryKey: employeeListKeys.employeesRoot(
                id,
                variables.employeeListId,
              ),
            }),
          ]
        : []),
      ...(variables.employeeListId && variables.employeeId
        ? [
            queryClient.invalidateQueries({
              queryKey: employeeListKeys.employee(
                id,
                variables.employeeListId,
                variables.employeeId,
              ),
            }),
          ]
        : []),
    ]);

  return useMutation({
    mutationFn: (variables: ApprovalMutationVariables) =>
      service.approveInvite(id, variables.inviteId, variables.payload ?? {}),
    onSuccess: (_result, variables) => refresh(variables),
    onError: (error, variables) => {
      if (isConflict(error)) void refresh(variables);
    },
  });
};

export const useRejectInviteApproval = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) =>
      service.rejectInviteApproval(id, inviteId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: inviteKeys.root }),
        queryClient.invalidateQueries({
          queryKey: businessMemberKeys.root(id),
        }),
        queryClient.invalidateQueries({ queryKey: employeeListKeys.root(id) }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.root }),
        queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(id) }),
        queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(id) }),
      ]),
    onError: (error) => {
      if (isConflict(error)) {
        void queryClient.invalidateQueries({ queryKey: inviteKeys.root });
      }
    },
  });
};

export const useNotifications = (
  page: number,
  limit: number,
  unreadOnly: boolean,
) =>
  useQuery({
    queryKey: notificationKeys.list(page, limit, unreadOnly),
    queryFn: () => service.getNotifications(page, limit, unreadOnly),
    ...previous,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: service.markNotificationRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.root }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: service.markAllNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.root }),
  });
};
