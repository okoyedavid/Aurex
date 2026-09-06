"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { auditKeys } from "@/features/audit/audit-hooks";
import { employeeKeys } from "@/features/employees/employee-hooks";
import { policyKeys } from "@/features/policies/policy-hooks";
import { BusinessApiError } from "@/lib/business-api";
import * as service from "@/lib/github-integration-api";

export const githubKeys = {
  root: (businessId: string) => ["business", businessId, "integrations", "github"] as const,
  repositories: (businessId: string) => [...githubKeys.root(businessId), "repositories"] as const,
  teams: (businessId: string) => [...githubKeys.root(businessId), "teams"] as const,
  employeeRoot: (businessId: string, employeeId: string) =>
    ["business", businessId, "employees", employeeId] as const,
  identity: (businessId: string, employeeId: string) =>
    [...githubKeys.employeeRoot(businessId, employeeId), "github-identity"] as const,
  access: (businessId: string, employeeId: string) =>
    [...githubKeys.employeeRoot(businessId, employeeId), "external-access"] as const,
};

const retryQuery = (count: number, error: Error) =>
  !(error instanceof BusinessApiError && error.status < 500) && count < 2;

export function useGitHubConnectionQuery(businessId: string, enabled = true) {
  return useQuery({
    queryKey: githubKeys.root(businessId),
    queryFn: () => service.getGitHubConnection(businessId),
    enabled: Boolean(businessId) && enabled,
    retry: retryQuery,
  });
}

export function useGitHubRepositoriesQuery(businessId: string, enabled = true) {
  return useQuery({
    queryKey: githubKeys.repositories(businessId),
    queryFn: () => service.getGitHubRepositories(businessId),
    enabled: Boolean(businessId) && enabled,
    staleTime: 5 * 60_000,
    retry: retryQuery,
  });
}

export function useGitHubTeamsQuery(businessId: string, enabled = true) {
  return useQuery({
    queryKey: githubKeys.teams(businessId),
    queryFn: () => service.getGitHubTeams(businessId),
    enabled: Boolean(businessId) && enabled,
    staleTime: 5 * 60_000,
    retry: retryQuery,
  });
}

export function useEmployeeGitHubIdentityQuery(
  businessId: string,
  employeeId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: githubKeys.identity(businessId, employeeId),
    queryFn: () => service.getEmployeeGitHubIdentity(businessId, employeeId),
    enabled: Boolean(businessId && employeeId) && enabled,
    retry: retryQuery,
  });
}

export function useEmployeeExternalAccessQuery(
  businessId: string,
  employeeId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: githubKeys.access(businessId, employeeId),
    queryFn: () => service.getEmployeeExternalAccess(businessId, employeeId),
    enabled: Boolean(businessId && employeeId) && enabled,
    retry: retryQuery,
    refetchInterval: (query) =>
      query.state.data?.items.some((item) =>
        ["unknown", "pending", "drifted", "failed"].includes(item.actualState),
      )
        ? 15_000
        : false,
  });
}

function invalidateConnectionQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  businessId: string,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: githubKeys.root(businessId) }),
    queryClient.invalidateQueries({ queryKey: policyKeys.policiesRoot(businessId) }),
    queryClient.invalidateQueries({
      queryKey: ["business", businessId, "employees"],
    }),
  ]);
}

export function useCreateGitHubInstallUrlMutation(businessId: string) {
  return useMutation({ mutationFn: () => service.createGitHubInstallUrl(businessId) });
}

export function useDisconnectGitHubMutation(businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => service.disconnectGitHub(businessId),
    onSuccess: () => invalidateConnectionQueries(queryClient, businessId),
  });
}

function useEmployeeIntegrationInvalidation(businessId: string, employeeId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: githubKeys.identity(businessId, employeeId) }),
      queryClient.invalidateQueries({ queryKey: githubKeys.access(businessId, employeeId) }),
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(businessId, employeeId) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(businessId) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(businessId) }),
    ]);
}

export function useSetEmployeeGitHubIdentityMutation(businessId: string, employeeId: string) {
  const invalidate = useEmployeeIntegrationInvalidation(businessId, employeeId);
  return useMutation({
    mutationFn: (username: string) =>
      service.setEmployeeGitHubIdentity(businessId, employeeId, username),
    onSuccess: invalidate,
  });
}

export function useRemoveEmployeeGitHubIdentityMutation(businessId: string, employeeId: string) {
  const invalidate = useEmployeeIntegrationInvalidation(businessId, employeeId);
  return useMutation({
    mutationFn: () => service.removeEmployeeGitHubIdentity(businessId, employeeId),
    onSuccess: invalidate,
  });
}
