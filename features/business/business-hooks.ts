"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  businessKeys,
  createBusiness,
  deleteBusinessProfileImage,
  getBusiness,
  getBusinesses,
  updateBusinessProfileImage,
} from "@/lib/business-api";
import {
  getBanks,
  resolveBankAccount,
  type ResolveBankAccountBody,
} from "@/features/business/bank-account-service";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function useBusinessesQuery() {
  return useQuery({
    queryKey: businessKeys.all,
    queryFn: getBusinesses,
  });
}

export function useBusinessQuery(businessId: string) {
  return useQuery({
    queryKey: businessKeys.detail(businessId),
    queryFn: () => getBusiness(businessId),
    enabled: Boolean(businessId),
  });
}

export function useCreateBusinessMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBusiness,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: businessKeys.all });
    },
  });
}

export function usePaystackBanksQuery() {
  return useQuery({
    queryKey: ["paystack-banks"] as const,
    queryFn: getBanks,
    staleTime: ONE_DAY_MS,
    gcTime: ONE_DAY_MS,
  });
}

export function useResolveBankAccountQuery({
  bankCode,
  accountNumber,
}: ResolveBankAccountBody) {
  return useQuery({
    queryKey: ["paystack-bank-account", bankCode, accountNumber] as const,
    queryFn: () => resolveBankAccount({ bankCode, accountNumber }),
    enabled: Boolean(bankCode && accountNumber.length === 10),
    retry: false,
  });
}

export function useUpdateBusinessProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBusinessProfileImage,
    onSuccess: async (item) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: businessKeys.all }),
        queryClient.invalidateQueries({
          queryKey: businessKeys.detail(item.business.id),
        }),
      ]);
    },
  });
}

export function useDeleteBusinessProfileImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBusinessProfileImage,
    onSuccess: async (item) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: businessKeys.all }),
        queryClient.invalidateQueries({
          queryKey: businessKeys.detail(item.business.id),
        }),
      ]);
    },
  });
}
