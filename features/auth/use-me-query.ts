"use client";

import { useQuery } from "@tanstack/react-query";

import { authKeys, getMe } from "@/lib/me-api";

export function useMeQuery() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    retry: false,
  });
}
