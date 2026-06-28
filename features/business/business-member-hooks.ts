"use client";

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getBusinessMember,
  getBusinessMembers,
} from "@/lib/business-members-api";

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
