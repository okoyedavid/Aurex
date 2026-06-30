"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getBusinessMember,
  getBusinessMembers,
  removeBusinessMember,
  updateBusinessMemberRole,
  updateBusinessMemberStatus,
} from "@/lib/business-members-api";
import { businessKeys } from "@/lib/business-api";
import { authKeys } from "@/lib/me-api";
import type { User } from "@/types/generic";
import { notificationKeys, roleKeys } from "@/features/access/hooks";

export const businessMemberKeys = {
  root: (businessId: string) => ["businesses", businessId, "members"] as const,
  list: (businessId: string, page: number, limit: number) =>
    [...businessMemberKeys.root(businessId), { page, limit }] as const,
  detail: (businessId: string, memberId: string) =>
    [...businessMemberKeys.root(businessId), memberId] as const,
};

export function useBusinessMembersQuery(
  businessId: string,
  page: number,
  limit: number,
  enabled: boolean,
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: businessMemberKeys.list(businessId, page, limit),
    queryFn: async () => {
      const data = await getBusinessMembers(businessId, page, limit);
      data.items.forEach((member) => {
        queryClient.setQueryData(
          businessMemberKeys.detail(businessId, member.id),
          member,
        );
      });
      return data;
    },
    enabled: Boolean(businessId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useBusinessMemberQuery(
  businessId: string,
  memberId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: businessMemberKeys.detail(businessId, memberId),
    queryFn: () => getBusinessMember(businessId, memberId),
    enabled: Boolean(businessId && memberId) && enabled,
  });
}

function useMemberMutation<TPayload>(
  businessId: string,
  memberId: string,
  mutationFn: (
    payload: TPayload,
  ) => Promise<import("@/lib/business-members-api").BusinessMember>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (member) => {
      queryClient.setQueryData(
        businessMemberKeys.detail(businessId, memberId),
        member,
      );
      const me = queryClient.getQueryData<User>(authKeys.me());
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey;
            return (
              key.length === 4 &&
              key[0] === "businesses" &&
              key[1] === businessId &&
              key[2] === "members" &&
              typeof key[3] === "object"
            );
          },
        }),
        queryClient.invalidateQueries({ queryKey: roleKeys.root(businessId) }),
        queryClient.invalidateQueries({ queryKey: notificationKeys.root }),
        ...(me?.id === member.userId.id
          ? [
              queryClient.invalidateQueries({
                queryKey: businessKeys.detail(businessId),
              }),
            ]
          : []),
      ]);
    },
  });
}

export function useUpdateBusinessMemberRole(
  businessId: string,
  memberId: string,
) {
  return useMemberMutation(businessId, memberId, (roleId: string) =>
    updateBusinessMemberRole(businessId, memberId, roleId),
  );
}

export function useUpdateBusinessMemberStatus(
  businessId: string,
  memberId: string,
) {
  return useMemberMutation(
    businessId,
    memberId,
    (status: "active" | "suspended") =>
      updateBusinessMemberStatus(businessId, memberId, status),
  );
}

export function useRemoveBusinessMember(businessId: string, memberId: string) {
  return useMemberMutation(businessId, memberId, () =>
    removeBusinessMember(businessId, memberId),
  );
}
