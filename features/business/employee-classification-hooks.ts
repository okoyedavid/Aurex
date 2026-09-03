"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import * as service from "@/lib/employee-classifications-api";
import { auditKeys } from "@/features/audit/audit-hooks";

export const employeeTypeKeys = {
  systemRoot: (businessId: string) =>
    ["businesses", businessId, "system-employee-types"] as const,
  ownedRoot: (businessId: string) =>
    ["businesses", businessId, "employee-types"] as const,
  list: (
    businessId: string,
    page: number,
    limit: number,
    status: service.EmployeeClassificationStatus,
  ) =>
    [
      ...employeeTypeKeys.ownedRoot(businessId),
      { page, limit, status },
    ] as const,
};

export const employeeGroupKeys = {
  systemRoot: (businessId: string) =>
    ["businesses", businessId, "system-employee-groups"] as const,
  ownedRoot: (businessId: string) =>
    ["businesses", businessId, "employee-groups"] as const,
  list: (
    businessId: string,
    page: number,
    limit: number,
    status: service.EmployeeClassificationStatus,
  ) =>
    [
      ...employeeGroupKeys.ownedRoot(businessId),
      { page, limit, status },
    ] as const,
};

export function useSystemEmployeeTypesQuery(
  businessId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: employeeTypeKeys.systemRoot(businessId),
    queryFn: () => service.getSystemEmployeeTypes(businessId),
    enabled: Boolean(businessId) && enabled,
  });
}

export function useEmployeeTypesQuery(
  businessId: string,
  status: service.EmployeeClassificationStatus = "active",
  enabled = true,
) {
  return useQuery({
    queryKey: employeeTypeKeys.list(businessId, 1, 100, status),
    queryFn: () => service.getEmployeeTypes(businessId, 1, 100, status),
    enabled: Boolean(businessId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeTypesPageQuery(
  businessId: string,
  page: number,
  limit: number,
  status: service.EmployeeClassificationStatus,
  enabled = true,
) {
  return useQuery({
    queryKey: employeeTypeKeys.list(businessId, page, limit, status),
    queryFn: () => service.getEmployeeTypes(businessId, page, limit, status),
    enabled: Boolean(businessId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useSystemEmployeeGroupsQuery(
  businessId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: employeeGroupKeys.systemRoot(businessId),
    queryFn: () => service.getSystemEmployeeGroups(businessId),
    enabled: Boolean(businessId) && enabled,
  });
}

export function useEmployeeGroupsQuery(
  businessId: string,
  status: service.EmployeeClassificationStatus = "active",
  enabled = true,
) {
  return useQuery({
    queryKey: employeeGroupKeys.list(businessId, 1, 100, status),
    queryFn: () => service.getEmployeeGroups(businessId, 1, 100, status),
    enabled: Boolean(businessId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeGroupsPageQuery(
  businessId: string,
  page: number,
  limit: number,
  status: service.EmployeeClassificationStatus,
  enabled = true,
) {
  return useQuery({
    queryKey: employeeGroupKeys.list(businessId, page, limit, status),
    queryFn: () => service.getEmployeeGroups(businessId, page, limit, status),
    enabled: Boolean(businessId) && enabled,
    placeholderData: keepPreviousData,
  });
}

export function useCreateOrResolveEmployeeTypeMutation(businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      body: service.CreateClassificationBody<service.DefaultEmployeeTypeKey>,
    ) => service.createOrResolveEmployeeType(businessId, body),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: employeeTypeKeys.ownedRoot(businessId) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(businessId) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(businessId) }),
    ]),
  });
}

export function useUpdateEmployeeTypeMutation(businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: service.UpdateClassificationBody;
    }) => service.updateEmployeeType(businessId, id, body),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: employeeTypeKeys.ownedRoot(businessId) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(businessId) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(businessId) }),
    ]),
  });
}

export function useCreateOrResolveEmployeeGroupMutation(businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      body: service.CreateClassificationBody<service.DefaultEmployeeGroupKey>,
    ) => service.createOrResolveEmployeeGroup(businessId, body),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: employeeGroupKeys.ownedRoot(businessId) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(businessId) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(businessId) }),
    ]),
  });
}

export function useUpdateEmployeeGroupMutation(businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: service.UpdateClassificationBody;
    }) => service.updateEmployeeGroup(businessId, id, body),
    onSuccess: () => Promise.all([
      queryClient.invalidateQueries({ queryKey: employeeGroupKeys.ownedRoot(businessId) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.organizationRoot(businessId) }),
      queryClient.invalidateQueries({ queryKey: auditKeys.personalRoot(businessId) }),
    ]),
  });
}
