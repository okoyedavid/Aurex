"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getMySessions,
  revokeOtherSessions,
  revokeSession,
  SessionApiError,
} from "@/lib/session-api";

const sessionKeys = {
  all: ["sessions"] as const,
  me: () => [...sessionKeys.all, "me"] as const,
};

export function useMySessionsQuery() {
  return useQuery({
    queryKey: sessionKeys.me(),
    queryFn: getMySessions,
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionKeys.me() });
    },
    onError: async (error) => {
      if (error instanceof SessionApiError && error.status === 404) {
        await queryClient.invalidateQueries({ queryKey: sessionKeys.me() });
      }
    },
  });
}

export function useRevokeOtherSessionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionKeys.me() });
    },
  });
}
